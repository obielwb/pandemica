import { Label as Activities, Activity, getActivity } from '../../population/activities'
import { EducationStatus, Individual, Occupation } from '../../population/individual'
import { selectTransportationToOccupation } from './general'

export function selectStudyActivity(
  individual: Individual,
  alsoWorksToday: boolean,
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

  const school = { ...getActivity(studyOccupation.label) }
  const restaurantActivity = getActivity(Activities.RestaurantIndoor)
  restaurantActivity.maximumIndividualsEngaged = Math.floor(studyOccupation.actualSize / 5)

  newActivities.push(school)

  // doesn't lunch in between
  if (individual.educationStatus === EducationStatus.MiddleSchooler) {
    newActivities.push(restaurantActivity)
  } else {
    const schoolDuration = alsoWorksToday ? school.duration - 2 * 60 : school.duration

    school.duration = Math.floor(schoolDuration / 2)
    newActivities.push(restaurantActivity)
    newActivities.push(school)
  }

  newActivities.push(...transportationToOccupationActivities)

  return newActivities
}
