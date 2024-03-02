import { Individual } from '../population/individual'
import { log } from '../utilities'
import { generateWeeklyRoutine } from './generators'

export function assignRoutine(individuals: Individual[]) {
  log('Assigning `routines` to individuals', { time: true, timeLabel: 'ASSIGNMENT' })

  const individualWithRoutines = individuals.map((individual) => {
    return {
      ...individual,
      serialize: individual.serialize,
      routine: generateWeeklyRoutine(individual)
    }
  })

  log('', { timeEnd: true, timeLabel: 'ASSIGNMENT' })

  return individualWithRoutines
}
