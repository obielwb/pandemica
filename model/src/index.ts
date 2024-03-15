import { getPopulation } from './population'

let population = await getPopulation({
  cache: true,
  saveToDisk: true
})
