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
  residentsPerHouse,
  salaries,
  ages
} from '../data/census'
import {
  Parameter,
  assign,
  normalize,
  assignSex,
  normalizeAge,
  normalizeResidentsPerHouse,
  assignHouse,
  assignAge,
  assignIncome
} from './parameter'
import { activitiesList } from './activities'
import { Individual, type Occupation } from './individual'

export function createPopulation() {
  let individuals: Individual[] = []

  for (let i = 0; i < totalPopulation; i++) {
    const individual = new Individual()

    individual.id = nanoid()

    // random assignment for now
    individual.currentActivity = {
      id: nanoid(),
      ...activitiesList[i % activitiesList.length],
      individualsEngaged: []
    }

    // defaults true by default for now
    // if age is invalid or for some other reason, reassign it
    individual.isValid = true

    individual.mask = 'none'

    // false by default
    individual.isDead = individual.isHospitalized = false

    individuals.push(individual)
  }

  individuals = assignSex(individuals, malePercentage)

  individuals = assignAge(individuals, normalizeAge(ages, totalPopulation, malePercentage))

  individuals = assignHouse(
    individuals,
    normalizeResidentsPerHouse(residentsPerHouse, individuals.length),
    regionsPopulation
  )

  individuals = assignIncome(individuals, salaries)

  // todo: review this number
  const students =
    ageFifteenToSeventeen + ageEighteenToNineteen + ageTwentyToTwentyFour + ageTwentyfiveOrMore

  const createWorkstations = (
    categories: Parameter[],
    employeesRanges: number[][]
  ): Occupation[] => {
    const workstations: Occupation[] = []

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

  return individuals
}
