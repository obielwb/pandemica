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
} from '../../population/activities'
import { Individual } from '../../population/individual'
import { chunkIntoNParts, fasterFilter, fisherYatesShuffle } from '../../utilities'

export class LockdownTrigger {
  private startDate: string

  private schoolRecuperationDates: { date: string; quantity?: number }[] = []

  private workRecuperationDates: { date: string; quantity?: number }[] = []

  constructor(
    public individuals: Individual[],
    startDate: string,
    private lockdownSchoolPercentage: number,
    schoolRecuperationDates: string[],
    private lockdownWorkPercentage: number,
    workRecuperationDates: string[]
  ) {
    this.startDate = startDate

    for (const recuperationDate of schoolRecuperationDates)
      this.schoolRecuperationDates.push({ date: recuperationDate })

    for (const recuperationDate of workRecuperationDates)
      this.workRecuperationDates.push({ date: recuperationDate })
  }

  public assign(currentDate: string) {
    if (this.startDate === currentDate) this.startLockdown()

    if (this.startDate === currentDate) this.startLockdown()

    if (
      this.schoolRecuperationDates.some((recuperationDate) => recuperationDate.date === currentDate)
    )
      this.schoolRecuperation(
        this.schoolRecuperationDates.find((date) => date.date === currentDate).quantity
      )

    if (
      this.workRecuperationDates.some((recuperationDate) => recuperationDate.date === currentDate)
    )
      this.workRecuperation(
        this.workRecuperationDates.find((date) => date.date === currentDate).quantity
      )
  }

  private startLockdown() {
    const shuffledPopulation = fisherYatesShuffle(this.individuals)

    const workers = fasterFilter(shuffledPopulation, (individual) =>
      individual.occupationTypes.includes('work')
    )
    const students = fasterFilter(shuffledPopulation, (individual) =>
      individual.occupationTypes.includes('study')
    )
    const withouthOccupationIndividuals = fasterFilter(
      shuffledPopulation,
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
      ['work.i.xs', microIndustryWorkFromHome],
      ['work.i.s', smallIndustryWorkFromHome],
      ['work.i.m', mediumIndustryWorkFromHome],
      ['work.i.l', largeIndustryWorkFromHome],
      ['work.cs.xs', microCommerceAndServicesWorkFromHome],
      ['work.cs.s', smallCommerceAndServicesWorkFromHome],
      ['work.cs.m', mediumCommerceAndServicesWorkFromHome],
      ['work.cs.l', largeCommerceAndServicesWorkFromHome]
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
    const students = fasterFilter(
      this.individuals,
      (individual) => individual.isInLockdown && individual.occupationTypes.includes('study')
    )

    const shuffledStudents = fisherYatesShuffle(students)

    const labelToStudyRoutineMap = new Map<string, Activity>([
      ['study.preschool.fh', preschoolStudy],
      ['study.middle_school.fh', middleSchoolStudy],
      ['study.high_school.from_homw', highSchoolStudy],
      ['study.college.fh', collegeStudy]
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
    const workers = fasterFilter(
      this.individuals,
      (individual) => individual.isInLockdown && individual.occupationTypes.includes('work')
    )

    const shuffledWorkers = fisherYatesShuffle(workers)

    const labelToWorkRoutineMap = new Map<string, Activity>([
      ['work.i.xs.fh', microIndustryWorkInPerson],
      ['work.i.s.fh', smallIndustryWorkInPerson],
      ['work.i.m.fh', mediumIndustryWorkInPerson],
      ['work.i.l.fh', largeIndustryWorkInPerson],
      ['work.cs.xs.fh', microCommerceAndServicesWorkInPerson],
      ['work.cs.s.fh', smallCommerceAndServicesWorkInPerson],
      ['work.cs.m.fh', mediumCommerceAndServicesWorkInPerson],
      ['work.cs.l.fh', largeCommerceAndServicesWorkInPerson]
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
