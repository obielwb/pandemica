import { Individual } from '../../../population/individual'

export type WorkRoutine = 'none' | 'business_hours' | '12x36' | 'part_time'

export function getIndividualWorkRoutine(individual: Individual): WorkRoutine {
  if (individual.occupationTypes.includes('work')) {
    if (individual.occupationTypes.includes('study')) {
      return 'part_time'
    }

    const work = individual.occupations.find((o) => o!.type === 'work')!
    const workType = work.label.split(',')[0]

    if (workType === 'i') {
      return '12x36'
    } else {
      // commerce_services
      if (Math.random() <= 0.725) {
        return 'business_hours'
      }

      return '12x36'
    }
  }

  return 'none'
}

// atention: days are zero-index
export function getWorkDays(workRoutine: WorkRoutine, workSize: string): number[] {
  if (workRoutine === 'none') {
    return []
  } else if (workRoutine === '12x36') {
    const workOnWeekends =
      (workSize === 'l' && Math.random() <= 0.8) || (workSize === 'm' && Math.random() <= 0.5)

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
      (workSize === 'l' && Math.random() <= 0.5) ||
      (workSize === 'm' && Math.random() <= 0.25) ||
      (workSize === 's' && Math.random() <= 0.15) ||
      (workSize === 'xs' && Math.random() <= 0.05)

    if (offMonday) {
      workDays = workDays.filter((day) => day !== 1)
    }

    if (workOnWeekends) {
      if (workSize === 'm' || workSize === 'l') {
        workDays.push(6)
      }
      if (workSize === 'l' || Math.random() <= 0.2) {
        workDays.push(0)
      }
    }

    return workDays
  }
}
