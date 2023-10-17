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
  ages,
} from './data'
import {
  Parameter,
  assign,
  normalize,
  assignSex,
  normalizeAge,
  normalizeResidentsPerHouse,
  assignHouse,
  assignAge
} from './parameter'
import { Individual, Workstation } from './individual'

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

individuals = assignAge(individuals, normalizeAge(ages, totalPopulation, malePercentage))

individuals = assignHouse(
  individuals,
  normalizeResidentsPerHouse(residentsPerHouse, individuals.length),
  regionsPopulation,
)

// todo: properly set number of students, income among individuals
// considerations: individuals under 10 years do not work
// income depends on age
individuals = assign(individuals, 'income', normalize('salaries', salaries, totalPopulation))

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

// todo: define risk profile
