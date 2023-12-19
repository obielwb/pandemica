import {
  type Distance as ActivityDistance,
  type Setting as ActivitySetting,
  type Voice as ActivityVoice
} from './activities'

export const Setting: { [key in ActivitySetting]: number } = {
  indoor: 1,
  outdoor: 0.05
}

export const Distance: { [key in ActivityDistance]: number } = {
  normal: 1,
  sixFt: 0.5,
  tenFt: 0.25
}

export const MaskMultiplier: { [key: string]: number } = {
  none: 1.0,
  thin: 1 / 2,
  basic: 1 / 3,
  surgical: 1 / 4,
  filtered: 1 / 4,
  n95: 1 / 6,
  n95Sealed: 1 / 16,
  p100: 1 / 3
}

export const Voice: { [key in ActivityVoice]: number } = {
  silent: 0.2,
  normal: 1,
  loud: 5
}

export interface VaccineValue {
  label: string
  multiplierPerDose: number[] // muliplierPerDose[n] is the multiplier for having |n| doses of vaccine.
}

export const Vaccines: { [key: string]: VaccineValue } = {
  pfizer: {
    label: 'pfizer',
    multiplierPerDose: [1, 1, 0.8, 0.25]
  },
  astraZeneca: {
    label: 'astra_zeneca',
    multiplierPerDose: [1, 1, 1, 0.3]
  },
  janssen: {
    label: 'janssen',
    multiplierPerDose: [1, 1, 0.95]
  },
  unknown: {
    label: 'unknown',
    multiplierPerDose: [1, 1, 1, 0.3]
  }
}
