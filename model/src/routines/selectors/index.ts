import { IndividualsRoutinesMap } from '..'
import { CHILD_AGE, RETIREMENT_AGE } from '../../../data/census'
import { Activity } from '../../population/activities'
import { Individual, Occupation } from '../../population/individual'
import { ACTIVE_TIME } from '../generators'
import { selectMimickedActivities } from './mimicked'
import { selectRandomDayOffActivity, selectRandomDailyActivity } from './random'
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
  weeklyRoutine: Activity[][],
  dailyRoutine: Activity[],
  totalTime: number,
  individualsRoutinesMap: IndividualsRoutinesMap,
  transportationActivities: Activity[],
  couldGoOnFootToWork: boolean,
  couldGoOnFootToSchool: boolean
): Activity[] {
  const newActivities: Activity[] = []
  let remainingTime = ACTIVE_TIME - totalTime

  if (studyOccupation || workOccupation) {
    if ((day >= 1 && day <= 5) || workDays.includes(day)) {
      let hasEaten = false
      let needsTransportToWork = true

      if (
        studyOccupation &&
        day >= 1 &&
        day <= 5 &&
        !dailyRoutine.find((activity) => activity.category === 'study')
      ) {
        newActivities.push(
          ...selectStudyActivity(
            individual,
            workDays.includes(day),
            couldGoOnFootToSchool,
            studyOccupation,
            transportationActivities
          )
        )
        needsTransportToWork = false
        hasEaten = true
        remainingTime -= newActivities.reduce((acc, activity) => acc + activity.duration, 0)
        console.log(day)
        console.log(
          newActivities.map((activity) => `${activity.label} ${activity.duration}`).join('\n'),
          newActivities.reduce((acc, activity) => acc + activity.duration, 0),
          workDays,
          workOccupation &&
            workDays.includes(day) &&
            !dailyRoutine.find((activity) => activity.category === 'work')
        )
      }

      if (
        workOccupation &&
        workDays.includes(day) &&
        !dailyRoutine.find((activity) => activity.category === 'work')
      ) {
        newActivities.push(
          ...selectWorkActivity(
            needsTransportToWork,
            couldGoOnFootToWork,
            individual.transportationMean,
            workOccupation,
            workRoutine,
            hasEaten,
            transportationActivities
          )
        )
        hasEaten = true
        remainingTime -= newActivities.reduce((acc, activity) => acc + activity.duration, 0)
        console.log(
          newActivities.map((activity) => `${activity.label} ${activity.duration}`).join('\n'),
          newActivities.reduce((acc, activity) => acc + activity.duration, 0)
        )
      }

      if (
        newActivities.length === 0 &&
        dailyRoutine.filter((activity) => activity.category === 'home').length === 2 // sleep and morning stay at home
      ) {
        const randomActivity = selectRandomDailyActivity(
          individual,
          day,
          remainingTime,
          weeklyRoutine,
          dailyRoutine
        )

        if (randomActivity) {
          if (randomActivity.label === 'home.stay_at_home') {
            randomActivity.duration = remainingTime
          }

          newActivities.push(randomActivity)
        }
      }
    } else {
      // weekends or day offs
      newActivities.push(
        ...selectRandomDayOffActivity(
          dailyRoutine,
          individual,
          day,
          remainingTime,
          weeklyRoutine,
          transportationActivities
        )
      )
    }
  } else {
    if (individual.age[1] >= RETIREMENT_AGE) {
      newActivities.push(
        ...selectRandomDayOffActivity(
          dailyRoutine,
          individual,
          day,
          remainingTime,
          weeklyRoutine,
          transportationActivities
        )
      )
    } else if (individual.age[1] <= CHILD_AGE) {
      // note: by mimicking a child's routine with their guardian's activities,
      // we also have to group them together in a single activity in order
      // to main the integrity of their routines. it wouldn't make any sense
      // to have the kid in a shopping.grocery in the other side of the city
      // without their guardian. we call this 'familiar integrity'

      newActivities.push(...selectMimickedActivities(individual, day, individualsRoutinesMap))
    } else {
      newActivities.push(
        ...selectRandomDayOffActivity(
          dailyRoutine,
          individual,
          day,
          remainingTime,
          weeklyRoutine,
          transportationActivities
        )
      )
    }
  }

  return newActivities
}
