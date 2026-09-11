package sim

import (
	"testing"
	"time"

	"github.com/ojpbarbosa/pandemica/engine-v2/internal/activity"
	"github.com/ojpbarbosa/pandemica/engine-v2/internal/disease"
	"github.com/ojpbarbosa/pandemica/engine-v2/internal/population"
	"github.com/ojpbarbosa/pandemica/engine-v2/internal/routine"
	"github.com/ojpbarbosa/pandemica/engine-v2/internal/scenario"
)

var testWorld *World

func world(t *testing.T) *World {
	t.Helper()
	if testWorld == nil {
		p, err := population.Generate(population.Options{N: 20000, Seed: 3, HospitalStaffShare: 0.5})
		if err != nil {
			t.Fatal(err)
		}
		m, _ := routine.TrainPreferenceNetwork(p, 5000, 10, 3)
		rt := routine.Generate(p, m, 3)
		testWorld = NewWorld(p, rt, 3)
	}
	return testWorld
}

func date(s string) scenario.Date {
	t, _ := time.Parse(scenario.DateLayout, s)
	return scenario.Date{Time: t}
}

func baseScenario() *scenario.Scenario {
	return &scenario.Scenario{
		Name: "test", Start: date("2020-03-18"), End: date("2020-06-30"),
		InitialInfections: 20,
		Phases:            []scenario.Phase{{Date: date("2020-03-18"), Isolation: 0.5, MaskType: "surgical"}},
	}
}

func run(t *testing.T, sc *scenario.Scenario, par Params, days int) []DayStats {
	t.Helper()
	s := New(world(t), sc, nil, par)
	return s.Run(days, nil)
}

func TestIndexMatchesLoc(t *testing.T) {
	w := world(t)
	if w.IndexSize() == 0 {
		t.Fatal("empty index")
	}
	for d := 0; d < 7; d++ {
		for loc := int32(0); loc < int32(w.NumLoc); loc++ {
			for _, e := range w.Entries(d, loc) {
				if got := w.Loc(e.ind, d, e.label(), e.start()); got != loc {
					t.Fatalf("entry %d at loc %d resolves to %d", e.ind, loc, got)
				}
				if e.end() <= e.start() || e.end() > 1440 {
					t.Fatalf("bad interval %d-%d", e.start(), e.end())
				}
			}
		}
	}
}

func TestPackRoundTrip(t *testing.T) {
	e := entry{7, pack(1439, 1440, activity.WorkLunch)}
	if e.start() != 1439 || e.end() != 1440 || e.label() != activity.WorkLunch {
		t.Fatalf("pack round trip: %d %d %d", e.start(), e.end(), e.label())
	}
}

func TestHomeOverlap(t *testing.T) {
	a := []seg{{0, 420, activity.Sleep7h, -1, true}, {420, 600, activity.StayAtHome, -1, true}, {600, 1440, activity.Gym, 3, false}}
	b := []seg{{0, 480, activity.Sleep8h, -1, true}, {480, 1440, activity.StayAtHome, -1, true}}
	// sleep partners share 0-420 asleep (silent 0.2); 420-480 one is asleep: no contact; 480-600 both awake
	awake, sleep := homeOverlap(a, b, true, false)
	if want := 420.0 / 60 * 0.2; sleep < want-1e-9 || sleep > want+1e-9 {
		t.Fatalf("partner sleep %v want %v", sleep, want)
	}
	if want := 120.0 / 60; awake < want-1e-9 || awake > want+1e-9 {
		t.Fatalf("awake %v want %v", awake, want)
	}
	// housemates in different bedrooms share no sleep
	if _, sleep := homeOverlap(a, b, false, false); sleep != 0 {
		t.Fatalf("non-partners share sleep %v", sleep)
	}
}

func TestZeroBetaNoSpread(t *testing.T) {
	par := DefaultParams()
	par.Beta = 0
	st := run(t, baseScenario(), par, 60)
	if last := st[len(st)-1]; last.TotalInfections != 20 {
		t.Fatalf("infections %d with beta 0", last.TotalInfections)
	}
}

func TestSpreadAndConservation(t *testing.T) {
	par := DefaultParams()
	par.Beta = 0.3
	s := New(world(t), baseScenario(), nil, par)
	s.Run(100, func(DayStats) {
		counts := [6]int{}
		for _, v := range s.State {
			counts[v]++
		}
		total := 0
		for _, c := range counts {
			total += c
		}
		if total != s.P.N {
			t.Fatalf("population not conserved: %d", total)
		}
	})
	last := s.Stats[len(s.Stats)-1]
	if last.TotalInfections < 1000 {
		t.Fatalf("expected an epidemic, got %d infections", last.TotalInfections)
	}
	settings := 0
	for k, v := range last.BySetting {
		_ = k
		settings += v
	}
	sum := 0
	for _, d := range s.Stats {
		for _, v := range d.BySetting {
			sum += v
		}
	}
	if sum != last.TotalInfections {
		t.Fatalf("setting attribution %d != infections %d", sum, last.TotalInfections)
	}
	if last.TotalDeaths == 0 || last.TotalDeaths > last.TotalInfections/20 {
		t.Fatalf("implausible deaths %d for %d infections", last.TotalDeaths, last.TotalInfections)
	}
}

func TestDeterministic(t *testing.T) {
	par := DefaultParams()
	par.Beta = 0.3
	a := run(t, baseScenario(), par, 50)
	b := run(t, baseScenario(), par, 50)
	for d := range a {
		if a[d].TotalInfections != b[d].TotalInfections || a[d].TotalDeaths != b[d].TotalDeaths {
			t.Fatalf("day %d differs: %d vs %d", d, a[d].TotalInfections, b[d].TotalInfections)
		}
	}
}

func TestInterventionsReduceSpread(t *testing.T) {
	par := DefaultParams()
	par.Beta = 0.3
	free := run(t, baseScenario(), par, 70)
	lock := baseScenario()
	lock.Phases[0].LeisureReduction = 0.8
	lock.Phases[0].WorkFromHome = 0.6
	lock.Phases[0].SchoolsClosed = 1
	lock.Phases[0].MaskAdherence = 0.9
	locked := run(t, lock, par, 70)
	f, l := free[len(free)-1].TotalInfections, locked[len(locked)-1].TotalInfections
	if l >= f/2 {
		t.Fatalf("interventions did not halve infections: free %d locked %d", f, l)
	}
}

func TestVaccinesAllocate(t *testing.T) {
	sc := baseScenario()
	sc.VaccinesEnabled = true
	d := date("2020-03-20").Time
	recs := []scenario.VaccineRecord{
		{Date: d, Dose: 1, Vaccine: "pfizer", Female: true, AgeLo: 60, AgeHi: 64, Count: 100000},
		{Date: d.AddDate(0, 0, 1), Dose: 2, Vaccine: "pfizer", Female: true, AgeLo: 60, AgeHi: 64, Count: 100000},
	}
	par := DefaultParams()
	par.Beta = 0
	s := New(world(t), sc, recs, par)
	s.Run(10, nil)
	vaccinated := 0
	for i := int32(0); i < int32(s.P.N); i++ {
		if s.Doses[i] > 0 {
			vaccinated++
			if s.P.Sex[i] != population.Female || s.P.Age[i] < 60 || s.P.Age[i] > 64 {
				t.Fatalf("wrong person vaccinated: sex %d age %d", s.P.Sex[i], s.P.Age[i])
			}
			if s.Doses[i] != 2 || disease.Vaccine(s.Vac[i]) != disease.Pfizer {
				t.Fatalf("expected 2 pfizer doses, got %d of %d", s.Doses[i], s.Vac[i])
			}
		}
	}
	if vaccinated == 0 {
		t.Fatal("nobody vaccinated")
	}
	last := s.Stats[len(s.Stats)-1]
	if last.Dose1 != vaccinated || last.Dose2 != vaccinated {
		t.Fatalf("dose counters %d %d vs %d", last.Dose1, last.Dose2, vaccinated)
	}
}

func TestVariantSeeding(t *testing.T) {
	sc := baseScenario()
	sc.Variants = []scenario.VariantIntro{{Date: date("2020-04-01"), Variant: "omicron", Seeds: 10}}
	par := DefaultParams()
	par.Beta = 0
	st := run(t, sc, par, 30)
	om := 0
	for _, d := range st {
		om += d.ByVariant[disease.VariantIndex("omicron")]
	}
	if om != 10 {
		t.Fatalf("omicron seeds %d", om)
	}
}

func TestDeterministicAcrossWorkerCounts(t *testing.T) {
	par := DefaultParams()
	par.Beta = 0.3
	par.Workers = 1
	a := run(t, baseScenario(), par, 60)
	par.Workers = 8
	b := run(t, baseScenario(), par, 60)
	for d := range a {
		if a[d].TotalInfections != b[d].TotalInfections || a[d].TotalCases != b[d].TotalCases || a[d].TotalDeaths != b[d].TotalDeaths {
			t.Fatalf("day %d differs between 1 and 8 workers: %d vs %d infections", d, a[d].TotalInfections, b[d].TotalInfections)
		}
	}
	if a[len(a)-1].TotalInfections < 1000 {
		t.Fatal("test needs an epidemic to be meaningful")
	}
}

func TestHomeOverlapV1Mode(t *testing.T) {
	a := []seg{{0, 420, activity.Sleep7h, -1, true}, {420, 1440, activity.StayAtHome, -1, true}}
	b := []seg{{0, 480, activity.Sleep8h, -1, true}, {480, 1440, activity.StayAtHome, -1, true}}
	awake, sleep := homeOverlap(a, b, true, true)
	// v1: 0-480 counts silently whether one or both are asleep, then awake
	if want := 480.0 / 60 * 0.2; sleep < want-1e-9 || sleep > want+1e-9 {
		t.Fatalf("v1 sleep %v want %v", sleep, want)
	}
	if want := 960.0 / 60; awake < want-1e-9 || awake > want+1e-9 {
		t.Fatalf("v1 awake %v want %v", awake, want)
	}
}
