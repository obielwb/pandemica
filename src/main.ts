import { createPopulation } from './population'
import { Clock } from './clock'
import { quickSort } from './clock/sorting'
import { IndividualActivity } from './activities'
import { calculate } from './calculate'
import { Individual } from './individual'
import { log } from './utilities'

// const individuals = createPopulation()
// const clock = new Clock(individuals, quickSort)

// console.log(clock.individuals.slice(5))
// clock.sortIndividuals()
// console.log(clock.individuals.slice(5))

const individuals: Individual[] = [
  {
    id: '',
    sex: 'male',
    age: [60, 64],
    hadCovid: false,
    isDead: false,
    hasCovid: false,
    mask: 'n95Sealed',
    studyLevel: '',
    routine: [],
    income: '',
    vaccine: {
      doses: 0,
      type: 'none'
    },
    house: {
      housemates: [],
      id: '',
      region: '',
      size: 2
    },

    isHospitalized: false,
    occupationType: [],
    vehicle: ''
  },
  {
    id: '',
    sex: 'male',
    age: [15, 19],
    hadCovid: false,
    isDead: false,
    hasCovid: true,
    mask: 'none',
    studyLevel: '',
    routine: [],
    income: '',
    vaccine: {
      doses: 0,
      type: 'none'
    },
    house: {
      housemates: [],
      id: '',
      region: '',
      size: 2
    },

    isHospitalized: false,
    occupationType: [],
    vehicle: ''
  }
]

const currentActivity: IndividualActivity = {
  category: 'transportation',
  distance: 'normal',
  duration: 10,
  id: 'id',
  individualsEngaged: [...individuals],
  label: 'transportation.public.ride',
  setting: 'indoor',
  maximumIndvidualsEngaged: 40,
  voice: 'loud'
}

const individualsWithCovid = currentActivity.individualsEngaged.filter(
  (individual) => individual.hasCovid
)
const individualsWithoutCovid = currentActivity.individualsEngaged.filter(
  (individual) => !individual.hasCovid
)

individualsWithoutCovid.forEach((individual) => {
  const { acquiredCovid, deathProbability, hospitalizationProbability } = calculate(
    currentActivity,
    individualsWithCovid,
    individual
  )
  log('Hospitalization Probability: ' + hospitalizationProbability)
  log('Death Probability: ' + deathProbability)
  if (acquiredCovid) individual.hasCovid = true
})
