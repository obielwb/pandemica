import { IndividualsRoutinesMap } from '..'
import { Activities, Activity, getActivity } from '../../population/activities'
import { Individual } from '../../population/individual'

export function selectMimickedActivities(
  individual: Individual,
  day: number,
  individualsRoutinesMap: IndividualsRoutinesMap
): Activity[] {
  const individualPotentialGuardiansIds = individual.house.housemates

  let oldestGuardian = { age: [0, 0], routine: [] as Activity[][] }
  individualPotentialGuardiansIds.forEach((potentialGuardianIds) => {
    const potentialGuardian = individualsRoutinesMap.get(potentialGuardianIds)

    if (potentialGuardian && potentialGuardian.age[1] > oldestGuardian.age[1]) {
      oldestGuardian = potentialGuardian
    }
  })

  if (oldestGuardian.routine.length > 0) {
    return oldestGuardian.routine[day].map((activity) => {
      if (activity.category === 'work' || activity.category === 'study') {
        const stayAtHomeActivity = getActivity(Activities.StayAtHome)
        stayAtHomeActivity.duration = activity.duration
        return stayAtHomeActivity
      } else {
        return activity
      }
    }) as Activity[]
  } else {
    return []
  }
}
