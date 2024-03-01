import { getPopulation } from './population'
import { Clock } from './clock'
import { quickSort } from './clock/sorting'
import { IndividualActivity } from './activities'
import { calculate } from './calculate'
import { Individual } from './individual'
import { log } from './utilities'
import { nanoid } from 'nanoid'
import { VaccineTrigger } from './triggers/vaccines'
import { LockdownTrigger } from './triggers/lockdown'
import { MaskTrigger } from './triggers/masks'

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
  endDate: Date = new Date('2023-01-01')
) {
  const runId = nanoid() // for result file storage purposes

  const population = await getPopulation({
    cache: true,
    saveToDisk: true
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
