package main

import (
	"fmt"
	"time"
)

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

func ProcessWindow(prevInstance, currentInstance, nextInstance *Individual) {
	currentInstance.ComputeNeighbor(prevInstance.data)
}

func main() {
	instanceCount := 1223237
	instances := make([]*Individual, instanceCount)

	for i := 0; i < instanceCount; i++ {
		instances[i] = NewIndividual()
	}

	size := instanceCount * 4 // assuming 32-bit integers, each occupying 4 bytes

	startTime := time.Now()

	// simulation
	prevInstance := instances[0]
	currentInstance := instances[1]

	for i := 2; i < len(instances); i++ {
		nextInstance := instances[i]

		ProcessWindow(prevInstance, currentInstance, nextInstance)

		prevInstance = currentInstance
		currentInstance = nextInstance
	}

	endTime := time.Now()

	fmt.Printf("%d\n", size)
	fmt.Printf("%s\n", endTime.Sub(startTime))
}
