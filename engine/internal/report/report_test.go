package report

import (
	"math"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"github.com/ojpbarbosa/pandemica/engine/internal/sim"
)

func TestMAPE(t *testing.T) {
	if got := MAPE([]float64{100, 200, 0}, []float64{110, 180, 5}); math.Abs(got-10) > 1e-9 {
		t.Fatalf("mape %v", got)
	}
	if !math.IsNaN(MAPE([]float64{0}, []float64{1})) {
		t.Fatal("expected NaN when reference is all zero")
	}
}

func TestWeekly(t *testing.T) {
	cum := []float64{0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14}
	w := weekly(cum)
	if len(w) != 2 || w[0] != 7 || w[1] != 7 {
		t.Fatalf("weekly %v", w)
	}
}

// The paper reports 58.48% accuracy for the TypeScript run; the paper metric
// computed on v1.csv against the real bulletin must reproduce it.
func TestPaperAccuracyDefinition(t *testing.T) {
	root := filepath.Join("..", "..", "..")
	v1 := filepath.Join(root, "web", "public", "simulation", "results", "campinas", "v1.csv")
	realPath := filepath.Join(root, "web", "public", "simulation", "data", "campinas", "2020_2021_2022_cases.csv")
	if _, err := os.Stat(v1); err != nil {
		t.Skip("paper results not present")
	}
	paper, err := LoadResultCSV("paper", v1)
	if err != nil {
		t.Fatal(err)
	}
	real, err := LoadResultCSV("real", realPath)
	if err != nil {
		t.Fatal(err)
	}
	m := Compare(real, paper, real.Dates[0], real.Dates[len(real.Dates)-1])
	t.Logf("paper v1: paper accuracy %.2f%%, curve accuracy %.2f%% (cases MAPE %.2f%%, deaths MAPE %.2f%%)",
		m.PaperAccuracy(), m.CurveAccuracy(), m.CasesMAPE, m.DeathsMAPE)
	if math.Abs(m.PaperAccuracy()-58.48) > 0.01 {
		t.Fatalf("paper accuracy %.3f, want 58.48", m.PaperAccuracy())
	}
}

func TestWriteCSVAndHTML(t *testing.T) {
	dir := t.TempDir()
	d0 := time.Date(2020, 3, 18, 0, 0, 0, 0, time.UTC)
	stats := []sim.DayStats{{Date: d0, NewCases: 1, TotalCases: 1}, {Date: d0.AddDate(0, 0, 1), NewCases: 2, TotalCases: 3, NewDeaths: 1, TotalDeaths: 1}}
	p := filepath.Join(dir, "r.csv")
	if err := WriteCSV(p, stats, 100000); err != nil {
		t.Fatal(err)
	}
	s, err := LoadResultCSV("x", p)
	if err != nil {
		t.Fatal(err)
	}
	if len(s.Cases) != 2 || s.Cases[1] != 3 || s.Deaths[1] != 1 {
		t.Fatalf("round trip %+v", s)
	}
	b, _ := os.ReadFile(p)
	if !strings.HasPrefix(string(b), "epi_week,date,state,city,ibgeID,newDeaths,deaths,newCases,totalCases") {
		t.Fatal("schema mismatch")
	}
	h := filepath.Join(dir, "r.html")
	if err := WriteHTML(h, "t", "<p>x</p>", []Chart{{Title: "c", Series: []Line{{Name: "a", Dates: s.Dates, Values: s.Cases}}}}); err != nil {
		t.Fatal(err)
	}
}
