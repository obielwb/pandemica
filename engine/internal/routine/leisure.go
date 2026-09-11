package routine

import (
	"math"

	"github.com/ojpbarbosa/pandemica/engine/internal/activity"
	"github.com/ojpbarbosa/pandemica/engine/internal/census"
	"github.com/ojpbarbosa/pandemica/engine/internal/nn"
	"github.com/ojpbarbosa/pandemica/engine/internal/population"
	"github.com/ojpbarbosa/pandemica/engine/internal/rng"
)

// The ten network outputs (the paper's 10-neuron output layer). Restaurant and
// party are split indoor/outdoor after selection.
const (
	outGrocery = iota
	outPharmacy
	outBakery
	outMall
	outRestaurant
	outBar
	outParty
	outPark
	outGym
	outChurch
	NumOutputs
)

// NumFeatures is the size of the paper's 10-neuron input layer.
const NumFeatures = 10

// Features encodes the sociodemographic profile of individual i for a day type.
func Features(p *population.Population, i int32, dayOff bool, x []float64) {
	b := func(v bool) float64 {
		if v {
			return 1
		}
		return 0
	}
	age := int(p.Age[i])
	h := p.House[i]
	size := p.HouseStart[h+1] - p.HouseStart[h]
	x[0] = float64(age) / 85
	x[1] = float64(p.Sex[i])
	x[2] = float64(p.Income[i]) / float64(len(census.Incomes)-1)
	x[3] = b(p.Work[i] >= 0)
	x[4] = b(p.School[i] >= 0)
	x[5] = b(age <= census.ChildAge)
	x[6] = b(age >= 60)
	x[7] = b(dayOff)
	x[8] = float64(size) / 11
	x[9] = float64(p.Transport[i])
}

// RuleWeights reproduces the TypeScript getAdjustedActivityWeights (weekly
// frequencies) aggregated into the ten outputs. It is the teacher signal for
// the neural network and the source of the daily activity rate.
func RuleWeights(p *population.Population, i int32, dayOff bool) [NumOutputs]float64 {
	w := [NumOutputs]float64{
		outGrocery: 2, outPharmacy: 1, outBakery: 2, outMall: 1,
		outRestaurant: 1.5, outBar: 0.5, outParty: 0.5, outPark: 1, outGym: 3, outChurch: 1,
	}
	age := int(p.Age[i])
	if age <= census.ChildAge {
		w[outBar], w[outGym] = 0, 0
	}
	if age >= census.ChildAge && age <= 19 {
		w[outParty] += 1
	} else if age >= 60 {
		w[outGym] /= 2
		w[outChurch] += 1
	}
	if p.Sex[i] == population.Male {
		w[outGym] += 0.5
	}
	if census.Incomes[p.Income[i]].Lo >= 10 {
		w[outMall] += 1
		w[outGrocery] += 0.5
		w[outRestaurant] += 1.5
	}
	if dayOff {
		w[outPark] += 0.25
		w[outMall] += 1
		w[outParty] += 1
		w[outBar] += 0.5
		w[outGym] -= 0.5
	} else {
		w[outGym] += 0.5
		w[outMall] -= 0.25
		w[outParty] -= 0.5
		w[outBar] -= 0.5
	}
	if age <= census.ChildAge {
		w[outBar], w[outGym] = 0, 0
	}
	for k := range w {
		if w[k] < 0 {
			w[k] = 0
		}
	}
	return w
}

// TrainPreferenceNetwork trains the 10-20-10 network on samples drawn from the
// population with the rule weights as soft targets.
func TrainPreferenceNetwork(p *population.Population, samples, epochs int, seed uint64) (*nn.MLP, float64) {
	r := rng.New(seed, 0x77)
	data := make([]nn.Sample, 0, samples)
	for k := 0; k < samples; k++ {
		i := int32(r.Intn(p.N))
		dayOff := k%2 == 1
		x := make([]float64, NumFeatures)
		Features(p, i, dayOff, x)
		w := RuleWeights(p, i, dayOff)
		sum := 0.0
		for _, v := range w {
			sum += v
		}
		y := make([]float64, NumOutputs)
		for o := range y {
			y[o] = w[o] / sum
		}
		data = append(data, nn.Sample{X: x, Y: y})
	}
	m := nn.New(NumFeatures, 20, NumOutputs, seed)
	loss := m.Train(data, epochs, 0.05, seed)
	return m, loss
}

// outputLabel converts a network output into a concrete activity label.
func outputLabel(o int, r *rng.Stream) activity.Label {
	switch o {
	case outGrocery:
		return activity.Grocery
	case outPharmacy:
		return activity.Pharmacy
	case outBakery:
		return activity.Bakery
	case outMall:
		return activity.Mall
	case outRestaurant:
		if r.Float64() < 1.0/3 {
			return activity.RestaurantOutdoor
		}
		return activity.RestaurantIndoor
	case outBar:
		return activity.Bar
	case outParty:
		if r.Float64() < 0.5 {
			return activity.PartyOutdoor
		}
		return activity.PartyIndoor
	case outPark:
		return activity.Park
	case outGym:
		return activity.Gym
	}
	return activity.Church
}

// poisson draws a Poisson deviate (Knuth; lambda is small here).
func poisson(lambda float64, r *rng.Stream) int {
	if lambda <= 0 {
		return 0
	}
	l := math.Exp(-lambda)
	k, prod := 0, r.Float64()
	for prod > l {
		k++
		prod *= r.Float64()
	}
	return k
}
