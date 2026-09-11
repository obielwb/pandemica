// Package sim runs the agent-based epidemic: a static per-weekday index of who
// is where (built once from the routines) and a daily loop that propagates
// infection from infectious individuals to everybody sharing a place with them
// at overlapping times, then advances each infection's natural history.
package sim

import (
	"math"
	"sync"

	"github.com/ojpbarbosa/pandemica/engine-v2/internal/activity"
	"github.com/ojpbarbosa/pandemica/engine-v2/internal/census"
	"github.com/ojpbarbosa/pandemica/engine-v2/internal/population"
	"github.com/ojpbarbosa/pandemica/engine-v2/internal/rng"
	"github.com/ojpbarbosa/pandemica/engine-v2/internal/routine"
)

// Settings used to attribute where infections happened.
const (
	SetHome = iota
	SetWork
	SetSchool
	SetVenue
	SetTransport
	SetHospital
	SetImported
	NumSettings
)

// SettingNames for reports.
var SettingNames = [NumSettings]string{"home", "work", "school", "venue", "transport", "hospital", "imported"}

// entry is one presence in the weekday index: individual ind is at the
// location during [start, end) minutes doing label.
type entry struct {
	ind    int32
	packed uint32 // start | end<<11 | label<<22
}

func pack(start, end int, l activity.Label) uint32 {
	return uint32(start) | uint32(end)<<11 | uint32(l)<<22
}
func (e entry) start() int            { return int(e.packed & 0x7FF) }
func (e entry) end() int              { return int(e.packed >> 11 & 0x7FF) }
func (e entry) label() activity.Label { return activity.Label(e.packed >> 22) }

// Venue sizing: venues are open openMinutes a day and hold on average
// targetOccupancy of the activity's maximum engaged individuals.
const (
	openMinutes     = 960
	targetOccupancy = 0.5
)

// World is the city: locations (work teams, classes, venue instances) and the
// weekday presence index. Houses are handled directly through housemates.
type World struct {
	P    *population.Population
	R    *routine.Routines
	Seed uint64

	classBase  int32
	venueBase  [activity.NumLabels][census.NumRegions]int32
	venueCount [activity.NumLabels][census.NumRegions]int32

	NumLoc     int
	LocGroup   []float32 // group size used for contact dilution
	LocSetting []uint8

	start   [7][]uint32
	entries [7][]entry
}

// NewWorld sizes venues from the routines and builds the presence index.
func NewWorld(p *population.Population, r *routine.Routines, seed uint64) *World {
	w := &World{P: p, R: r, Seed: seed}
	w.classBase = int32(p.NumWorkGroups)
	next := w.classBase + int32(p.NumClasses)

	var minutes [activity.NumLabels][census.NumRegions]float64
	for i := int32(0); i < int32(p.N); i++ {
		reg := p.HouseRegion[p.House[i]]
		for d := 0; d < 7; d++ {
			for _, a := range r.Day(i, d) {
				if activity.IsVenue(a.Label) {
					minutes[a.Label][reg] += float64(a.Dur)
				}
			}
		}
	}
	for l := activity.Label(0); l < activity.NumLabels; l++ {
		for reg := 0; reg < int(census.NumRegions); reg++ {
			if minutes[l][reg] == 0 {
				continue
			}
			concurrent := minutes[l][reg] / 7 / openMinutes
			capacity := float64(activity.Catalog[l].MaxEngaged) * targetOccupancy
			n := int32(math.Ceil(concurrent / capacity))
			if n < 1 {
				n = 1
			}
			w.venueBase[l][reg] = next
			w.venueCount[l][reg] = n
			next += n
		}
	}
	w.NumLoc = int(next)
	w.LocGroup = make([]float32, w.NumLoc)
	w.LocSetting = make([]uint8, w.NumLoc)
	for g, s := range p.WorkGroupSize {
		w.LocGroup[g] = float32(s)
		w.LocSetting[g] = SetWork
		if len(p.HospitalGroup) > g && p.HospitalGroup[g] {
			w.LocSetting[g] = SetHospital
		}
	}
	for c, s := range p.ClassSize {
		w.LocGroup[w.classBase+int32(c)] = float32(s)
		w.LocSetting[w.classBase+int32(c)] = SetSchool
	}
	for l := activity.Label(0); l < activity.NumLabels; l++ {
		for reg := 0; reg < int(census.NumRegions); reg++ {
			set := uint8(SetVenue)
			if activity.Catalog[l].Category == activity.Transport {
				set = SetTransport
			}
			for k := int32(0); k < w.venueCount[l][reg]; k++ {
				loc := w.venueBase[l][reg] + k
				w.LocGroup[loc] = float32(activity.Catalog[l].MaxEngaged) * targetOccupancy
				w.LocSetting[loc] = set
			}
		}
	}

	var wg sync.WaitGroup
	for d := 0; d < 7; d++ {
		wg.Add(1)
		go func(d int) {
			defer wg.Done()
			w.buildIndex(d)
		}(d)
	}
	wg.Wait()
	return w
}

func (w *World) buildIndex(d int) {
	p := w.P
	counts := make([]uint32, w.NumLoc+1)
	for i := int32(0); i < int32(p.N); i++ {
		t := 0
		for _, a := range w.R.Day(i, d) {
			if loc := w.Loc(i, d, a.Label, t); loc >= 0 {
				counts[loc+1]++
			}
			t += int(a.Dur)
		}
	}
	for k := 1; k <= w.NumLoc; k++ {
		counts[k] += counts[k-1]
	}
	entries := make([]entry, counts[w.NumLoc])
	cursor := make([]uint32, w.NumLoc)
	copy(cursor, counts[:w.NumLoc])
	for i := int32(0); i < int32(p.N); i++ {
		t := 0
		for _, a := range w.R.Day(i, d) {
			if loc := w.Loc(i, d, a.Label, t); loc >= 0 {
				entries[cursor[loc]] = entry{i, pack(t, t+int(a.Dur), a.Label)}
				cursor[loc]++
			}
			t += int(a.Dur)
		}
	}
	w.start[d] = counts
	w.entries[d] = entries
}

// Loc resolves where individual i performs label l starting at minute start
// on weekday d. Home activities, private rides and hospital return -1.
func (w *World) Loc(i int32, d int, l activity.Label, start int) int32 {
	p := w.P
	switch {
	case activity.IsWorkInPerson(l) || l == activity.WorkLunch:
		if p.WorkGroup[i] < 0 {
			return -1
		}
		return p.WorkGroup[i]
	case activity.IsStudyInPerson(l) || l == activity.SchoolLunch:
		if p.Class[i] < 0 {
			return -1
		}
		return w.classBase + p.Class[i]
	case activity.IsVenue(l):
		reg := p.HouseRegion[p.House[i]]
		n := w.venueCount[l][reg]
		if n == 0 {
			return -1
		}
		key := w.R.VenueKey[i] // children share their guardian's venue instance
		h := rng.Hash(w.Seed, uint64(key), uint64(d), uint64(start), uint64(l))
		return w.venueBase[l][reg] + int32(h%uint64(n))
	}
	return -1
}

// VenueLoc picks an instance of venue label l in region reg for key (used for
// visits outside the weekly routine, such as a sick person's pharmacy trip).
func (w *World) VenueLoc(l activity.Label, reg uint8, key uint64) int32 {
	n := w.venueCount[l][reg]
	if n == 0 {
		return -1
	}
	return w.venueBase[l][reg] + int32(rng.Hash(w.Seed, key, 99, uint64(l))%uint64(n))
}

// Entries returns everybody scheduled at loc on weekday d.
func (w *World) Entries(d int, loc int32) []entry {
	return w.entries[d][w.start[d][loc]:w.start[d][loc+1]]
}

// IndexSize returns the number of presences in the weekday index.
func (w *World) IndexSize() int {
	n := 0
	for d := 0; d < 7; d++ {
		n += len(w.entries[d])
	}
	return n
}
