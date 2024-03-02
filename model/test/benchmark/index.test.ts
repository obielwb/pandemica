import { Individual } from '../../src/population/individual'
import { getPopulation } from '../../src/population'
import { fasterFilter, fisherYatesShuffle, log, shuffle } from '../../src/utilities'

function measureExecutionTime<T>(func: (...args: any[]) => T, ...args: any[]): number {
  const startTime = performance.now()
  func(...args)
  const endTime = performance.now()
  return endTime - startTime
}

async function run() {
  const population = await getPopulation({ cache: true, saveToDisk: true })

  const shuffleTime = measureExecutionTime(shuffle, population)
  log(`shuffle time ${shuffleTime}`)
  const fisherYaterShuffleTime = measureExecutionTime(fisherYatesShuffle, population)
  log(`fisher shuffle time ${fisherYaterShuffleTime}`)

  let startTime = performance.now()
  population.filter((individual) => individual.occupationTypes.includes('work'))
  let endTime = performance.now()
  log(`filter time ${endTime - startTime}`)

  startTime = performance.now()
  fasterFilter(population, (individual) => individual.occupationTypes.includes('work'))
  endTime = performance.now()
  log(`faster filter time ${endTime - startTime}`)
}

run()
