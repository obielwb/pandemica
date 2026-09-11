package census

import "testing"

func TestNormalizeSumsExactly(t *testing.T) {
	for _, total := range []int{10, 1000, PaperPopulation} {
		out := Normalize(RegionsPopulation, total)
		s := 0
		for _, p := range out {
			s += p.Value
		}
		if s != total {
			t.Fatalf("total %d: got %d", total, s)
		}
	}
}

func TestNormalizeAges(t *testing.T) {
	out := NormalizeAges(Ages, PaperPopulation, MalePercentage)
	f, m := 0, 0
	for _, a := range out {
		f += a.Female
		m += a.Male
	}
	if f+m != PaperPopulation {
		t.Fatalf("sum %d", f+m)
	}
	pct := float64(m) / float64(f+m) * 100
	if pct < MalePercentage-0.01 || pct > MalePercentage+0.01 {
		t.Fatalf("male pct %v want %v", pct, MalePercentage)
	}
	if len(out) != 17 || out[0].Lo != 0 || out[16].Hi != 84 {
		t.Fatal("bracket structure lost")
	}
}

func TestNormalizeResidentsPerHouse(t *testing.T) {
	out := NormalizeResidentsPerHouse(ResidentsPerHouse, PaperPopulation)
	res := 0
	for _, p := range out {
		res += p.Value * p.Label
	}
	if res != PaperPopulation {
		t.Fatalf("residents %d", res)
	}
}

func TestNormalizeIncomes(t *testing.T) {
	out := NormalizeIncomes(Incomes, 1000, 400)
	s := 0
	for _, v := range out {
		s += v
	}
	if s != 1000 || out[0] != 600 {
		t.Fatalf("incomes %v", out)
	}
}

func TestRegionsSumToPaperPopulation(t *testing.T) {
	s := 0
	for _, r := range RegionsPopulation {
		s += r.Value
	}
	if s != PaperPopulation {
		t.Fatalf("regions sum %d", s)
	}
}
