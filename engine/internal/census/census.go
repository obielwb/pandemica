// Package census holds the Campinas demographic constants (IBGE 2010 and later
// municipal reports) transcribed from model/data/census/index.ts, plus the
// normalization routines that scale them to the simulated population size.
package census

import "github.com/ojpbarbosa/pandemica/engine/internal/activity"

// PaperPopulation is the population size used in the paper (sum of the 2016
// regional report), the default simulated population.
const PaperPopulation = 1164099

// IBGE2010Population is the 2010 census headcount.
const IBGE2010Population = 1080113

// Region of the city.
type Region uint8

const (
	East Region = iota
	Northwest
	North
	Southwest
	South
	NumRegions
)

var RegionNames = [NumRegions]string{"east", "northwest", "north", "southwest", "south"}

// Parameter is a labelled count.
type Parameter struct {
	Label int
	Value int
}

// RegionsPopulation from the 2016 social information report.
var RegionsPopulation = []Parameter{
	{int(East), 248939},
	{int(Northwest), 133086},
	{int(North), 212342},
	{int(Southwest), 253061},
	{int(South), 316671},
}

const (
	Males2010   = 520865
	Females2010 = 559248
)

// MalePercentage in [0,100].
var MalePercentage = float64(Males2010) / float64(IBGE2010Population) * 100

const (
	RetirementAge = 64
	ChildAge      = 14
)

// AgeBracket is a 5-year interval with male/female counts (IBGE 2010).
type AgeBracket struct {
	Lo, Hi int
	Female int
	Male   int
}

// Ages: 17 brackets 0-4 ... 80-84.
var Ages = []AgeBracket{
	{0, 4, 31745, 32660},
	{5, 9, 32214, 33570},
	{10, 14, 38690, 39891},
	{15, 19, 40346, 41344},
	{20, 24, 48593, 48225},
	{25, 29, 52883, 51178},
	{30, 34, 49301, 47315},
	{35, 39, 43304, 40812},
	{40, 44, 41335, 37975},
	{45, 49, 38876, 34630},
	{50, 54, 35795, 31354},
	{55, 59, 29515, 25295},
	{60, 64, 23211, 19059},
	{65, 69, 16986, 13776},
	{70, 74, 13743, 10457},
	{75, 79, 6832, 10260},
	{80, 84, 7291, 4094},
}

// IncomeBracket in minimum salaries; Hi < 0 means open-ended.
type IncomeBracket struct {
	Lo, Hi float64
	Value  int
}

// Incomes: IBGE 2010 residents by income (age 10+); the first bracket is
// "no income" and includes under-10s (as in the TypeScript model).
var Incomes = []IncomeBracket{
	{0, 0, 316000 + 31745 + 32660 + 33570 + 32214},
	{0, 0.5, 10400},
	{0.5, 1, 98800},
	{1, 2, 225500},
	{2, 3, 98600},
	{3, 5, 89300},
	{5, 10, 72300},
	{10, 15, 15700},
	{15, 20, 13400},
	{20, -1, 10400},
}

// Education attendance (IBGE 2010), adapted to the age brackets.
const (
	ageZeroToThree        = 21684
	ageFourToFive         = 21201
	ageSix                = 12535
	ageSevenToFourteen    = 113766
	ageFifteenToSeventeen = 41497
	ageEighteenToNineteen = 15200
	ageTwentyToTwentyFour = 29289
	ageTwentyFiveOrMore   = 69474
)

var (
	sevenToNine   = ageSevenToFourteen * 2 / 5 // floor(113766/2.5)
	tenToFourteen = ageSevenToFourteen - sevenToNine
)

// AgeQuota is an education quota over an age interval.
type AgeQuota struct {
	Lo, Hi int
	Value  int
}

var (
	Preschoolers                 = AgeQuota{0, 4, ageZeroToThree + ageFourToFive}
	MiddleSchoolersYoungerThan10 = AgeQuota{5, 9, ageSix + sevenToNine}
	MiddleSchoolersOlderThan10   = AgeQuota{10, 14, tenToFourteen}
	HighSchoolers                = AgeQuota{15, 19, ageFifteenToSeventeen + ageEighteenToNineteen}
	UndergradStudents            = AgeQuota{20, 24, ageTwentyToTwentyFour}
	GradStudents                 = AgeQuota{25, 1 << 30, ageTwentyFiveOrMore}
	AlreadyAttended              = 687104
	NeverAttended                = 68363
)

// School site counts (IBGE 2010 / city hall).
const (
	Preschools    = 308 + 291
	MiddleSchools = 230 + 200
	HighSchools   = 148
	Colleges      = 23
)

const HousesWithVehicles = 229315

// ResidentsPerHouse: houses by number of residents (11 = eleven or more).
var ResidentsPerHouse = []Parameter{
	{1, 48687}, {2, 87532}, {3, 87969}, {4, 72222}, {5, 31014}, {6, 11744},
	{7, 4937}, {8, 2137}, {9, 1027}, {10, 532}, {11, 467},
}

// WorkSize classes.
type WorkSize uint8

const (
	Micro WorkSize = iota
	Small
	Medium
	Large
)

// WorkCategory: a class of workplaces with a count and an employee range.
type WorkCategory struct {
	Label        activity.Label
	Size         WorkSize
	Sites        int
	MinEmployees int
	MaxEmployees int
}

// Industries (IBGE 2018 counts; MTE 2016 employee ranges).
var Industries = []WorkCategory{
	{activity.MicroIndustryInPerson, Micro, 14398, 1, 19},
	{activity.SmallIndustryInPerson, Small, 2846, 20, 99},
	{activity.MediumIndustryInPerson, Medium, 724, 100, 499},
	{activity.LargeIndustryInPerson, Large, 160, 500, 899},
}

// CommerceAndServices.
var CommerceAndServices = []WorkCategory{
	{activity.MicroCommerceInPerson, Micro, 109612, 1, 9},
	{activity.SmallCommerceInPerson, Small, 7834, 10, 49},
	{activity.MediumCommerceInPerson, Medium, 1202, 50, 99},
	{activity.LargeCommerceInPerson, Large, 0, 100, 299},
}

const (
	Employees     = 428584
	SelfEmployed  = 92989
	Employers     = 14474
	TotalEmployed = Employees + SelfEmployed + Employers
)
