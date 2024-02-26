import { Activity, ActivityType, activities, activitiesList } from './activities'
import { Individual } from './individual'

export function createRoutines(individuals: Individual[]) {
  const individualWithRoutines = individuals.map((individual) => {
    return {
      ...individual,
      serialize: individual.serialize,
      // routine: generateWeeklyRoutine(individual)
      routine: []
    }
  })

  return individualWithRoutines
}

// todo: also take into consideration individuals that study and individuals that
// both study and work
function generateWeeklyRoutine(individual: Individual): Activity[][] {
  const workRoutine = getIndividualWorkRoutine(individual)
  let isWorkNightShift = false
  if (workRoutine === '12x36') {
    isWorkNightShift = is12x36NightShift(individual.sex)
  }
  const sleepActivity = selectSleepActivity()
  const weeklyRoutine: Activity[][] = []

  for (let i = 0; i < 7; i++) {
    weeklyRoutine.push(
      generateDailyRoutine(i, individual, workRoutine, isWorkNightShift, sleepActivity)
    )
  }

  return weeklyRoutine
}

function generateDailyRoutine(
  day: number,
  individual: Individual,
  workRoutine: WorkRoutine,
  isWorkNightShift: boolean,
  sleepActivity: Activity
): Activity[] {
  let dailyRoutine: Activity[] = []
  let totalTime = 0

  totalTime += sleepActivity.duration

  if (
    workRoutine === 'none' ||
    workRoutine === 'business_hours' ||
    (workRoutine === '12x36' && !isWorkNightShift)
  ) {
    dailyRoutine.push(sleepActivity)
  }
  // 12x36
  else {
    // todo: properly implement this, since this is the main goal of
    // 12x36 shifts to keep production rolling no matter what time and day
    // it is
    if (day === 0 && Math.random() > 0.5) {
      // 12x36 shift starts on sunday
    } else {
      // 12x36 shift starts on monday
    }
  }

  // todo: needs revision for kids, students, retired
  if (individual.transportationMean === 'private') {
    dailyRoutine.push(activities[ActivityType.PrivateTransportRide])
    totalTime += activities[ActivityType.PrivateTransportRide].duration
  } else {
    dailyRoutine.push(activities[ActivityType.PublicTransportStation])
    dailyRoutine.push(activities[ActivityType.PrivateTransportRide])

    totalTime += activities[ActivityType.PublicTransportStation].duration
    totalTime += activities[ActivityType.PrivateTransportRide].duration
  }

  while (totalTime < 24 * 60) {
    const activity = selectActivityBasedOnAttributes(individual, workRoutine, day, totalTime)
    dailyRoutine.push(activity)
    totalTime += activity.duration

    if (totalTime > 24 * 60) {
      let overflow = totalTime - 24 * 60
      dailyRoutine[dailyRoutine.length - 1].duration -= overflow
    }
  }

  return dailyRoutine
}

type WorkRoutine = 'none' | 'business_hours' | '12x36'

function getIndividualWorkRoutine(individual: Individual): WorkRoutine {
  if (individual.occupationTypes.includes('work')) {
    const work = individual.occupations.find((o) => o!.type === 'work')!

    if (work.label.includes('commerce_services')) {
      return 'business_hours'
    } else if (work.label.includes('industry')) {
      return '12x36'
    }
  }

  return 'none'
}

// based on https://bmcpublichealth.biomedcentral.com/articles/10.1186/s12889-022-13830-5
function is12x36NightShift(sex: 'male' | 'female') {
  if (sex === 'male') {
    return Math.random() <= 0.224
  }

  return Math.random() <= 0.1
}

function selectSleepActivity(): Activity {
  let sleepTypes = [
    ActivityType.FiveHoursSleep,
    ActivityType.SixHoursSleep,
    ActivityType.SevenHoursSleep,
    ActivityType.EightHoursSleep
  ]

  const randomIndex = Math.floor(Math.random() * sleepTypes.length)

  return activities[sleepTypes[randomIndex]]
}

function selectActivityBasedOnAttributes(
  individual: Individual,
  workRoutine: WorkRoutine,
  day: number,
  currentTime: number
): Activity {
  const randomIndex = Math.floor(Math.random() * activitiesList.length)

  return activitiesList[randomIndex]
}

// for test purposes
const individual: Individual = {
  id: 199582,
  sex: 'male',
  age: [25, 29],
  educationStatus: 'educated',
  currentActivity: undefined,
  routine: [],
  house: {
    id: 252513,
    region: 'southwest',
    size: 4,
    housemates: [851941, 425719, 933541, 199582]
  },
  income: [0, 0],
  transportationMean: 'public',
  occupationTypes: ['work'],
  occupations: [
    {
      id: 119466,
      type: 'work',
      label: 'commerce_services.micro',
      actualSize: 4,
      intervalSize: [1, 9]
    }
  ],
  state: 'susceptible',
  hadCovid: false,
  vaccine: {
    doses: 0,
    type: 'none'
  },
  mask: 'none'
}

createRoutines([individual])
