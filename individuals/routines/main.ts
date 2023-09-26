import { nanoid } from 'nanoid'

import {
  ageEighteenToNineteen,
  ageFifteenToSeventeen,
  ageTwentyfiveOrMore,
  ageTwentyToTwentyFour,
  commerceAndServices,
  commerceAndServicesEmployees,
  industries,
  industriesEmployees,
  totalPopulation,
  regionsPopulation,
  malePercentage,
  Activity,
  residentsPerHouse,
  salaries,
  ages
} from './data'
import {
  Parameter,
  assign,
  normalize,
  assignSex,
  normalizeAge,
  normalizeResidentsPerHouse,
  assignHouse
} from './parameter'
import { Individual, Workstation } from './individual'
import { log } from './utilities'

let individuals: Individual[] = []

for (let i = 0; i < totalPopulation; i++) {
  const individual = new Individual()

  individual.id = nanoid()

  individual.currentActivity = {} as Activity

  // defaults true by default for now
  // if age is invalid or for some other reason, reassign it
  individual.isValid = true

  // false by default
  individual.isWearingMask = individual.isDead = individual.isHospitalized = false

  individuals.push(individual)
}

individuals = assignSex(individuals, malePercentage)

const normalizedResidentsPerHouse = normalizeResidentsPerHouse(residentsPerHouse, totalPopulation)
individuals = assignHouse(individuals, normalizedResidentsPerHouse, regionsPopulation)

const normalizedAges = normalizeAge(ages, totalPopulation)
// todo: properly set ages
const setAge = (sex: 'male' | 'female') => {
  const ageDistribution = Math.random()
  let selectedAgeRange: {
    interval: number[]
    female: number
    male: number
  } = {} as any

  if (sex === 'male') {
    const malePercentage =
      normalizedAges.reduce((total, age) => total + age.male, 0) / individuals.length
    const adjustedDistribution = ageDistribution * malePercentage

    let cumulativePercentage = 0
    for (const ageRange of normalizedAges) {
      cumulativePercentage += ageRange.male * malePercentage
      if (adjustedDistribution <= cumulativePercentage) {
        selectedAgeRange = ageRange
        break
      }
    }
  } else if (sex === 'female') {
    const femalePercentage =
      normalizedAges.reduce((total, age) => total + age.female, 0) / individuals.length
    const adjustedDistribution = ageDistribution * femalePercentage

    let cumulativePercentage = 0
    for (const ageRange of normalizedAges) {
      cumulativePercentage += ageRange.female * femalePercentage
      if (adjustedDistribution <= cumulativePercentage) {
        selectedAgeRange = ageRange
        break
      }
    }
  }

  return selectedAgeRange.interval
}

individuals = assign(individuals, 'income', salaries)

const agedFemales = ages.reduce((total, age) => total + age.female, 0)
const agedMales = ages.reduce((total, age) => total + age.male, 0)
log(`Aged females '${agedFemales}' - Aged males '${agedMales}'`)

const normalizedAgedFemales = normalizedAges.reduce((total, age) => total + age.female, 0)
const normalizedAgedMales = normalizedAges.reduce((total, age) => total + age.male, 0)
log(
  `Normalized aged females '${normalizedAgedFemales}' - Normalized aged males '${normalizedAgedMales}'`
)

log(
  `Total individuals '${individuals.length}' - Aged individuals ${
    agedFemales + agedMales
  } - Normalized aged individuals '${normalizedAgedFemales + normalizedAgedMales}'`
)

log('Setting individuals `age`', { time: true, timeLabel: 'SETTING' })
individuals.forEach((individual) => {
  individual.age = setAge(individual.sex)
})
log('', { timeEnd: true, timeLabel: 'SETTING' })
////////////////////////////////////////////////

// todo: review this number
const students =
  ageFifteenToSeventeen + ageEighteenToNineteen + ageTwentyToTwentyFour + ageTwentyfiveOrMore

const createWorkstations = (
  categories: Parameter[],
  employeesRanges: number[][]
): Workstation[] => {
  const workstations: Workstation[] = []

  categories.forEach((category, index) => {
    const [minEmployees, maxEmployees] = employeesRanges[index]
    for (let i = 0; i < category.value; i++) {
      const employeesCount =
        Math.floor(Math.random() * (maxEmployees - minEmployees + 1)) + minEmployees

      const workstation = {
        id: nanoid(),
        label: category.label as string,
        size: employeesCount
      }

      workstations.push(workstation)
    }
  })

  return workstations
}

const industryWorkstations = createWorkstations(industries, industriesEmployees)

const commerceAndServicesWorkstations = createWorkstations(
  commerceAndServices,
  commerceAndServicesEmployees
)

// todo: improve calculation (currently returns 1502524)
const allWorkstations = [...industryWorkstations, ...commerceAndServicesWorkstations]

// log(allWorkstations.sort((a, b) => (a.size > b.size ? -1 : 1))[0])

// todo: define risk profile
