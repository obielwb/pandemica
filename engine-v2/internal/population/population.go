// Package population synthesizes the virtual city population from the census
// constants, following model/src/population but storing every attribute in
// flat arrays (struct of arrays) to keep 1.16M individuals compact.
package population

import (
	"fmt"
	"math"
	"sort"

	"github.com/ojpbarbosa/pandemica/engine-v2/internal/activity"
	"github.com/ojpbarbosa/pandemica/engine-v2/internal/census"
	"github.com/ojpbarbosa/pandemica/engine-v2/internal/rng"
)

// Sex values.
const (
	Male   uint8 = 0
	Female uint8 = 1
)

// Education status (TypeScript EducationStatus).
type Education uint8

const (
	EduNone Education = iota
	Preschooler
	MiddleSchooler
	HighSchooler
	Undergraduate
	Graduate
	Educated
	Unschooled
)

// Transport means.
const (
	Public  uint8 = 0
	Private uint8 = 1
)

// Population holds every individual attribute plus the houses, workplaces and
// schools they belong to.
type Population struct {
	N int

	Sex        []uint8
	Age        []uint8 // years
	AgeBracket []uint8 // index into census.Ages
	Education  []Education
	Income     []uint8 // index into census.Incomes
	Transport  []uint8
	House      []int32
	Work       []int32 // work site id or -1
	WorkGroup  []int32 // team inside the work site or -1
	School     []int32 // school id or -1
	Class      []int32 // class inside the school or -1

	HouseRegion  []uint8
	HouseStart   []int32 // CSR offsets, len = houses+1
	HouseMembers []int32

	WorkLabel     []activity.Label
	WorkSize      []census.WorkSize
	WorkEmployees []int32
	NumWorkGroups int
	WorkGroupSize []int32

	HospitalGroup []bool  // per work group: a hospital ward team (v2)
	SleepPartner  []int32 // per individual: who shares their bedroom, or -1 (v2)

	SchoolLabel []activity.Label
	SchoolSize  []int32
	NumClasses  int
	ClassSize   []int32
}

// NumHouses returns the number of houses.
func (p *Population) NumHouses() int { return len(p.HouseRegion) }

// Housemates returns the members of house h (including the individual).
func (p *Population) Housemates(h int32) []int32 {
	return p.HouseMembers[p.HouseStart[h]:p.HouseStart[h+1]]
}

// Region returns the region of individual i.
func (p *Population) Region(i int32) census.Region {
	return census.Region(p.HouseRegion[p.House[i]])
}

// HasWork / HasStudy.
func (p *Population) HasWork(i int32) bool  { return p.Work[i] >= 0 }
func (p *Population) HasStudy(i int32) bool { return p.School[i] >= 0 }

// Options control synthesis.
type Options struct {
	N    int
	Seed uint64
	// HospitalStaffShare is the share of the census health workforce that
	// works in hospital wards (v2 assumption); 0 builds no hospitals.
	HospitalStaffShare float64
}

// SleepPartnerOf returns i's sleep partner or -1.
func (p *Population) SleepPartnerOf(i int32) int32 {
	if p.SleepPartner == nil {
		return -1
	}
	return p.SleepPartner[i]
}

func scaleCount(v int, scale float64) int {
	if v == 0 {
		return 0
	}
	c := int(math.Round(float64(v) * scale))
	if c < 1 {
		c = 1
	}
	return c
}

// Generate builds a population of opts.N individuals.
func Generate(opts Options) (*Population, error) {
	n := opts.N
	if n < 100 {
		return nil, fmt.Errorf("population too small: %d", n)
	}
	r := rng.New(opts.Seed, 1)
	p := &Population{
		N:          n,
		Sex:        make([]uint8, n),
		Age:        make([]uint8, n),
		AgeBracket: make([]uint8, n),
		Education:  make([]Education, n),
		Income:     make([]uint8, n),
		Transport:  make([]uint8, n),
		House:      make([]int32, n),
		Work:       make([]int32, n),
		WorkGroup:  make([]int32, n),
		School:     make([]int32, n),
		Class:      make([]int32, n),
	}
	for i := 0; i < n; i++ {
		p.Work[i], p.WorkGroup[i], p.School[i], p.Class[i] = -1, -1, -1, -1
	}
	assignSexAndAge(p, r)
	assignHouses(p, r)
	assignSleepPartners(p)
	assignEducation(p, r)
	assignSchools(p, r)
	assignWork(p, r, opts.HospitalStaffShare)
	assignIncome(p, r)
	assignTransport(p, r)
	return p, nil
}

func assignSexAndAge(p *Population, r *rng.Stream) {
	ages := census.NormalizeAges(census.Ages, p.N, census.MalePercentage)
	idx := 0
	for b, a := range ages {
		for s, count := range []int{a.Male, a.Female} {
			for k := 0; k < count; k++ {
				p.Sex[idx] = uint8(s)
				p.AgeBracket[idx] = uint8(b)
				p.Age[idx] = uint8(a.Lo + r.Intn(a.Hi-a.Lo+1))
				idx++
			}
		}
	}
	// shuffle all attributes together so ids carry no ordering
	r.ShuffleN(p.N, func(i, j int) {
		p.Sex[i], p.Sex[j] = p.Sex[j], p.Sex[i]
		p.Age[i], p.Age[j] = p.Age[j], p.Age[i]
		p.AgeBracket[i], p.AgeBracket[j] = p.AgeBracket[j], p.AgeBracket[i]
	})
}

// assignHouses creates houses with the normalized residents-per-house
// distribution, assigns regions, and places one adult (20+) in every house
// before filling the remaining slots with a random mix of the rest, so that no
// child lives alone (the paper's constraint).
func assignHouses(p *Population, r *rng.Stream) {
	sizes := census.NormalizeResidentsPerHouse(census.ResidentsPerHouse, p.N)
	var houseSize []int
	for _, s := range sizes {
		for k := 0; k < s.Value; k++ {
			houseSize = append(houseSize, s.Label)
		}
	}
	h := len(houseSize)
	hs := make([]int32, h)
	for i := range hs {
		hs[i] = int32(i)
	}
	r.Shuffle(hs)
	shuffledSize := make([]int, h)
	for i, k := range hs {
		shuffledSize[i] = houseSize[k]
	}
	houseSize = shuffledSize

	regions := census.Normalize(census.RegionsPopulation, h)
	p.HouseRegion = make([]uint8, h)
	k := 0
	for _, reg := range regions {
		for c := 0; c < reg.Value; c++ {
			p.HouseRegion[k] = uint8(reg.Label)
			k++
		}
	}

	var adults, minors []int32
	for i := 0; i < p.N; i++ {
		if p.Age[i] >= 20 {
			adults = append(adults, int32(i))
		} else {
			minors = append(minors, int32(i))
		}
	}
	r.Shuffle(adults)
	r.Shuffle(minors)

	p.HouseStart = make([]int32, h+1)
	for i := 0; i < h; i++ {
		p.HouseStart[i+1] = p.HouseStart[i] + int32(houseSize[i])
	}
	p.HouseMembers = make([]int32, p.N)
	fill := make([]int32, h) // members placed so far
	place := func(house int, ind int32) {
		p.HouseMembers[p.HouseStart[house]+fill[house]] = ind
		p.House[ind] = int32(house)
		fill[house]++
	}
	ai := 0
	// pass 1: one adult per house (single-resident houses first so they are adults)
	order := make([]int, h)
	for i := range order {
		order[i] = i
	}
	sort.SliceStable(order, func(a, b int) bool { return houseSize[order[a]] < houseSize[order[b]] })
	for _, house := range order {
		if ai < len(adults) {
			place(house, adults[ai])
			ai++
		}
	}
	// pass 2: remaining people shuffled together fill the free slots
	rest := append(adults[ai:len(adults):len(adults)], minors...)
	r.Shuffle(rest)
	ri := 0
	for house := 0; house < h; house++ {
		for fill[house] < int32(houseSize[house]) && ri < len(rest) {
			place(house, rest[ri])
			ri++
		}
	}
	if ri != len(rest) {
		panic(fmt.Sprintf("population: %d individuals without a house", len(rest)-ri))
	}
}

func assignEducation(p *Population, r *rng.Stream) {
	scale := float64(p.N) / float64(census.IBGE2010Population)
	order := make([]int32, p.N)
	for i := range order {
		order[i] = int32(i)
	}
	r.Shuffle(order)
	quota := func(q census.AgeQuota, status Education) {
		limit := scaleCount(q.Value, scale)
		c := 0
		for _, i := range order {
			if c >= limit {
				break
			}
			a := int(p.Age[i])
			if p.Education[i] == EduNone && a >= q.Lo && a <= q.Hi {
				p.Education[i] = status
				c++
			}
		}
	}
	quota(census.Preschoolers, Preschooler)
	quota(census.MiddleSchoolersYoungerThan10, MiddleSchooler)
	quota(census.MiddleSchoolersOlderThan10, MiddleSchooler)
	quota(census.HighSchoolers, HighSchooler)
	quota(census.UndergradStudents, Undergraduate)
	quota(census.GradStudents, Graduate)
	never := scaleCount(census.NeverAttended, scale)
	for _, i := range order {
		if p.Education[i] != EduNone {
			continue
		}
		if p.Age[i] <= 19 {
			if p.Age[i] >= 5 && never > 0 { // toddlers stay EduNone
				p.Education[i] = Unschooled
				never--
			}
			continue
		}
		if never > 0 && r.Bernoulli(0.1) {
			p.Education[i] = Unschooled
			never--
		} else {
			p.Education[i] = Educated
		}
	}
}

func assignSchools(p *Population, r *rng.Stream) {
	scale := float64(p.N) / float64(census.PaperPopulation)
	levels := []struct {
		label  activity.Label
		sites  int
		status []Education
	}{
		{activity.PreschoolInPerson, census.Preschools, []Education{Preschooler}},
		{activity.MiddleSchoolInPerson, census.MiddleSchools, []Education{MiddleSchooler}},
		{activity.HighSchoolInPerson, census.HighSchools, []Education{HighSchooler}},
		{activity.CollegeInPerson, census.Colleges, []Education{Undergraduate, Graduate}},
	}
	for _, lv := range levels {
		var students []int32
		for i := 0; i < p.N; i++ {
			for _, s := range lv.status {
				if p.Education[i] == s {
					students = append(students, int32(i))
				}
			}
		}
		if len(students) == 0 {
			continue
		}
		// students attend a school of their own region when possible: sort by region
		r.Shuffle(students)
		sort.SliceStable(students, func(a, b int) bool {
			return p.HouseRegion[p.House[students[a]]] < p.HouseRegion[p.House[students[b]]]
		})
		sites := scaleCount(lv.sites, scale)
		per := int(math.Ceil(float64(len(students)) / float64(sites)))
		classCap := int(activity.Catalog[lv.label].MaxEngaged)
		for s := 0; s < sites; s++ {
			lo := s * per
			if lo >= len(students) {
				break
			}
			hi := lo + per
			if hi > len(students) {
				hi = len(students)
			}
			id := int32(len(p.SchoolLabel))
			p.SchoolLabel = append(p.SchoolLabel, lv.label)
			p.SchoolSize = append(p.SchoolSize, int32(hi-lo))
			nClasses := int(math.Ceil(float64(hi-lo) / float64(classCap)))
			base := p.NumClasses
			for c := 0; c < nClasses; c++ {
				p.ClassSize = append(p.ClassSize, 0)
			}
			p.NumClasses += nClasses
			for k := lo; k < hi; k++ {
				i := students[k]
				p.School[i] = id
				c := int32(base + (k-lo)%nClasses)
				p.Class[i] = c
				p.ClassSize[c]++
			}
		}
	}
}

// assignWork creates the workplaces and staffs them. Only the census number of
// employed people (scaled) aged 20-64 get a job; every site first receives its
// minimum staff, the rest are spread round-robin prioritizing micro sites (as
// in the TypeScript model). Teams are chunks of MaxEngaged employees.
func assignWork(p *Population, r *rng.Stream, staffShare float64) {
	scale := float64(p.N) / float64(census.PaperPopulation)
	var candidates []int32
	for i := 0; i < p.N; i++ {
		if p.Age[i] >= 20 && p.Age[i] <= census.RetirementAge {
			candidates = append(candidates, int32(i))
		}
	}
	r.Shuffle(candidates)
	employed := scaleCount(census.TotalEmployed, float64(p.N)/float64(census.IBGE2010Population))
	if employed < len(candidates) {
		candidates = candidates[:employed]
	}
	// v2: hospital staff come out of the employed total
	nStaff := int(math.Round(float64(census.HealthWorkers2010) * float64(p.N) / float64(census.IBGE2010Population) * staffShare))
	if nStaff > len(candidates) {
		nStaff = len(candidates)
	}
	staff := candidates[:nStaff]
	candidates = candidates[nStaff:]
	type site struct {
		cat     census.WorkCategory
		members []int32
	}
	var sites []*site
	for _, group := range [][]census.WorkCategory{census.Industries, census.CommerceAndServices} {
		for _, c := range group {
			count := scaleCount(c.Sites, scale)
			for k := 0; k < count; k++ {
				sites = append(sites, &site{cat: c})
			}
		}
	}
	w := 0
	for _, s := range sites {
		for k := 0; k < s.cat.MinEmployees && w < len(candidates); k++ {
			s.members = append(s.members, candidates[w])
			w++
		}
	}
	sort.SliceStable(sites, func(a, b int) bool { return sites[a].cat.Size < sites[b].cat.Size })
	for si := 0; w < len(candidates); si = (si + 1) % len(sites) {
		s := sites[si]
		if len(s.members) < s.cat.MaxEmployees {
			s.members = append(s.members, candidates[w])
			w++
		}
	}
	for id, s := range sites {
		if len(s.members) == 0 {
			continue
		}
		p.WorkLabel = append(p.WorkLabel, s.cat.Label)
		p.WorkSize = append(p.WorkSize, s.cat.Size)
		p.WorkEmployees = append(p.WorkEmployees, int32(len(s.members)))
		sid := int32(len(p.WorkLabel) - 1)
		_ = id
		team := int(activity.Catalog[s.cat.Label].MaxEngaged)
		nTeams := int(math.Ceil(float64(len(s.members)) / float64(team)))
		base := p.NumWorkGroups
		for t := 0; t < nTeams; t++ {
			p.WorkGroupSize = append(p.WorkGroupSize, 0)
		}
		p.NumWorkGroups += nTeams
		for k, i := range s.members {
			p.Work[i] = sid
			g := int32(base + k%nTeams)
			p.WorkGroup[i] = g
			p.WorkGroupSize[g]++
		}
	}
	firstHospitalGroup := p.NumWorkGroups
	if len(staff) > 0 {
		// hospitals of about 400 staff, split into ward teams of MaxEngaged
		nHosp := int(math.Round(float64(len(staff)) / 400))
		if nHosp < 1 {
			nHosp = 1
		}
		team := int(activity.Catalog[activity.HospitalShift].MaxEngaged)
		for h := 0; h < nHosp; h++ {
			var members []int32
			for k := h; k < len(staff); k += nHosp {
				members = append(members, staff[k])
			}
			if len(members) == 0 {
				continue
			}
			p.WorkLabel = append(p.WorkLabel, activity.HospitalShift)
			p.WorkSize = append(p.WorkSize, census.Large)
			p.WorkEmployees = append(p.WorkEmployees, int32(len(members)))
			sid := int32(len(p.WorkLabel) - 1)
			nTeams := int(math.Ceil(float64(len(members)) / float64(team)))
			base := p.NumWorkGroups
			for t := 0; t < nTeams; t++ {
				p.WorkGroupSize = append(p.WorkGroupSize, 0)
			}
			p.NumWorkGroups += nTeams
			for k, i := range members {
				p.Work[i] = sid
				g := int32(base + k%nTeams)
				p.WorkGroup[i] = g
				p.WorkGroupSize[g]++
			}
		}
	}
	p.HospitalGroup = make([]bool, p.NumWorkGroups)
	for g := firstHospitalGroup; g < p.NumWorkGroups; g++ {
		p.HospitalGroup[g] = true
	}
}

// assignSleepPartners pairs housemates into bedrooms of at most two (the TS
// sleep activities have maxEngaged 2): the adults oldest first, then the
// children; a leftover child sleeps with a leftover adult.
func assignSleepPartners(p *Population) {
	p.SleepPartner = make([]int32, p.N)
	for i := range p.SleepPartner {
		p.SleepPartner[i] = -1
	}
	for h := 0; h < p.NumHouses(); h++ {
		members := append([]int32(nil), p.Housemates(int32(h))...)
		sort.SliceStable(members, func(a, b int) bool { return p.Age[members[a]] > p.Age[members[b]] })
		var adults, kids []int32
		for _, m := range members {
			if p.Age[m] >= 20 {
				adults = append(adults, m)
			} else {
				kids = append(kids, m)
			}
		}
		pair := func(a, b int32) { p.SleepPartner[a], p.SleepPartner[b] = b, a }
		for k := 0; k+1 < len(adults); k += 2 {
			pair(adults[k], adults[k+1])
		}
		for k := 0; k+1 < len(kids); k += 2 {
			pair(kids[k], kids[k+1])
		}
		if len(adults)%2 == 1 && len(kids)%2 == 1 {
			pair(adults[len(adults)-1], kids[len(kids)-1])
		}
	}
}

// assignIncome distributes the normalized income brackets: everyone without a
// job gets "no income"; the non-zero brackets go to workers ranked by
// education with noise, so income correlates with schooling.
func assignIncome(p *Population, r *rng.Stream) {
	var workers []int32
	for i := 0; i < p.N; i++ {
		if p.Work[i] >= 0 {
			workers = append(workers, int32(i))
		}
	}
	counts := census.NormalizeIncomes(census.Incomes, p.N, len(workers))
	rank := func(e Education) float64 {
		switch e {
		case Graduate:
			return 3
		case Undergraduate:
			return 2
		case Educated:
			return 1
		}
		return 0
	}
	score := make([]float64, len(workers))
	for k, i := range workers {
		score[k] = rank(p.Education[i]) + 2.0*r.Normal()
	}
	idx := make([]int, len(workers))
	for k := range idx {
		idx[k] = k
	}
	sort.Slice(idx, func(a, b int) bool { return score[idx[a]] > score[idx[b]] })
	k := 0
	for b := len(census.Incomes) - 1; b >= 0; b-- {
		if census.Incomes[b].Hi == 0 {
			continue
		}
		for c := 0; c < counts[b] && k < len(idx); c++ {
			p.Income[workers[idx[k]]] = uint8(b)
			k++
		}
	}
	// zero bracket (index 0) is the default for everyone else
}

// assignTransport gives private transport to every member of the richest
// houses, up to the census share of houses with vehicles.
func assignTransport(p *Population, r *rng.Stream) {
	h := p.NumHouses()
	maxIncome := make([]float64, h)
	for i := 0; i < p.N; i++ {
		b := census.Incomes[p.Income[i]]
		v := b.Lo + r.Float64()*0.01
		if v > maxIncome[p.House[i]] {
			maxIncome[p.House[i]] = v
		}
	}
	order := make([]int, h)
	for i := range order {
		order[i] = i
	}
	sort.Slice(order, func(a, b int) bool { return maxIncome[order[a]] > maxIncome[order[b]] })
	share := float64(census.HousesWithVehicles) / 348268.0 // 2010 permanent private households
	withCar := int(math.Round(share * float64(h)))
	car := make([]bool, h)
	for _, house := range order[:withCar] {
		car[house] = true
	}
	for i := 0; i < p.N; i++ {
		if car[p.House[i]] {
			p.Transport[i] = Private
		}
	}
}
