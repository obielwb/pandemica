import { Activities, Activity, getActivity } from '../../population/activities'
import { Individual, Occupation } from '../../population/individual'
import { selectTransportation } from '../selectors'

export function selectWorkActivity(
  individual: Individual,
  workOccupation: Occupation,
  workRoutine: WorkRoutine,
  hasEaten: boolean
) {
  const newActivities: Activity[] = []

  const stayAtHomeActivity = getActivity(Activities.StayAtHome)
  stayAtHomeActivity.duration = 30
  stayAtHomeActivity.maximumIndividualsEngaged = individual.house.size
  newActivities.push(stayAtHomeActivity)

  const transportationActivities = selectTransportation(individual.transportationMean)
  newActivities.push(...transportationActivities)

  const work = getActivity(workOccupation.label)

  switch (workRoutine) {
    case 'part_time':
      work.duration = 5 * 60
      break
    case '12x36':
      work.duration = 12 * 60
      break
    case 'business_hours':
      work.duration = 8 * 60
      break
  }
  newActivities.push(work)

  if (!hasEaten) {
    const restaurantActivity = getActivity(Activities.RestaurantIndoors)
    restaurantActivity.maximumIndividualsEngaged = Math.round(workOccupation.actualSize / 2)
    newActivities.push(restaurantActivity)
  }

  newActivities.push(...transportationActivities)

  return newActivities
}

export type WorkRoutine = 'none' | 'business_hours' | '12x36' | 'part_time'

export function getIndividualWorkRoutine(individual: Individual): WorkRoutine {
  if (individual.occupationTypes.includes('work')) {
    if (individual.occupationTypes.includes('study')) {
      return 'part_time'
    }

    const work = individual.occupations.find((o) => o!.type === 'work')!
    const workType = work.label.split(',')[0]

    if (workType === 'industry') {
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
      (workSize === 'large' && Math.random() <= 0.8) ||
      (workSize === 'medium' && Math.random() <= 0.5)

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
      (workSize === 'large' && Math.random() <= 0.5) ||
      (workSize === 'medium' && Math.random() <= 0.25) ||
      (workSize === 'small' && Math.random() <= 0.15) ||
      (workSize === 'micro' && Math.random() <= 0.05)

    if (offMonday) {
      workDays = workDays.filter((day) => day !== 1)
    }

    if (workOnWeekends) {
      if (workSize === 'medium' || workSize === 'large') {
        workDays.push(6)
      }
      if (workSize === 'large' || Math.random() <= 0.2) {
        workDays.push(0)
      }
    }

    return workDays
  }
}
