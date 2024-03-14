import {
  Activity,
  Category,
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
    workRecuperationDates: string[],
    private interruptedActivities: Category[]
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
      individual.occupationTypes.includes('w')
    )
    const students = fasterFilter(shuffledPopulation, (individual) =>
      individual.occupationTypes.includes('s')
    )
    const withouthOccupationIndividuals = fasterFilter(
      shuffledPopulation,
      (individual) =>
        individual.occupationTypes.includes('s') === false &&
        individual.occupationTypes.includes('w') === false
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

    this.implementReductionInCommonActivities()
  }

  private implementSchoolFromHome(individual: Individual) {
    const labelToStudyRoutineMap = new Map<string, Activity>([
      ['s.ps', preschoolStudyFromHome],
      ['s.ms', middleSchoolStudyFromHome],
      ['s.hs', highSchoolStudyFromHome],
      ['s.c', collegeStudyFromHome]
    ])

    individual.routine.forEach((dayRoutine) => {
      dayRoutine.forEach((activity) => {
        if (activity.category === 's') {
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
      ['w.i.xs', microIndustryWorkFromHome],
      ['w.i.s', smallIndustryWorkFromHome],
      ['w.i.m', mediumIndustryWorkFromHome],
      ['w.i.l', largeIndustryWorkFromHome],
      ['w.cs.xs', microCommerceAndServicesWorkFromHome],
      ['w.cs.s', smallCommerceAndServicesWorkFromHome],
      ['w.cs.m', mediumCommerceAndServicesWorkFromHome],
      ['w.cs.l', largeCommerceAndServicesWorkFromHome]
    ])

    individual.routine.forEach((dayRoutine) => {
      dayRoutine.forEach((activity) => {
        if (activity.category === 'w') {
          const replacement = labelToWorkRoutineMap.get(activity.label)
          if (replacement) {
            activity = replacement
          }
        }
      })
    })
  }

  private implementReductionInCommonActivities(affectedPopulationPercentage: number = 1) {
    for (let i = 0; i < Math.ceil(this.individuals.length * affectedPopulationPercentage); i++) {
      const individual = this.individuals[i]

      individual.routine.forEach((day) => {
        let addedTimeAtHome = 0
        day = fasterFilter(day, (activity) => {
          if (this.interruptedActivities.includes(activity.category)) {
            addedTimeAtHome += activity.duration
            return false
          }
        })

        day.find((activity) => activity.category === 'home').duration += addedTimeAtHome
      })
    }
  }

  private schoolRecuperation(recuperationNumber: number) {
    const students = fasterFilter(
      this.individuals,
      (individual) => individual.isInLockdown && individual.occupationTypes.includes('s')
    )

    const shuffledStudents = fisherYatesShuffle(students)

    const labelToStudyRoutineMap = new Map<string, Activity>([
      ['s.ps.fh', preschoolStudy],
      ['s.ms.fh', middleSchoolStudy],
      ['s.hs.from_homw', highSchoolStudy],
      ['s.c.fh', collegeStudy]
    ])

    shuffledStudents.slice(0, recuperationNumber).forEach((individual) => {
      individual.routine.forEach((dayRoutine) => {
        dayRoutine.forEach((activity) => {
          if (activity.category === 's') {
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
      (individual) => individual.isInLockdown && individual.occupationTypes.includes('w')
    )

    const shuffledWorkers = fisherYatesShuffle(workers)

    const labelToWorkRoutineMap = new Map<string, Activity>([
      ['w.i.xs.fh', microIndustryWorkInPerson],
      ['w.i.s.fh', smallIndustryWorkInPerson],
      ['w.i.m.fh', mediumIndustryWorkInPerson],
      ['w.i.l.fh', largeIndustryWorkInPerson],
      ['w.cs.xs.fh', microCommerceAndServicesWorkInPerson],
      ['w.cs.s.fh', smallCommerceAndServicesWorkInPerson],
      ['w.cs.m.fh', mediumCommerceAndServicesWorkInPerson],
      ['w.cs.l.fh', largeCommerceAndServicesWorkInPerson]
    ])

    shuffledWorkers.slice(0, recuperationNumber).forEach((individual) => {
      individual.routine.forEach((dayRoutine) => {
        dayRoutine.forEach((activity) => {
          if (activity.category === 'w') {
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
