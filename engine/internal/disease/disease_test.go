package disease

import (
	"math"
	"testing"

	"github.com/ojpbarbosa/pandemica/engine/internal/activity"
)

func TestReferenceInteraction(t *testing.T) {
	// one hour, one infectious source, indoor, 1 m, normal voice → 14%
	h := ReferenceHazardPerHour * SettingMultiplier[activity.Indoor] * DistanceMultiplier[activity.Normal] * VoiceMultiplier[activity.NormalVoice]
	if p := Probability(h); math.Abs(p-0.14) > 1e-9 {
		t.Fatalf("reference probability %v", p)
	}
	if Probability(0) != 0 {
		t.Fatal("zero hazard must be zero probability")
	}
}

func TestModifiersMatchPaperTable(t *testing.T) {
	if SettingMultiplier[activity.Outdoor] != 0.05 {
		t.Fatal("outdoor should be /20")
	}
	if DistanceMultiplier[activity.SixFt] != 0.5 {
		t.Fatal("2 m should be /2")
	}
	if VoiceMultiplier[activity.Loud] != 5 || VoiceMultiplier[activity.Silent] != 0.2 {
		t.Fatal("voice multipliers")
	}
	// paper table 1: I am wearing a surgical mask /2, the other person /4
	if ReceiverMask[Surgical] != 0.5 || SourceMask[Surgical] != 0.25 {
		t.Fatalf("surgical mask multipliers %v %v", ReceiverMask[Surgical], SourceMask[Surgical])
	}
	// masks section: thick cotton 1/3, thin 1/2 (protection to others)
	if SourceMask[Basic] != 1.0/3 || SourceMask[Thin] != 0.5 {
		t.Fatal("cloth mask multipliers")
	}
	if SourceMask[NoMask] != 1 || ReceiverMask[NoMask] != 1 {
		t.Fatal("no mask must be 1")
	}
	if MaskByName("cloth") != Basic || MaskByName("n95") != N95 || MaskByName("x") != NoMask {
		t.Fatal("mask names")
	}
}

func TestVaccineProtection(t *testing.T) {
	if p := InfectionProtection(Pfizer, 2, 0); math.Abs(p-0.83) > 1e-9 {
		t.Fatalf("pfizer 2 doses %v", p)
	}
	if p := InfectionProtection(Janssen, 1, 0); math.Abs(p-0.64) > 1e-9 {
		t.Fatalf("janssen 1 dose %v", p)
	}
	one := InfectionProtection(Pfizer, 1, 0)
	two := InfectionProtection(Pfizer, 2, 0)
	three := InfectionProtection(Pfizer, 3, 0)
	if !(one < two && two < three && three < 1) {
		t.Fatalf("doses not monotonic: %v %v %v", one, two, three)
	}
	if InfectionProtection(NoVaccine, 0, 0) != 0 || InfectionProtection(Pfizer, 0, 0) != 0 {
		t.Fatal("unvaccinated must be zero")
	}
	if InfectionProtection(Pfizer, 2, 400) >= two {
		t.Fatal("waning must reduce protection")
	}
	if Waning(0) != 1 || Waning(365) != 0.4 || Waning(1000) != 0.4 {
		t.Fatal("waning endpoints")
	}
	if SevereProtection(Pfizer, 2, 0) <= InfectionProtection(Pfizer, 2, 0) {
		t.Fatal("severe protection should exceed infection protection")
	}
}

func TestOutcomeForAge(t *testing.T) {
	if OutcomeForAge(4).Death != 0.000015 || OutcomeForAge(84).Death != 0.06 || OutcomeForAge(54).Hospitalization != 0.079 {
		t.Fatal("age outcome lookup")
	}
}

func TestVariantIndex(t *testing.T) {
	for i, v := range Variants {
		if VariantIndex(v.Name) != i {
			t.Fatalf("variant %s index", v.Name)
		}
		if i > 0 && v.Transmissibility < Variants[i-1].Transmissibility {
			t.Fatalf("variant %s less transmissible than predecessor", v.Name)
		}
	}
	if VariantIndex("nope") != -1 {
		t.Fatal("unknown variant must be -1")
	}
}
