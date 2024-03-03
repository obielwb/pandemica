import { Activities, Activity, getActivity } from '../../population/activities'
import { Individual, Occupation } from '../../population/individual'
import { selectTransportation } from './general'

export function selectStudyActivity(individual: Individual, studyOccupation: Occupation) {
  const newActivities: Activity[] = []

  const transportationActivities = selectTransportation(individual.transportationMean)
  newActivities.push(...transportationActivities)

  const schoolActivity = getActivity(studyOccupation.label)
  newActivities.push(schoolActivity)

  const restaurantActivity = getActivity(Activities.RestaurantIndoors)
  restaurantActivity.maximumIndividualsEngaged = Math.round(studyOccupation.actualSize / 2)
  newActivities.push(restaurantActivity)

  newActivities.push(...transportationActivities)

  return newActivities
}
