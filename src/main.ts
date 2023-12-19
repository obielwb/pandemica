import { createPopulation } from './population'
import { Clock } from './clock'
import { quickSort } from './clock/sorting'

const individuals = createPopulation()
const clock = new Clock(individuals, quickSort)

// console.log(clock.individuals.slice(5))
clock.sortIndividuals()
// console.log(clock.individuals.slice(5))
