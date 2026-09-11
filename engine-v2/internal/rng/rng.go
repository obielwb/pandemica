// Package rng provides small, fast, deterministic random sources used by the
// simulation. Every worker owns its own stream so parallel passes stay
// reproducible for a given seed.
package rng

import "math"

// Splitmix64 advances a 64-bit state and returns the next output. It is the
// generator used to seed streams and to derive stable hashes.
func Splitmix64(state *uint64) uint64 {
	*state += 0x9E3779B97F4A7C15
	z := *state
	z = (z ^ (z >> 30)) * 0xBF58476D1CE4E5B9
	z = (z ^ (z >> 27)) * 0x94D049BB133111EB
	return z ^ (z >> 31)
}

// Hash mixes an arbitrary list of integers into a well-distributed 64-bit
// value. It is used to make per-(individual, day, ordinal) decisions that both
// simulation passes must agree on without storing anything.
func Hash(parts ...uint64) uint64 {
	h := uint64(0x243F6A8885A308D3)
	for _, p := range parts {
		h ^= p + 0x9E3779B97F4A7C15 + (h << 6) + (h >> 2)
		h = Splitmix64(&h)
	}
	return h
}

// HashUnit returns Hash(parts) mapped to [0, 1).
func HashUnit(parts ...uint64) float64 {
	return float64(Hash(parts...)>>11) / float64(1<<53)
}

// Stream is a PCG32-style generator (xorshift-multiply on a 64-bit LCG).
type Stream struct {
	state uint64
	inc   uint64
}

// New returns a stream seeded from seed and stream id. Different ids yield
// independent sequences for the same seed.
func New(seed, id uint64) *Stream {
	s := &Stream{inc: (id << 1) | 1}
	s.state = 0
	s.Uint32()
	s.state += seed
	s.Uint32()
	return s
}

// Uint32 returns the next 32 random bits.
func (s *Stream) Uint32() uint32 {
	old := s.state
	s.state = old*6364136223846793005 + s.inc
	xorshifted := uint32(((old >> 18) ^ old) >> 27)
	rot := uint32(old >> 59)
	return (xorshifted >> rot) | (xorshifted << ((-rot) & 31))
}

// Uint64 returns 64 random bits.
func (s *Stream) Uint64() uint64 {
	return uint64(s.Uint32())<<32 | uint64(s.Uint32())
}

// Float64 returns a uniform value in [0, 1).
func (s *Stream) Float64() float64 {
	return float64(s.Uint64()>>11) / float64(1<<53)
}

// Intn returns a uniform integer in [0, n). n must be > 0.
func (s *Stream) Intn(n int) int {
	if n <= 0 {
		panic("rng: Intn with n <= 0")
	}
	return int(s.Uint64() % uint64(n))
}

// IntRange returns a uniform integer in [lo, hi] inclusive.
func (s *Stream) IntRange(lo, hi int) int {
	return lo + s.Intn(hi-lo+1)
}

// Bernoulli returns true with probability p.
func (s *Stream) Bernoulli(p float64) bool {
	if p <= 0 {
		return false
	}
	if p >= 1 {
		return true
	}
	return s.Float64() < p
}

// Normal returns a standard normal deviate (Box-Muller).
func (s *Stream) Normal() float64 {
	u1 := 1 - s.Float64()
	u2 := s.Float64()
	return math.Sqrt(-2*math.Log(u1)) * math.Cos(2*math.Pi*u2)
}

// Weighted picks an index with probability proportional to weights[i].
// Non-positive weights are never picked. If every weight is non-positive it
// returns -1.
func (s *Stream) Weighted(weights []float64) int {
	total := 0.0
	for _, w := range weights {
		if w > 0 {
			total += w
		}
	}
	if total <= 0 {
		return -1
	}
	r := s.Float64() * total
	for i, w := range weights {
		if w <= 0 {
			continue
		}
		r -= w
		if r < 0 {
			return i
		}
	}
	for i := len(weights) - 1; i >= 0; i-- {
		if weights[i] > 0 {
			return i
		}
	}
	return -1
}

// Shuffle performs a Fisher-Yates shuffle of an int32 slice.
func (s *Stream) Shuffle(a []int32) {
	for i := len(a) - 1; i > 0; i-- {
		j := s.Intn(i + 1)
		a[i], a[j] = a[j], a[i]
	}
}

// ShuffleN shuffles n elements addressed through swap.
func (s *Stream) ShuffleN(n int, swap func(i, j int)) {
	for i := n - 1; i > 0; i-- {
		j := s.Intn(i + 1)
		swap(i, j)
	}
}
