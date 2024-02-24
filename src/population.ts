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
import { join } from 'node:path'
import { log } from './utilities'
import { createRoutines } from './routines'

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

  // warn: defaults to false for now as decompressing the compressed serialized
  // data is being a pain in the ass. using plain decompressed json files
  // is fine for now.
  const compress = false

  if (cache) {
    const population = await readPopulationFromDisk(compress!)

    if (population.length > 0) {
      return population
    }
  }

  log('Instantiating new population', { time: true, timeLabel: 'POPULATION' })

  const population = instantiatePopulation()

  if (saveToDisk) {
    savePopulationToDisk(population, compress!)
  }

  log('', { timeEnd: true, timeLabel: 'POPULATION' })

  return population
}

async function readPopulationFromDisk(isCompressed: boolean) {
  log('Deserializing population')
  const populationDir = join(__dirname, '..', 'data', 'simulation', 'population')

  const population: Individual[] = []
  const glob = new Bun.Glob('*')
  for (const file of glob.scanSync(populationDir)) {
    if (file.endsWith('.json' + (isCompressed ? '.gz' : ''))) {
      const individuals = await readPopulationFragmentFromFile(
        join(populationDir, file),
        isCompressed
      )

      individuals.forEach((individual) => {
        population.push(individual)
      })
    }
  }

  population.sort((a, b) => a.id - b.id)

  return population
}

async function readPopulationFragmentFromFile(filePath: string, isCompressed: boolean) {
  const fragmentNumber = filePath.split('-')[1].split('.')[0]

  log(`Loading population fragment from file ${fragmentNumber}`, { time: true, timeLabel: 'POPULATION' })

  const populationFile = Bun.file(filePath)
  const serializedPopulation = await populationFile.text()
  const population = deserializePopulationFragment(serializedPopulation, isCompressed)

  log('', { timeEnd: true, timeLabel: 'POPULATION' })

  return population
}

const FRAGMENT_FILE_SIZE = 42 * 1024 * 1024 // 42mb

function savePopulationToDisk(population: Individual[], isCompressed: boolean) {
  log('Serializing population')

  let populationTotalSize = 0
  if (isCompressed) {
    const serializedPopulation = population.map((individual) => {
      return individual.serialize!()
    })

    const jsonString = JSON.stringify(serializedPopulation)
    const buffer = Buffer.from(jsonString)
    const compressedPopulation = Bun.gzipSync(buffer)
    populationTotalSize = Buffer.byteLength(compressedPopulation)
  } else {
    populationTotalSize = population.reduce((acc, individual) => {
      const size = Buffer.byteLength(serializeIndividual(individual))

      return acc + size
    }, 0)
  }

  const fragments = Math.ceil(populationTotalSize / FRAGMENT_FILE_SIZE)
  const fragmentIndividualCount = Math.ceil(population.length / fragments)

  const populationDir = join(__dirname, '..', 'data', 'simulation', 'population')

  for (let i = 0; i < fragments; i++) {
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

    const filePath = join(populationDir, `fragment-${i}.json${isCompressed ? '.gz' : ''}`)

    const jsonString = `[${fragmentIndividuals.join(",")}]`

    if (isCompressed) {
      const buffer = Buffer.from(jsonString)
      const compressedPopulation = Bun.gzipSync(buffer)
      Bun.write(filePath, compressedPopulation)
    } else {
      Bun.write(filePath, jsonString)
    }
  }
}

function serializeIndividual(individual: Individual) {
  const serializedIndividual = individual.serialize!()
  const jsonString = JSON.stringify(serializedIndividual)
  const buffer = Buffer.from(jsonString)
  return buffer
}

function deserializePopulationFragment(
  serialized: string | Uint8Array,
  isCompressed: boolean
): Individual[] {
  let decompressedData: Uint8Array;

  if (isCompressed) {
    try {
      // Assume serialized is always a Uint8Array for compressed data.
      decompressedData = Bun.gunzipSync(serialized instanceof Uint8Array ? serialized : new Uint8Array(Buffer.from(serialized)));
    } catch (error) {
      log('Error during decompression', { error });
      throw error;
    }
  } else {
    // If not compressed, convert to Uint8Array if necessary.
    decompressedData = serialized instanceof Uint8Array ? serialized : new Uint8Array(Buffer.from(serialized.toString()));
  }

  // Convert Uint8Array to string for JSON parsing.
  // Assuming UTF-8 encoding for the decompressed data.
  const serializedIndividualsString = new TextDecoder().decode(decompressedData);
  const serializedIndividuals = JSON.parse(serializedIndividualsString) as string[];
  const individuals = serializedIndividuals.map((serializedIndividual) =>
    Individual.deserialize(serializedIndividual)
  );

  return individuals;
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

  individuals.sort((a, b) => a.id - b.id)

  return individuals
}
