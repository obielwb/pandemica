import { Activity } from '../population/activities'
import { Individual } from '../population/individual'
import { log } from '../utilities'
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

  let totalRoutines = individuals.length
  const LOG_INTERVAL = 1_000

  const individualWithRoutines = individuals.map((individual, index) => {
    if (index % LOG_INTERVAL === 0) {
      log('', { time: true, timeLabel: `ROUTINE-${index}` })
    }

    const routine = generateWeeklyRoutine(individual, individualsRoutinesMap)

    if (individual.age[1] > 19) {
      individualsRoutinesMap.set(individual.id, {
        age: individual.age,
        routine
      })
    }

    if (index % LOG_INTERVAL === 0) {
      log('', { timeEnd: true, timeLabel: `ROUTINE-${index}` })
      totalRoutines -= LOG_INTERVAL
    }

    return {
      ...individual,
      serialize: individual.serialize,
      routine
    }
  })

  log('', { timeEnd: true, timeLabel: 'ASSIGNMENT' })

  return individualWithRoutines
}
