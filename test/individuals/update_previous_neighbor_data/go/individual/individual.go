package updatepreviousneighbordata

type Individual struct {
	Data            int
	RiskProfile     string
	Interaction     string
	PersonCount     int
	SymptomsChecked string
	Setting         string
	Distance        string
	Duration        int
	TheirMask       string
	YourMask        string
	Voice           string
}

func NewIndividual() *Individual {
	return &Individual{
		Data:            0,
		RiskProfile:     "riskprofile",
		Interaction:     "interaction",
		PersonCount:     0,
		SymptomsChecked: "no",
		Setting:         "setting",
		Distance:        "distance",
		Duration:        0,
		TheirMask:       "their_mask",
		YourMask:        "your_mask",
	}
}

func (i *Individual) Update(data int, riskProfile, interaction string, personCount int, symptomsChecked, setting, distance, theirMask, yourMask, voice string) {
	i.Data += data
	i.RiskProfile = riskProfile
	i.Interaction = interaction
	i.PersonCount = personCount
	i.SymptomsChecked = symptomsChecked
	i.Setting = setting
	i.Distance = distance
	i.Duration = 0
	i.TheirMask = theirMask
	i.YourMask = yourMask
	i.Voice = voice
}

func (i *Individual) ComputeNeighbor(neighborData int) {
	if neighborData == 0 {
		i.Data = 1
	} else {
		i.Data = 0
	}
}
