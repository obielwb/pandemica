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
  populationRegions,
  malePercentage,
  Activity,
  residentsPerHouse,
  Parameter,
  salaries,
  ages,
  totalEmployees
} from './data'
import { Individual } from './individual'
import { nanoid } from 'nanoid'
import { Workstation } from './occupation'

const individuals: Individual[] = []

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

const assignParameter = (label: string, parameter: Parameter[]) => {
  let index = 0
  parameter.forEach((entry) => {
    for (let i = 0; i < entry.value; i++) individuals[index++][label] = entry.label
  })
}

const assignSex = () => {
  for (let i = 0; i < Math.round((malePercentage / 100) * individuals.length); i++)
    individuals[i].sex = 'male'
  for (
    let i = Math.round((malePercentage / 100) * individuals.length - 1);
    i < individuals.length;
    i++
  )
    individuals[i].sex = 'female'
}

// const assignParameter = (label: string, parameter: Parameter[]) => {
//   const totalParameterCount = parameter.reduce((total, entry) => total + entry.count, 0)

//   const totalIndividuals = individuals.length

//   const percentages = parameter.map((entry) => entry.count / totalParameterCount)

//   if (totalParameterCount < totalIndividuals) {
//     console.log(totalIndividuals - totalParameterCount)
// todo: add calc to normalize via percentage
//   }

// let index = 0
// percentages.forEach((percentage, i) => {
//   const labelCount = Math.round((percentage / 100) * totalIndividuals)

//   for (let j = 0; j < labelCount; j++) {
//     if (index >= totalIndividuals) {
//       // Handle the case where there are more labels than individuals
//       break
//     }
//     individuals[index++][label] = parameter[i].label
//   }
// })
// }

assignSex()

assignParameter('region', populationRegions)
// todo: number of residentsPerHouse is not normalized.
// strategies: use percentage calculation on assign parameter to round up data?
// write about this on the diary
assignParameter('housemates', residentsPerHouse)
assignParameter('income', salaries)

// todo: properly assign age
const determineAge = (sex: 'male' | 'female') => {
  const ageDistribution = Math.random()
  let selectedAgeRange: {
    interval: number[]
    female: number
    male: number
  } = {} as any

  if (sex === 'male') {
    const malePercentage = ages.reduce((total, age) => total + age.male, 0) / individuals.length
    const adjustedDistribution = ageDistribution * malePercentage

    let cumulativePercentage = 0
    for (const ageRange of ages) {
      cumulativePercentage += ageRange.male * malePercentage
      if (adjustedDistribution <= cumulativePercentage) {
        selectedAgeRange = ageRange
        break
      }
    }
  } else if (sex === 'female') {
    const femalePercentage = ages.reduce((total, age) => total + age.female, 0) / individuals.length
    const adjustedDistribution = ageDistribution * femalePercentage

    let cumulativePercentage = 0
    for (const ageRange of ages) {
      cumulativePercentage += ageRange.female * femalePercentage
      if (adjustedDistribution <= cumulativePercentage) {
        selectedAgeRange = ageRange
        break
      }
    }
  }

  return selectedAgeRange.interval
}

individuals.forEach((individual) => {
  individual.age = determineAge(individual.sex)
})

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

console.log(allWorkstations.sort((a, b) => (a.size > b.size ? -1 : 1))[0])

// console.log(individuals[individuals.length - 1])

// todo: define risk profile
