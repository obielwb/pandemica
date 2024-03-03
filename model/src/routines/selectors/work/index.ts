import { Activities, Activity, getActivity } from '../../../population/activities'
import { Individual, Occupation } from '../../../population/individual'
import { selectTransportation } from '../general'
import { WorkRoutine } from './getters'

export function selectWorkActivity(
  individual: Individual,
  workOccupation: Occupation,
  workRoutine: WorkRoutine,
  hasEaten: boolean
) {
  const newActivities: Activity[] = []

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
