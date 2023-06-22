package main

import (
	"fmt"
	"sync"
	"time"

	individual "updatepreviousneighbordata/individual"
)

func ProcessWindow(prevInstance, currentInstance, nextInstance *individual.Individual, wg *sync.WaitGroup) {
	defer wg.Done()
	currentInstance.ComputeNeighbor(prevInstance.Data)
}

func main() {
	instanceCount := 1223237
	instances := make([]*individual.Individual, instanceCount)

	// Pre-allocate instances slice
	for i := 0; i < instanceCount; i++ {
		instances[i] = individual.NewIndividual()
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

	fmt.Printf("%d\n", size)
	fmt.Printf("%f\n", endTime.Sub(startTime).Seconds())
}
