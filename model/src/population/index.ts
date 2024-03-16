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
  RETIREMENT_AGE,
  middleSchoolerOlderThanTen,
  middleSchoolerYoungerThanTen
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
import { Individual, OccupationType, State } from './individual'
import { join, extname } from 'node:path'
import { readdir, readFile, writeFile } from 'node:fs/promises'
import { log } from '../utilities'
import { assignRoutine } from '../routines'
import { Mask, VaccineType } from '../calculus/data'
import os from 'node:os'
import { exec } from 'node:child_process'

type GetPopulationParameters = { cache: boolean; saveToDisk: boolean; city: 'campinas' }

// todo: improve jsdoc usage
/**
 * @param cache {boolean} Defaults to false
 * @param saveToDisk {boolean} Defaults to false
 */
export async function getPopulation(
  params: GetPopulationParameters = { cache: false, saveToDisk: false, city: 'campinas' }
): Promise<Individual[]> {
  const { cache, saveToDisk, city } = params

  if (cache) {
    log('Trying to read existing population', {
      time: true,
      timeLabel: 'POPULATION'
    })

    const population = await readPopulationFromDisk(city)

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
    await savePopulationToDisk(population, city)
  }

  log('', { timeEnd: true, timeLabel: 'POPULATION' })

  return population
}

async function readPopulationFromDisk(city: 'campinas') {
  log('Deserializing population', {
    time: true,
    timeLabel: 'DESERIALIZATION'
  })

  const populationsDir = join(__dirname, '..', '..', 'data', 'simulation', 'populations')
  const populationDir = join(populationsDir, city)

  let population = []

  try {
    let files = await readdir(populationDir)

    const jsonFiles = files.filter((file) => extname(file) === '.json')

    if (jsonFiles.length === 0) {
      const decompressScript = `${populationsDir}/decompress.${
        os.platform() === 'win32' ? 'bat' : 'sh'
      }`
      const decompressCommand = `${decompressScript} ${city}`

      log('Decompressing population data', { time: true, timeLabel: 'DECOMPRESSION' })
      await new Promise((resolve, reject) => {
        exec(decompressCommand, (error, stdout, stderr) => {
          if (error) {
            log(`Error during decompression: ${error}`, { error })
            reject(error)
          } else {
            log('Population data decompressed successfully', {
              timeEnd: true,
              timeLabel: 'DECOMPRESSION'
            })
            resolve(stdout)
          }
        })
      })

      files = await readdir(populationDir)
    } else {
      log('Population data already decompressed, skipping')
    }

    let fileCount = 0
    let initialTime = new Date()

    for (const file of files) {
      if (extname(file) === '.json') {
        const filePath = join(populationDir, file)
        fileCount++
        const individuals = await readPopulationFragmentFromFile(filePath)
        population = population.concat(individuals)

        const currentTime = new Date().getTime()
        const timeElapsed = currentTime - initialTime.getTime()
        const totalRemainingTimeInSeconds = ((files.length - fileCount) * timeElapsed) / 1000
        const remainingMinutes = Math.floor(totalRemainingTimeInSeconds / 60)
        const remainingSeconds = Math.round(totalRemainingTimeInSeconds % 60)

        console.log(
          `[POPULATION]: ${individuals.length.toLocaleString()} individuals processed in ${(
            timeElapsed / 1000
          ).toFixed(2)}s, ` +
            `${(files.length - fileCount).toLocaleString()} fragments remaining ` +
            `(${Math.round(individuals.length / timeElapsed)}ms per individual, ` +
            `${remainingMinutes}min ${remainingSeconds}s estimated to completion)`
        )

        initialTime = new Date()
      }
    }
  } catch (error) {
    log('Error reading population from disk', { error })
    throw error
  }

  log('Deserialization complete', {
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

const FRAGMENT_FILE_SIZE = 496 * 1024 * 1024 // 496mb

async function savePopulationToDisk(population: Individual[], city: 'campinas') {
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

  const populationsDir = join(__dirname, '..', '..', 'data', 'simulation', 'populations')
  const cityPopulationDir = join(populationsDir, city)

  let initialTime = new Date()
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

    const filePath = join(cityPopulationDir, `fragment-${i}.json`)

    const jsonString = `[${fragmentIndividuals.join(',')}]`

    try {
      await writeFile(filePath, jsonString)

      const currentTime = new Date().getTime()
      const timeElapsed = currentTime - initialTime.getTime()
      const totalRemainingTimeInSeconds = ((fragments - i - 1) * timeElapsed) / 1000
      const remainingMinutes = Math.floor(totalRemainingTimeInSeconds / 60)
      const remainingSeconds = Math.round(totalRemainingTimeInSeconds % 60)

      console.log(
        `[SERIALIZATION]: Fragment ${i} saved in ${(timeElapsed / 1000).toFixed(2)}s, ` +
          `${fragments - i - 1} fragments remaining ` +
          `(${Math.round(fragmentIndividualCount / timeElapsed)}ms per individual, ` +
          `${remainingMinutes}min ${remainingSeconds}s estimated to completion)`
      )

      initialTime = new Date()

      log('', {
        timeEnd: true,
        timeLabel: 'FRAGMENT'
      })
    } catch (error) {
      log(`Error saving fragment ${i} to disk`, { error })
      throw error
    }
  }

  log('Compressing population', {
    time: true,
    timeLabel: 'COMPRESSION'
  })

  const compressScript = `${populationsDir}/compress.${os.platform() === 'win32' ? 'bat' : 'sh'}`
  const compressCommand = `${compressScript} ${city}`

  try {
    await new Promise((resolve, reject) => {
      exec(compressCommand, (error, stdout, stderr) => {
        if (error) {
          log(`Error during compression: ${error}`, { error })
          return
        }
        log('Population data compressed successfully', {
          timeEnd: true,
          timeLabel: 'COMPRESSION'
        })
      })
    })
  } catch (error) {
    log('Compression failed', { error })
    throw error
  }

  log('', {
    timeEnd: true,
    timeLabel: 'SERIALIZATION'
  })
}

function serializeIndividual(individual: Individual) {
  const serializedIndividual = Individual.serialize(individual)
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
    individual.mask = Mask.None
    individual.vaccine = {
      doses: 0,
      type: VaccineType.None
    }

    individual.occupationTypes = []
    individual.occupations = []

    individual.state = State.Susceptible
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
    middleSchoolerYoungerThanTen,
    middleSchoolerOlderThanTen,
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

  individuals = assignRoutine(individuals)

  individuals.sort((a, b) => a.id - b.id)

  return individuals
}
