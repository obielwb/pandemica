package scenario

import (
	"os"
	"path/filepath"
	"testing"
	"time"
)

func repo(t *testing.T, rel string) string {
	t.Helper()
	p := filepath.Join("..", "..", "..", rel)
	if _, err := os.Stat(p); err != nil {
		t.Skipf("data file missing: %s", p)
	}
	return p
}

func TestLoadCases(t *testing.T) {
	c, err := LoadCases(repo(t, "model/data/covid19/campinas_2020_2021_2022_cases.csv"))
	if err != nil {
		t.Fatal(err)
	}
	if len(c) != 1019 {
		t.Fatalf("rows %d", len(c))
	}
	last := c[len(c)-1]
	if last.TotalCases != 209500 || last.Deaths != 5360 || last.Date.Format(DateLayout) != "2022-12-31" {
		t.Fatalf("last row %+v", last)
	}
}

func TestLoadVaccines(t *testing.T) {
	v, err := LoadVaccines(repo(t, "model/data/covid19/campinas_2021_2022_2023_vaccines.csv"))
	if err != nil {
		t.Fatal(err)
	}
	first := 0
	for _, r := range v {
		if r.Dose == 1 {
			first += r.Count
		}
		if r.AgeHi < r.AgeLo || r.Count <= 0 {
			t.Fatalf("bad record %+v", r)
		}
	}
	if first < 1_100_000 {
		t.Fatalf("first doses %d", first)
	}
	if !v[0].Date.Before(v[len(v)-1].Date) {
		t.Fatal("not sorted")
	}
}

func TestPhaseAt(t *testing.T) {
	d := func(s string) Date { x, _ := time.Parse(DateLayout, s); return Date{x} }
	s := &Scenario{Start: d("2020-01-01"), End: d("2020-12-31"), Phases: []Phase{
		{Date: d("2020-06-01"), LeisureReduction: 0.5},
		{Date: d("2020-01-01"), LeisureReduction: 0.1},
	}}
	if err := s.Validate(); err != nil {
		t.Fatal(err)
	}
	if s.PhaseAt(d("2020-03-01").Time).LeisureReduction != 0.1 || s.PhaseAt(d("2020-06-01").Time).LeisureReduction != 0.5 {
		t.Fatal("phase lookup")
	}
	if s.Days() != 366 {
		t.Fatalf("days %d", s.Days())
	}
	s.Phases[0].MaskType = "bogus"
	if s.Validate() == nil {
		t.Fatal("expected validation error")
	}
}

func TestShippedScenarioLoads(t *testing.T) {
	s, err := Load(filepath.Join("..", "..", "scenarios", "campinas.json"))
	if err != nil {
		t.Fatal(err)
	}
	if s.Days() != 1019 {
		t.Fatalf("days %d", s.Days())
	}
}
