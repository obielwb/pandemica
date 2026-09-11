package sim

import (
	"time"

	"github.com/ojpbarbosa/pandemica/engine-v2/internal/census"
	"github.com/ojpbarbosa/pandemica/engine-v2/internal/disease"
	"github.com/ojpbarbosa/pandemica/engine-v2/internal/population"
	"github.com/ojpbarbosa/pandemica/engine-v2/internal/rng"
	"github.com/ojpbarbosa/pandemica/engine-v2/internal/scenario"
)

const maxDoses = 4

// vaccinator replays the real Campinas dose registry: each record gives Count
// doses (scaled to the simulated population) of dose number Dose to people of
// one sex and 5-year age bracket who already have Dose-1 doses.
type vaccinator struct {
	recs  []scenario.VaccineRecord
	next  int
	scale float64
	carry float64
	pools [2][17][maxDoses + 1][]int32 // sex, age bracket, doses taken

	dose1, dose2, dose3 int
}

func vaccineType(name string) disease.Vaccine {
	switch name {
	case "pfizer":
		return disease.Pfizer
	case "astrazeneca":
		return disease.AstraZeneca
	case "janssen":
		return disease.Janssen
	case "coronavac":
		return disease.CoronaVac
	}
	return disease.NoVaccine
}

func newVaccinator(p *population.Population, recs []scenario.VaccineRecord, scale float64) *vaccinator {
	v := &vaccinator{recs: recs, scale: scale}
	for i := int32(0); i < int32(p.N); i++ {
		sex := p.Sex[i]
		b := p.AgeBracket[i]
		v.pools[sex][b][0] = append(v.pools[sex][b][0], i)
	}
	return v
}

func bracketOf(ageLo int) int {
	b := ageLo / 5
	if b >= len(census.Ages) {
		b = len(census.Ages) - 1
	}
	return b
}

func (v *vaccinator) apply(s *Sim, date time.Time, day int, r *rng.Stream) {
	for v.next < len(v.recs) && !v.recs[v.next].Date.After(date) {
		rec := v.recs[v.next]
		v.next++
		dose := rec.Dose
		if dose > maxDoses {
			dose = maxDoses
		}
		sex := population.Male
		if rec.Female {
			sex = population.Female
		}
		b := bracketOf(rec.AgeLo)
		want := float64(rec.Count)*v.scale + v.carry
		count := int(want)
		v.carry = want - float64(count)
		pool := &v.pools[sex][b][dose-1]
		for c := 0; c < count && len(*pool) > 0; {
			k := r.Intn(len(*pool))
			j := (*pool)[k]
			(*pool)[k] = (*pool)[len(*pool)-1]
			*pool = (*pool)[:len(*pool)-1]
			if s.State[j] == Dead {
				continue
			}
			if dose == 1 {
				s.Vac[j] = uint8(vaccineType(rec.Vaccine))
				v.dose1++
			} else if dose == 2 {
				v.dose2++
			} else {
				v.dose3++
			}
			s.Doses[j] = uint8(dose)
			s.LastDose[j] = int16(day)
			if dose < maxDoses {
				next := &v.pools[sex][b][dose]
				*next = append(*next, j)
			}
			c++
		}
	}
}
