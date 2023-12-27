import { Activity, ActivityType, activities } from './activities'
import { Individual } from './individual'

export function createRoutines(individuals: Individual[]) {
  const individualWithRoutines = individuals.map((individual) => {
    return {
      ...individual,
      serialize: individual.serialize,
      routine: generateWeeklyRoutine(individual)
    }
  })

  return individualWithRoutines
}

function generateWeeklyRoutine(individual: Individual): Activity[][] {
  const weeklyRoutine: Activity[][] = []
  for (let i = 0; i < 7; i++) {
    weeklyRoutine.push(generateDailyRoutine(i, individual))
  }
  return weeklyRoutine
}

function generateDailyRoutine(day: number, individual: Individual): Activity[] {
  let dailyRoutine: Activity[] = []
  let totalTime = 0

  const sleepActivity = selectSleepActivity(day)
  dailyRoutine.push(sleepActivity)
  totalTime += sleepActivity.duration

  while (totalTime < 24 * 60) {
    const activity = selectActivityBasedOnAttributes(individual)
    dailyRoutine.push(activity)
    totalTime += activity.duration

    if (totalTime > 24 * 60) {
      let overflow = totalTime - 24 * 60
      dailyRoutine[dailyRoutine.length - 1].duration -= overflow
    }
  }

  return dailyRoutine
}

function selectSleepActivity(day: number): Activity {
  let sleepTypes = [ActivityType.SevenHoursSleep, ActivityType.EightHoursSleep]
  if (day === 0 || day === 6) {
    sleepTypes.push(ActivityType.NineHoursSleep)
  } else {
    sleepTypes.push(ActivityType.FiveHoursSleep, ActivityType.SixHoursSleep)
  }

  const randomIndex = Math.floor(Math.random() * sleepTypes.length)

  return activities[sleepTypes[randomIndex]]
}

function selectActivityBasedOnAttributes(individual: Individual): Activity {}
