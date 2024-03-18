import * as fs from 'fs'

import { getPopulation } from './population'
import { Clock } from './clock'
import { quickSort } from './clock/sorting'
import { calculate, changeSEIRState } from './calculus'
import { Individual, State } from './population/individual'
import { fasterFilter, fisherYatesShuffle, log } from './utilities'
import { nanoid } from 'nanoid'
import { VaccineTrigger } from './clock/triggers/vaccines'
import { LockdownTrigger } from './clock/triggers/lockdown'
import { MaskTrigger } from './clock/triggers/masks'
import { PandemicRegister } from '../data/covid19'
import { join } from 'path'
import { assignHospitalizedRoutine } from './routines'
import { Activity, Category, IndividualActivity, Label } from './population/activities'

// todo: implement run function
/**
 * @param endDate {Date} Simulation end date, defaults to 2023-01-01
 * @param initialScenario {PandemicRegister[]} First real pandemic cases to set up our model
 */
export async function run(
  endDate: Date = new Date('2022-12-31'),
  initialScenario: PandemicRegister[]
) {
  const runId = nanoid() // for result file storage purposes

  const simulatedPandemicRegisters: PandemicRegister[] = []

  let population = await getPopulation({
    cache: true,
    saveToDisk: true,
    city: 'campinas'
  })

  const clock = new Clock(new Date(initialScenario[0].date), population, quickSort)

  const lockdown = new LockdownTrigger(
    '2020-03-30',
    1,
    ['2021-05-01', '2021-08-01', '2021-11-01'],
    0.5,
    ['2020-06-01', '2020-08-01', '2020-10-01', '2020-12-01'],
    []
  )
  const vaccines = new VaccineTrigger()
  const masks = new MaskTrigger([])

  const { date, withoutDeadPopulation } = setInitialScenario(initialScenario, population)
  population = withoutDeadPopulation
  clock.setCurrentDateFromString(date)

  type HouseActivities =
    | Label.StayAtHome
    | Label.Sleep5h
    | Label.Sleep6h
    | Label.Sleep7h
    | Label.Sleep8h
    | Label.Sleep9h

  const occupationSites = new Map<number, IndividualActivity>()
  const houseActivties = new Map<number, Map<HouseActivities, IndividualActivity>>()
  const currentActivities = new Map<number, IndividualActivity>()

  let activitiesIds = 0

  const firstDayOfTheWeek = clock.currentDate().getDay()
  population.forEach((individual) => {
    const firstIndividualActivity = individual.routine[firstDayOfTheWeek][0]

    if (firstIndividualActivity.category === Category.Home) {
      let house = houseActivties.get(individual.house.id)

      if (house) {
        const ongoingHouseActivity = house.get(firstIndividualActivity.label as HouseActivities)

        if (ongoingHouseActivity) {
          individual.currentActivity = ongoingHouseActivity
          ongoingHouseActivity.individualsEngaged.push(individual.id)
        } else {
          const newHouseActivity = createIndividualActivity(
            activitiesIds++,
            firstIndividualActivity,
            individual.id,
            clock.currentDate()
          )
          house.set(firstIndividualActivity.label as HouseActivities, newHouseActivity)
          individual.currentActivity = newHouseActivity
        }
      } else {
        houseActivties.set(individual.house.id, new Map<HouseActivities, IndividualActivity>())

        const newHouseActivity = createIndividualActivity(
          activitiesIds++,
          firstIndividualActivity,
          individual.id,
          clock.currentDate()
        )

        house = houseActivties.get(individual.house.id)
        house.set(firstIndividualActivity.label as HouseActivities, newHouseActivity)
      }
    }
  })

  while (clock.currentDate() <= endDate) {
    clock.sortIndividuals()
    let minActivityTime = 0

    // const individualsWithCovid = currentActivity.individualsEngaged.map((i) => {
    //   let individual = individuals[i]
    //   if (individual.state === 'exposed' || individual.state === 'infectious') return individual
    // })

    // const individualsWithoutCovid = currentActivity.individualsEngaged.filter((i) => {
    //   const individual = individuals[i]

    //   return (
    //     individual.state !== 'exposed' &&
    //     individual.state !== 'infectious' &&
    //     individual.state !== 'recovered' &&
    //     individual.state !== 'dead' &&
    //     individual.state !== 'hospitalized'
    //   )
    // })

    // individualsWithoutCovid.forEach((i) => {
    //   const { acquiredCovid, deathProbability, hospitalizationProbability } = calculate(
    //     currentActivity,
    //     individualsWithCovid,
    //     individuals[i]
    //   )
    //   log('Hospitalization probability: ' + hospitalizationProbability)
    //   log('Death probability: ' + deathProbability)
    //   if (acquiredCovid) individuals[i].state = 'exposed'
    // })

    let dailyDeaths = []

    lockdown.assign(clock.currentDateString(), population)
    vaccines.assign(clock.currentDateString(), population)
    masks.assign(clock.currentDateString(), population)

    dailyDeaths = changeSEIRState(population)
    if (dailyDeaths.length !== 0) {
      population = fasterFilter(population, (individual) => !dailyDeaths.includes(individual.id))
    }

    dailyDeaths = []

    clock.tick(minActivityTime)
  }

  saveSimulatedPandemicRegistersToDisk(runId, simulatedPandemicRegisters)
}

function setInitialScenario(
  pandemicRegisters: PandemicRegister[],
  population: Individual[]
): { date: string; withoutDeadPopulation: Individual[] } {
  log('Setting initial pandemic scenario', { time: true, timeLabel: 'SIMULATION' })
  const lastPandemicRegister = pandemicRegisters[pandemicRegisters.length - 1]
  const totalIndividualsContaminated = fisherYatesShuffle(population).slice(
    0,
    lastPandemicRegister.totalCases
  )

  const deadIndividuals = totalIndividualsContaminated.slice(0, lastPandemicRegister.deaths)

  // infected individuals recover. to start the simulation
  // being contaminated we only catch individuals who were infected in the last 14 days
  const individualsCurrentContaminted = totalIndividualsContaminated.slice(
    lastPandemicRegister.deaths, // leave behind dead individuals
    lastPandemicRegister.deaths +
      (pandemicRegisters[pandemicRegisters.length - 1].totalCases -
        pandemicRegisters[pandemicRegisters.length - 14].totalCases)
  )

  individualsCurrentContaminted.map((individual) => {
    individual.state = State.Hospitalized
    assignHospitalizedRoutine(individual)
  })

  let withoutDeadPopulation = fasterFilter(population, (individual) =>
    deadIndividuals.some((deadIndividual) => deadIndividual.id === individual.id)
  )

  return {
    date: pandemicRegisters[pandemicRegisters.length - 1].date,
    withoutDeadPopulation
  }
}

function saveSimulatedPandemicRegistersToDisk(
  simulationId: string,
  pandemicRegisters: PandemicRegister[]
) {
  log('Serializing simulation pandemic registers', {
    time: true,
    timeLabel: 'SERIALIZATION'
  })

  const headers = Object.keys(pandemicRegisters[0]).join(',')
  const rows = pandemicRegisters.map((entry) => Object.values(entry).join(','))

  const resultDir = join(__dirname, '..', 'data', 'simulation', 'results')
  const filePath = join(resultDir, `${simulationId}.csv`)

  fs.writeFileSync(filePath, `${headers}\n${rows.join('\n')}`)

  log('', {
    timeEnd: true,
    timeLabel: 'SERIALIZATION'
  })
}

function createIndividualActivity(
  activityId: number,
  activity: Activity,
  individualId: number,
  date: Date
) {
  return new IndividualActivity(
    activityId,
    activity.category,
    activity.label,
    activity.setting,
    activity.duration,
    activity.distance,
    activity.voice,
    activity.maximumIndividualsEngaged,
    [individualId],
    date
  )
}
