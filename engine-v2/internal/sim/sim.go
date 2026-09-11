package sim

import (
	"math"
	"runtime"
	"sync"
	"time"

	"github.com/ojpbarbosa/pandemica/engine-v2/internal/activity"
	"github.com/ojpbarbosa/pandemica/engine-v2/internal/disease"
	"github.com/ojpbarbosa/pandemica/engine-v2/internal/population"
	"github.com/ojpbarbosa/pandemica/engine-v2/internal/rng"
	"github.com/ojpbarbosa/pandemica/engine-v2/internal/routine"
	"github.com/ojpbarbosa/pandemica/engine-v2/internal/scenario"
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

// LabelImported indexes DayStats.ByLabel for imported (seeded) infections.
const LabelImported = int(activity.NumLabels)

// Params are the model knobs. Beta is the only fitted parameter: it scales the
// paper's reference hazard (the "threshold yet to be stipulated").
type Params struct {
	Beta               float64
	DetectSymptomatic  float64 // P(a symptomatic infection becomes a reported case)
	DetectAsymptomatic float64 // P(an asymptomatic infection becomes a reported case)
	CloseContacts      float64 // people one is effectively close to in a group
	HomeContact        float64 // contact intensity between housemates at home (v2: the full reference interaction)
	OccupationContact  float64 // contact intensity with coworkers/classmates/ward staff
	Workers            int
	Seed               uint64

	// v2
	CovidBedsPer1000       float64 // hospital beds available to COVID patients; <= 0 means unlimited (no bed data in the repository)
	CareSeeking            float64 // P(a symptomatic person visits a pharmacy at symptom onset) (assumption)
	OverloadDeathFactor    float64 // death probability multiplier for severe cases turned away (assumption)
	HospitalInfectiousDays int     // days a severe case keeps shedding after admission (assumption)
	SickMaskShare          float64 // P(a symptomatic, non-isolating person masks up) (TS useMask; assumption)
	SickLeisureDrop        float64 // P(a symptomatic, non-isolating person drops leisure) (TS interruptedActivities; assumption)
	SleepPairs             bool    // only bedroom partners share the night (TS sleep maxEngaged 2)
}

// DefaultParams returns the baseline parameters.
func DefaultParams() Params {
	return Params{
		Beta:                   1,
		DetectSymptomatic:      1,
		DetectAsymptomatic:     1,
		CloseContacts:          10,
		HomeContact:            1,
		OccupationContact:      0.5,
		Workers:                runtime.NumCPU(),
		Seed:                   1,
		CovidBedsPer1000:       0,
		CareSeeking:            0.6,
		OverloadDeathFactor:    2,
		HospitalInfectiousDays: 5,
		SickMaskShare:          0.5,
		SickLeisureDrop:        0.5,
		SleepPairs:             true,
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
	ByLabel             [activity.NumLabels + 1]int // last slot = imported
	ByVariant           [8]int
	Dose1, Dose2, Dose3 int // cumulative
	BedsUsed            int
	BedsTotal           int
	TurnedAway          int // severe cases refused a bed today
}

type infection struct {
	id                                          int32
	variant                                     uint8
	asym, isolates, care, turned                bool
	sickMask, sickDrop                          bool
	infectious, onset, report, hosp, death, end int16 // simulation days, -1 = none
	infEnd                                      int16 // last infectious day (exclusive)
	ward                                        int32 // ward index while admitted, -1 otherwise
	pD, uD                                      float32
}

type contribution struct {
	j   int32
	h   float32
	v   uint8
	set uint8
	lbl uint8
}

type seg struct {
	start, end int
	label      activity.Label
	loc        int32
	home       bool
}

// schedule modes for segments.
const (
	modeNormal = iota
	modeIsolating
	modeSick // TS assignInfectiousRoutine: drop leisure, keep work and study
)

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
	bestLabel []uint8
	mark      []int32
	touched   []int32
	chunks    [][]contribution

	// hospitals: wards are the hospital staff teams (work groups)
	wards     []int32 // ward index -> work group id (= location id)
	wardOf    []int32 // work group id -> ward index or -1
	bedCap    []int32
	bedUsed   []int32
	bedsTotal int
	bedsUsed  int

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
		best: make([]float32, n), bestSet: make([]uint8, n), bestLabel: make([]uint8, n), mark: make([]int32, n),
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
	s.setupBeds()
	return s
}

// setupBeds splits the COVID beds over the hospital wards in proportion to
// their staff team size.
func (s *Sim) setupBeds() {
	p := s.P
	s.wardOf = make([]int32, p.NumWorkGroups)
	for g := range s.wardOf {
		s.wardOf[g] = -1
	}
	staff := 0
	for g := 0; g < p.NumWorkGroups; g++ {
		if len(p.HospitalGroup) > g && p.HospitalGroup[g] {
			s.wardOf[g] = int32(len(s.wards))
			s.wards = append(s.wards, int32(g))
			staff += int(p.WorkGroupSize[g])
		}
	}
	s.bedCap = make([]int32, len(s.wards))
	s.bedUsed = make([]int32, len(s.wards))
	if len(s.wards) == 0 {
		return
	}
	if s.Par.CovidBedsPer1000 <= 0 { // unlimited: every ward can always take one more
		for k := range s.bedCap {
			s.bedCap[k] = math.MaxInt32
		}
		return
	}
	s.bedsTotal = int(math.Round(float64(p.N) / 1000 * s.Par.CovidBedsPer1000))
	if s.bedsTotal == 0 {
		s.bedsTotal = 1
	}
	given := 0
	for k, g := range s.wards {
		c := int32(float64(s.bedsTotal) * float64(p.WorkGroupSize[g]) / float64(staff))
		s.bedCap[k] = c
		given += int(c)
	}
	for k := 0; given < s.bedsTotal; k = (k + 1) % len(s.wards) {
		s.bedCap[k]++
		given++
	}
}

// admit finds a free bed for individual id, returning the ward index or -1.
func (s *Sim) admit(id int32) int32 {
	if len(s.wards) == 0 {
		return -1
	}
	start := int(rng.Hash(s.Par.Seed, uint64(id), 77) % uint64(len(s.wards)))
	for k := 0; k < len(s.wards); k++ {
		w := (start + k) % len(s.wards)
		if s.bedUsed[w] < s.bedCap[w] {
			s.bedUsed[w]++
			s.bedsUsed++
			return int32(w)
		}
	}
	return -1
}

func (s *Sim) release(a *infection) {
	if a.ward >= 0 {
		s.bedUsed[a.ward]--
		s.bedsUsed--
		a.ward = -1
	}
}

// isStaff reports whether j works in a hospital ward.
func (s *Sim) isStaff(j int32) bool {
	g := s.P.WorkGroup[j]
	return g >= 0 && s.wardOf[g] >= 0
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
	st := DayStats{Date: date, BedsTotal: s.bedsTotal}
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
	st.BedsUsed = s.bedsUsed
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
			s.infect(j, v, day, SetImported, LabelImported, r, st)
			k--
		}
	}
}

func (s *Sim) infect(j int32, v, day, setting, label int, r *rng.Stream, st *DayStats) {
	V := disease.Variants[v]
	lat := V.LatentDays + r.Intn(2)
	dur := disease.InfectiousDays - 1 + r.Intn(3)
	a := infection{id: j, variant: uint8(v), onset: -1, report: -1, hosp: -1, death: -1, ward: -1}
	a.infectious = int16(day + lat)
	a.end = int16(day + lat + dur)
	a.infEnd = a.end
	a.asym = r.Bernoulli(disease.AsymptomaticFraction)
	if a.asym {
		if r.Bernoulli(s.Par.DetectAsymptomatic) {
			a.report = a.infectious + 2
		}
	} else {
		a.onset = a.infectious + disease.SymptomOnsetOffset
		a.isolates = r.Bernoulli(s.phase.Isolation)
		a.care = r.Bernoulli(s.Par.CareSeeking)
		a.sickMask = r.Bernoulli(s.Par.SickMaskShare)
		a.sickDrop = r.Bernoulli(s.Par.SickLeisureDrop)
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
			a.infEnd = a.hosp + int16(s.Par.HospitalInfectiousDays)
			a.pD = float32(o.Death / o.Hospitalization)
			a.uD = float32(r.Float64())
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
	st.ByLabel[label]++
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
			st.NewHospitalizations++
			pD := float64(a.pD)
			if len(s.wards) == 0 { // no hospitals modelled: v1 behaviour
				s.State[id] = Hospitalized
			} else if w := s.admit(id); w >= 0 {
				a.ward = w
				s.State[id] = Hospitalized
			} else {
				// no bed: the severe case stays home, isolated with the household
				a.turned = true
				a.isolates = true
				st.TurnedAway++
				pD = math.Min(1, pD*s.Par.OverloadDeathFactor)
			}
			if float64(a.uD) < pD {
				a.death = a.hosp + 2 + int16(rng.Hash(s.Par.Seed, uint64(id), uint64(day), 5)%8)
			}
		}
		if int(a.death) == day {
			s.release(a)
			s.State[id] = Dead
			st.NewDeaths++
			s.active[k] = s.active[len(s.active)-1]
			s.active = s.active[:len(s.active)-1]
			continue
		}
		if int(a.end) <= day {
			s.release(a)
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
	if s.isStaff(j) { // hospital staff cannot work from home
		return false
	}
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

// sickMask is the mask a symptomatic person puts on (TS useMask): the phase's
// mask type, or a cloth mask before masks were mandated.
func (s *Sim) sickMask() disease.Mask {
	if s.mask == disease.NoMask {
		return disease.Basic
	}
	return s.mask
}

// isLeisure reports whether l is a leisure, shopping or errand venue activity
// (the TS interruptedActivities of an infectious routine).
func isLeisure(l activity.Label) bool {
	return activity.IsVenue(l) && activity.Catalog[l].Category != activity.Transport
}

// present reports whether j actually performs the out-of-home activity l
// (starting at minute start) today given the current phase.
func (s *Sim) present(j int32, l activity.Label, start, day, weekday int) bool {
	switch {
	case l == activity.HospitalShift:
		return true
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
func (s *Sim) segments(j int32, day, weekday, mode int, buf []seg) []seg {
	buf = buf[:0]
	keepOut := true
	if mode == modeSick { // commute only if work or study still happens
		keepOut = false
		t := 0
		for _, a := range s.R.Day(j, weekday) {
			l := a.Label
			if (activity.IsWorkInPerson(l) || activity.IsStudyInPerson(l)) && s.present(j, l, t, day, weekday) {
				keepOut = true
			}
			t += int(a.Dur)
		}
	}
	t := 0
	for _, a := range s.R.Day(j, weekday) {
		st, en := t, t+int(a.Dur)
		t = en
		l := a.Label
		switch {
		case activity.AtHome(l):
			buf = append(buf, seg{st, en, l, -1, true})
		case mode == modeIsolating:
			buf = append(buf, seg{st, en, activity.StayAtHome, -1, true})
		case l == activity.PrivateTransportRide || l == activity.Hospitalized:
			buf = append(buf, seg{st, en, l, -1, false})
		case mode == modeSick && (isLeisure(l) || (activity.Catalog[l].Category == activity.Transport && !keepOut)):
			buf = append(buf, seg{st, en, activity.StayAtHome, -1, true})
		case !s.present(j, l, st, day, weekday):
			buf = append(buf, seg{st, en, activity.StayAtHome, -1, true})
		default:
			buf = append(buf, seg{st, en, l, s.W.Loc(j, weekday, l, st), false})
		}
	}
	return buf
}

// homeOverlap returns the voice-weighted hours two schedules share at home,
// split into awake time and shared sleep. Following the TS catalog (sleep has
// maxEngaged 2), only sleep partners share the night; someone asleep does not
// interact with housemates who are awake.
func homeOverlap(a, b []seg, partners, v1 bool) (awake, sleep float64) {
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
			hrs := float64(hi-lo) / 60
			xs, ys := activity.IsSleep(x.label), activity.IsSleep(y.label)
			switch {
			case xs && ys:
				if partners {
					sleep += hrs * disease.VoiceMultiplier[activity.Silent]
				}
			case (xs || ys) && v1: // v1: one asleep, one awake still share the home, silently
				sleep += hrs * disease.VoiceMultiplier[activity.Silent]
			case xs || ys:
			default:
				v := activity.Catalog[x.label].Voice
				if w := activity.Catalog[y.label].Voice; w < v {
					v = w
				}
				awake += hrs * disease.VoiceMultiplier[v]
			}
		}
		if x.end < y.end {
			i++
		} else {
			k++
		}
	}
	return
}

func (s *Sim) isInfector(a *infection, day int) bool {
	if int(a.infectious) > day || day >= int(a.infEnd) {
		return false
	}
	switch s.State[a.id] {
	case Infectious:
		return true
	case Hospitalized:
		return a.ward >= 0
	}
	return false
}

func (s *Sim) transmit(day, weekday int, r *rng.Stream, st *DayStats) {
	s.infectors = s.infectors[:0]
	for k := range s.active {
		if s.isInfector(&s.active[k], day) {
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
					s.bestLabel[j] = ct.lbl
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
				s.infect(j, v, day, int(s.bestSet[j]), int(s.bestLabel[j]), r, st)
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

	// an admitted patient spends the whole day in the ward (TS hospitalized activity)
	if s.State[i] == Hospitalized && a.ward >= 0 {
		out = s.spreadAt(i, a, seg{0, 1440, activity.Hospitalized, s.wards[a.ward], false}, base, 1, day, weekday, out)
		return out, bi, bj
	}

	symptomatic := !a.asym && a.onset >= 0 && day >= int(a.onset)
	isolating := a.isolates && symptomatic
	mode := modeNormal
	if isolating {
		mode = modeIsolating
	} else if symptomatic && a.sickDrop {
		mode = modeSick
	}
	bi = s.segments(i, day, weekday, mode, bi)

	// household
	p := s.P
	partner := p.SleepPartnerOf(i)
	if !s.Par.SleepPairs {
		partner = -2 // everyone in the house shares the night (v1)
	}
	for _, j := range p.Housemates(p.House[i]) {
		if j == i || (s.State[j] != Susceptible && s.State[j] != Recovered) {
			continue
		}
		bj = s.segments(j, day, weekday, modeNormal, bj)
		awake, sleep := homeOverlap(bi, bj, partner == -2 || j == partner, partner == -2)
		if awake > 0 {
			out = append(out, contribution{j, float32(base * s.Par.HomeContact * awake), a.variant, SetHome, uint8(activity.StayAtHome)})
		}
		if sleep > 0 {
			out = append(out, contribution{j, float32(base * s.Par.HomeContact * sleep), a.variant, SetHome, uint8(activity.Sleep8h)})
		}
	}

	src := 1.0
	if s.wearsMask(i) {
		src = disease.SourceMask[s.mask]
	}
	if symptomatic && a.sickMask && src == 1 { // TS useMask for infectious routines
		src = disease.SourceMask[s.sickMask()]
	}

	// care seeking: a pharmacy visit at symptom onset (TS infectious routine)
	if symptomatic && a.care && day == int(a.onset) {
		region := p.HouseRegion[p.House[i]]
		if loc := s.W.VenueLoc(activity.Pharmacy, region, rng.Hash(uint64(i), uint64(day))); loc >= 0 {
			out = s.spreadAt(i, a, seg{600, 615, activity.Pharmacy, loc, false}, base, src, day, weekday, out)
		}
	}
	if isolating {
		return out, bi, bj
	}
	for _, sg := range bi {
		if sg.home || sg.loc < 0 {
			continue
		}
		out = s.spreadAt(i, a, sg, base, src, day, weekday, out)
	}
	return out, bi, bj
}

// spreadAt appends the contributions of infector i present at segment sg.
func (s *Sim) spreadAt(i int32, a *infection, sg seg, base, src float64, day, weekday int, out []contribution) []contribution {
	spec := &activity.Catalog[sg.label]
	dil := 1.0
	if g := float64(s.W.LocGroup[sg.loc]); g-1 > s.Par.CloseContacts {
		dil = s.Par.CloseContacts / (g - 1)
	}
	set := s.W.LocSetting[sg.loc]
	intensity := 1.0
	if set == SetWork || set == SetSchool || set == SetHospital {
		intensity = s.Par.OccupationContact
	}
	hospital := set == SetHospital
	if hospital && s.isStaff(i) && s.State[i] != Hospitalized {
		src = disease.SourceMask[disease.N95] // staff wear respirators on the ward
	}
	rcv := disease.ReceiverMask[s.mask]
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
		if hospital {
			h *= disease.ReceiverMask[disease.N95]
		} else if s.wearsMask(j) {
			h *= rcv
		}
		out = append(out, contribution{j, float32(h), a.variant, set, uint8(sg.label)})
	}
	return out
}
