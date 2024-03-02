import {
  type Distance as ActivityDistance,
  type Setting as ActivitySetting,
  type Voice as ActivityVoice
} from '../population/activities'

export const SettingMultiplier: { [key in ActivitySetting]: number } = {
  indoor: 1,
  outdoor: 0.05
}

export const DistanceMultiplier: { [key in ActivityDistance]: number } = {
  normal: 1,
  sixFt: 0.5,
  tenFt: 0.25
}

export type MaskType =
  | 'none'
  | 'thin'
  | 'basic'
  | 'surgical'
  | 'filtered'
  | 'n95'
  | 'n95Sealed'
  | 'p100'

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

export const VoiceMultiplier: { [key in ActivityVoice]: number } = {
  silent: 0.2,
  normal: 1,
  loud: 5
}

export interface VaccineValue {
  multiplierPerDose: number[] // muliplierPerDose[n] is the multiplier for having |n| doses of vaccine.
}

export const VaccinesRiskReduction: { [key: string]: VaccineValue } = {
  pfizer: {
    multiplierPerDose: [0.91, 0.95]
  },
  astraZeneca: {
    multiplierPerDose: [0.67, 0.85]
  },
  janssen: {
    multiplierPerDose: [0.77, 1, 0.95]
  },
  none: {
    multiplierPerDose: [0, 0, 0, 0]
  }
}

export type VaccineType = 'pfizer' | 'moderna' | 'astra_zeneca' | 'johnson_johnson' | 'none'

export type Vaccine = {
  type: VaccineType
  doses: number
}

export interface AgeValue {
  interval: number[]
  hospitalizationRate: number // %
  deathRate: number // %
}

export const AgeMultipler: { [key: string]: AgeValue } = {
  zeroToNineteenYears: {
    interval: [0, 19],
    hospitalizationRate: 0.008,
    deathRate: 0.000015
  },
  twentyToFourtynineYears: {
    interval: [20, 49],
    hospitalizationRate: 0.025,
    deathRate: 0.0007
  },
  fiftyToSixtyfourYears: {
    interval: [50, 64],
    hospitalizationRate: 0.079,
    deathRate: 0.007
  },
  sixtyFivePlusYears: {
    interval: [65, 84],
    hospitalizationRate: 0.23,
    deathRate: 0.06
  }
}
