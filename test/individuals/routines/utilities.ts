import moment from 'moment'

type LogOptions = Partial<{
  time: boolean
  timeEnd: boolean
  timeLabel: string
}>

export const log = (message: any, options?: LogOptions) => {
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
