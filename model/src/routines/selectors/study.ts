import { Activities, Activity, getActivity } from '../../population/activities'
import { Individual, Occupation } from '../../population/individual'
import { selectTransportationToOccupation } from './general'

export function selectStudyActivity(
  individual: Individual,
  couldGoOnFootToSchool: boolean,
  studyOccupation: Occupation,
  transportationActivities: Activity[]
) {
  const transportationToOccupationActivities = selectTransportationToOccupation(
    couldGoOnFootToSchool,
    individual.transportationMean,
    transportationActivities
  )

  const newActivities = [...transportationToOccupationActivities.slice()]

  const school = getActivity(studyOccupation.label)
  const restaurantActivity = getActivity(Activities.RestaurantIndoors)
  restaurantActivity.maximumIndividualsEngaged = Math.floor(studyOccupation.intervalSize[0] / 2)

  const alsoWorks = individual.occupationTypes.includes('work')

  newActivities.push({
    ...school,
    duration: alsoWorks ? school.duration - 2 : school.duration
  })

  // lunch in between
  if (individual.educationStatus === 'middle_school') {
    newActivities.push(restaurantActivity)
  } else {
    school.duration = Math.floor(school.duration / 2)
    newActivities.push(restaurantActivity)
    newActivities.push({ ...school, duration: alsoWorks ? school.duration - 2 : school.duration })
  }

  newActivities.push(...transportationToOccupationActivities)

  return newActivities
}
