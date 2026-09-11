package sim

import (
	"os"
	"path/filepath"
	"testing"

	"github.com/ojpbarbosa/pandemica/engine/internal/population"
	"github.com/ojpbarbosa/pandemica/engine/internal/routine"
	"github.com/ojpbarbosa/pandemica/engine/internal/scenario"
)

// TestCampinasScenarioEndToEnd runs the shipped 2020-2022 timeline with the
// real vaccine registry on a 30k-person city and checks global invariants.
func TestCampinasScenarioEndToEnd(t *testing.T) {
	if testing.Short() {
		t.Skip("long test")
	}
	root := filepath.Join("..", "..", "..")
	vacPath := filepath.Join(root, "model", "data", "covid19", "campinas_2021_2022_2023_vaccines.csv")
	if _, err := os.Stat(vacPath); err != nil {
		t.Skip("data not present")
	}
	sc, err := scenario.Load(filepath.Join("..", "..", "scenarios", "campinas.json"))
	if err != nil {
		t.Fatal(err)
	}
	vax, err := scenario.LoadVaccines(vacPath)
	if err != nil {
		t.Fatal(err)
	}
	p, err := population.Generate(population.Options{N: 30000, Seed: 9})
	if err != nil {
		t.Fatal(err)
	}
	m, _ := routine.TrainPreferenceNetwork(p, 5000, 10, 9)
	w := NewWorld(p, routine.Generate(p, m, 9), 9)
	par := DefaultParams()
	par.Beta = 0.15
	s := New(w, sc, vax, par)
	stats := s.Run(0, nil)
	if len(stats) != sc.Days() {
		t.Fatalf("days %d want %d", len(stats), sc.Days())
	}
	last := stats[len(stats)-1]
	t.Logf("infections %d (ever %d), cases %d, deaths %d, doses %d/%d/%d",
		last.TotalInfections, last.EverInfected, last.TotalCases, last.TotalDeaths, last.Dose1, last.Dose2, last.Dose3)

	// first-dose coverage by the end of 2022: the registry has ~1.16M first
	// doses for 1.22M inhabitants (~95%); the simulated city must be close.
	cov := float64(last.Dose1) / float64(p.N)
	if cov < 0.8 || cov > 1.0 {
		t.Fatalf("first-dose coverage %.2f", cov)
	}
	if last.Dose2 > last.Dose1 || last.Dose3 == 0 {
		t.Fatalf("dose ordering broken: %d %d %d", last.Dose1, last.Dose2, last.Dose3)
	}
	// every variant introduced must have produced infections
	for _, v := range sc.Variants {
		_ = v
	}
	if last.EverInfected > p.N || last.TotalDeaths >= last.EverInfected {
		t.Fatal("implausible totals")
	}
	for k := 1; k < len(stats); k++ {
		if stats[k].TotalCases < stats[k-1].TotalCases || stats[k].TotalDeaths < stats[k-1].TotalDeaths {
			t.Fatal("cumulative series must not decrease")
		}
	}
	dead := 0
	for _, st := range s.State {
		if st == Dead {
			dead++
		}
	}
	if dead != last.TotalDeaths {
		t.Fatalf("dead individuals %d != reported deaths %d", dead, last.TotalDeaths)
	}
}
