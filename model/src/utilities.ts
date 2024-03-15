import moment from 'moment'

export function log(
  message: string | string[] | number | number[] | object | object[],
  options?: Partial<{
    time: boolean
    timeEnd: boolean
    timeLabel: string
    error: Error
  }>
) {
  if (options?.time && options?.timeEnd)
    throw new Error('[LOG] Cannot specify both "time" and "timeEnd" options simultaneously')

  if (options?.time) console.time(options.timeLabel && `[${options.timeLabel}]`)

  if (message)
    if (typeof message === 'object') {
      console.log(`[LOG] ${moment().local().format('DD/MM/YYYY HH:mm:ss')}:`)
      console.log(message)
    } else {
      console.log(`[LOG] ${moment().format('DD/MM/YYYY HH:mm:ss')}: ${message}`)
    }

  if (options?.timeEnd) console.timeEnd(options.timeLabel && `[${options.timeLabel}]`)

  if (options?.error) console.error(options.error)
}

export function shuffle<T>(array: T[]): T[] {
  return array.slice().sort(() => Math.random() - 0.5)
}

export function fisherYatesShuffle<T>(array: T[]) {
  let i = array.length,
    j: number,
    k: T

  while (i) {
    j = Math.floor(Math.random() * i--)
    k = array[i]
    array[i] = array[j]
    array[j] = k
  }

  return array
}

export function selectRandomPercentage<T>(arr: T[], percentage: number): T[] {
  const quantity = Math.round(percentage * arr.length)
  const shuffled = fisherYatesShuffle(arr)
  const selected = shuffled.slice(0, quantity)

  return selected
}

export function chunkIntoNParts<T>(arr: T[], n: number): T[][] {
  const size = Math.ceil(arr.length / n)
  return Array.from({ length: n }, (_, i) => arr.slice(i * size, i * size + size)) as T[][]
}

export function fasterFilter<T>(array: T[], predicate: (value: T) => boolean): T[] {
  const result: T[] = []
  for (let i = 0; i < array.length; i++) {
    if (predicate(array[i])) {
      result.push(array[i])
    }
  }
  return result
}

export function willEventOccur(probability: number): boolean {
  const random = Math.random()

  return random <= probability
}

/**
 * Generates a random integer between min and max (inclusive)
 * @param  {number} min
 * @param  {number} max
 * @returns randomly generated integer
 */
export function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}
