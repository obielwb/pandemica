import { test, describe } from 'bun:test'

import {
  radixSort,
  quickSort,
  mergeSort,
  insertionSort,
  bubbleSort,
  vanillaSort
} from '../src/clock/sorting'
import { Activity } from '../src/activities'

const currentActivities: Activity[] = []

const exampleActivity: Activity = {
  category: 'leisure',
  label: '',
  setting: 'indoor',
  distance: 'intimate',
  voice: 'normal',
  maximumIndvidualsEngaged: 0
}
for (let i = 0; i < 10000; i++) {
  exampleActivity.duration = Math.floor(5 + Math.random() * (750 - 5 + 1))

  currentActivities.push(exampleActivity)
}

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
      [insertionSort, 'insertion'],
      [bubbleSort, 'bubble'],
      [vanillaSort, 'vanilla']
    ]

    for (const algorithm of algorithms) {
      const currentActivitiesCopy = currentActivities.slice()
      await testSortingAlgorithm(algorithm[0], currentActivitiesCopy, algorithm[1], ITERATIONS)
    }
  })
})
