import moment from 'moment'

export function fisherYatesShuffle(array: any[]) {
  let i = array.length,
    j: number,
    k: any

  while (i) {
    j = Math.floor(Math.random() * i--)
    k = array[i]
    array[i] = array[j]
    array[j] = k
  }

  return array
}

export function log(
  message: any,
  options?: Partial<{
    time: boolean
    timeEnd: boolean
    timeLabel: string
  }>
) {
  if (options?.time && options?.timeEnd)
    throw new Error('[LOG] Cannot specify both "time" and "timeEnd" options simultaneously')

  if (options?.time) console.time(options.timeLabel && `[${options.timeLabel}]`)

  if (message)
    if (typeof message === 'object') {
      console.log(`[LOG] ${moment().format('DD/MM/YYYY hh:mm:ss')}:`)
      console.log(message)
    } else {
      console.log(`[LOG] ${moment().format('DD/MM/YYYY hh:mm:ss')}: ${message}`)
    }

  if (options?.timeEnd) console.timeEnd(options.timeLabel && `[${options.timeLabel}]`)
}
