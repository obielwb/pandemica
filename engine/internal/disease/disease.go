// Package disease holds the transmission risk model (microCOVID-style
// modifiers from the paper's tables), vaccine efficacy, age-based outcome
// rates and the variant timeline multipliers.
package disease

import (
	"math"

	"github.com/ojpbarbosa/pandemica/engine/internal/activity"
)

// ReferenceRiskPerHour: talking with one infectious person for one hour,
// indoors, no mask, 1 m, normal voice (paper: 14%).
const ReferenceRiskPerHour = 0.14

// ReferenceHazardPerHour is the Poisson hazard equivalent to the reference
// risk so that 1-exp(-h) = 0.14 for one hour.
var ReferenceHazardPerHour = -math.Log(1 - ReferenceRiskPerHour)

var SettingMultiplier = [...]float64{activity.Indoor: 1, activity.Outdoor: 0.05}
var DistanceMultiplier = [...]float64{activity.Normal: 1, activity.SixFt: 0.5, activity.TenFt: 0.25}
var VoiceMultiplier = [...]float64{activity.Silent: 0.2, activity.NormalVoice: 1, activity.Loud: 5}

// Mask types.
type Mask uint8

const (
	NoMask Mask = iota
	Thin
	Basic
	Surgical
	Filtered
	N95
	N95Sealed
	P100
	NumMasks
)

// SourceMask is the multiplier when the infectious person wears the mask
// (paper table 1: another person wearing a surgical mask /4; masks section:
// thin 1/2, thick cotton 1/3). These are the TypeScript MaskMultiplier values.
var SourceMask = [NumMasks]float64{NoMask: 1, Thin: 1.0 / 2, Basic: 1.0 / 3, Surgical: 1.0 / 4, Filtered: 1.0 / 4, N95: 1.0 / 6, N95Sealed: 1.0 / 16, P100: 1.0 / 3}

// ReceiverMask is the multiplier when the susceptible person wears the mask
// (paper table 1: I am wearing a surgical mask /2). Cloth masks protect the
// wearer less; respirators protect the wearer about as well as others.
var ReceiverMask = [NumMasks]float64{NoMask: 1, Thin: 0.75, Basic: 2.0 / 3, Surgical: 1.0 / 2, Filtered: 1.0 / 2, N95: 1.0 / 6, N95Sealed: 1.0 / 16, P100: 1.0 / 3}

// MaskByName maps scenario mask names to mask types.
func MaskByName(name string) Mask {
	switch name {
	case "thin":
		return Thin
	case "cloth":
		return Basic
	case "surgical":
		return Surgical
	case "n95":
		return N95
	}
	return NoMask
}

// Vaccine types.
type Vaccine uint8

const (
	NoVaccine Vaccine = iota
	Pfizer
	AstraZeneca
	Janssen
	CoronaVac
	NumVaccines
)

var VaccineNames = [NumVaccines]string{"none", "pfizer", "astrazeneca", "janssen", "coronavac"}

// fullScheduleRelativeRisk is the paper's "adjusted infectivity rate" for a
// completed primary schedule (2 doses, 1 for Janssen).
var fullScheduleRelativeRisk = [NumVaccines]float64{NoVaccine: 1, Pfizer: 0.17, AstraZeneca: 0.47, Janssen: 0.36, CoronaVac: 0.45}

// primaryDoses per vaccine.
var primaryDoses = [NumVaccines]uint8{NoVaccine: 0, Pfizer: 2, AstraZeneca: 2, Janssen: 1, CoronaVac: 2}

// InfectionProtection returns the fraction by which a vaccine reduces the
// chance of infection, after waning (days since last dose). Values are the
// paper's full-schedule ratios; one dose counts 55% of the full effect; each
// booster removes 40% of the remaining risk. Waning: full effect for 90 days
// then linear decay to 40% of the effect at 365 days.
func InfectionProtection(v Vaccine, doses uint8, daysSinceLastDose int) float64 {
	if v == NoVaccine || doses == 0 {
		return 0
	}
	full := 1 - fullScheduleRelativeRisk[v]
	var eff float64
	pd := primaryDoses[v]
	switch {
	case doses < pd:
		eff = full * 0.55
	case doses == pd:
		eff = full
	default:
		rr := (1 - full) * math.Pow(0.6, float64(doses-pd))
		eff = 1 - rr
	}
	return eff * Waning(daysSinceLastDose)
}

// Waning multiplier for protection as a function of days since the last dose.
func Waning(days int) float64 {
	if days <= 90 {
		return 1
	}
	if days >= 365 {
		return 0.4
	}
	return 1 - 0.6*float64(days-90)/float64(365-90)
}

// SevereProtection is the vaccine protection against hospitalization/death.
func SevereProtection(v Vaccine, doses uint8, daysSinceLastDose int) float64 {
	if v == NoVaccine || doses == 0 {
		return 0
	}
	base := [...]float64{0, 0.6, 0.85, 0.93, 0.95}
	i := int(doses)
	if i >= len(base) {
		i = len(base) - 1
	}
	eff := base[i]
	if v == CoronaVac {
		eff *= 0.85
	}
	// severe protection wanes slower: floor at 70%
	w := 0.7 + 0.3*Waning(daysSinceLastDose)
	return eff * w
}

// AgeOutcome holds hospitalization and death rates per infection for an age
// interval (paper table 7, Aslaner et al. 2021).
type AgeOutcome struct {
	Lo, Hi          int
	Hospitalization float64
	Death           float64
}

var AgeOutcomes = []AgeOutcome{
	{0, 17, 0.008, 0.000015},
	{18, 49, 0.025, 0.0007},
	{50, 64, 0.079, 0.007},
	{65, 200, 0.23, 0.06},
}

// OutcomeForAge returns the rates for an age (uses the bracket's upper bound,
// like the TypeScript model).
func OutcomeForAge(age int) AgeOutcome {
	for _, o := range AgeOutcomes {
		if age <= o.Hi {
			return o
		}
	}
	return AgeOutcomes[len(AgeOutcomes)-1]
}

// Variant multipliers.
type Variant struct {
	Name             string
	Transmissibility float64 // multiplier on the reference hazard
	ImmuneEscape     float64 // fraction of prior-infection protection lost (vs older variants)
	VaccineEscape    float64 // fraction of vaccine protection against infection lost
	LatentDays       int
	SeverityFactor   float64 // multiplier on hospitalization/death
}

// Transmissibility follows the paper (x1.5 for each variant of concern);
// Omicron escape values follow published effectiveness estimates.
var (
	Wildtype = Variant{"wildtype", 1.0, 0, 0, 3, 1.0}
	Gamma    = Variant{"gamma", 1.5, 0.3, 0.1, 3, 1.2}
	Delta    = Variant{"delta", 1.5 * 1.5, 0.3, 0.2, 3, 1.3}
	Omicron  = Variant{"omicron", 1.5 * 1.5 * 1.5, 0.6, 0.5, 2, 0.4}
	// BA5 and BQ1 are later Omicron sub-lineages: slightly more transmissible
	// and escaping immunity from earlier Omicron infections.
	BA5 = Variant{"ba5", 1.5 * 1.5 * 1.5 * 1.1, 0.65, 0.55, 2, 0.35}
	BQ1 = Variant{"bq1", 1.5 * 1.5 * 1.5 * 1.2, 0.7, 0.6, 2, 0.3}
)

// Variants in order of emergence; index 0 is the ancestral strain.
var Variants = []Variant{Wildtype, Gamma, Delta, Omicron, BA5, BQ1}

// VariantIndex returns the index of the variant with the given name or -1.
func VariantIndex(name string) int {
	for i, v := range Variants {
		if v.Name == name {
			return i
		}
	}
	return -1
}

// Natural history constants.
const (
	InfectiousDays           = 7    // paper: recovered ~10 days after exposure with a 3-day latency
	AsymptomaticFraction     = 0.17 // Byambasuren et al.
	AsymptomaticInfectivity  = 0.4
	PriorInfectionProtection = 0.92 // TypeScript: hadCovid ×0.08
	SymptomOnsetOffset       = 1    // days after becoming infectious
	HospitalizationOffset    = 5    // days after symptom onset
	HospitalStayDays         = 10
	DeathOffset              = 9    // days after symptom onset (≈ 2 weeks after exposure)
	HospitalizedDeathRate    = 0.06 // JAMA 2023 (TypeScript comment)
)

// Probability converts an accumulated hazard into an infection probability.
func Probability(hazard float64) float64 {
	if hazard <= 0 {
		return 0
	}
	return 1 - math.Exp(-hazard)
}
