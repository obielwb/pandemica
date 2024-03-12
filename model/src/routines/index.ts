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

  const individualWithRoutines = individuals.map((individual) => {
    const routine = generateWeeklyRoutine(individual, individualsRoutinesMap)
    individualsRoutinesMap.set(individual.id, {
      age: individual.age,
      routine
    })

    return {
      ...individual,
      serialize: individual.serialize,
      routine
    }
  })

  log('', { timeEnd: true, timeLabel: 'ASSIGNMENT' })

  return individualWithRoutines
}

export function assignHospitalizedRoutine(individual: Individual) {}
