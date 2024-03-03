import { IndividualsRoutinesMap } from '..'
import { CHILD_AGE, RETIREMENT_AGE } from '../../../data/census'
import { Activity } from '../../population/activities'
import { Individual, Occupation } from '../../population/individual'
import { selectMimickedActivities } from './mimicked'
import { selectRandomDailyActivity } from './random'
import { selectStudyActivity } from './study'
import { selectWorkActivity } from './work'
import { WorkRoutine } from './work/getters'

export function selectActivitiesBasedOnAttributes(
  day: number,
  individual: Individual,
  studyOccupation: Occupation | undefined,
  workOccupation: Occupation | undefined,
  workRoutine: WorkRoutine,
  workDays: number[],
  dailyRoutine: Activity[],
  totalTime: number,
  individualsRoutinesMap: IndividualsRoutinesMap
): Activity[] {
  const newActivities: Activity[] = []

  if (studyOccupation || workOccupation) {
    let hasEaten = false
    if (studyOccupation && !dailyRoutine.find((activity) => activity.category === 'study')) {
      if (day >= 1 && day <= 5) {
        newActivities.push(...selectStudyActivity(individual, studyOccupation))
        hasEaten = true
      }
    }

    if (workOccupation && !dailyRoutine.find((activity) => activity.category === 'work')) {
      if (workDays.includes(day)) {
        newActivities.push(...selectWorkActivity(individual, workOccupation, workRoutine, hasEaten))
      }
    }

    newActivities.push(selectRandomDailyActivity(individual, day))
  } else {
    if (individual.age[1] >= RETIREMENT_AGE) {
      // todo: treat retireds
    } else if (individual.age[1] <= CHILD_AGE) {
      // note: by mimicking a child's routine with their guardian's activities,
      // we will also have to group them together in a single activity in order
      // to main the integrity of their routines. it wouldn't make any sense
      // to have the kid in a shopping.grocery in the other side of the city
      // without their guardian. let's call this 'familiar integrity'

      newActivities.push(...selectMimickedActivities(individual, day, individualsRoutinesMap))
    } else {
      // todo?: treat nem-nem (nem trabalha, nem estuda) as if they were childs
    }
  }

  return newActivities
}
