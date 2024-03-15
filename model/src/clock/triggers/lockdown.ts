import {
  Activity,
  Category,
  Label,
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
import { Individual, OccupationType } from '../../population/individual'
import { chunkIntoNParts, fasterFilter, fisherYatesShuffle } from '../../utilities'

export class LockdownTrigger {
  private startDate: string

  private schoolRecuperationDates: { date: string; quantity?: number }[] = []

  private workRecuperationDates: { date: string; quantity?: number }[] = []

  constructor(
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

  public assign(currentDate: string, population: Individual[]) {
    if (this.startDate === currentDate) this.startLockdown(population)

    if (
      this.schoolRecuperationDates.some((recuperationDate) => recuperationDate.date === currentDate)
    )
      this.schoolRecuperation(
        this.schoolRecuperationDates.find((date) => date.date === currentDate).quantity,
        population
      )

    if (
      this.workRecuperationDates.some((recuperationDate) => recuperationDate.date === currentDate)
    )
      this.workRecuperation(
        this.workRecuperationDates.find((date) => date.date === currentDate).quantity,
        population
      )
  }

  private startLockdown(population: Individual[]) {
    const shuffledPopulation = fisherYatesShuffle(population)

    const workers = fasterFilter(shuffledPopulation, (individual) =>
      individual.occupationTypes.includes(OccupationType.Work)
    )
    const students = fasterFilter(shuffledPopulation, (individual) =>
      individual.occupationTypes.includes(OccupationType.Study)
    )
    const withouthOccupationpopulation = fasterFilter(
      shuffledPopulation,
      (individual) =>
        individual.occupationTypes.includes(OccupationType.Study) === false &&
        individual.occupationTypes.includes(OccupationType.Work) === false
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

    // assign the quantity of population that return to normal live in each recuperation date
    const schoolRecuperationpopulationPerDate = chunkIntoNParts(
      lockdownWorkers,
      this.workRecuperationDates.length
    )
    this.schoolRecuperationDates.map(
      (recuperationDate, i) =>
        (recuperationDate.quantity = schoolRecuperationpopulationPerDate[i].length)
    )

    const workRecuperationpopulationPerDate = chunkIntoNParts(
      lockdownWorkers,
      this.workRecuperationDates.length
    )
    this.workRecuperationDates.map(
      (recuperationDate, i) =>
        (recuperationDate.quantity = workRecuperationpopulationPerDate[i].length)
    )

    this.implementReductionInCommonActivities(1, population)
  }

  private implementSchoolFromHome(individual: Individual) {
    const labelToStudyRoutineMap = new Map<Label, Activity>([
      [Label.PreschoolInPerson, { ...preschoolStudyFromHome }],
      [Label.MiddleSchoolInPerson, { ...middleSchoolStudyFromHome }],
      [Label.HighSchoolInPerson, { ...highSchoolStudyFromHome }],
      [Label.CollegeInPerson, { ...collegeStudyFromHome }]
    ])

    individual.routine.forEach((dayRoutine) => {
      dayRoutine.forEach((activity) => {
        if (activity.category === Category.Study) {
          const replacement = labelToStudyRoutineMap.get(activity.label)
          if (replacement) {
            activity = replacement
          }
        }
      })
    })
  }

  private implementWorkFromHome(individual: Individual) {
    const labelToWorkRoutineMap = new Map<Label, Activity>([
      [Label.MicroIndustryInPerson, microIndustryWorkFromHome],
      [Label.SmallIndustryInPerson, smallIndustryWorkFromHome],
      [Label.MediumIndustryInPerson, mediumIndustryWorkFromHome],
      [Label.LargeIndustryInPerson, largeIndustryWorkFromHome],
      [Label.MicroCommerceInPerson, microCommerceAndServicesWorkFromHome],
      [Label.SmallCommerceInPerson, smallCommerceAndServicesWorkFromHome],
      [Label.MediumCommerceInPerson, mediumCommerceAndServicesWorkFromHome],
      [Label.LargeCommerceInPerson, largeCommerceAndServicesWorkFromHome]
    ])

    individual.routine.forEach((dayRoutine) => {
      dayRoutine.forEach((activity) => {
        if (activity.category === Category.Work) {
          const replacement = labelToWorkRoutineMap.get(activity.label)
          if (replacement) {
            activity = { ...replacement }
          }
        }
      })
    })
  }

  private implementReductionInCommonActivities(
    affectedPopulationPercentage: number = 1,
    population: Individual[]
  ) {
    for (let i = 0; i < Math.ceil(population.length * affectedPopulationPercentage); i++) {
      const individual = population[i]

      individual.routine.forEach((day) => {
        let addedTimeAtHome = 0
        day = fasterFilter(day, (activity) => {
          if (this.interruptedActivities.includes(activity.category)) {
            addedTimeAtHome += activity.duration
            return false
          }
        })

        day.find((activity) => activity.category === Category.Home).duration += addedTimeAtHome
      })
    }
  }

  private schoolRecuperation(recuperationNumber: number, population: Individual[]) {
    const students = fasterFilter(
      population,
      (individual) =>
        individual.isInLockdown && individual.occupationTypes.includes(OccupationType.Study)
    )

    const shuffledStudents = fisherYatesShuffle(students)

    const labelToStudyRoutineMap = new Map<Label, Activity>([
      [Label.PreschoolFromHome, preschoolStudy],
      [Label.MiddleSchoolFromHome, middleSchoolStudy],
      [Label.HighSchoolFromHome, highSchoolStudy],
      [Label.CollegeFromHome, collegeStudy]
    ])

    shuffledStudents.slice(0, recuperationNumber).forEach((individual) => {
      individual.routine.forEach((dayRoutine) => {
        dayRoutine.forEach((activity) => {
          if (activity.category === Category.Study) {
            const replacement = labelToStudyRoutineMap.get(activity.label)
            if (replacement) {
              activity = { ...replacement }
            }
          }
        })
      })
    })
  }

  private workRecuperation(recuperationNumber: number, population: Individual[]) {
    const workers = fasterFilter(
      population,
      (individual) =>
        individual.isInLockdown && individual.occupationTypes.includes(OccupationType.Work)
    )

    const shuffledWorkers = fisherYatesShuffle(workers)

    const labelToWorkRoutineMap = new Map<Label, Activity>([
      [Label.MicroIndustryFromHome, microIndustryWorkInPerson],
      [Label.SmallIndustryFromHome, smallIndustryWorkInPerson],
      [Label.MediumIndustryFromHome, mediumIndustryWorkInPerson],
      [Label.LargeIndustryFromHome, largeIndustryWorkInPerson],
      [Label.MicroCommerceFromHome, microCommerceAndServicesWorkInPerson],
      [Label.SmallCommerceFromHome, smallCommerceAndServicesWorkInPerson],
      [Label.MediumCommerceFromHome, mediumCommerceAndServicesWorkInPerson],
      [Label.LargeCommerceFromHome, largeCommerceAndServicesWorkInPerson]
    ])

    shuffledWorkers.slice(0, recuperationNumber).forEach((individual) => {
      individual.routine.forEach((dayRoutine) => {
        dayRoutine.forEach((activity) => {
          if (activity.category === Category.Work) {
            const replacement = labelToWorkRoutineMap.get(activity.label)
            if (replacement) {
              activity = { ...replacement }
            }
          }
        })
      })
    })
  }
}
