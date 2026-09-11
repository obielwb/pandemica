package population

import (
	"testing"

	"github.com/ojpbarbosa/pandemica/engine-v2/internal/activity"
	"github.com/ojpbarbosa/pandemica/engine-v2/internal/census"
)

func gen(t *testing.T, n int) *Population {
	t.Helper()
	p, err := Generate(Options{N: n, Seed: 11})
	if err != nil {
		t.Fatal(err)
	}
	return p
}

func TestEveryoneHousedAndHousesFull(t *testing.T) {
	p := gen(t, 50000)
	seen := make([]bool, p.N)
	for h := 0; h < p.NumHouses(); h++ {
		members := p.Housemates(int32(h))
		if len(members) == 0 {
			t.Fatalf("house %d empty", h)
		}
		hasAdult := false
		for _, m := range members {
			if seen[m] {
				t.Fatalf("individual %d in two houses", m)
			}
			seen[m] = true
			if p.House[m] != int32(h) {
				t.Fatalf("house back-reference broken for %d", m)
			}
			if p.Age[m] >= 20 {
				hasAdult = true
			}
		}
		if !hasAdult {
			t.Fatalf("house %d has no adult", h)
		}
	}
	for i, s := range seen {
		if !s {
			t.Fatalf("individual %d not housed", i)
		}
	}
}

func TestSexAndAgeDistribution(t *testing.T) {
	p := gen(t, 100000)
	males := 0
	for i := 0; i < p.N; i++ {
		if p.Sex[i] == Male {
			males++
		}
		b := census.Ages[p.AgeBracket[i]]
		if int(p.Age[i]) < b.Lo || int(p.Age[i]) > b.Hi {
			t.Fatalf("age %d outside bracket %v", p.Age[i], b)
		}
	}
	pct := float64(males) / float64(p.N) * 100
	if pct < census.MalePercentage-0.1 || pct > census.MalePercentage+0.1 {
		t.Fatalf("male pct %v", pct)
	}
}

func TestSchoolsAndWork(t *testing.T) {
	p := gen(t, 100000)
	students, workers := 0, 0
	for i := 0; i < p.N; i++ {
		if p.School[i] >= 0 {
			students++
			if p.Class[i] < 0 {
				t.Fatal("student without class")
			}
			switch p.Education[i] {
			case Preschooler, MiddleSchooler, HighSchooler, Undergraduate, Graduate:
			default:
				t.Fatalf("non-student %d in school", i)
			}
		}
		if p.Work[i] >= 0 {
			workers++
			if p.Age[i] < 20 || p.Age[i] > census.RetirementAge {
				t.Fatalf("worker aged %d", p.Age[i])
			}
			if p.WorkGroup[i] < 0 || p.Income[i] == 0 {
				t.Fatalf("worker %d without team or income", i)
			}
		} else if p.Income[i] != 0 {
			t.Fatalf("non-worker %d with income", i)
		}
	}
	wantWorkers := float64(census.TotalEmployed) * float64(p.N) / float64(census.IBGE2010Population)
	if float64(workers) < 0.95*wantWorkers || float64(workers) > 1.05*wantWorkers {
		t.Fatalf("workers %d want ~%v", workers, wantWorkers)
	}
	if students < p.N/5 {
		t.Fatalf("too few students %d", students)
	}
	// teams never exceed the activity's max engaged
	for g, s := range p.WorkGroupSize {
		if s <= 0 || s > 500 {
			t.Fatalf("team %d size %d", g, s)
		}
	}
}

func TestTransportShare(t *testing.T) {
	p := gen(t, 50000)
	houses := make(map[int32]bool)
	for i := 0; i < p.N; i++ {
		if p.Transport[i] == Private {
			houses[p.House[i]] = true
		}
	}
	share := float64(len(houses)) / float64(p.NumHouses())
	want := float64(census.HousesWithVehicles) / 348268.0
	if share < want-0.01 || share > want+0.01 {
		t.Fatalf("car share %v want %v", share, want)
	}
}

func TestDeterministic(t *testing.T) {
	a := gen(t, 5000)
	b := gen(t, 5000)
	for i := 0; i < a.N; i++ {
		if a.Age[i] != b.Age[i] || a.House[i] != b.House[i] || a.Work[i] != b.Work[i] {
			t.Fatal("generation not deterministic")
		}
	}
}

func TestSleepPartnersAndHospitalStaff(t *testing.T) {
	p, err := Generate(Options{N: 60000, Seed: 4, HospitalStaffShare: 0.5})
	if err != nil {
		t.Fatal(err)
	}
	paired := 0
	for i := int32(0); i < int32(p.N); i++ {
		q := p.SleepPartner[i]
		if q < 0 {
			continue
		}
		paired++
		if p.SleepPartner[q] != i || p.House[q] != p.House[i] || q == i {
			t.Fatalf("bad sleep partner %d <-> %d", i, q)
		}
	}
	if paired == 0 {
		t.Fatal("nobody shares a bedroom")
	}
	staff := 0
	for i := 0; i < p.N; i++ {
		g := p.WorkGroup[i]
		if g >= 0 && p.HospitalGroup[g] {
			staff++
			if p.WorkLabel[p.Work[i]] != activity.HospitalShift {
				t.Fatalf("ward member %d not on hospital shift", i)
			}
		}
	}
	want := float64(census.HealthWorkers2010) * float64(p.N) / float64(census.IBGE2010Population) * 0.5
	if float64(staff) < 0.98*want || float64(staff) > 1.02*want {
		t.Fatalf("hospital staff %d want ~%v", staff, want)
	}
	for g, isWard := range p.HospitalGroup {
		if isWard && p.WorkGroupSize[g] > 25 {
			t.Fatalf("ward team %d has %d staff", g, p.WorkGroupSize[g])
		}
	}
}
