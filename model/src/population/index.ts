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
  highSchools,
  RETIREMENT_AGE
} from '../../data/census'
import {
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
} from './parameters'
import { Individual } from './individual'
import { join, extname } from 'node:path'
import { readdir, readFile, writeFile } from 'node:fs/promises'
import { log } from '../utilities'
import { assignRoutine } from '../routines'

type GetPopulationParameters = { cache: boolean; saveToDisk: boolean }

// todo: improve jsdoc usage
/**
 * @param cache {boolean} Defaults to false
 * @param saveToDisk {boolean} Defaults to false
 */
export async function getPopulation(
  options: GetPopulationParameters = { cache: false, saveToDisk: false }
): Promise<Individual[]> {
  const { cache, saveToDisk } = options

  if (cache) {
    log('Trying to read existing population', {
      time: true,
      timeLabel: 'POPULATION'
    })

    const population = await readPopulationFromDisk()

    log('', {
      timeEnd: true,
      timeLabel: 'POPULATION'
    })

    if (population.length > 0) {
      return population
    }
  }

  log('Instantiating new population', { time: true, timeLabel: 'POPULATION' })

  const population = instantiatePopulation()

  if (saveToDisk) {
    await savePopulationToDisk(population)
  }

  log('', { timeEnd: true, timeLabel: 'POPULATION' })

  return population
}

async function readPopulationFromDisk() {
  log('Deserializing population', {
    time: true,
    timeLabel: 'DESERIALIZATION'
  })
  const populationDir = join(__dirname, '..', '..', 'data', 'simulation', 'population')

  let population = []

  try {
    const files = await readdir(populationDir)
    for (const file of files) {
      if (extname(file) === '.json') {
        const filePath = join(populationDir, file)
        const individuals = await readPopulationFragmentFromFile(filePath)
        population = population.concat(individuals)
      }
    }
    population.sort((a, b) => a.id - b.id)
  } catch (error) {
    log('Error reading population from disk', { error })
    throw error
  }

  log('', {
    timeEnd: true,
    timeLabel: 'DESERIALIZATION'
  })

  return population
}

async function readPopulationFragmentFromFile(filePath: string): Promise<Individual[]> {
  const fragmentNumber = filePath.split('-')[1].split('.')[0]

  log(`Loading population fragment ${fragmentNumber}`, {
    time: true,
    timeLabel: 'FRAGMENT'
  })

  try {
    const serializedPopulation = await readFile(filePath, 'utf8')
    const population = JSON.parse(serializedPopulation).map(Individual.deserialize)

    log('', { timeEnd: true, timeLabel: 'FRAGMENT' })

    return population
  } catch (error) {
    log('Error reading population fragment from file', {
      error
    })
    throw error
  }
}

const FRAGMENT_FILE_SIZE = 42 * 1024 * 1024 // 42mb

async function savePopulationToDisk(population: Individual[]) {
  log('Serializing population', {
    time: true,
    timeLabel: 'SERIALIZATION'
  })

  const populationTotalSize = population.reduce((acc, individual) => {
    const size = Buffer.byteLength(serializeIndividual(individual))
    return acc + size
  }, 0)

  const fragments = Math.ceil(populationTotalSize / FRAGMENT_FILE_SIZE)
  const fragmentIndividualCount = Math.ceil(population.length / fragments)

  const populationDir = join(__dirname, '..', '..', 'data', 'simulation', 'population')

  for (let i = 0; i < fragments; i++) {
    log(`Saving fragment ${i} to disk`, {
      time: true,
      timeLabel: 'FRAGMENT'
    })

    const fragmentIndividuals: Buffer[] = []
    for (let j = 0; j < fragmentIndividualCount; j++) {
      const individualIndex = i * fragmentIndividualCount + j

      if (individualIndex >= population.length) {
        break
      }

      const individual = population[individualIndex]
      if (!individual) {
        continue
      }

      const serializedIndividual = serializeIndividual(individual)
      fragmentIndividuals.push(serializedIndividual)
    }

    const filePath = join(populationDir, `fragment-${i}.json`)

    const jsonString = `[${fragmentIndividuals.join(',')}]`

    try {
      await writeFile(filePath, jsonString)
      log('', {
        timeEnd: true,
        timeLabel: 'FRAGMENT'
      })
    } catch (error) {
      log(`Error saving fragment ${i} to disk`, { error })
      throw error
    }
  }

  log('', {
    timeEnd: true,
    timeLabel: 'SERIALIZATION'
  })
}

function serializeIndividual(individual: Individual) {
  const serializedIndividual = individual.serialize!()
  const jsonString = JSON.stringify(serializedIndividual)
  const buffer = Buffer.from(jsonString)
  return buffer
}

function instantiatePopulation() {
  let individuals: Individual[] = []

  for (let i = 0; i < totalPopulation; i++) {
    const individual = new Individual()

    individual.id = i

    // initial settings
    individual.mask = ''
    individual.vaccine = {
      doses: 0,
      type: ''
    }

    individual.occupationTypes = []
    individual.occupations = []

    individual.state = 'susceptible'
    individual.hadCovid = individual.isInLockdown = false

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
    commerceAndServicesEmployees,
    RETIREMENT_AGE
  )

  individuals = assignIncome(individuals, normalizeIncomes(incomes, individuals))

  individuals = assignTransportationMean(individuals, housesWithVehicles)

  individuals = assignRoutine(individuals)

  individuals.sort((a, b) => a.id - b.id)

  return individuals
}
