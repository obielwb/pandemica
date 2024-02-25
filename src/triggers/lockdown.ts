import {
  collegeStudyFromHome,
  highSchoolStudyFromHome,
  middleSchoolStudyFromHome,
  preschoolStudyFromHome
} from '../activities'
import { Individual } from '../individual'

const LOCKDOWN_INIT_DATE = ''

const LOCKDOWN_SCHOOL_INIT_PERCENTAGE = 100
const LOCKDOWN_START_SCHOOLS_RECUPERATION_DATE = ''
const LOCKDOWN_SCHOOL_RECUPERATION_RATE_PER_MONTH = 20

const LOCKDOWN_WORK_INIT_PERCENTAGE = 50
const LOCKDOWN_START_WORK_RECUPERATION_DATE = ''
const LOCKDOWN_WORK_RECUPERATION_RATE_PER_MONTH = 10

export function assignLockdown(date: string, population: Individual[]) {
  if (LOCKDOWN_INIT_DATE === date) startLockdown(population)
  if (LOCKDOWN_START_SCHOOLS_RECUPERATION_DATE === date) startSchoolRecuperation(population)
  if (LOCKDOWN_START_WORK_RECUPERATION_DATE === date) startWorkRecuperation(population)
}

function startLockdown(population: Individual[]) {
  for (const individual of population) {
    if (individual.occupationTypes.includes('study')) {
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

    if (individual.occupationTypes.includes('work')) {
    }
  }
}

function startSchoolRecuperation(population: Individual[]) {}

function startWorkRecuperation(population: Individual[]) {}
