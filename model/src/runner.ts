import { getPopulation } from './population'
import { Clock } from './clock'
import { quickSort } from './clock/sorting'
import { IndividualActivity } from './population/activities'
import { calculate } from './calculus'
import { Individual } from './population/individual'
import { log } from './utilities'
import { nanoid } from 'nanoid'
import { VaccineTrigger } from './clock/triggers/vaccines'
import { LockdownTrigger } from './clock/triggers/lockdown'
import { MaskTrigger } from './clock/triggers/masks'

// todo: these individuals are outdated
const individuals: Individual[] = []

const currentActivity: IndividualActivity = {
  id: 0,
  category: 'transport',
  distance: 'normal',
  duration: 10,
  individualsEngaged: individuals.map((individual) => individual.id),
  label: 'transportation.public.ride',
  setting: 'indoor',
  maximumIndividualsEngaged: 40,
  voice: 'loud',
  // todo
  serialize: null
}

// todo: implement run function
/**
 * @param step {number} Number of days before saving results to file, defaults to 30
 * @param ignoreStep {boolean} Whether to ignore step parameter, saving results only at the end, defaults to false
 * @param startDate {Date} Simulation start date, defaults to 2020-01-01
 * @param endDate {Date} Simulation end date, defaults to 2023-01-01
 */
export async function run(
  step: number = 30,
  ignoreStep: boolean = false,
  startDate: Date = new Date('2020-01-01'),
  endDate: Date = new Date('2023-01-01'),
  initialScenario: PandemicRegister[]
) {
  const runId = nanoid() // for result file storage purposes

  const population = await getPopulation({
    cache: true,
    saveToDisk: false
  })

  const clock = new Clock(startDate, individuals, quickSort)

  const lockdown = new LockdownTrigger(
    individuals,
    '0000-00-00',
    1,
    ['0000-00-00', '0000-00-00'],
    0.5,
    ['0000-00-00']
  )

  console.log(
    population.find(
      (individual) => individual.age[1] <= 19 && individual.occupationTypes.length === 0
    ):
  )

  console.log(
    population.find(
      (individual) => individual.age[1] <= 19 && individual.occupationTypes.includes('study')
    )
  )

  console.log(population.find((individual) => individual.occupationTypes.length === 2))

  console.log(
    population.find(
      (individual) => individual.age[1] > 19 && individual.occupationTypes.length === 0
    )
  )

  const vaccines = new VaccineTrigger(individuals)
  const masks = new MaskTrigger(individuals, [])

  lockdown.assign(clock.currentDateString())
  vaccines.assign(clock.currentDateString())
  masks.assign(clock.currentDateString())

  // while (clock.currentDate() <= endDate) {
  //   const individualsWithCovid = currentActivity.individualsEngaged.map(
  //     (i) => {
  //       let individual = individuals[i]
  //       if (individual.state === 'exposed' || individual.state === 'infectious')
  //         return individual
  //     }
  //   )

  //   const individualsWithoutCovid = currentActivity.individualsEngaged.filter(
  //     (i) => {
  //       const individual = individuals[i]

  //       return individual.state !== 'exposed' &&
  //         individual.state !== 'infectious' &&
  //         individual.state !== 'recovered' &&
  //         individual.state !== 'dead' &&
  //         individual.state !== 'hospitalized'
  //     }
  //   )

  //   individualsWithoutCovid.forEach((i) => {
  //     const { acquiredCovid, deathProbability, hospitalizationProbability } = calculate(
  //       currentActivity,
  //       individualsWithCovid,
  //       individuals[i]
  //     )
  //     log('Hospitalization probability: ' + hospitalizationProbability)
  //     log('Death probability: ' + deathProbability)
  //     if (acquiredCovid) individuals[i].state = 'exposed'
  //   })
  // }
}
