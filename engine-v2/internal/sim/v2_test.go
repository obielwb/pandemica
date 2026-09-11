package sim

import (
	"testing"

	"github.com/ojpbarbosa/pandemica/engine-v2/internal/activity"
)

func TestBedsNeverExceededAndOverflowTurnsAway(t *testing.T) {
	par := DefaultParams()
	par.Beta = 0.4
	par.CovidBedsPer1000 = 0.1 // 2 beds for 20,000 people
	s := New(world(t), baseScenario(), nil, par)
	turned := 0
	s.Run(120, func(d DayStats) {
		if d.BedsUsed > d.BedsTotal || d.BedsUsed < 0 {
			t.Fatalf("beds used %d of %d", d.BedsUsed, d.BedsTotal)
		}
		turned += d.TurnedAway
	})
	if turned == 0 {
		t.Fatal("expected severe cases turned away with 2 beds")
	}
	used := 0
	for _, u := range s.bedUsed {
		used += int(u)
	}
	if used != s.bedsUsed {
		t.Fatalf("bed bookkeeping %d vs %d", used, s.bedsUsed)
	}
}

func TestHospitalWardsInfectStaff(t *testing.T) {
	par := DefaultParams()
	par.Beta = 0.4
	par.CovidBedsPer1000 = 5
	s := New(world(t), baseScenario(), nil, par)
	s.Run(150, nil)
	hosp := 0
	for _, d := range s.Stats {
		hosp += d.BySetting[SetHospital]
	}
	if hosp == 0 {
		t.Fatal("no infections on hospital wards")
	}
	for g, isWard := range s.P.HospitalGroup {
		if isWard && s.W.LocSetting[g] != SetHospital {
			t.Fatalf("ward %d not tagged as hospital", g)
		}
	}
}

func TestLabelAttributionSumsToInfections(t *testing.T) {
	par := DefaultParams()
	par.Beta = 0.3
	s := New(world(t), baseScenario(), nil, par)
	s.Run(90, nil)
	for _, d := range s.Stats {
		sum := 0
		for _, v := range d.ByLabel {
			sum += v
		}
		if sum != d.NewInfections {
			t.Fatalf("%s: labels %d vs infections %d", d.Date.Format("2006-01-02"), sum, d.NewInfections)
		}
	}
}

func TestSickScheduleDropsLeisureKeepsWork(t *testing.T) {
	par := DefaultParams()
	par.SickLeisureDrop = 1
	s := New(world(t), baseScenario(), nil, par)
	s.phase = s.Sc.Phases[0]
	checked := 0
	for j := int32(0); j < int32(s.P.N) && checked < 200; j++ {
		for d := 0; d < 7; d++ {
			hasLeisure, hasWork := false, false
			for _, a := range s.R.Day(j, d) {
				hasLeisure = hasLeisure || isLeisure(a.Label)
				hasWork = hasWork || activity.IsWorkInPerson(a.Label)
			}
			if !hasLeisure {
				continue
			}
			segs := s.segments(j, 0, d, modeSick, nil)
			work := false
			for _, sg := range segs {
				if !sg.home && isLeisure(sg.label) {
					t.Fatalf("sick individual %d kept leisure %s", j, activity.Catalog[sg.label].Name)
				}
				work = work || activity.IsWorkInPerson(sg.label)
			}
			if hasWork && !work && !s.wfh(j) {
				t.Fatalf("sick individual %d lost work", j)
			}
			checked++
			break
		}
	}
	if checked == 0 {
		t.Fatal("nobody with leisure found")
	}
}

func TestUnlimitedBedsNeverTurnAway(t *testing.T) {
	par := DefaultParams()
	par.Beta = 0.4
	par.CovidBedsPer1000 = 0
	s := New(world(t), baseScenario(), nil, par)
	s.Run(120, func(d DayStats) {
		if d.TurnedAway != 0 {
			t.Fatalf("turned away %d with unlimited beds", d.TurnedAway)
		}
	})
	if s.bedsUsed == 0 && s.Stats[len(s.Stats)-1].TotalDeaths == 0 {
		t.Log("no admissions in the test window")
	}
}

func TestAwarenessCutsSpread(t *testing.T) {
	par := DefaultParams()
	par.Beta = 0.3
	base := run(t, baseScenario(), par, 120)
	par.Awareness = 1
	aware := run(t, baseScenario(), par, 120)
	if aware[len(aware)-1].TotalInfections >= base[len(base)-1].TotalInfections {
		t.Fatalf("awareness did not cut spread: %d vs %d", aware[len(aware)-1].TotalInfections, base[len(base)-1].TotalInfections)
	}
	peak := 0.0
	for k, d := range aware {
		if d.Awareness > peak {
			peak = d.Awareness
		}
		if k < 21 && d.Awareness != 0 {
			t.Fatalf("awareness before any lagged deaths on day %d", k)
		}
	}
	if peak <= 0 || peak > 0.8 {
		t.Fatalf("awareness peak %v outside (0, 0.8]", peak)
	}
}
