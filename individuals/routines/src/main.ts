import { instantiateIndividuals } from './individuals'
import { Clock } from './clock'

const individuals = instantiateIndividuals()
const clock = new Clock(individuals)

console.log(clock.individuals.slice(5))
clock.sortIndividuals()
console.log(clock.individuals.slice(5))
