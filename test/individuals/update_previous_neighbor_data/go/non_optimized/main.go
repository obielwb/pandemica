package main

import (
	"fmt"
	"time"

	individual "updatepreviousneighbordata/individual"
)

func ProcessWindow(prevInstance, currentInstance, nextInstance *individual.Individual) {
	currentInstance.ComputeNeighbor(prevInstance.Data)
}

func main() {
	instanceCount := 1223237
	instances := make([]*individual.Individual, instanceCount)

	for i := 0; i < instanceCount; i++ {
		instances[i] = individual.NewIndividual()
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
	fmt.Printf("%f\n", endTime.Sub(startTime).Seconds())
}