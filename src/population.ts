import {
  commerceAndServices,
  commerceAndServicesEmployees,
  industries,
  industriesEmployees,
  totalPopulation,
  regionsPopulation,
  malePercentage,
  residentsPerHouse,
  incomes,
  ages,
  middleSchoolers,
  preschoolers,
  highSchoolers,
  undergradStudents,
  gradStudents,
  alreadyAttended,
  neverAttended,
  housesWithVehicles,
  preschools,
  colleges,
  middleSchools,
  highSchools
} from '../data/census'
import {
  normalize,
  assignSex,
  normalizeAge,
  normalizeResidentsPerHouse,
  assignHouse,
  assignAge,
  assignIncome,
  assignEducationStatus,
  assignTransportationMean,
  assignStudyOccupations,
  assignWorkOccupations,
  normalizeIncomes
} from './parameter'
import { Individual } from './individual'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fisherYatesShuffle, log } from './utilities'
import { createRoutines } from './routines'

// todo: add automatic gzip compression to serialization in order to
// be able to upload a gzip file to github and maintain
// a single population for test purposes
// todo: improve parameter options implementation and document it using jsdoc
export function getPopulation(options = { cache: false, saveToDisk: false }): Individual[] {
  const { cache, saveToDisk } = options

  if (cache) {
    const population = readPopulationFromDisk()!

    if (population) {
      return population
    }
  }

  log('Instantiating new population', { time: true, timeLabel: 'POPULATION' })

  const population = instantiatePopulation()

  if (saveToDisk) {
    savePopulationToDisk(population)
  }

  log('', { timeEnd: true, timeLabel: 'POPULATION' })

  return population
}

export function readPopulationFromDisk() {
  const filePath = join(__dirname, '..', 'data', 'simulation', 'population.json')
  if (existsSync(filePath)) {
    log('Loading population from disk', { time: true, timeLabel: 'POPULATION' })

    const serialized = readFileSync(filePath)

    const population = deserializePopulation(serialized)

    log('', { timeEnd: true, timeLabel: 'POPULATION' })

    return population
  }
}

export function savePopulationToDisk(population: Individual[]) {
  const filePath = join(__dirname, '..', 'data', 'simulation', 'population.json')
  const serialized = serializePopulation(population)
  writeFileSync(filePath, serialized)
}

function serializePopulation(population: Individual[]) {
  log('Serializing population')

  const serializedPopulation = population.map((individual) => individual.serialize!())

  const jsonString = JSON.stringify(serializedPopulation)

  return Buffer.from(jsonString)
}

function deserializePopulation(serialized: Buffer): Individual[] {
  log('Deserializing population')

  const jsonString = serialized.toString()

  const serializedIndividuals = JSON.parse(jsonString) as string[]

  return serializedIndividuals.map((serializedIndividual) =>
    Individual.deserialize(serializedIndividual)
  )
}

function instantiatePopulation() {
  let individuals: Individual[] = []

  for (let i = 0; i < totalPopulation; i++) {
    const individual = new Individual()

    individual.id = i

    // initial settings
    individual.mask = 'none'
    individual.vaccine = {
      doses: 0,
      type: 'none'
    }

    individual.occupationTypes = []
    individual.occupations = []

    individual.state = 'susceptible'
    individual.hadCovid = false

    individuals.push(individual)
  }

  individuals = assignSex(individuals, malePercentage)

  individuals = assignAge(individuals, normalizeAge(ages, totalPopulation, malePercentage))

  individuals = assignHouse(
    individuals,
    normalizeResidentsPerHouse(residentsPerHouse, individuals.length),
    regionsPopulation
  )

  individuals = assignEducationStatus(
    individuals,
    preschoolers,
    middleSchoolers,
    highSchoolers,
    undergradStudents,
    gradStudents,
    alreadyAttended,
    neverAttended
  )

  const { individuals: individualsWithStudyOccupation, lastOccupationId } = assignStudyOccupations(
    individuals,
    preschools,
    middleSchools,
    highSchools,
    colleges
  )

  individuals = assignWorkOccupations(
    individualsWithStudyOccupation,
    lastOccupationId,
    industries,
    industriesEmployees,
    commerceAndServices,
    commerceAndServicesEmployees
  )

  individuals = assignIncome(individuals, normalizeIncomes(incomes, individuals))

  individuals = assignTransportationMean(individuals, housesWithVehicles)

  individuals = createRoutines(individuals)

  return fisherYatesShuffle(individuals)
}
