package activity

import "testing"

func TestCatalogComplete(t *testing.T) {
	for l := Label(0); l < NumLabels; l++ {
		s := Catalog[l]
		if s.Label != l {
			t.Fatalf("label %d has spec label %d", l, s.Label)
		}
		if s.Name == "" || s.Duration == 0 || s.MaxEngaged == 0 {
			t.Fatalf("label %d (%s) incomplete: %+v", l, s.Name, s)
		}
	}
}

func TestFromHomeMapping(t *testing.T) {
	cases := map[Label]Label{
		MicroIndustryInPerson: MicroIndustryFromHome,
		LargeIndustryInPerson: LargeIndustryFromHome,
		SmallCommerceInPerson: SmallCommerceFromHome,
		CollegeInPerson:       CollegeFromHome,
		PreschoolInPerson:     PreschoolFromHome,
		Grocery:               Grocery,
	}
	for in, want := range cases {
		if got := FromHome(in); got != want {
			t.Fatalf("FromHome(%s) = %s, want %s", Catalog[in].Name, Catalog[got].Name, Catalog[want].Name)
		}
		if in != Grocery && !AtHome(want) {
			t.Fatalf("%s should be at home", Catalog[want].Name)
		}
	}
	if AtHome(Grocery) || AtHome(MicroIndustryInPerson) || !AtHome(Sleep7h) || !AtHome(StayAtHome) {
		t.Fatal("AtHome misclassifies")
	}
	if !IsVenue(Gym) || IsVenue(PrivateTransportRide) || IsVenue(StayAtHome) || !IsVenue(PublicTransportRide) {
		t.Fatal("IsVenue misclassifies")
	}
}
