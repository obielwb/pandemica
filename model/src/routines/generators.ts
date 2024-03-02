import { Activity } from '../activities'
import { Individual, Occupation } from '../individual'
import { selectActivitiesBasedOnAttributes, selectSleepActivity } from './selectors'
import { getIndividualWorkRoutine, getWorkDays, WorkRoutine } from './work'
import { getWorkSize, isNightShift, worksOrStudiesToday } from './work/helpers'

// todo: also take into consideration individuals that study, individuals that
// study and work, and individuals that do nothing (unemployed and retired)
export function generateWeeklyRoutine(individual: Individual): Activity[][] {
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
        workDays
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
  workDays: number[]
): Activity[] {
  let dailyRoutine: Activity[] = []
  let totalTime = 0

  const sleepActivity = selectSleepActivity(worksOrStudiesToday(individual, day, workDays))

  const reverseRoutine = isWorkNightShift && workDays.includes(day)

  dailyRoutine.push(sleepActivity) // day starts or ends with sleep
  totalTime += sleepActivity.duration

  while (totalTime < 24 * 60) {
    const newActivities = selectActivitiesBasedOnAttributes(
      day,
      individual,
      studyOccupation,
      workOccupation,
      workRoutine,
      workDays,
      dailyRoutine,
      totalTime
    )
    dailyRoutine.push(...newActivities)
    newActivities.forEach((newActivity) => (totalTime += newActivity.duration))

    if (totalTime > 24 * 60) {
      let overflow = totalTime - 24 * 60
      dailyRoutine[dailyRoutine.length - 1].duration -= overflow
    }
  }

  if (reverseRoutine) {
    return dailyRoutine.reverse()
  }

  return dailyRoutine
}
