import { test, describe } from 'bun:test'

import { instantiateIndividuals } from '../src/individuals'
import { Individual } from '../src/individual'
import {
  radixSort,
  quickSort,
  mergeSort,
  insertionSort,
  bubbleSort,
  vanillaSort
} from '../src/clock/sorting'

const individuals = instantiateIndividuals()

describe('Sorting', () => {
  test('Should test and export algorithms data', async () => {
    type Result = {
      iteration: number
      time: number
    }

    async function testSortingAlgorithm(
      sortFunction: (individuals: Individual[]) => Individual[],
      individuals: Individual[],
      sortFunctionName: string,
      iterations: number
    ) {
      const results: Result[] = []

      for (let i = 0; i < iterations; i++) {
        const startTime = Date.now()
        sortFunction(individuals)
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
    const algorithms: [(individuals: Individual[]) => Individual[], string][] = [
      // [radixSort, 'radix'],
      // [quickSort, 'quick'],
      [mergeSort, 'merge'],
      [insertionSort, 'insertion'],
      [bubbleSort, 'bubble'],
      [vanillaSort, 'vanilla']
    ]

    for (const algorithm of algorithms) {
      const individualsCopy = individuals.slice()
      await testSortingAlgorithm(algorithm[0], individualsCopy, algorithm[1], ITERATIONS)
    }
  })
})
