package updatepreviousneighbordata

import (
	"fmt"
	"time"
)

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
