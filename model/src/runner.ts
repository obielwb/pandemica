import * as fs from 'fs'

import { getPopulation } from './population'
import { Clock } from './clock'
import { quickSort } from './clock/sorting'
import { calculate } from './calculus'
import { Individual, State } from './population/individual'
import { fisherYatesShuffle, log } from './utilities'
import { nanoid } from 'nanoid'
import { VaccineTrigger } from './clock/triggers/vaccines'
import { LockdownTrigger } from './clock/triggers/lockdown'
import { MaskTrigger } from './clock/triggers/masks'
import { PandemicRegister } from '../data/covid19'
import { join } from 'path'
import { assignHospitalizedRoutine } from './routines'

// todo: implement run function
/**
 * @param endDate {Date} Simulation end date, defaults to 2023-01-01
 * @param initialScenario {PandemicRegister[]} First real pandemic cases to set up our model
 */
export async function run(
  endDate: Date = new Date('2023-01-01'),
  initialScenario: PandemicRegister[]
) {
  const runId = nanoid() // for result file storage purposes

  const simulatedPandemicRegisters: PandemicRegister[] = []

  const population = await getPopulation({
    cache: true,
    saveToDisk: true
  })

  const clock = new Clock(new Date(initialScenario[0].date), population, quickSort)

  // nao sabia se queria isso aqui dnv, acabei nao apagando
  // console.log(
  //   population.find(
  //     (individual) => individual.age[1] <= 19 && individual.occupationTypes.length === 0
  //   )
  // )

  // console.log(
  //   population.find(
  //     (individual) => individual.age[1] <= 19 && individual.occupationTypes.includes('s')
  //   )
  // )

  // console.log(population.find((individual) => individual.occupationTypes.length === 2))

  // console.log(
  //   population.find(
  //     (individual) => individual.age[1] > 19 && individual.occupationTypes.length === 0
  //   )
  // )

  const lockdown = new LockdownTrigger(
    population,
    '0000-00-00',
    1,
    ['0000-00-00', '0000-00-00'],
    0.5,
    ['0000-00-00'],
    []
  )
  const vaccines = new VaccineTrigger(population)
  const masks = new MaskTrigger(population, [])

  // lockdown.assign(clock.currentDateString())
  // vaccines.assign(clock.currentDateString())
  // masks.assign(clock.currentDateString())

  // while (clock.currentDate() <= endDate) {
  //   const individualsWithCovid = currentActivity.individualsEngaged.map((i) => {
  //     let individual = individuals[i]
  //     if (individual.state === 'exposed' || individual.state === 'infectious') return individual
  //   })

  //   const individualsWithoutCovid = currentActivity.individualsEngaged.filter((i) => {
  //     const individual = individuals[i]

  //     return (
  //       individual.state !== 'exposed' &&
  //       individual.state !== 'infectious' &&
  //       individual.state !== 'recovered' &&
  //       individual.state !== 'dead' &&
  //       individual.state !== 'hospitalized'
  //     )
  //   })

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

  saveSimulatedPandemicRegistersToDisk(runId, simulatedPandemicRegisters)
}

function setInitialScenario(
  totalDeaths: number,
  totalCases: number,
  pandemicRegisters: PandemicRegister[],
  population: Individual[]
) {
  log('Setting initial pandemic scenario', { time: true, timeLabel: 'SIMULATION' })
  const totalIndividualsContaminated = fisherYatesShuffle(population).slice(0, totalCases)

  const individualsDead = totalIndividualsContaminated.slice(0, totalDeaths)

  individualsDead.map((individual) => (individual.state = State.Dead))

  // todo: be aware of dead individuals in runner
  // todo: implement assignCovidstateRoutine functions
  // todo: implement covid recuperation

  // infected individuals recover. To start the simulation
  // being contaminated we only catch individuals who were infected in the last 14 days
  const individualsCurrentContaminted = totalIndividualsContaminated.slice(
    totalDeaths, // starts to select where individualsDead ends
    totalDeaths + (pandemicRegisters[-1].totalCases - pandemicRegisters[-14].totalCases)
  )

  individualsCurrentContaminted.slice(totalDeaths).map((individual) => {
    individual.state = State.Hospitalized
    assignHospitalizedRoutine(individual)
  })

  return pandemicRegisters[pandemicRegisters.length - 1].date
}

function saveSimulatedPandemicRegistersToDisk(
  simulationId: string,
  pandemicRegisters: PandemicRegister[]
) {
  log('Serializing siumation pandemic registers', {
    time: true,
    timeLabel: 'SERIALIZATION'
  })

  const headers = Object.keys(pandemicRegisters[0]).join(',')
  const rows = pandemicRegisters.map((entry) => Object.values(entry).join(','))

  const resultDir = join(__dirname, '..', 'data', 'simulation', 'results')
  const filePath = join(resultDir, `simulation_${simulationId}.csv`)

  fs.writeFileSync(filePath, `${headers}\n${rows.join('\n')}`)
}
