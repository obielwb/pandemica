import { Activity, Activities, getActivity } from '../../population/activities'
import { Individual } from '../../population/individual'

export function selectTransportation(
  transportationMean: Individual['transportationMean']
): Activity[] {
  const transportationActivities: Activity[] = []

  if (transportationMean === 'pr') {
    transportationActivities.push(getActivity(Activities.PrivateTransportRide))
  } else {
    transportationActivities.push(getActivity(Activities.PublicTransportStation))
    transportationActivities.push(getActivity(Activities.PublicTransportRide))
  }

  return transportationActivities
}

export function selectTransportationToOccupation(
  couldGoOnFoot: boolean,
  transportationMean: Individual['transportationMean'],
  transportationActivities: Activity[]
) {
  if (couldGoOnFoot) {
    const shoudlGoOnFoot = transportationMean === 'pr'
    if (shoudlGoOnFoot) {
      const privateTransportRide = transportationActivities[0]
      privateTransportRide.duration = 7.5 // decrease distance (duration) if the occupation is close enough to go on foot
      return [privateTransportRide]
    } else {
      // for public transport users that can go on foot, they simply go
      return []
    }
  } else {
    // otherwise, return the regular transportation activities independently of it being private or public
    return transportationActivities
  }
}

export function selectSleepActivity(worksOrStudiesToday: boolean): Activity {
  function createWeightedSleepTypes(worksOrStudiesToday: boolean): Activities[] {
    if (worksOrStudiesToday) {
      return [
        ...Array(2).fill(Activities.FiveHoursSleep),
        ...Array(3).fill(Activities.SixHoursSleep),
        ...Array(4).fill(Activities.SevenHoursSleep),
        Activities.EightHoursSleep
      ]
    }

    return [
      Activities.FiveHoursSleep,
      ...Array(2).fill(Activities.SixHoursSleep),
      ...Array(4).fill(Activities.SevenHoursSleep),
      ...Array(4).fill(Activities.EightHoursSleep)
    ]
  }

  const weightedSleepTypes = createWeightedSleepTypes(worksOrStudiesToday)
  const randomIndex = Math.floor(Math.random() * weightedSleepTypes.length)
  return { ...getActivity(weightedSleepTypes[randomIndex]) }
}
