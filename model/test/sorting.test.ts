import { test, describe } from 'bun:test'

import {
  radixSort,
  quickSort,
  mergeSort,
  // insertionSort, // -> bottle necks
  // bubbleSort, // -> bottle necks
  vanillaSort,
  countingSort,
  heapSort,
  timSort
} from '../individuals/routines/src/clock/sorting'
import type { Activity } from '../individuals/routines/src/activities'
import { totalPopulation } from '../src/data'

const exampleActivity: Activity = {
  category: 'leisure',
  label: '',
  setting: 'indoor',
  distance: 'intimate',
  voice: 'normal',
  maximumIndvidualsEngaged: 0
}

const currentActivities: Activity[] = Array.from({ length: totalPopulation }, () => {
  return { ...exampleActivity, duration: Math.floor(5 + Math.random() * (750 - 5 + 1)) }
})

describe('Sorting', () => {
  test('Should test and export algorithms data', async () => {
    type Result = {
      iteration: number
      time: number
    }

    async function testSortingAlgorithm(
      sortFunction: (currentActivities: Activity[]) => Activity[],
      currentActivities: Activity[],
      sortFunctionName: string,
      iterations: number
    ) {
      const results: Result[] = []

      for (let i = 0; i < iterations; i++) {
        const startTime = Date.now()
        sortFunction(currentActivities)
        const endTime = Date.now()

        const elapsedTime = (endTime - startTime) / 1000
        results.push({ iteration: i, time: elapsedTime })
      }

      await exportToCsv(results, sortFunctionName)
    }

    async function exportToCsv(results: Result[], sortName: string) {
      const csvData =
        'iteration,runtime\n' +
        results.map((result) => `${result.iteration},${result.time}`).join('\n')

      const fileName = `./test/sorting/data/${sortName}.csv`

      Bun.file(fileName)
      await Bun.write(fileName, csvData)
    }

    const ITERATIONS = 20
    const algorithms: [(currentActivities: Activity[]) => Activity[], string][] = [
      [radixSort, 'radix'],
      [quickSort, 'quick'],
      [mergeSort, 'merge'],
      // [insertionSort, 'insertion'], // -> bottle neck
      // [bubbleSort, 'bubble'], // -> bottle neck
      [vanillaSort, 'vanilla'],
      [countingSort, 'counting'],
      [heapSort, 'heap'],
      [timSort, 'tim']
    ]

    for (const algorithm of algorithms) {
      const currentActivitiesCopy = currentActivities.slice()
      await testSortingAlgorithm(algorithm[0], currentActivitiesCopy, algorithm[1], ITERATIONS)
    }
  })
})
