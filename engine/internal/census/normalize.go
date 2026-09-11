package census

import "math"

// Normalize scales labelled counts so they sum exactly to total, keeping the
// original proportions (the TypeScript `normalize`).
func Normalize(params []Parameter, total int) []Parameter {
	out := make([]Parameter, len(params))
	labelled := 0
	for _, p := range params {
		labelled += p.Value
	}
	if labelled == 0 || len(params) == 0 {
		return out
	}
	sum := 0
	for i, p := range params {
		v := int(math.Round(float64(p.Value) / float64(labelled) * float64(total)))
		out[i] = Parameter{p.Label, v}
		sum += v
	}
	fixRemainder(func(i int, d int) { out[i].Value += d }, len(out), total-sum)
	return out
}

// fixRemainder distributes diff one unit at a time round-robin across n slots.
func fixRemainder(add func(i, d int), n, diff int) {
	if n == 0 {
		return
	}
	i := 0
	for diff > 0 {
		add(i%n, 1)
		diff--
		i++
	}
	for diff < 0 {
		add(i%n, -1)
		diff++
		i++
	}
}

// NormalizedAge is a scaled age bracket.
type NormalizedAge struct {
	Lo, Hi int
	Female int
	Male   int
}

// NormalizeAges scales the census age pyramid to total individuals while
// enforcing the male percentage.
func NormalizeAges(ages []AgeBracket, total int, malePercentage float64) []NormalizedAge {
	totalMales := int(math.Round(float64(total) * malePercentage / 100))
	totalFemales := total - totalMales
	sumF, sumM := 0, 0
	for _, a := range ages {
		sumF += a.Female
		sumM += a.Male
	}
	out := make([]NormalizedAge, len(ages))
	gotF, gotM := 0, 0
	for i, a := range ages {
		f := int(math.Round(float64(a.Female) / float64(sumF) * float64(totalFemales)))
		m := int(math.Round(float64(a.Male) / float64(sumM) * float64(totalMales)))
		out[i] = NormalizedAge{a.Lo, a.Hi, f, m}
		gotF += f
		gotM += m
	}
	fixRemainder(func(i, d int) { out[i].Female += d }, len(out), totalFemales-gotF)
	fixRemainder(func(i, d int) { out[i].Male += d }, len(out), totalMales-gotM)
	return out
}

// NormalizeResidentsPerHouse scales house-size counts so that the residents
// (size × houses) sum exactly to total. Sizes are the labels.
func NormalizeResidentsPerHouse(params []Parameter, total int) []Parameter {
	residents := 0
	for _, p := range params {
		residents += p.Value * p.Label
	}
	out := make([]Parameter, len(params))
	got := 0
	for i, p := range params {
		v := int(math.Round(float64(p.Value) / float64(residents) * float64(total)))
		out[i] = Parameter{p.Label, v}
		got += v * p.Label
	}
	// adjust using single-resident houses so the residents sum is exact
	diff := total - got
	for i := range out {
		if out[i].Label == 1 {
			out[i].Value += diff
			diff = 0
		}
	}
	if diff != 0 { // no size-1 bucket: append one
		out = append(out, Parameter{1, diff})
	}
	return out
}

// NormalizeIncomes returns the number of individuals per income bracket for a
// population of `total` with `workers` employed people: non-zero brackets are
// scaled to the workers, the zero bracket takes everyone else.
func NormalizeIncomes(incomes []IncomeBracket, total, workers int) []int {
	out := make([]int, len(incomes))
	nonZero := 0
	for _, b := range incomes {
		if b.Hi != 0 {
			nonZero += b.Value
		}
	}
	got := 0
	idx := []int{}
	for i, b := range incomes {
		if b.Hi == 0 {
			continue
		}
		out[i] = int(math.Round(float64(b.Value) / float64(nonZero) * float64(workers)))
		got += out[i]
		idx = append(idx, i)
	}
	fixRemainder(func(k, d int) { out[idx[k]] += d }, len(idx), workers-got)
	for i, b := range incomes {
		if b.Hi == 0 {
			out[i] = total - workers
		}
	}
	return out
}
