import { Mask } from '../calculus/data'
import { Activity, Category, eightHoursSleep, hospitalized } from '../population/activities'
import { Individual } from '../population/individual'
import { fasterFilter, log } from '../utilities'
import { generateWeeklyRoutine } from './generators'

export type IndividualsRoutinesMap = Map<
  number,
  {
    age: number[]
    routine: Activity[][]
  }
>

export function assignRoutine(individuals: Individual[]) {
  log('Assigning `routines` to individuals', { time: true, timeLabel: 'ASSIGNMENT' })

  individuals.sort((a, b) => b.age[1] - a.age[1])

  const individualsRoutinesMap = new Map<
    number,
    {
      age: number[]
      routine: Activity[][]
    }
  >()

  const LOG_INTERVAL = 10_000
  let initialTime = new Date()

  const individualWithRoutines = individuals.map((individual, index) => {
    const routine = generateWeeklyRoutine(individual, individualsRoutinesMap)

    if (individual.age[1] > 19) {
      individualsRoutinesMap.set(individual.id, {
        age: individual.age,
        routine
      })
    }

    if (index % LOG_INTERVAL === 0 && index !== 0) {
      const currentTime = new Date().getTime()
      const timeElapsed = currentTime - initialTime.getTime()
      const timePerRoutine = timeElapsed / LOG_INTERVAL
      const totalRemainingTimeInSeconds = ((individuals.length - index) * timePerRoutine) / 1000
      const remainingMinutes = Math.floor(totalRemainingTimeInSeconds / 60)
      const remainingSeconds = Math.round(totalRemainingTimeInSeconds % 60)

      console.log(
        `[ROUTINES]: ${index.toLocaleString()} assigned in ${(timeElapsed / 1000).toFixed(2)}s, ` +
          `${(individuals.length - index).toLocaleString()} remaining ` +
          `(${Math.round(timePerRoutine)}ms per routine, ` +
          `${remainingMinutes}min ${remainingSeconds}s estimated to completion)`
      )

      initialTime = new Date()
    }

    return {
      ...individual,
      routine
    }
  })

  log('', { timeEnd: true, timeLabel: 'ASSIGNMENT' })

  return individualWithRoutines
}

// SEIR Routines

export function assignHospitalizedRoutine(individual: Individual) {
  individual.preInfectedRoutine = individual.routine
  individual.routine = Array.from({ length: 7 }, () => [] as Activity[] | [])
  for (let i = 0; i < 7; i++) {
    individual.routine[i].push({ ...eightHoursSleep })
    individual.routine[i].push({ ...hospitalized })
  }
}

export function assignInfectiousRoutine(
  individual: Individual,
  useMask: boolean = false,
  maskType: Mask = Mask.None,
  interruptedActivities: Category[] = []
) {
  individual.preInfectedRoutine = individual.routine

  if (useMask) individual.mask = maskType

  individual.routine.forEach((day) => {
    let addedTimeAtHome = 0
    day = fasterFilter(day, (activity) => {
      if (interruptedActivities.includes(activity.category)) {
        addedTimeAtHome += activity.duration
        return false
      }
      return true // gabriel, is this right>
    })

    day.find((activity) => activity.category === Category.Home)!.duration += addedTimeAtHome
  })
}

export function assignRecuperedRoutine(individual: Individual) {
  individual.routine = individual.preInfectedRoutine!
  individual.preInfectedRoutine = undefined
}
