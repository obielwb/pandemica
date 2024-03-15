import { IndividualsRoutinesMap } from '.'
import { CHILD_AGE } from '../../data/census'
import { Activities, Activity, getActivity } from '../population/activities'
import { Individual, Occupation } from '../population/individual'
import { willEventOccur } from '../utilities'
import { selectActivitiesBasedOnAttributes } from './selectors'
import { selectSleepActivity, selectTransportation } from './selectors/general'
import { getIndividualWorkRoutine, getWorkDays, WorkRoutine } from './selectors/work/getters'
import { getWorkSize, isNightShift, worksOrStudiesToday } from './selectors/work/helpers'

export function generateWeeklyRoutine(
  individual: Individual,
  individualsRoutinesMap: IndividualsRoutinesMap
): Activity[][] {
  const workRoutine = getIndividualWorkRoutine(individual)
  let workDays = []
  let isWorkNightShift = false

  if (workRoutine != '') {
    const workSize = getWorkSize(individual)
    isWorkNightShift = isNightShift(individual, workSize)
    workDays = getWorkDays(workRoutine, workSize)
  }

  const workOccupation = individual.occupations.find((o) => o.type === 'w')
  const couldGoOnFootToWork = workOccupation && Math.random() <= 0.05 // todo: replace with actual value

  const studyOccupation = individual.occupations.find((o) => o.type === 's')
  const couldGoOnFootToSchool = studyOccupation && Math.random() <= 0.05 // todo: replace with actual value

  const transportationActivities = selectTransportation(individual.transportationMean)

  const weeklyRoutine: Activity[][] = []

  for (let i = 0; i < 7; i++) {
    weeklyRoutine.push(
      generateDailyRoutine(
        i,
        individual,
        studyOccupation,
        workOccupation,
        workRoutine,
        isWorkNightShift,
        workDays,
        weeklyRoutine,
        individualsRoutinesMap,
        transportationActivities,
        couldGoOnFootToWork,
        couldGoOnFootToSchool
      )
    )
  }

  return weeklyRoutine
}

const MINIMUM_HOME_TIME = 15
const INITIAl_HOME_TIME = 1.5 * 60
export const ACTIVE_TIME = 24 * 60 - INITIAl_HOME_TIME

export function generateDailyRoutine(
  day: number,
  individual: Individual,
  studyOccupation: Occupation | undefined,
  workOccupation: Occupation | undefined,
  workRoutine: WorkRoutine,
  isWorkNightShift: boolean,
  workDays: number[],
  weeklyRoutine: Activity[][],
  individualsRoutinesMap: IndividualsRoutinesMap,
  transportationActivities: Activity[],
  couldGoOnFootToWork: boolean,
  couldGoOnFootToSchool: boolean
): Activity[] {
  let dailyRoutine: Activity[] = []
  let totalTime = 0
  let homeTime = INITIAl_HOME_TIME

  const willIncapableFollowGuardian =
    willEventOccur(0.5) &&
    individual.house.housemates.find((housemate) => individualsRoutinesMap.get(housemate)) !==
      undefined
  const isRegularRoutine = () =>
    individual.age[1] > CHILD_AGE || (individual.house.size === 1 && !willIncapableFollowGuardian)

  if (isRegularRoutine()) {
    const sleepActivity = selectSleepActivity(worksOrStudiesToday(individual, day, workDays))
    dailyRoutine.push(sleepActivity) // day starts or ends with sleep
    totalTime += sleepActivity.duration

    const stayAtHomeActivity = { ...getActivity(Activities.StayAtHome) }
    stayAtHomeActivity.duration = 1 * 60
    stayAtHomeActivity.maximumIndividualsEngaged = individual.house.size
    dailyRoutine.push(stayAtHomeActivity)
    totalTime += stayAtHomeActivity.duration
  }

  while (totalTime < ACTIVE_TIME) {
    const newActivities = selectActivitiesBasedOnAttributes(
      day,
      individual,
      studyOccupation,
      workOccupation,
      workRoutine,
      workDays,
      weeklyRoutine,
      dailyRoutine,
      totalTime,
      individualsRoutinesMap,
      transportationActivities,
      couldGoOnFootToWork,
      couldGoOnFootToSchool,
      willIncapableFollowGuardian
    )
    dailyRoutine.push(...newActivities)
    totalTime += newActivities.reduce((acc, newActivity) => acc + newActivity.duration, 0)
  }

  let overflow = totalTime - ACTIVE_TIME
  if (overflow > 0 && isRegularRoutine()) {
    // first try to reduce from the leisure and shopping activities other than home
    for (let i = dailyRoutine.length - 1; i >= 0 && overflow > 0; i--) {
      let activity = dailyRoutine[i]
      if (
        activity.label !== Activities.StayAtHome &&
        (activity.category === 'leisure' || activity.category === 'shopping') &&
        activity.duration > overflow
      ) {
        dailyRoutine[i] = { ...activity, duration: activity.duration - overflow }
        overflow = 0
      } else if (
        activity.label !== Activities.StayAtHome &&
        activity.category !== 'w' &&
        activity.category !== 's' &&
        activity.category !== 'errands'
      ) {
        overflow -= activity.duration + 15
        dailyRoutine[i] = { ...activity, duration: 15 }
      }
    }

    totalTime = dailyRoutine.reduce((acc, activity) => acc + activity.duration, 0) // recalculate total time after reducing activities duration
    overflow = totalTime - ACTIVE_TIME

    // if overflow still exists, reduce from HOME_TIME but not below MINIMUN_HOME_TIME
    if (overflow > 0 && homeTime - overflow >= MINIMUM_HOME_TIME) {
      homeTime -= overflow
      overflow = 0
    }
  }

  if (totalTime < 24 * 60) {
    const stayAtHomeActivity = { ...getActivity(Activities.StayAtHome) }
    stayAtHomeActivity.duration = homeTime
    stayAtHomeActivity.maximumIndividualsEngaged = individual.house.size
    dailyRoutine.push(stayAtHomeActivity)
  }

  // remove and extend duplicate activities duration to a single activity
  let finalDailyRoutine = []
  let i = 0
  while (i < dailyRoutine.length) {
    let currentActivity = dailyRoutine[i]
    let totalDuration = currentActivity.duration
    let j = i + 1

    while (
      j < dailyRoutine.length &&
      currentActivity.label === dailyRoutine[j].label &&
      currentActivity.setting === dailyRoutine[j].setting &&
      currentActivity.distance === dailyRoutine[j].distance &&
      currentActivity.voice === dailyRoutine[j].voice
    ) {
      totalDuration += dailyRoutine[j].duration
      j++
    }

    finalDailyRoutine.push({ ...currentActivity, duration: totalDuration })
    i = j
  }

  const reverseRoutine = isWorkNightShift && workDays.includes(day)
  if (reverseRoutine) {
    return finalDailyRoutine.reverse()
  }

  return finalDailyRoutine
}
