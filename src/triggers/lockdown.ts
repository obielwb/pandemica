import {
  collegeStudyFromHome,
  highSchoolStudyFromHome,
  middleSchoolStudyFromHome,
  preschoolStudyFromHome
} from '../activities'
import { Individual } from '../individual'

const LOCKDOWN_INIT_DATE = '01-03-2020'

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
}

function start(population: Individual[]) {
  for (const individual of population) {
    if (individual.occupationTypes.includes('study')) implementSchoolFromHome(individual)

    if (individual.occupationTypes.includes('work')) implementWorkFromHome(individual)
  }
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

function implementWorkFromHome(individual: Individual) {}

function schoolRecuperation(population: Individual[]) {}

function workRecuperation(population: Individual[]) {}
