import { normalize } from '../parameter'
import { totalPopulation, populationRegions } from '.'
import { Individual } from '../individual'

const individuals: Individual[] = []
for (let i = 0; i < totalPopulation; i++) individuals[i] = new Individual()

console.log(populationRegions)
console.log(normalize(individuals, 'region', populationRegions))
