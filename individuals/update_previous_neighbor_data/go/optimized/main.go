package main

import (
	"fmt"
	"sync"
	"time"
)

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

func ProcessWindow(prevInstance, currentInstance, nextInstance *Individual, wg *sync.WaitGroup) {
	defer wg.Done()
	currentInstance.ComputeNeighbor(prevInstance.Data)
}

func main() {
	instanceCount := 1223237
	instances := make([]*Individual, instanceCount)

	// Pre-allocate instances slice
	for i := 0; i < instanceCount; i++ {
		instances[i] = NewIndividual()
	}

	size := instanceCount * 4 // assuming 32-bit integers, each occupying 4 bytes

	startTime := time.Now()

	// simulation
	var wg sync.WaitGroup

	for i := 2; i < len(instances); i++ {
		prevInstance := instances[i-2]
		currentInstance := instances[i-1]
		nextInstance := instances[i]

		wg.Add(1)
		go ProcessWindow(prevInstance, currentInstance, nextInstance, &wg)
	}

	wg.Wait()

	endTime := time.Now()

	fmt.Printf("%d,%f", size, endTime.Sub(startTime).Seconds())
}
