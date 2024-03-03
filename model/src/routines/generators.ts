import { IndividualsRoutinesMap } from '.'
import { Activities, Activity, getActivity } from '../population/activities'
import { Individual, Occupation } from '../population/individual'
import { selectActivitiesBasedOnAttributes } from './selectors'
import { selectSleepActivity } from './selectors/general'
import { getIndividualWorkRoutine, getWorkDays, WorkRoutine } from './selectors/work/getters'
import { getWorkSize, isNightShift, worksOrStudiesToday } from './selectors/work/helpers'

// todo: also take into consideration individuals that study, individuals that
// study and work, and individuals that do nothing (unemployed and retired)
export function generateWeeklyRoutine(
  individual: Individual,
  individualsRoutinesMap: IndividualsRoutinesMap
): Activity[][] {
  const workRoutine = getIndividualWorkRoutine(individual)
  let workDays = []
  let isWorkNightShift = false

  if (workRoutine != 'none') {
    const workSize = getWorkSize(individual)
    isWorkNightShift = isNightShift(individual, workSize)
    workDays = getWorkDays(workRoutine, workSize)
  }

  const studyOccupation = individual.occupations.find((o) => o.type === 'study')
  const workOccupation = individual.occupations.find((o) => o.type === 'work')

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
        individualsRoutinesMap
      )
    )
  }

  return weeklyRoutine
}

export function generateDailyRoutine(
  day: number,
  individual: Individual,
  studyOccupation: Occupation | undefined,
  workOccupation: Occupation | undefined,
  workRoutine: WorkRoutine,
  isWorkNightShift: boolean,
  workDays: number[],
  individualsRoutinesMap: IndividualsRoutinesMap
): Activity[] {
  let dailyRoutine: Activity[] = []
  let totalTime = 0

  const sleepActivity = selectSleepActivity(worksOrStudiesToday(individual, day, workDays))
  dailyRoutine.push(sleepActivity) // day starts or ends with sleep
  totalTime += sleepActivity.duration

  const stayAtHomeActivity = getActivity(Activities.StayAtHome)
  stayAtHomeActivity.duration = 30
  stayAtHomeActivity.maximumIndividualsEngaged = individual.house.size
  dailyRoutine.push(stayAtHomeActivity)
  totalTime += sleepActivity.duration

  const reverseRoutine = isWorkNightShift && workDays.includes(day)

  while (totalTime < 23.5 * 60) {
    const newActivities = selectActivitiesBasedOnAttributes(
      day,
      individual,
      studyOccupation,
      workOccupation,
      workRoutine,
      workDays,
      dailyRoutine,
      totalTime,
      individualsRoutinesMap
    )
    dailyRoutine.push(...newActivities)
    newActivities.forEach((newActivity) => (totalTime += newActivity.duration))

    if (totalTime > 23.5 * 60) {
      let overflow = totalTime - 23.5 * 60
      dailyRoutine[dailyRoutine.length - 1].duration -= overflow
    }
  }

  dailyRoutine.push(stayAtHomeActivity)
  totalTime += sleepActivity.duration

  if (reverseRoutine) {
    return dailyRoutine.reverse()
  }

  return dailyRoutine
}
