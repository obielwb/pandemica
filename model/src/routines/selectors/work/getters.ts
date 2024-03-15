import { WorkSize } from '../../../../data/census'
import { Label } from '../../../population/activities'
import { Individual, OccupationType } from '../../../population/individual'
import { willEventOccur } from '../../../utilities'

export type WorkRoutine = '' | 'business_hours' | '12x36' | 'part_time'

export function getIndividualWorkRoutine(individual: Individual): WorkRoutine {
  if (individual.occupationTypes.includes(OccupationType.Work)) {
    if (individual.occupationTypes.includes(OccupationType.Study)) {
      return 'part_time'
    }

    const work = individual.occupations.find((o) => o.type === OccupationType.Work)!
    const isIndustryWork = () =>
      work.label === Label.MicroIndustryInPerson ||
      work.label === Label.SmallIndustryInPerson ||
      work.label === Label.MediumIndustryInPerson ||
      work.label === Label.LargeIndustryInPerson

    if (isIndustryWork()) {
      if (willEventOccur(0.5)) {
        return '12x36'
      }

      return 'business_hours'
    } else {
      // commerce_services
      if (willEventOccur(0.725)) {
        return 'business_hours'
      }

      return '12x36'
    }
  }

  return ''
}

// atention: days are zero-index
export function getWorkDays(workRoutine: WorkRoutine, workSize: WorkSize): number[] {
  if (workRoutine === '') {
    return []
  } else if (workRoutine === '12x36') {
    const workOnWeekends =
      (workSize === WorkSize.Large && Math.random() <= 0.8) ||
      (workSize === WorkSize.Medium && Math.random() <= 0.5)

    if (Math.random() <= 0.5) {
      let workDays = [0, 2, 4] // starts on sunday
      if (workOnWeekends) {
        workDays.push(6) // adds saturday
      }

      return workDays
    } else {
      let workDays = [1, 3, 5] // starts on monday
      if (workOnWeekends) {
        workDays.push(0) // adds sunday
      }

      return workDays
    }
  } else {
    // business_hours and part_time
    let workDays = [1, 2, 3, 4, 5] // monday to friday
    const offMonday = Math.random() <= 0.3
    const workOnWeekends =
      (workSize === WorkSize.Large && Math.random() <= 0.5) ||
      (workSize === WorkSize.Medium && Math.random() <= 0.25) ||
      (workSize === WorkSize.Small && Math.random() <= 0.15) ||
      (workSize === WorkSize.Micro && Math.random() <= 0.05)

    if (offMonday) {
      workDays = workDays.filter((day) => day !== 1)
    }

    if (workOnWeekends) {
      if (workSize === WorkSize.Medium || workSize === WorkSize.Large) {
        workDays.push(6)
      }
      if (workSize === WorkSize.Large || Math.random() <= 0.2) {
        workDays.push(0)
      }
    }

    return workDays
  }
}
