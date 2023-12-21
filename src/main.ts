import { createPopulation } from './population'
import { Clock } from './clock'
import { quickSort } from './clock/sorting'
import { IndividualActivity } from './activities'
import { calculate } from './calculate'

const individuals = createPopulation()
const clock = new Clock(individuals, quickSort)

// console.log(clock.individuals.slice(5))
// clock.sortIndividuals()
// console.log(clock.individuals.slice(5))

const currentIndividuals = individuals.slice(5)
currentIndividuals[0].hasCovid = true

const currentActivity: IndividualActivity = {
  category: 'transportation',
  distance: 'normal',
  duration: 60,
  id: 'id',
  individualsEngaged: [...currentIndividuals],
  label: 'transportation.public.ride',
  setting: 'indoor',
  maximumIndvidualsEngaged: 40,
  voice: 'silent'
}

const individualsWithCovid = currentActivity.individualsEngaged.filter(
  (individual) => individual.hasCovid
)
const individualsWithoutCovid = currentActivity.individualsEngaged.filter(
  (individual) => !individual.hasCovid
)

individualsWithoutCovid.forEach((individual) => {
  const getCovid = calculate(currentActivity, individualsWithCovid, individual)
  if (getCovid) individual.hasCovid = true
})
