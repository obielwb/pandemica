import { createPopulation } from './individuals'
import { Clock } from './clock'
import { vanillaSort } from './clock/sorting'

const individuals = createPopulation()
const clock = new Clock(individuals, vanillaSort)

console.log(clock.individuals.slice(5))
clock.sortIndividuals()
console.log(clock.individuals.slice(5))
