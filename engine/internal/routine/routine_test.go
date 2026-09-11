package routine

import (
	"math"
	"testing"

	"github.com/ojpbarbosa/pandemica/engine/internal/activity"
	"github.com/ojpbarbosa/pandemica/engine/internal/nn"
	"github.com/ojpbarbosa/pandemica/engine/internal/population"
)

var (
	testPop *population.Population
	testNN  *nn.MLP
	testRT  *Routines
)

func setup(t *testing.T) (*population.Population, *nn.MLP, *Routines) {
	t.Helper()
	if testPop == nil {
		p, err := population.Generate(population.Options{N: 30000, Seed: 5})
		if err != nil {
			t.Fatal(err)
		}
		m, _ := TrainPreferenceNetwork(p, 20000, 30, 5)
		testPop, testNN, testRT = p, m, Generate(p, m, 5)
	}
	return testPop, testNN, testRT
}

func TestEveryDayIs1440Minutes(t *testing.T) {
	p, _, rt := setup(t)
	for i := int32(0); i < int32(p.N); i++ {
		for d := 0; d < 7; d++ {
			day := rt.Day(i, d)
			if len(day) == 0 {
				t.Fatalf("individual %d day %d empty", i, d)
			}
			total := 0
			for _, a := range day {
				total += int(a.Dur)
				if a.Label >= activity.NumLabels {
					t.Fatalf("bad label %d", a.Label)
				}
			}
			if total != DayMinutes {
				t.Fatalf("individual %d day %d has %d minutes: %v", i, d, total, day)
			}
		}
	}
}

func TestWorkersWorkAndStudentsStudy(t *testing.T) {
	p, _, rt := setup(t)
	for i := int32(0); i < int32(p.N); i++ {
		work, study := 0, 0
		for d := 0; d < 7; d++ {
			for _, a := range rt.Day(i, d) {
				if activity.IsWorkInPerson(a.Label) {
					work++
					if p.Work[i] < 0 || a.Label != p.WorkLabel[p.Work[i]] {
						t.Fatalf("individual %d works at wrong label", i)
					}
				}
				if activity.IsStudyInPerson(a.Label) {
					study++
					if p.School[i] < 0 || a.Label != p.SchoolLabel[p.School[i]] {
						t.Fatalf("individual %d studies at wrong label", i)
					}
				}
			}
		}
		if p.Work[i] >= 0 && work == 0 {
			t.Fatalf("worker %d never works", i)
		}
		if p.School[i] >= 0 && study == 0 {
			t.Fatalf("student %d never studies", i)
		}
		if p.Work[i] < 0 && work > 0 || p.School[i] < 0 && study > 0 {
			t.Fatalf("individual %d has occupation activity without occupation", i)
		}
	}
}

func TestChildrenFollowGuardians(t *testing.T) {
	p, _, rt := setup(t)
	checked := 0
	for i := int32(0); i < int32(p.N) && checked < 500; i++ {
		if p.Age[i] > 14 || rt.VenueKey[i] == i {
			continue
		}
		g := rt.VenueKey[i]
		if p.House[g] != p.House[i] || p.Age[g] < 20 {
			t.Fatalf("child %d guardian %d invalid", i, g)
		}
		d := 0 // sunday: no school
		for _, a := range rt.Day(i, d) {
			if activity.IsWorkInPerson(a.Label) || a.Label == activity.Bar || a.Label == activity.Gym {
				t.Fatalf("child %d mimics adult-only activity %s", i, activity.Catalog[a.Label].Name)
			}
		}
		checked++
	}
	if checked == 0 {
		t.Fatal("no children checked")
	}
}

func TestNetworkMatchesRuleWeights(t *testing.T) {
	p, m, _ := setup(t)
	s := m.NewScratch()
	x := make([]float64, NumFeatures)
	worst, mean, n := 0.0, 0.0, 0
	for i := int32(0); i < 2000; i++ {
		for _, off := range []bool{false, true} {
			Features(p, i, off, x)
			o := m.Forward(x, s)
			w := RuleWeights(p, i, off)
			tot := 0.0
			for _, v := range w {
				tot += v
			}
			kl := 0.0
			for k := range w {
				q := w[k] / tot
				if q > 0 {
					kl += q * math.Log(q/math.Max(o[k], 1e-9))
				}
			}
			if kl > worst {
				worst = kl
			}
			mean += kl
			n++
		}
	}
	mean /= float64(n)
	t.Logf("KL(teacher||network): mean %.4f worst %.4f", mean, worst)
	if mean > 0.02 || worst > 0.3 {
		t.Fatalf("network deviates from teacher: mean KL %v worst %v", mean, worst)
	}
}

func TestWorkDays(t *testing.T) {
	p, _, rt := setup(t)
	for i := int32(0); i < int32(p.N); i++ {
		if rt.Shift[i] == TwelveByThirtySix {
			days := 0
			for d := 0; d < 7; d++ {
				for _, a := range rt.Day(i, d) {
					if activity.IsWorkInPerson(a.Label) {
						days++
						break
					}
				}
			}
			if days < 3 || days > 4 {
				t.Fatalf("12x36 worker %d works %d days", i, days)
			}
		}
	}
}
