package sim

import (
	"math"
	"runtime"
	"sync"
	"time"

	"github.com/ojpbarbosa/pandemica/engine/internal/activity"
	"github.com/ojpbarbosa/pandemica/engine/internal/disease"
	"github.com/ojpbarbosa/pandemica/engine/internal/population"
	"github.com/ojpbarbosa/pandemica/engine/internal/rng"
	"github.com/ojpbarbosa/pandemica/engine/internal/routine"
	"github.com/ojpbarbosa/pandemica/engine/internal/scenario"
)

// Health states.
const (
	Susceptible uint8 = iota
	Exposed
	Infectious
	Recovered
	Hospitalized
	Dead
)

// Params are the model knobs. Beta is the only fitted parameter: it scales the
// paper's reference hazard (the "threshold yet to be stipulated").
type Params struct {
	Beta               float64
	DetectSymptomatic  float64 // P(a symptomatic infection becomes a reported case)
	DetectAsymptomatic float64 // P(an asymptomatic infection becomes a reported case)
	CloseContacts      float64 // people one is effectively close to in a group
	HomeContact        float64 // contact intensity between housemates at home
	OccupationContact  float64 // contact intensity with coworkers/classmates
	Workers            int
	Seed               uint64
}

// DefaultParams returns the baseline parameters.
func DefaultParams() Params {
	return Params{
		Beta:               1,
		DetectSymptomatic:  1,
		DetectAsymptomatic: 1,
		CloseContacts:      10,
		HomeContact:        0.5,
		OccupationContact:  0.5,
		Workers:            runtime.NumCPU(),
		Seed:               1,
	}
}

// DayStats are the daily outputs.
type DayStats struct {
	Date                time.Time
	NewInfections       int
	NewCases            int
	NewDeaths           int
	NewHospitalizations int
	NewReinfections     int
	Infectious          int
	Hospitalized        int
	TotalInfections     int
	TotalCases          int
	TotalDeaths         int
	EverInfected        int
	BySetting           [NumSettings]int
	ByVariant           [8]int
	Dose1, Dose2, Dose3 int // cumulative
}

type infection struct {
	id                                          int32
	variant                                     uint8
	asym, isolates                              bool
	infectious, onset, report, hosp, death, end int16 // simulation days, -1 = none
}

type contribution struct {
	j   int32
	h   float32
	v   uint8
	set uint8
}

type seg struct {
	start, end int
	label      activity.Label
	loc        int32
	home       bool
}

// Sim is one simulation run.
type Sim struct {
	W   *World
	P   *population.Population
	R   *routine.Routines
	Sc  *scenario.Scenario
	Par Params

	State        []uint8
	LastVariant  []uint8
	LastRecovery []int16
	everInfected []bool
	Vac          []uint8
	Doses        []uint8
	LastDose     []int16

	active    []infection
	infectors []int32
	hz        [][]float32
	best      []float32
	bestSet   []uint8
	mark      []int32
	touched   []int32
	chunks    [][]contribution

	vacc   *vaccinator
	phase  scenario.Phase
	mask   disease.Mask
	day    int
	totals DayStats
	Stats  []DayStats
}

// New prepares a run. vaccines may be nil.
func New(w *World, sc *scenario.Scenario, vaccines []scenario.VaccineRecord, par Params) *Sim {
	n := w.P.N
	s := &Sim{W: w, P: w.P, R: w.R, Sc: sc, Par: par,
		State: make([]uint8, n), LastVariant: make([]uint8, n), LastRecovery: make([]int16, n),
		everInfected: make([]bool, n),
		Vac:          make([]uint8, n), Doses: make([]uint8, n), LastDose: make([]int16, n),
		best: make([]float32, n), bestSet: make([]uint8, n), mark: make([]int32, n),
	}
	if s.Par.Workers <= 0 {
		s.Par.Workers = runtime.NumCPU()
	}
	for i := range s.LastRecovery {
		s.LastRecovery[i] = -1
		s.mark[i] = -1
	}
	s.hz = make([][]float32, len(disease.Variants))
	for v := range s.hz {
		s.hz[v] = make([]float32, n)
	}
	if sc.VaccinesEnabled && len(vaccines) > 0 {
		s.vacc = newVaccinator(w.P, vaccines, float64(n)/float64(scenario.VaccinePopulation))
	}
	return s
}

// Day returns the index of the next day to simulate.
func (s *Sim) Day() int { return s.day }

// Run simulates up to days days (or the whole scenario if days <= 0).
func (s *Sim) Run(days int, progress func(DayStats)) []DayStats {
	if days <= 0 || days > s.Sc.Days() {
		days = s.Sc.Days()
	}
	for s.day < days {
		st := s.Step()
		if progress != nil {
			progress(st)
		}
	}
	return s.Stats
}

func poisson(lambda float64, r *rng.Stream) int {
	if lambda <= 0 {
		return 0
	}
	l := math.Exp(-lambda)
	k, prod := 0, r.Float64()
	for prod > l {
		k++
		prod *= r.Float64()
	}
	return k
}

// Step simulates one day.
func (s *Sim) Step() DayStats {
	day := s.day
	date := s.Sc.Start.AddDate(0, 0, day)
	s.phase = s.Sc.PhaseAt(date)
	s.mask = disease.MaskByName(s.phase.MaskType)
	weekday := int(date.Weekday())
	st := DayStats{Date: date}
	r := rng.New(s.Par.Seed, 1<<40|uint64(day))

	if day == 0 {
		s.seed(s.Sc.InitialInfections, 0, day, r, &st)
	}
	if day < s.Sc.ImportDays {
		s.seed(poisson(s.Sc.ImportPerDay, r), 0, day, r, &st)
	}
	for _, v := range s.Sc.Variants {
		if v.Date.Equal(date) {
			if idx := disease.VariantIndex(v.Variant); idx >= 0 {
				s.seed(v.Seeds, idx, day, r, &st)
			}
		}
	}
	if s.vacc != nil {
		s.vacc.apply(s, date, day, r)
	}
	s.transmit(day, weekday, r, &st)
	s.progress(day, &st)

	for _, a := range s.active {
		switch s.State[a.id] {
		case Infectious:
			st.Infectious++
		case Hospitalized:
			st.Hospitalized++
		}
	}
	s.totals.TotalInfections += st.NewInfections
	s.totals.TotalCases += st.NewCases
	s.totals.TotalDeaths += st.NewDeaths
	st.TotalInfections = s.totals.TotalInfections
	st.TotalCases = s.totals.TotalCases
	st.TotalDeaths = s.totals.TotalDeaths
	st.EverInfected = s.totals.EverInfected
	if s.vacc != nil {
		st.Dose1, st.Dose2, st.Dose3 = s.vacc.dose1, s.vacc.dose2, s.vacc.dose3
	}
	s.Stats = append(s.Stats, st)
	s.day++
	return st
}

// seed infects k random susceptible (or recovered) individuals with variant v.
func (s *Sim) seed(k, v, day int, r *rng.Stream, st *DayStats) {
	for tries := 0; k > 0 && tries < 100*k+1000; tries++ {
		j := int32(r.Intn(s.P.N))
		if s.State[j] == Susceptible || s.State[j] == Recovered {
			s.infect(j, v, day, SetImported, r, st)
			k--
		}
	}
}

func (s *Sim) infect(j int32, v, day, setting int, r *rng.Stream, st *DayStats) {
	V := disease.Variants[v]
	lat := V.LatentDays + r.Intn(2)
	dur := disease.InfectiousDays - 1 + r.Intn(3)
	a := infection{id: j, variant: uint8(v), onset: -1, report: -1, hosp: -1, death: -1}
	a.infectious = int16(day + lat)
	a.end = int16(day + lat + dur)
	a.asym = r.Bernoulli(disease.AsymptomaticFraction)
	if a.asym {
		if r.Bernoulli(s.Par.DetectAsymptomatic) {
			a.report = a.infectious + 2
		}
	} else {
		a.onset = a.infectious + disease.SymptomOnsetOffset
		a.isolates = r.Bernoulli(s.phase.Isolation)
		if r.Bernoulli(s.Par.DetectSymptomatic) {
			a.report = a.onset + 1
		}
		o := disease.OutcomeForAge(int(s.P.Age[j]))
		sev := V.SeverityFactor * (1 - disease.SevereProtection(disease.Vaccine(s.Vac[j]), s.Doses[j], day-int(s.LastDose[j])))
		if s.LastRecovery[j] >= 0 { // prior infection also protects against severe disease
			sev *= 0.5
		}
		pH := o.Hospitalization / (1 - disease.AsymptomaticFraction) * sev
		if r.Bernoulli(pH) {
			a.hosp = a.onset + disease.HospitalizationOffset
			a.end = a.hosp + disease.HospitalStayDays
			pD := o.Death / o.Hospitalization
			if r.Bernoulli(pD) {
				a.death = a.hosp + 2 + int16(r.Intn(8))
			}
		}
	}
	if s.everInfected[j] {
		st.NewReinfections++
	}
	s.State[j] = Exposed
	s.LastVariant[j] = uint8(v)
	if !s.everInfected[j] {
		s.everInfected[j] = true
		s.totals.EverInfected++
	}
	s.active = append(s.active, a)
	st.NewInfections++
	st.BySetting[setting]++
	st.ByVariant[v]++
}

func (s *Sim) progress(day int, st *DayStats) {
	for k := 0; k < len(s.active); {
		a := &s.active[k]
		id := a.id
		if int(a.infectious) == day && s.State[id] == Exposed {
			s.State[id] = Infectious
		}
		if int(a.report) == day {
			st.NewCases++
		}
		if int(a.hosp) == day {
			s.State[id] = Hospitalized
			st.NewHospitalizations++
		}
		if int(a.death) == day {
			s.State[id] = Dead
			st.NewDeaths++
			s.active[k] = s.active[len(s.active)-1]
			s.active = s.active[:len(s.active)-1]
			continue
		}
		if int(a.end) <= day {
			s.State[id] = Recovered
			s.LastRecovery[id] = int16(day)
			s.active[k] = s.active[len(s.active)-1]
			s.active = s.active[:len(s.active)-1]
			continue
		}
		k++
	}
}

// behaviour switches (stable per individual so the same people keep working
// from home while a phase lasts, and fewer return as the fraction drops).
func (s *Sim) wfh(j int32) bool {
	return s.phase.WorkFromHome > 0 && rng.HashUnit(s.Par.Seed, uint64(j), 11) < s.phase.WorkFromHome
}
func (s *Sim) schoolClosed(j int32) bool {
	return s.phase.SchoolsClosed > 0 && rng.HashUnit(s.Par.Seed, uint64(j), 12) < s.phase.SchoolsClosed
}
func (s *Sim) skipsLeisure(key int32, day, start int) bool {
	return s.phase.LeisureReduction > 0 && rng.HashUnit(s.Par.Seed, uint64(key), uint64(day), uint64(start), 13) < s.phase.LeisureReduction
}
func (s *Sim) wearsMask(j int32) bool {
	return s.phase.MaskAdherence > 0 && rng.HashUnit(s.Par.Seed, uint64(j), 21) < s.phase.MaskAdherence
}

// present reports whether j actually performs the out-of-home activity l
// (starting at minute start) today given the current phase.
func (s *Sim) present(j int32, l activity.Label, start, day, weekday int) bool {
	switch {
	case activity.IsWorkInPerson(l) || l == activity.WorkLunch:
		return !s.wfh(j)
	case activity.IsStudyInPerson(l) || l == activity.SchoolLunch:
		return !s.schoolClosed(j)
	case activity.Catalog[l].Category == activity.Transport:
		return s.leavesHome(j, day, weekday)
	}
	return !s.skipsLeisure(s.R.VenueKey[j], day, start)
}

// leavesHome reports whether j has any non-transport out-of-home activity
// today (otherwise commuting does not happen either).
func (s *Sim) leavesHome(j int32, day, weekday int) bool {
	t := 0
	for _, a := range s.R.Day(j, weekday) {
		l := a.Label
		st := t
		t += int(a.Dur)
		if activity.AtHome(l) || activity.Catalog[l].Category == activity.Transport {
			continue
		}
		if s.present(j, l, st, day, weekday) {
			return true
		}
	}
	return false
}

// segments returns j's effective schedule today.
func (s *Sim) segments(j int32, day, weekday int, isolating bool, buf []seg) []seg {
	buf = buf[:0]
	t := 0
	for _, a := range s.R.Day(j, weekday) {
		st, en := t, t+int(a.Dur)
		t = en
		l := a.Label
		switch {
		case activity.AtHome(l):
			buf = append(buf, seg{st, en, l, -1, true})
		case isolating:
			buf = append(buf, seg{st, en, activity.StayAtHome, -1, true})
		case l == activity.PrivateTransportRide || l == activity.Hospitalized:
			buf = append(buf, seg{st, en, l, -1, false})
		case !s.present(j, l, st, day, weekday):
			buf = append(buf, seg{st, en, activity.StayAtHome, -1, true})
		default:
			buf = append(buf, seg{st, en, l, s.W.Loc(j, weekday, l, st), false})
		}
	}
	return buf
}

// homeOverlap returns the voice-weighted hours two schedules share at home.
func homeOverlap(a, b []seg) float64 {
	total := 0.0
	i, k := 0, 0
	for i < len(a) && k < len(b) {
		x, y := a[i], b[k]
		lo, hi := x.start, x.end
		if y.start > lo {
			lo = y.start
		}
		if y.end < hi {
			hi = y.end
		}
		if hi > lo && x.home && y.home {
			v := activity.Catalog[x.label].Voice
			if w := activity.Catalog[y.label].Voice; w < v {
				v = w
			}
			total += float64(hi-lo) / 60 * disease.VoiceMultiplier[v]
		}
		if x.end < y.end {
			i++
		} else {
			k++
		}
	}
	return total
}

func (s *Sim) transmit(day, weekday int, r *rng.Stream, st *DayStats) {
	s.infectors = s.infectors[:0]
	for k := range s.active {
		a := &s.active[k]
		if s.State[a.id] == Infectious && int(a.infectious) <= day && day < int(a.end) {
			s.infectors = append(s.infectors, int32(k))
		}
	}
	// Infectors are processed in batches of chunks: every chunk of a batch is
	// computed in parallel, then the batch is merged in chunk order. Memory
	// stays bounded by one batch and the result is deterministic.
	const chunk = 128
	const batchChunks = 64
	nChunks := (len(s.infectors) + chunk - 1) / chunk
	if len(s.chunks) < batchChunks {
		s.chunks = make([][]contribution, batchChunks)
	}
	s.touched = s.touched[:0]
	for b0 := 0; b0 < nChunks; b0 += batchChunks {
		b1 := b0 + batchChunks
		if b1 > nChunks {
			b1 = nChunks
		}
		var wg sync.WaitGroup
		work := make(chan int, b1-b0)
		for c := b0; c < b1; c++ {
			work <- c
		}
		close(work)
		workers := s.Par.Workers
		if workers > b1-b0 {
			workers = b1 - b0
		}
		for w := 0; w < workers; w++ {
			wg.Add(1)
			go func() {
				defer wg.Done()
				var bi, bj []seg
				for c := range work {
					slot := c - b0
					out := s.chunks[slot][:0]
					lo, hi := c*chunk, (c+1)*chunk
					if hi > len(s.infectors) {
						hi = len(s.infectors)
					}
					for _, k := range s.infectors[lo:hi] {
						out, bi, bj = s.spread(&s.active[k], day, weekday, out, bi, bj)
					}
					s.chunks[slot] = out
				}
			}()
		}
		wg.Wait()
		for slot := 0; slot < b1-b0; slot++ {
			for _, ct := range s.chunks[slot] {
				j := ct.j
				if s.mark[j] != int32(day) {
					s.mark[j] = int32(day)
					s.touched = append(s.touched, j)
				}
				s.hz[ct.v][j] += ct.h
				if ct.h > s.best[j] {
					s.best[j] = ct.h
					s.bestSet[j] = ct.set
				}
			}
			if cap(s.chunks[slot]) > 1<<20 { // release unusually large buffers
				s.chunks[slot] = nil
			}
		}
	}

	for _, j := range s.touched {
		var w [8]float64
		total := 0.0
		if s.State[j] == Susceptible || s.State[j] == Recovered {
			vacP := disease.InfectionProtection(disease.Vaccine(s.Vac[j]), s.Doses[j], day-int(s.LastDose[j]))
			prior := 0.0
			if s.LastRecovery[j] >= 0 {
				prior = disease.PriorInfectionProtection * disease.WaningInfection(day-int(s.LastRecovery[j]))
			}
			for v := range s.hz {
				h := s.hz[v][j]
				if h == 0 {
					continue
				}
				V := disease.Variants[v]
				pp := prior * (1 - disease.PriorEscape(int(s.LastVariant[j]), v))
				susc := (1 - vacP*(1-V.VaccineEscape)) * (1 - pp)
				w[v] = float64(h) * susc
				total += w[v]
			}
			hazard := s.Par.Beta * total
			if hazard > 0 && rng.HashUnit(s.Par.Seed, uint64(day), uint64(j), 31) < 1-math.Exp(-hazard) {
				u := rng.HashUnit(s.Par.Seed, uint64(day), uint64(j), 32) * total
				v := 0
				for ; v < len(s.hz)-1; v++ {
					u -= w[v]
					if u < 0 && w[v] > 0 {
						break
					}
				}
				for w[v] == 0 && v > 0 { // guard against rounding at the tail
					v--
				}
				s.infect(j, v, day, int(s.bestSet[j]), r, st)
			}
		}
		for v := range s.hz {
			s.hz[v][j] = 0
		}
		s.best[j] = 0
	}
}

// spread appends the hazard contributions of one infectious individual.
func (s *Sim) spread(a *infection, day, weekday int, out []contribution, bi, bj []seg) ([]contribution, []seg, []seg) {
	i := a.id
	V := disease.Variants[a.variant]
	infectivity := 1.0
	if a.asym {
		infectivity = disease.AsymptomaticInfectivity
	}
	base := disease.ReferenceHazardPerHour * infectivity * V.Transmissibility
	isolating := a.isolates && a.onset >= 0 && day >= int(a.onset)
	bi = s.segments(i, day, weekday, isolating, bi)

	// household
	p := s.P
	for _, j := range p.Housemates(p.House[i]) {
		if j == i || (s.State[j] != Susceptible && s.State[j] != Recovered) {
			continue
		}
		bj = s.segments(j, day, weekday, false, bj)
		if hrs := homeOverlap(bi, bj); hrs > 0 {
			out = append(out, contribution{j, float32(base * s.Par.HomeContact * hrs), a.variant, SetHome})
		}
	}
	if isolating {
		return out, bi, bj
	}

	src := 1.0
	if s.wearsMask(i) {
		src = disease.SourceMask[s.mask]
	}
	rcv := disease.ReceiverMask[s.mask]
	C := s.Par.CloseContacts
	for _, sg := range bi {
		if sg.home || sg.loc < 0 {
			continue
		}
		spec := &activity.Catalog[sg.label]
		dil := 1.0
		if g := float64(s.W.LocGroup[sg.loc]); g-1 > C {
			dil = C / (g - 1)
		}
		set := s.W.LocSetting[sg.loc]
		intensity := 1.0
		if set == SetWork || set == SetSchool {
			intensity = s.Par.OccupationContact
		}
		f := base * disease.SettingMultiplier[spec.Setting] * disease.DistanceMultiplier[spec.Distance] *
			disease.VoiceMultiplier[spec.Voice] * dil * intensity * src
		for _, e := range s.W.Entries(weekday, sg.loc) {
			j := e.ind
			if j == i || (s.State[j] != Susceptible && s.State[j] != Recovered) {
				continue
			}
			lo, hi := sg.start, sg.end
			if es := e.start(); es > lo {
				lo = es
			}
			if ee := e.end(); ee < hi {
				hi = ee
			}
			if hi <= lo {
				continue
			}
			if !s.present(j, e.label(), e.start(), day, weekday) {
				continue
			}
			h := f * float64(hi-lo) / 60
			if s.wearsMask(j) {
				h *= rcv
			}
			out = append(out, contribution{j, float32(h), a.variant, set})
		}
	}
	return out, bi, bj
}
