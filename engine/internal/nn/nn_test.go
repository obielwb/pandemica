package nn

import (
	"math"
	"path/filepath"
	"testing"
)

func TestSoftmaxSumsToOne(t *testing.T) {
	m := New(10, 20, 10, 1)
	s := m.NewScratch()
	o := m.Forward(make([]float64, 10), s)
	sum := 0.0
	for _, v := range o {
		sum += v
	}
	if math.Abs(sum-1) > 1e-9 {
		t.Fatalf("softmax sums to %v", sum)
	}
}

func TestLearnsXOR(t *testing.T) {
	m := New(2, 8, 2, 3)
	data := []Sample{
		{[]float64{0, 0}, []float64{1, 0}},
		{[]float64{0, 1}, []float64{0, 1}},
		{[]float64{1, 0}, []float64{0, 1}},
		{[]float64{1, 1}, []float64{1, 0}},
	}
	m.Train(data, 4000, 0.5, 9)
	s := m.NewScratch()
	for _, d := range data {
		o := m.Forward(d.X, s)
		want := 0
		if d.Y[1] == 1 {
			want = 1
		}
		if o[want] < 0.9 {
			t.Fatalf("xor %v: output %v", d.X, o)
		}
	}
}

func TestLearnsSoftTargets(t *testing.T) {
	// the network must reproduce a feature-dependent distribution
	m := New(10, 20, 10, 5)
	var data []Sample
	for i := 0; i < 200; i++ {
		x := make([]float64, 10)
		x[0] = float64(i % 2)
		y := make([]float64, 10)
		if i%2 == 0 {
			y[0], y[1] = 0.7, 0.3
		} else {
			y[8], y[9] = 0.5, 0.5
		}
		data = append(data, Sample{x, y})
	}
	m.Train(data, 60, 0.1, 1)
	s := m.NewScratch()
	x := make([]float64, 10)
	o := m.Forward(x, s)
	if math.Abs(o[0]-0.7) > 0.05 || math.Abs(o[1]-0.3) > 0.05 {
		t.Fatalf("class 0 output %v", o)
	}
	x[0] = 1
	o = m.Forward(x, s)
	if math.Abs(o[8]-0.5) > 0.05 || math.Abs(o[9]-0.5) > 0.05 {
		t.Fatalf("class 1 output %v", o)
	}
}

func TestSaveLoad(t *testing.T) {
	m := New(10, 20, 10, 2)
	p := filepath.Join(t.TempDir(), "m.json")
	if err := m.Save(p); err != nil {
		t.Fatal(err)
	}
	l, err := Load(p)
	if err != nil {
		t.Fatal(err)
	}
	x := []float64{1, 0, 1, 0, 1, 0, 1, 0, 1, 0}
	a := m.Forward(x, m.NewScratch())
	b := l.Forward(x, l.NewScratch())
	for i := range a {
		if a[i] != b[i] {
			t.Fatal("loaded network differs")
		}
	}
}
