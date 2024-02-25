import {
  collegeStudyFromHome,
  highSchoolStudyFromHome,
  largeCommerceAndServicesWorkFromHome,
  largeIndustryWorkFromHome,
  mediumCommerceAndServicesWorkFromHome,
  mediumIndustryWorkFromHome,
  microCommerceAndServicesWorkFromHome,
  microIndustryWorkFromHome,
  middleSchoolStudyFromHome,
  preschoolStudyFromHome,
  smallCommerceAndServicesWorkFromHome,
  smallIndustryWorkFromHome
} from '../activities'
import { Individual } from '../individual'
import { shuffle } from '../utilities'

const LOCKDOWN_INIT_DATE = '01-03-2020'
const INDIVIDUALS_WITHOUT_OCCUPATION_RECUPERATION_DATE = ''

const LOCKDOWN_SCHOOL_INIT_PERCENTAGE = 1.0 // x% of all individuals who will be selected to study at home
const LOCKDOWN_SCHOOL_RECUPERATION_RATE = 0.2 // x% of 100% studying from home individuals
const schoolRecuperationsDates = [
  '01-03-2021',
  '01-04-2021',
  '01-05-2021',
  '01-06-2021',
  '01-07-2021'
]

const LOCKDOWN_WORK_INIT_PERCENTAGE = 0.5 // x% of all individuals who will be selected to work at home
const LOCKDOWN_WORK_RECUPERATION_RATE = 0.2 // x% of 100% working from home individuals
const workRecuperationsDates = [
  '01-03-2021',
  '01-04-2021',
  '01-05-2021',
  '01-06-2021',
  '01-07-2021'
]

export function assignLockdown(day: string, month: number, year: number, population: Individual[]) {
  const date = `${day}-${month}-${year}`

  if (LOCKDOWN_INIT_DATE === date) start(population)

  if (schoolRecuperationsDates.includes(date)) schoolRecuperation(population)
  if (workRecuperationsDates.includes(date)) workRecuperation(population)

  if (INDIVIDUALS_WITHOUT_OCCUPATION_RECUPERATION_DATE === date)
    individualsWithoutOcuppationRecuperation(population)
}

function start(population: Individual[]) {
  const shuffledPopulation = shuffle(population)

  const workers = shuffledPopulation.filter((individual) =>
    individual.occupationTypes.includes('work')
  )
  const students = shuffledPopulation.filter((individual) =>
    individual.occupationTypes.includes('study')
  )
  const withouthOccupationIndividuals = shuffledPopulation.filter(
    (individual) =>
      individual.occupationTypes.includes('study') === false &&
      individual.occupationTypes.includes('work') === false
  )

  const lockdownWorkers = workers.slice(
    0,
    Math.ceil(workers.length * LOCKDOWN_WORK_INIT_PERCENTAGE)
  )
  for (const individual of lockdownWorkers) {
    implementWorkFromHome(individual)
  }

  const lockdownStudents = students.slice(
    0,
    Math.ceil(students.length * LOCKDOWN_SCHOOL_INIT_PERCENTAGE)
  )
  for (const individual of lockdownStudents) {
    implementSchoolFromHome(individual)
  }

  //todo: decrease outside activities, like shopping and leisure
}

function implementSchoolFromHome(individual: Individual) {
  for (let i = 0; i < individual.routine.length; i++) {
    for (let j = 0; j < individual.routine[i].length; j++) {
      if (individual.routine[i][j].category === 'study') {
        switch (individual.routine[i][j].label) {
          case 'study.preschool':
            individual.routine[i][j] = preschoolStudyFromHome
            break
          case 'study.middle_school':
            individual.routine[i][j] = middleSchoolStudyFromHome
            break
          case 'study.high_school':
            individual.routine[i][j] = highSchoolStudyFromHome
            break
          case 'study.college':
            individual.routine[i][j] = collegeStudyFromHome
            break
        }
      }
    }
  }
}

function implementWorkFromHome(individual: Individual) {
  for (let i = 0; i < individual.routine.length; i++) {
    for (let j = 0; j < individual.routine[i].length; j++) {
      if (individual.routine[i][j].category === 'work') {
        switch (individual.routine[i][j].label) {
          case 'work.industry.micro':
            individual.routine[i][j] = microIndustryWorkFromHome
            break
          case 'work.industry.small':
            individual.routine[i][j] = smallIndustryWorkFromHome
            break
          case 'work.industry.medium':
            individual.routine[i][j] = mediumIndustryWorkFromHome
            break
          case 'work.industry.large':
            individual.routine[i][j] = largeIndustryWorkFromHome
            break
          case 'work.commerce_services.micro':
            individual.routine[i][j] = microCommerceAndServicesWorkFromHome
            break
          case 'work.commerce_services.small':
            individual.routine[i][j] = smallCommerceAndServicesWorkFromHome
            break
          case 'work.commerce_services.medium':
            individual.routine[i][j] = mediumCommerceAndServicesWorkFromHome
            break
          case 'work.commerce_services.large':
            individual.routine[i][j] = largeCommerceAndServicesWorkFromHome
            break
        }
      }
    }
  }
}

function schoolRecuperation(population: Individual[]) {}

function workRecuperation(population: Individual[]) {}

function individualsWithoutOcuppationRecuperation(population: Individual[]) {}
