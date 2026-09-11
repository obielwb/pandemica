// Package nn implements the small feedforward network described in the paper:
// 10 input neurons, one hidden layer of 20 sigmoid neurons and 10 softmax
// outputs, trained with backpropagation (SGD on cross-entropy with soft
// targets). It is used to assign leisure/shopping preferences to individuals.
package nn

import (
	"encoding/json"
	"math"
	"os"

	"github.com/ojpbarbosa/pandemica/engine-v2/internal/rng"
)

// MLP is a one-hidden-layer perceptron.
type MLP struct {
	In, Hidden, Out int
	W1              []float64 // Hidden × In
	B1              []float64 // Hidden
	W2              []float64 // Out × Hidden
	B2              []float64 // Out
}

// New creates a network with Xavier-initialized weights.
func New(in, hidden, out int, seed uint64) *MLP {
	r := rng.New(seed, 0xAA)
	m := &MLP{In: in, Hidden: hidden, Out: out,
		W1: make([]float64, hidden*in), B1: make([]float64, hidden),
		W2: make([]float64, out*hidden), B2: make([]float64, out)}
	s1 := math.Sqrt(2.0 / float64(in+hidden))
	for i := range m.W1 {
		m.W1[i] = r.Normal() * s1
	}
	s2 := math.Sqrt(2.0 / float64(hidden+out))
	for i := range m.W2 {
		m.W2[i] = r.Normal() * s2
	}
	return m
}

func sigmoid(x float64) float64 { return 1 / (1 + math.Exp(-x)) }

// Scratch holds per-goroutine buffers so Forward does not allocate.
type Scratch struct {
	h, o []float64
}

// NewScratch allocates buffers for m.
func (m *MLP) NewScratch() *Scratch {
	return &Scratch{h: make([]float64, m.Hidden), o: make([]float64, m.Out)}
}

// Forward computes the softmax output for x into s and returns it. The
// returned slice is owned by s.
func (m *MLP) Forward(x []float64, s *Scratch) []float64 {
	for j := 0; j < m.Hidden; j++ {
		z := m.B1[j]
		row := m.W1[j*m.In : (j+1)*m.In]
		for i, xi := range x {
			z += row[i] * xi
		}
		s.h[j] = sigmoid(z)
	}
	maxZ := math.Inf(-1)
	for k := 0; k < m.Out; k++ {
		z := m.B2[k]
		row := m.W2[k*m.Hidden : (k+1)*m.Hidden]
		for j, hj := range s.h {
			z += row[j] * hj
		}
		s.o[k] = z
		if z > maxZ {
			maxZ = z
		}
	}
	sum := 0.0
	for k := range s.o {
		s.o[k] = math.Exp(s.o[k] - maxZ)
		sum += s.o[k]
	}
	for k := range s.o {
		s.o[k] /= sum
	}
	return s.o
}

// Sample is one training example: input features and a target probability
// distribution over the outputs.
type Sample struct {
	X []float64
	Y []float64
}

// Train runs SGD with backpropagation for the given number of epochs and
// returns the mean cross-entropy of the final epoch.
func (m *MLP) Train(samples []Sample, epochs int, lr float64, seed uint64) float64 {
	r := rng.New(seed, 0xBB)
	s := m.NewScratch()
	dOut := make([]float64, m.Out)
	dHid := make([]float64, m.Hidden)
	order := make([]int32, len(samples))
	for i := range order {
		order[i] = int32(i)
	}
	var loss float64
	for e := 0; e < epochs; e++ {
		r.Shuffle(order)
		loss = 0
		for _, idx := range order {
			sm := samples[idx]
			o := m.Forward(sm.X, s)
			for k := range o {
				dOut[k] = o[k] - sm.Y[k] // softmax + cross-entropy gradient
				if sm.Y[k] > 0 {
					loss -= sm.Y[k] * math.Log(math.Max(o[k], 1e-12))
				}
			}
			for j := 0; j < m.Hidden; j++ {
				g := 0.0
				for k := 0; k < m.Out; k++ {
					g += m.W2[k*m.Hidden+j] * dOut[k]
				}
				dHid[j] = g * s.h[j] * (1 - s.h[j])
			}
			for k := 0; k < m.Out; k++ {
				row := m.W2[k*m.Hidden : (k+1)*m.Hidden]
				for j := range row {
					row[j] -= lr * dOut[k] * s.h[j]
				}
				m.B2[k] -= lr * dOut[k]
			}
			for j := 0; j < m.Hidden; j++ {
				row := m.W1[j*m.In : (j+1)*m.In]
				for i := range row {
					row[i] -= lr * dHid[j] * sm.X[i]
				}
				m.B1[j] -= lr * dHid[j]
			}
		}
		loss /= float64(len(samples))
	}
	return loss
}

// Save writes the network as JSON.
func (m *MLP) Save(path string) error {
	b, err := json.Marshal(m)
	if err != nil {
		return err
	}
	return os.WriteFile(path, b, 0o644)
}

// Load reads a network saved with Save.
func Load(path string) (*MLP, error) {
	b, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}
	var m MLP
	if err := json.Unmarshal(b, &m); err != nil {
		return nil, err
	}
	return &m, nil
}
