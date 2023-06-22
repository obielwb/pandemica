package updatepreviousneighbordata

type Individual struct {
	data            int
	riskProfile     string
	interaction     string
	personCount     int
	symptomsChecked string
	setting         string
	distance        string
	duration        int
	theirMask       string
	yourMask        string
	voice           string
}

func NewIndividual() *Individual {
	return &Individual{
		data:            0,
		riskProfile:     "riskprofile",
		interaction:     "interaction",
		personCount:     0,
		symptomsChecked: "no",
		setting:         "setting",
		distance:        "distance",
		duration:        0,
		theirMask:       "their_mask",
		yourMask:        "your_mask",
	}
}

func (i *Individual) Update(data int, riskProfile, interaction string, personCount int, symptomsChecked, setting, distance, theirMask, yourMask, voice string) {
	i.data += data
	i.riskProfile = riskProfile
	i.interaction = interaction
	i.personCount = personCount
	i.symptomsChecked = symptomsChecked
	i.setting = setting
	i.distance = distance
	i.duration = 0
	i.theirMask = theirMask
	i.yourMask = yourMask
	i.voice = voice
}

func (i *Individual) ComputeNeighbor(neighborData int) {
	if neighborData == 0 {
		i.data = 1
	} else {
		i.data = 0
	}
}
