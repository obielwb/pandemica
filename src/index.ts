import { getPopulation } from './population'
// import { Clock } from './clock'
// import { quickSort } from './clock/sorting'

const individuals = getPopulation({ cache: false, saveToDisk: true })
// const clock = new Clock(individuals, quickSort)