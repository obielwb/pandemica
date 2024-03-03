import { Activity, Activities, getActivity } from '../population/activities'
import { Individual, Occupation } from '../population/individual'
import { selectStudyActivity } from './study'
import { WorkRoutine, selectWorkActivity } from './work'

export function selectActivitiesBasedOnAttributes(
  day: number,
  individual: Individual,
  studyOccupation: Occupation | undefined,
  workOccupation: Occupation | undefined,
  workRoutine: WorkRoutine,
  workDays: number[],
  dailyRoutine: Activity[],
  totalTime: number
): Activity[] {
  const newActivities: Activity[] = []

  if (studyOccupation || workOccupation) {
    let hasEaten = false
    if (studyOccupation && !dailyRoutine.find((activity) => activity.category === 'study')) {
      if (!workOccupation && day >= 1 && day <= 5) {
        newActivities.push(...selectStudyActivity(individual, studyOccupation))
        hasEaten = true
      }
    }

    if (workOccupation && !dailyRoutine.find((activity) => activity.category === 'work')) {
      if (workDays.includes(day)) {
        newActivities.push(...selectWorkActivity(individual, workOccupation, workRoutine, hasEaten))
      }
    }
  }

  return newActivities
}

export function selectTransportation(
  transportationMean: Individual['transportationMean']
): Activity[] {
  const transportationActivities: Activity[] = []

  if (transportationMean === 'private') {
    transportationActivities.push(getActivity(Activities.PrivateTransportRide))
  } else {
    transportationActivities.push(getActivity(Activities.PublicTransportStation))
    transportationActivities.push(getActivity(Activities.PrivateTransportRide))
  }

  return transportationActivities
}

export function selectSleepActivity(worksOrStudiesToday: boolean): Activity {
  function createWeightedSleepTypes(worksOrStudiesToday: boolean): Activities[] {
    if (worksOrStudiesToday) {
      return [
        ...Array(2).fill(Activities.FiveHoursSleep),
        ...Array(3).fill(Activities.SixHoursSleep),
        ...Array(3).fill(Activities.SevenHoursSleep),
        Activities.EightHoursSleep
      ]
    }

    return [
      Activities.FiveHoursSleep,
      ...Array(2).fill(Activities.SixHoursSleep),
      ...Array(3).fill(Activities.SevenHoursSleep),
      ...Array(3).fill(Activities.EightHoursSleep)
    ]
  }

  const weightedSleepTypes = createWeightedSleepTypes(worksOrStudiesToday)
  const randomIndex = Math.floor(Math.random() * weightedSleepTypes.length)
  return getActivity(weightedSleepTypes[randomIndex])
}
