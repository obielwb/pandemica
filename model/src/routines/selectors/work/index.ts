import { Activities, Activity, getActivity } from '../../../population/activities'
import { Individual, Occupation } from '../../../population/individual'
import { selectTransportationToOccupation } from '../general'
import { WorkRoutine } from './getters'

export function selectWorkActivity(
  transportToWork: boolean,
  couldGoOnFootToWork: boolean,
  transportationMean: Individual['transportationMean'],
  workOccupation: Occupation,
  workRoutine: WorkRoutine,
  hasEaten: boolean,
  transportationActivities: Activity[]
) {
  const transportationToOccupationActivities = transportToWork
    ? selectTransportationToOccupation(
        couldGoOnFootToWork,
        transportationMean,
        transportationActivities
      )
    : []

  const newActivities = [...transportationToOccupationActivities]

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

  // lunch break
  if (!hasEaten && (workRoutine === '12x36' || workRoutine === 'business_hours')) {
    work.duration = Math.floor(work.duration / 2)

    newActivities.push(work)

    const restaurantActivity = getActivity(Activities.RestaurantIndoors)
    restaurantActivity.maximumIndividualsEngaged = Math.floor(workOccupation.intervalSize[0] / 2)
    newActivities.push(restaurantActivity)
  }

  newActivities.push(work)

  newActivities.push(...transportationToOccupationActivities)

  return newActivities
}
