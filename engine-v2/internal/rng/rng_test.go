package rng

import "testing"

func TestStreamDeterministic(t *testing.T) {
	a, b := New(42, 1), New(42, 1)
	for i := 0; i < 1000; i++ {
		if a.Uint32() != b.Uint32() {
			t.Fatalf("streams diverged at %d", i)
		}
	}
	c := New(42, 2)
	same := 0
	a = New(42, 1)
	for i := 0; i < 1000; i++ {
		if a.Uint32() == c.Uint32() {
			same++
		}
	}
	if same > 5 {
		t.Fatalf("streams with different ids look identical (%d collisions)", same)
	}
}

func TestFloat64Range(t *testing.T) {
	s := New(1, 0)
	sum := 0.0
	for i := 0; i < 100000; i++ {
		f := s.Float64()
		if f < 0 || f >= 1 {
			t.Fatalf("out of range: %v", f)
		}
		sum += f
	}
	if mean := sum / 100000; mean < 0.49 || mean > 0.51 {
		t.Fatalf("mean %v not ~0.5", mean)
	}
}

func TestWeighted(t *testing.T) {
	s := New(7, 0)
	counts := make([]int, 3)
	w := []float64{1, 0, 3}
	for i := 0; i < 40000; i++ {
		counts[s.Weighted(w)]++
	}
	if counts[1] != 0 {
		t.Fatalf("zero weight picked %d times", counts[1])
	}
	ratio := float64(counts[2]) / float64(counts[0])
	if ratio < 2.7 || ratio > 3.3 {
		t.Fatalf("ratio %v not ~3", ratio)
	}
	if s.Weighted([]float64{0, 0}) != -1 {
		t.Fatal("expected -1 for all-zero weights")
	}
}

func TestHashUnitStable(t *testing.T) {
	if HashUnit(1, 2, 3) != HashUnit(1, 2, 3) {
		t.Fatal("hash not stable")
	}
	if HashUnit(1, 2, 3) == HashUnit(1, 2, 4) {
		t.Fatal("hash collision on trivial input")
	}
	s := 0.0
	for i := uint64(0); i < 100000; i++ {
		s += HashUnit(i, 9)
	}
	if m := s / 100000; m < 0.49 || m > 0.51 {
		t.Fatalf("hash mean %v", m)
	}
}

func TestShuffleIsPermutation(t *testing.T) {
	s := New(3, 0)
	a := make([]int32, 100)
	for i := range a {
		a[i] = int32(i)
	}
	s.Shuffle(a)
	seen := make(map[int32]bool)
	for _, v := range a {
		seen[v] = true
	}
	if len(seen) != 100 {
		t.Fatal("shuffle lost elements")
	}
}
