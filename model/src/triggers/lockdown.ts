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

export class Lockdown {
  private startDate: Date

  private lockdownSchoolPercentage: number
  private schoolRecuperationRate: number
  private schoolRecuperationDates: { [key: string]: number }[]

  private lockdownWorkPercentage: number
  private workRecuperationRate: number
  private workRecuperationDates: { [key: string]: number }[]

  constructor(
    public individuals: Individual[],
    startDate: string,
    lockdownSchoolPercentage: number,
    schoolRecuperationRate: number,
    schoolRecuperationDates: { [key: string]: number }[],
    lockdownWorkPercentage: number,
    workRecuperationRate: number,
    workRecuperationDates: { [key: string]: number }[]
  ) {
    this.lockdownSchoolPercentage = lockdownSchoolPercentage
    this.schoolRecuperationRate = schoolRecuperationRate
    this.schoolRecuperationDates = schoolRecuperationDates

    this.lockdownWorkPercentage = lockdownWorkPercentage
    this.workRecuperationRate = workRecuperationRate
    this.workRecuperationDates = workRecuperationDates
  }

  // public assign(currentDate: Date) {
  //   if (this.startDate === currentDate) this.startLockdown()

  //   const stringDate = `${currentDate.getDay}-${currentDate.getMonth}-${currentDate.getFullYear}`

  //   if (this.schoolRecuperationDates.some((obj) => obj)) schoolRecuperation(population)
  //   if (workRecuperationsDates.includes(date)) workRecuperation(population)

  //   if (INDIVIDUALS_WITHOUT_OCCUPATION_RECUPERATION_DATE === date)
  //     individualsWithoutOcuppationRecuperation(population)
  // }

  private startLockdown() {
    const shuffledPopulation = shuffle(this.individuals)

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
      Math.ceil(workers.length * this.lockdownWorkPercentage)
    )
    for (const individual of lockdownWorkers) {
      implementWorkFromHome(individual)
    }

    const lockdownStudents = students.slice(
      0,
      Math.ceil(students.length * this.lockdownSchoolPercentage)
    )
    for (const individual of lockdownStudents) {
      implementSchoolFromHome(individual)
    }

    //todo: decrease outside activities, like shopping and leisure
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
