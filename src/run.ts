import { getPopulation } from './population'
import { Clock } from './clock'
import { quickSort } from './clock/sorting'
import { IndividualActivity } from './activities'
import { calculate } from './calculate'
import { Individual } from './individual'
import { log } from './utilities'
import { nanoid } from 'nanoid'

// todo: these individuals are outdated
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

// todo: implement run function
/**
 * @param runId {string} Simulation run id for result file storage purposes, defaults to nanoid
 * @param step {number} Number of days before saving results to file, defaults to 30
 * @param ignoreStep {boolean} Whether to ignore step parameter, saving results only at the end, defaults to false
 * @param startAt {Date} Simulation start date, defaults to 2020-01-01
 * @param endAt {Date} Simulation end date, defaults to 2023-01-01
 */
export function run(
  runId: string = nanoid(),
  step: number = 30,
  ignoreStep: boolean = false,
  startAt: Date = new Date('2020-01-01'),
  endAt: Date = new Date('2023-01-01')
) {
  const population = getPopulation({
    cache: true,
    saveToDisk: true
  })
  const clock = new Clock(individuals, quickSort)

  // add more step-by-step before ticking the clock here
  const individualsWithCovid = currentActivity.individualsEngaged.filter(
    (individual) => individual.state === 'exposed' && individual.state === 'infected'
  )
  const individualsWithoutCovid = currentActivity.individualsEngaged.filter(
    (individual) =>
      individual.state !== 'exposed' &&
      individual.state !== 'infected' &&
      individual.state !== 'recovered' &&
      individual.state !== 'dead' &&
      individual.state !== 'hospitalized' &&
      individual.state !== 'quarantined'
  )

  individualsWithoutCovid.forEach((individual) => {
    const { acquiredCovid, deathProbability, hospitalizationProbability } = calculate(
      currentActivity,
      individualsWithCovid,
      individual
    )
    log('Hospitalization Probability: ' + hospitalizationProbability)
    log('Death Probability: ' + deathProbability)
    if (acquiredCovid) individual.state = 'exposed'
  })
}
