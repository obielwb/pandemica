// Package routine generates the weekly routine of every individual: sleep,
// home, commute, work or study (with shifts), lunch and leisure outings whose
// activities are drawn from the neural network preferences. Each day covers
// exactly 1440 minutes.
package routine

import (
	"runtime"
	"sync"

	"github.com/ojpbarbosa/pandemica/engine-v2/internal/activity"
	"github.com/ojpbarbosa/pandemica/engine-v2/internal/census"
	"github.com/ojpbarbosa/pandemica/engine-v2/internal/nn"
	"github.com/ojpbarbosa/pandemica/engine-v2/internal/population"
	"github.com/ojpbarbosa/pandemica/engine-v2/internal/rng"
)

// DayMinutes is the length of one routine day.
const DayMinutes = 1440

// Act is one routine entry (4 bytes).
type Act struct {
	Label activity.Label
	_     uint8
	Dur   uint16
}

// WorkRoutine types (TypeScript WorkRoutine).
type WorkRoutine uint8

const (
	NoWork WorkRoutine = iota
	BusinessHours
	TwelveByThirtySix
	PartTime
)

// Routines stores every weekly routine in one flat array.
type Routines struct {
	Acts     []Act
	DayOff   []uint32 // index into Acts, per individual*7+day
	DayLen   []uint8
	VenueKey []int32 // id used to pick venue instances (guardian for children)
	Shift    []WorkRoutine
}

// Day returns the activities of individual i on weekday d (0 = Sunday).
func (r *Routines) Day(i int32, d int) []Act {
	k := int(i)*7 + d
	o := r.DayOff[k]
	return r.Acts[o : o+uint32(r.DayLen[k])]
}

type profile struct {
	shift        WorkRoutine
	workDays     uint8 // bitmask
	nightShift   bool
	walkToWork   bool
	walkToSchool bool
	pref         [2][NumOutputs]float64 // NN distribution: [workday, dayoff]
	rate         [2]float64             // expected leisure activities per day
}

func (pr *profile) worksOn(d int) bool { return pr.workDays&(1<<uint(d)) != 0 }

func studiesOn(p *population.Population, i int32, d int) bool {
	return p.School[i] >= 0 && d >= 1 && d <= 5
}

// Generate builds routines for the whole population using the preference
// network m.
func Generate(p *population.Population, m *nn.MLP, seed uint64) *Routines {
	rt := &Routines{
		DayOff:   make([]uint32, p.N*7),
		DayLen:   make([]uint8, p.N*7),
		VenueKey: make([]int32, p.N),
		Shift:    make([]WorkRoutine, p.N),
	}
	guardian := make([]int32, p.N)
	var pass1, pass2 []int32
	for i := 0; i < p.N; i++ {
		guardian[i] = -1
		rt.VenueKey[i] = int32(i)
		if int(p.Age[i]) <= census.ChildAge {
			best := int32(-1)
			for _, h := range p.Housemates(p.House[i]) {
				if p.Age[h] >= 20 && (best < 0 || p.Age[h] > p.Age[best]) {
					best = h
				}
			}
			if best >= 0 {
				guardian[i] = best
				rt.VenueKey[i] = best
				pass2 = append(pass2, int32(i))
				continue
			}
		}
		pass1 = append(pass1, int32(i))
	}
	rt.Acts = make([]Act, 0, p.N*7*8)
	run := func(ids []int32, passID uint64) {
		const chunk = 8192
		nChunks := (len(ids) + chunk - 1) / chunk
		type out struct {
			acts []Act
			lens []uint8 // 7 per individual
		}
		outs := make([]out, nChunks)
		var wg sync.WaitGroup
		sem := make(chan struct{}, runtime.GOMAXPROCS(0))
		for c := 0; c < nChunks; c++ {
			wg.Add(1)
			sem <- struct{}{}
			go func(c int) {
				defer wg.Done()
				defer func() { <-sem }()
				r := rng.New(seed, passID<<32|uint64(c))
				g := &gen{p: p, m: m, rt: rt, r: r, s: m.NewScratch(), x: make([]float64, NumFeatures), guardian: guardian}
				lo, hi := c*chunk, (c+1)*chunk
				if hi > len(ids) {
					hi = len(ids)
				}
				o := out{acts: make([]Act, 0, (hi-lo)*7*8), lens: make([]uint8, 0, (hi-lo)*7)}
				for _, i := range ids[lo:hi] {
					pr := g.profile(i)
					rt.Shift[i] = pr.shift
					for d := 0; d < 7; d++ {
						day := g.day(i, d, &pr)
						o.acts = append(o.acts, day...)
						o.lens = append(o.lens, uint8(len(day)))
					}
				}
				outs[c] = o
			}(c)
		}
		wg.Wait()
		for c := range outs {
			lo := c * chunk
			pos := 0
			for k, l := range outs[c].lens {
				i := ids[lo+k/7]
				d := k % 7
				rt.DayOff[int(i)*7+d] = uint32(len(rt.Acts))
				rt.DayLen[int(i)*7+d] = l
				rt.Acts = append(rt.Acts, outs[c].acts[pos:pos+int(l)]...)
				pos += int(l)
			}
		}
	}
	run(pass1, 1)
	run(pass2, 2) // children copy guardians generated in pass 1
	return rt
}

type gen struct {
	p        *population.Population
	m        *nn.MLP
	rt       *Routines
	r        *rng.Stream
	s        *nn.Scratch
	x        []float64
	guardian []int32
	buf      []Act
}

func (g *gen) profile(i int32) profile {
	p, r := g.p, g.r
	var pr profile
	if p.Work[i] >= 0 {
		label := p.WorkLabel[p.Work[i]]
		size := p.WorkSize[p.Work[i]]
		industry := label >= activity.MicroIndustryInPerson && label <= activity.LargeIndustryInPerson
		switch {
		case p.School[i] >= 0:
			pr.shift = PartTime
		case industry && r.Bernoulli(0.5):
			pr.shift = TwelveByThirtySix
		case industry:
			pr.shift = BusinessHours
		case r.Bernoulli(0.725):
			pr.shift = BusinessHours
		default:
			pr.shift = TwelveByThirtySix
		}
		pr.workDays = workDays(pr.shift, size, r)
		pr.nightShift = nightShift(p, i, size, r)
		pr.walkToWork = r.Bernoulli(0.05)
	}
	if p.School[i] >= 0 {
		pr.walkToSchool = r.Bernoulli(0.05)
	}
	for t := 0; t < 2; t++ {
		dayOff := t == 1
		Features(p, i, dayOff, g.x)
		o := g.m.Forward(g.x, g.s)
		copy(pr.pref[t][:], o)
		w := RuleWeights(p, i, dayOff)
		sum := 0.0
		for _, v := range w {
			sum += v
		}
		pr.rate[t] = sum / 7
	}
	return pr
}

// workDays ports getWorkDays (zero-indexed days, 0 = Sunday).
func workDays(shift WorkRoutine, size census.WorkSize, r *rng.Stream) uint8 {
	set := func(days ...int) uint8 {
		var m uint8
		for _, d := range days {
			m |= 1 << uint(d)
		}
		return m
	}
	if shift == TwelveByThirtySix {
		weekends := (size == census.Large && r.Bernoulli(0.8)) || (size == census.Medium && r.Bernoulli(0.5))
		if r.Bernoulli(0.5) {
			m := set(0, 2, 4)
			if weekends {
				m |= set(6)
			}
			return m
		}
		m := set(1, 3, 5)
		if weekends {
			m |= set(0)
		}
		return m
	}
	m := set(1, 2, 3, 4, 5)
	if r.Bernoulli(0.3) {
		m &^= set(1)
	}
	weekends := (size == census.Large && r.Bernoulli(0.5)) || (size == census.Medium && r.Bernoulli(0.25)) ||
		(size == census.Small && r.Bernoulli(0.15)) || (size == census.Micro && r.Bernoulli(0.05))
	if weekends {
		if size == census.Medium || size == census.Large {
			m |= set(6)
		}
		if size == census.Large || r.Bernoulli(0.2) {
			m |= set(0)
		}
	}
	return m
}

// nightShift ports isNightShift.
func nightShift(p *population.Population, i int32, size census.WorkSize, r *rng.Stream) bool {
	if p.School[i] >= 0 {
		return false
	}
	avail := [...]float64{census.Micro: 0.05, census.Small: 0.1, census.Medium: 0.2, census.Large: 0.8}[size]
	if !r.Bernoulli(avail) {
		return false
	}
	if p.Sex[i] == population.Male {
		return r.Bernoulli(0.224)
	}
	return r.Bernoulli(0.1)
}

func act(l activity.Label, dur int) Act { return Act{Label: l, Dur: uint16(dur)} }

func (g *gen) sleep(i int32, busy bool) Act {
	r := g.r
	if int(g.p.Age[i]) <= census.ChildAge {
		if r.Bernoulli(0.75) {
			return act(activity.Sleep9h, 540)
		}
		return act(activity.Sleep8h, 480)
	}
	var w []float64
	if busy {
		w = []float64{2, 3, 4, 1, 0}
	} else {
		w = []float64{1, 2, 4, 4, 1}
	}
	k := r.Weighted(w)
	l := activity.Sleep5h + activity.Label(k)
	return act(l, int(activity.Catalog[l].Duration))
}

func (g *gen) transport(i int32, walk bool) []Act {
	if g.p.Transport[i] == population.Private {
		if walk {
			return []Act{act(activity.PrivateTransportRide, 8)}
		}
		return []Act{act(activity.PrivateTransportRide, 30)}
	}
	if walk {
		return nil
	}
	return []Act{act(activity.PublicTransportStation, 15), act(activity.PublicTransportRide, 45)}
}

// outing draws k leisure activities from the network preferences.
func (g *gen) outing(pr *profile, dayOff bool, budget int) []Act {
	t := 0
	if dayOff {
		t = 1
	}
	k := poisson(pr.rate[t], g.r)
	var acts []Act
	var used [NumOutputs]int
	for n := 0; n < k; n++ {
		w := pr.pref[t]
		for o := range w {
			// repeated activities in the same day are penalized (TS activityPenalty)
			for c := 0; c < used[o]; c++ {
				w[o] *= 0.25
			}
		}
		o := g.r.Weighted(w[:])
		if o < 0 {
			break
		}
		l := outputLabel(o, g.r)
		d := int(activity.Catalog[l].Duration)
		if d > budget {
			continue
		}
		budget -= d
		used[o]++
		acts = append(acts, act(l, d))
	}
	return acts
}

func sum(acts []Act) int {
	s := 0
	for _, a := range acts {
		s += int(a.Dur)
	}
	return s
}

func (g *gen) day(i int32, d int, pr *profile) []Act {
	p := g.p
	if gd := g.guardian[i]; gd >= 0 && !studiesOn(p, i, d) {
		return g.finish(g.mimic(gd, d), false)
	}
	works := p.Work[i] >= 0 && pr.worksOn(d)
	studies := studiesOn(p, i, d)
	acts := g.buf[:0]
	sl := g.sleep(i, works || studies)
	acts = append(acts, sl, act(activity.StayAtHome, 60))
	if works || studies {
		walk := pr.walkToWork
		if studies {
			walk = pr.walkToSchool
		}
		tr := g.transport(i, walk)
		acts = append(acts, tr...)
		if studies {
			label := p.SchoolLabel[p.School[i]]
			dur := int(activity.Catalog[label].Duration)
			if p.Education[i] == population.MiddleSchooler {
				acts = append(acts, act(label, dur), act(activity.SchoolLunch, 60))
			} else {
				if works {
					dur -= 120
				}
				acts = append(acts, act(label, dur/2), act(activity.SchoolLunch, 60), act(label, dur-dur/2))
			}
		}
		if works {
			label := p.WorkLabel[p.Work[i]]
			dur := 480
			switch pr.shift {
			case TwelveByThirtySix:
				dur = 720
			case PartTime:
				dur = 300
			}
			if studies || pr.shift == PartTime {
				acts = append(acts, act(label, dur))
			} else {
				acts = append(acts, act(label, dur/2), act(activity.WorkLunch, 60), act(label, dur-dur/2))
			}
		}
		used := sum(acts) + sum(tr)
		acts = append(acts, g.outing(pr, false, DayMinutes-used-15)...)
		acts = append(acts, tr...)
	} else {
		tr := g.transport(i, false)
		trTime := 2 * sum(tr)
		if g.r.Bernoulli(0.5) {
			morning := 60 + g.r.Intn(300)
			acts = append(acts, act(activity.StayAtHome, morning))
		}
		budget := DayMinutes - sum(acts) - trTime - 15
		out := g.outing(pr, true, budget)
		if len(out) > 0 {
			acts = append(acts, tr...)
			acts = append(acts, out...)
			acts = append(acts, tr...)
		}
	}
	res := g.finish(acts, pr.nightShift && works)
	g.buf = acts
	return res
}

// mimic copies the guardian's day, keeping the child at home while the
// guardian works or studies (and while commuting to those).
func (g *gen) mimic(gd int32, d int) []Act {
	src := g.rt.Day(gd, d)
	occupied := false
	for _, a := range src {
		c := activity.Catalog[a.Label].Category
		if c == activity.Work || c == activity.Study || a.Label == activity.WorkLunch || a.Label == activity.SchoolLunch {
			occupied = true
		}
	}
	acts := g.buf[:0]
	for _, a := range src {
		c := activity.Catalog[a.Label].Category
		switch {
		case c == activity.Work || c == activity.Study || a.Label == activity.WorkLunch || a.Label == activity.SchoolLunch:
			acts = append(acts, act(activity.StayAtHome, int(a.Dur)))
		case c == activity.Transport && occupied:
			acts = append(acts, act(activity.StayAtHome, int(a.Dur)))
		case a.Label == activity.Bar || a.Label == activity.Gym:
			// adult-only activities: the child stays home with another housemate
			acts = append(acts, act(activity.StayAtHome, int(a.Dur)))
		default:
			acts = append(acts, a)
		}
	}
	g.buf = acts
	return acts
}

// finish fits the day into exactly 1440 minutes (shrinking home, then sleep,
// then dropping leisure), appends the final home block, merges consecutive
// duplicates, and reverses the order for night shifts. It returns a fresh
// slice.
func (g *gen) finish(acts []Act, reverse bool) []Act {
	total := sum(acts)
	over := total - DayMinutes
	for k := range acts {
		if over <= 0 {
			break
		}
		if acts[k].Label == activity.StayAtHome && acts[k].Dur > 15 {
			cut := int(acts[k].Dur) - 15
			if cut > over {
				cut = over
			}
			acts[k].Dur -= uint16(cut)
			over -= cut
		}
	}
	for k := range acts {
		if over <= 0 {
			break
		}
		if activity.IsSleep(acts[k].Label) && acts[k].Dur > 300 {
			cut := int(acts[k].Dur) - 300
			if cut > over {
				cut = over
			}
			acts[k].Dur -= uint16(cut)
			over -= cut
		}
	}
	for k := len(acts) - 1; k >= 0 && over > 0; k-- {
		c := activity.Catalog[acts[k].Label].Category
		if c == activity.Leisure || c == activity.Shopping || acts[k].Label == activity.RestaurantIndoor || acts[k].Label == activity.RestaurantOutdoor {
			over -= int(acts[k].Dur)
			acts = append(acts[:k], acts[k+1:]...)
		}
	}
	for k := len(acts) - 1; k >= 0 && over > 0; k-- { // last resort: shorten the longest block
		if acts[k].Dur > 60 {
			cut := int(acts[k].Dur) - 60
			if cut > over {
				cut = over
			}
			acts[k].Dur -= uint16(cut)
			over -= cut
		}
	}
	total = sum(acts)
	if total < DayMinutes {
		acts = append(acts, act(activity.StayAtHome, DayMinutes-total))
	} else if total > DayMinutes { // leisure removal overshot into negative; trim final block
		acts[len(acts)-1].Dur -= uint16(total - DayMinutes)
	}
	out := make([]Act, 0, len(acts))
	for _, a := range acts {
		if a.Dur == 0 {
			continue
		}
		if n := len(out); n > 0 && out[n-1].Label == a.Label {
			out[n-1].Dur += a.Dur
			continue
		}
		out = append(out, a)
	}
	if reverse {
		for l, r := 0, len(out)-1; l < r; l, r = l+1, r-1 {
			out[l], out[r] = out[r], out[l]
		}
	}
	return out
}
