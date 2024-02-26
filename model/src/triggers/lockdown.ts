import {
  Activity,
  collegeStudy,
  collegeStudyFromHome,
  highSchoolStudy,
  highSchoolStudyFromHome,
  largeCommerceAndServicesWorkFromHome,
  largeCommerceAndServicesWorkInPerson,
  largeIndustryWorkFromHome,
  largeIndustryWorkInPerson,
  mediumCommerceAndServicesWorkFromHome,
  mediumCommerceAndServicesWorkInPerson,
  mediumIndustryWorkFromHome,
  mediumIndustryWorkInPerson,
  microCommerceAndServicesWorkFromHome,
  microCommerceAndServicesWorkInPerson,
  microIndustryWorkFromHome,
  microIndustryWorkInPerson,
  middleSchoolStudy,
  middleSchoolStudyFromHome,
  preschoolStudy,
  preschoolStudyFromHome,
  smallCommerceAndServicesWorkFromHome,
  smallCommerceAndServicesWorkInPerson,
  smallIndustryWorkFromHome,
  smallIndustryWorkInPerson
} from '../activities'
import { Individual } from '../individual'
import { chunkIntoNParts, shuffle } from '../utilities'

export class Lockdown {
  private startDate: Date

  private lockdownSchoolPercentage: number
  private schoolRecuperationDates: { date: string; quantity?: number }[]

  private lockdownWorkPercentage: number
  private workRecuperationDates: { date: string; quantity?: number }[]

  constructor(
    public individuals: Individual[],
    startDate: Date,
    lockdownSchoolPercentage: number,
    schoolRecuperationDates: string[],
    lockdownWorkPercentage: number,
    workRecuperationDates: string[]
  ) {
    this.startDate = startDate

    this.lockdownSchoolPercentage = lockdownSchoolPercentage
    for (const recuperationDate of schoolRecuperationDates)
      this.schoolRecuperationDates.push({ date: recuperationDate })

    this.lockdownWorkPercentage = lockdownWorkPercentage
    for (const recuperationDate of workRecuperationDates)
      this.workRecuperationDates.push({ date: recuperationDate })
  }

  public assign(currentDate: Date) {
    if (this.startDate === currentDate) this.startLockdown()

    const stringDate = `${currentDate.getDay}-${currentDate.getMonth}-${currentDate.getFullYear}`

    if (this.startDate === currentDate) this.startLockdown()

    if (
      this.schoolRecuperationDates.some((recuperationDate) => recuperationDate.date === stringDate)
    )
      this.schoolRecuperation(
        this.schoolRecuperationDates.find((date) => date.date === stringDate).quantity
      )

    if (this.workRecuperationDates.some((recuperationDate) => recuperationDate.date === stringDate))
      this.workRecuperation(
        this.workRecuperationDates.find((date) => date.date === stringDate).quantity
      )
  }

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
      this.implementWorkFromHome(individual)
    }

    const lockdownStudents = students.slice(
      0,
      Math.ceil(students.length * this.lockdownSchoolPercentage)
    )
    for (const individual of lockdownStudents) {
      this.implementSchoolFromHome(individual)
    }

    // assign the quantity of individuals that return to normal live in each recuperation date
    const schoolRecuperationIndividualsPerDate = chunkIntoNParts(
      lockdownWorkers,
      this.workRecuperationDates.length
    )
    this.schoolRecuperationDates.map(
      (recuperationDate, i) =>
        (recuperationDate.quantity = schoolRecuperationIndividualsPerDate[i].length)
    )

    const workRecuperationIndividualsPerDate = chunkIntoNParts(
      lockdownWorkers,
      this.workRecuperationDates.length
    )
    this.workRecuperationDates.map(
      (recuperationDate, i) =>
        (recuperationDate.quantity = workRecuperationIndividualsPerDate[i].length)
    )

    //todo: decrease outside activities, like shopping and leisure
  }

  private implementSchoolFromHome(individual: Individual) {
    const labelToStudyRoutineMap = new Map<string, Activity>([
      ['study.preschool', preschoolStudyFromHome],
      ['study.middle_school', middleSchoolStudyFromHome],
      ['study.high_school', highSchoolStudyFromHome],
      ['study.college', collegeStudyFromHome]
    ])

    individual.routine.forEach((dayRoutine) => {
      dayRoutine.forEach((activity) => {
        if (activity.category === 'study') {
          const replacement = labelToStudyRoutineMap.get(activity.label)
          if (replacement) {
            activity = replacement
          }
        }
      })
    })
  }

  private implementWorkFromHome(individual: Individual) {
    const labelToWorkRoutineMap = new Map<string, Activity>([
      ['work.industry.micro', microIndustryWorkFromHome],
      ['work.industry.small', smallIndustryWorkFromHome],
      ['work.industry.medium', mediumIndustryWorkFromHome],
      ['work.industry.large', largeIndustryWorkFromHome],
      ['work.commerce_services.micro', microCommerceAndServicesWorkFromHome],
      ['work.commerce_services.small', smallCommerceAndServicesWorkFromHome],
      ['work.commerce_services.medium', mediumCommerceAndServicesWorkFromHome],
      ['work.commerce_services.large', largeCommerceAndServicesWorkFromHome]
    ])

    individual.routine.forEach((dayRoutine) => {
      dayRoutine.forEach((activity) => {
        if (activity.category === 'work') {
          const replacement = labelToWorkRoutineMap.get(activity.label)
          if (replacement) {
            activity = replacement
          }
        }
      })
    })
  }

  private schoolRecuperation(recuperationNumber: number) {
    const students = this.individuals.filter()

    const shuffledStudents = shuffle(students)

    const labelToStudyRoutineMap = new Map<string, Activity>([
      ['study.preschool.from_home', preschoolStudy],
      ['study.middle_school.from_home', middleSchoolStudy],
      ['study.high_school.from_homw', highSchoolStudy],
      ['study.college.from_home', collegeStudy]
    ])

    shuffledStudents.slice(0, recuperationNumber).forEach((individual) => {
      individual.routine.forEach((dayRoutine) => {
        dayRoutine.forEach((activity) => {
          if (activity.category === 'study') {
            const replacement = labelToStudyRoutineMap.get(activity.label)
            if (replacement) {
              activity = replacement
            }
          }
        })
      })
    })
  }

  private workRecuperation(recuperationNumber: number) {
    const workers = this.individuals.filter()

    const shuffledWorkers = shuffle(workers)

    const labelToWorkRoutineMap = new Map<string, Activity>([
      ['work.industry.micro.from_home', microIndustryWorkInPerson],
      ['work.industry.small.from_home', smallIndustryWorkInPerson],
      ['work.industry.medium.from_home', mediumIndustryWorkInPerson],
      ['work.industry.large.from_home', largeIndustryWorkInPerson],
      ['work.commerce_services.micro.from_home', microCommerceAndServicesWorkInPerson],
      ['work.commerce_services.small.from_home', smallCommerceAndServicesWorkInPerson],
      ['work.commerce_services.medium.from_home', mediumCommerceAndServicesWorkInPerson],
      ['work.commerce_services.large.from_home', largeCommerceAndServicesWorkInPerson]
    ])

    shuffledWorkers.slice(0, recuperationNumber).forEach((individual) => {
      individual.routine.forEach((dayRoutine) => {
        dayRoutine.forEach((activity) => {
          if (activity.category === 'work') {
            const replacement = labelToWorkRoutineMap.get(activity.label)
            if (replacement) {
              activity = replacement
            }
          }
        })
      })
    })
  }
}
