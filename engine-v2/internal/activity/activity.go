// Package activity holds the fixed catalog of activities an individual can be
// engaged in. Values mirror model/src/population/activities.ts.
package activity

// Category groups activities by the kind of place / behaviour.
type Category uint8

const (
	Leisure Category = iota
	Errands
	Work
	Home
	Transport
	Shopping
	Study
	Sleep
	Hospital
)

// Setting is indoor / outdoor.
type Setting uint8

const (
	Indoor Setting = iota
	Outdoor
)

// Distance between individuals during the activity.
type Distance uint8

const (
	Normal Distance = iota
	SixFt
	TenFt
)

// Voice volume during the activity.
type Voice uint8

const (
	Silent Voice = iota
	NormalVoice
	Loud
)

// Label identifies one catalog entry.
type Label uint8

const (
	Grocery Label = iota
	Pharmacy
	Bakery
	Mall

	RestaurantIndoor
	RestaurantOutdoor

	Bar
	PartyIndoor
	PartyOutdoor
	Park
	Gym
	Church

	StayAtHome
	Sleep5h
	Sleep6h
	Sleep7h
	Sleep8h
	Sleep9h

	PublicTransportStation
	PublicTransportRide
	PrivateTransportRide

	MicroIndustryInPerson
	SmallIndustryInPerson
	MediumIndustryInPerson
	LargeIndustryInPerson

	MicroIndustryFromHome
	SmallIndustryFromHome
	MediumIndustryFromHome
	LargeIndustryFromHome

	MicroCommerceInPerson
	SmallCommerceInPerson
	MediumCommerceInPerson
	LargeCommerceInPerson

	MicroCommerceFromHome
	SmallCommerceFromHome
	MediumCommerceFromHome
	LargeCommerceFromHome

	PreschoolInPerson
	MiddleSchoolInPerson
	HighSchoolInPerson
	CollegeInPerson

	PreschoolFromHome
	MiddleSchoolFromHome
	HighSchoolFromHome
	CollegeFromHome

	Hospitalized

	// WorkLunch / SchoolLunch: the lunch break taken with the occupation's
	// team or class (the TypeScript restaurant with maxEngaged = site/2).
	WorkLunch
	SchoolLunch

	// HospitalShift is a 12-hour ward shift of hospital staff (v2).
	HospitalShift

	NumLabels
)

// Spec is the static description of an activity label.
type Spec struct {
	Label      Label
	Name       string
	Category   Category
	Setting    Setting
	Duration   uint16 // minutes (default)
	Distance   Distance
	Voice      Voice
	MaxEngaged uint16 // maximum individuals sharing one instance
}

// Catalog indexed by Label.
var Catalog = [NumLabels]Spec{
	Grocery:           {Grocery, "grocery", Shopping, Indoor, 30, Normal, NormalVoice, 80},
	Pharmacy:          {Pharmacy, "pharmacy", Shopping, Indoor, 15, Normal, NormalVoice, 20},
	Bakery:            {Bakery, "bakery", Shopping, Indoor, 10, Normal, NormalVoice, 20},
	Mall:              {Mall, "mall", Shopping, Indoor, 90, Normal, Loud, 100},
	RestaurantIndoor:  {RestaurantIndoor, "restaurant_indoor", Errands, Indoor, 60, Normal, NormalVoice, 40},
	RestaurantOutdoor: {RestaurantOutdoor, "restaurant_outdoor", Errands, Outdoor, 60, Normal, NormalVoice, 50},
	Bar:               {Bar, "bar", Leisure, Indoor, 120, Normal, NormalVoice, 30},
	PartyIndoor:       {PartyIndoor, "party_indoor", Leisure, Indoor, 180, Normal, NormalVoice, 30},
	PartyOutdoor:      {PartyOutdoor, "party_outdoor", Leisure, Outdoor, 180, Normal, NormalVoice, 50},
	Park:              {Park, "park", Leisure, Outdoor, 90, SixFt, NormalVoice, 50},
	Gym:               {Gym, "gym", Leisure, Indoor, 60, Normal, NormalVoice, 30},
	Church:            {Church, "church", Leisure, Indoor, 60, Normal, Silent, 50},

	StayAtHome: {StayAtHome, "stay_at_home", Home, Indoor, 600, Normal, NormalVoice, 11},
	Sleep5h:    {Sleep5h, "sleep_5h", Sleep, Indoor, 300, Normal, Silent, 2},
	Sleep6h:    {Sleep6h, "sleep_6h", Sleep, Indoor, 360, Normal, Silent, 2},
	Sleep7h:    {Sleep7h, "sleep_7h", Sleep, Indoor, 420, Normal, Silent, 2},
	Sleep8h:    {Sleep8h, "sleep_8h", Sleep, Indoor, 480, Normal, Silent, 2},
	Sleep9h:    {Sleep9h, "sleep_9h", Sleep, Indoor, 540, Normal, Silent, 2},

	PublicTransportStation: {PublicTransportStation, "public_transport_station", Transport, Outdoor, 15, Normal, NormalVoice, 10},
	PublicTransportRide:    {PublicTransportRide, "public_transport_ride", Transport, Indoor, 45, Normal, Silent, 50},
	PrivateTransportRide:   {PrivateTransportRide, "private_transport_ride", Transport, Indoor, 30, Normal, NormalVoice, 5},

	MicroIndustryInPerson:  {MicroIndustryInPerson, "micro_industry", Work, Indoor, 480, Normal, NormalVoice, 10},
	SmallIndustryInPerson:  {SmallIndustryInPerson, "small_industry", Work, Indoor, 480, Normal, NormalVoice, 60},
	MediumIndustryInPerson: {MediumIndustryInPerson, "medium_industry", Work, Indoor, 720, Normal, NormalVoice, 300},
	LargeIndustryInPerson:  {LargeIndustryInPerson, "large_industry", Work, Indoor, 720, Normal, NormalVoice, 500},

	MicroIndustryFromHome:  {MicroIndustryFromHome, "micro_industry_from_home", Work, Indoor, 480, Normal, NormalVoice, 11},
	SmallIndustryFromHome:  {SmallIndustryFromHome, "small_industry_from_home", Work, Indoor, 480, Normal, NormalVoice, 11},
	MediumIndustryFromHome: {MediumIndustryFromHome, "medium_industry_from_home", Work, Indoor, 720, Normal, NormalVoice, 11},
	LargeIndustryFromHome:  {LargeIndustryFromHome, "large_industry_from_home", Work, Indoor, 720, Normal, NormalVoice, 11},

	MicroCommerceInPerson:  {MicroCommerceInPerson, "micro_commerce", Work, Indoor, 480, Normal, NormalVoice, 5},
	SmallCommerceInPerson:  {SmallCommerceInPerson, "small_commerce", Work, Indoor, 480, Normal, NormalVoice, 30},
	MediumCommerceInPerson: {MediumCommerceInPerson, "medium_commerce", Work, Indoor, 480, Normal, NormalVoice, 75},
	LargeCommerceInPerson:  {LargeCommerceInPerson, "large_commerce", Work, Indoor, 480, Normal, NormalVoice, 200},

	MicroCommerceFromHome:  {MicroCommerceFromHome, "micro_commerce_from_home", Work, Indoor, 480, Normal, NormalVoice, 11},
	SmallCommerceFromHome:  {SmallCommerceFromHome, "small_commerce_from_home", Work, Indoor, 480, Normal, NormalVoice, 11},
	MediumCommerceFromHome: {MediumCommerceFromHome, "medium_commerce_from_home", Work, Indoor, 480, Normal, NormalVoice, 11},
	LargeCommerceFromHome:  {LargeCommerceFromHome, "large_commerce_from_home", Work, Indoor, 480, Normal, NormalVoice, 11},

	PreschoolInPerson:    {PreschoolInPerson, "preschool", Study, Indoor, 540, Normal, NormalVoice, 30},
	MiddleSchoolInPerson: {MiddleSchoolInPerson, "middle_school", Study, Indoor, 300, Normal, NormalVoice, 45},
	HighSchoolInPerson:   {HighSchoolInPerson, "high_school", Study, Indoor, 360, Normal, NormalVoice, 60},
	CollegeInPerson:      {CollegeInPerson, "college", Study, Indoor, 450, Normal, NormalVoice, 75},

	PreschoolFromHome:    {PreschoolFromHome, "preschool_from_home", Study, Indoor, 540, Normal, NormalVoice, 11},
	MiddleSchoolFromHome: {MiddleSchoolFromHome, "middle_school_from_home", Study, Indoor, 300, Normal, NormalVoice, 11},
	HighSchoolFromHome:   {HighSchoolFromHome, "high_school_from_home", Study, Indoor, 360, Normal, NormalVoice, 11},
	CollegeFromHome:      {CollegeFromHome, "college_from_home", Study, Indoor, 480, Normal, NormalVoice, 11},

	Hospitalized: {Hospitalized, "hospitalized", Hospital, Indoor, 960, Normal, Silent, 2},

	WorkLunch:   {WorkLunch, "work_lunch", Errands, Indoor, 60, Normal, NormalVoice, 40},
	SchoolLunch: {SchoolLunch, "school_lunch", Errands, Indoor, 60, Normal, NormalVoice, 40},

	HospitalShift: {HospitalShift, "hospital_shift", Work, Indoor, 720, Normal, NormalVoice, 25},
}

// Get returns the spec for a label.
func Get(l Label) *Spec { return &Catalog[l] }

// IsSleep reports whether the label is a sleep activity.
func IsSleep(l Label) bool { return l >= Sleep5h && l <= Sleep9h }

// IsWorkInPerson reports whether the label is an in-person work activity.
func IsWorkInPerson(l Label) bool {
	return l >= MicroIndustryInPerson && l <= LargeIndustryInPerson || l >= MicroCommerceInPerson && l <= LargeCommerceInPerson || l == HospitalShift
}

// IsStudyInPerson reports whether the label is an in-person study activity.
func IsStudyInPerson(l Label) bool { return l >= PreschoolInPerson && l <= CollegeInPerson }

// FromHome maps an in-person work/study label to its from-home variant. Other
// labels are returned unchanged.
func FromHome(l Label) Label {
	switch {
	case l >= MicroIndustryInPerson && l <= LargeIndustryInPerson:
		return l + (MicroIndustryFromHome - MicroIndustryInPerson)
	case l >= MicroCommerceInPerson && l <= LargeCommerceInPerson:
		return l + (MicroCommerceFromHome - MicroCommerceInPerson)
	case l >= PreschoolInPerson && l <= CollegeInPerson:
		return l + (PreschoolFromHome - PreschoolInPerson)
	}
	return l
}

// AtHome reports whether an activity happens inside the individual's house.
func AtHome(l Label) bool {
	c := Catalog[l].Category
	if c == Home || c == Sleep {
		return true
	}
	return l >= MicroIndustryFromHome && l <= LargeIndustryFromHome ||
		l >= MicroCommerceFromHome && l <= LargeCommerceFromHome ||
		l >= PreschoolFromHome && l <= CollegeFromHome
}

// LeisureLabels are the activities chosen by the random / neural selector.
var LeisureLabels = []Label{Grocery, Pharmacy, Bakery, Mall, RestaurantOutdoor, RestaurantIndoor, Bar, PartyOutdoor, PartyIndoor, Park, Gym, Church}

// IsVenue reports whether the label happens in a shared public venue (not a
// house, work site or school).
func IsVenue(l Label) bool {
	if l == WorkLunch || l == SchoolLunch {
		return false
	}
	switch Catalog[l].Category {
	case Leisure, Errands, Shopping, Transport:
		return l != PrivateTransportRide
	}
	return false
}
