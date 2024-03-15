import {
  Setting as ActivitySetting,
  Distance as ActivityDistance,
  Voice as ActivityVoice
} from '../population/activities'

export const SettingMultiplier: { [key in ActivitySetting]: number } = {
  [ActivitySetting.Indoor]: 1,
  [ActivitySetting.Outdoor]: 0.05
}

export const DistanceMultiplier: { [key in ActivityDistance]: number } = {
  [ActivityDistance.Normal]: 1,
  [ActivityDistance.SixFt]: 0.5,
  [ActivityDistance.TenFt]: 0.25
}

export enum Mask {
  Thin,
  Basic,
  Surgical,
  Filtered,
  N95,
  N95Sealed,
  P100,
  None
}

export const MaskMultiplier: { [key in Mask]: number } = {
  [Mask.None]: 1.0,
  [Mask.Thin]: 1 / 2,
  [Mask.Basic]: 1 / 3,
  [Mask.Surgical]: 1 / 4,
  [Mask.Filtered]: 1 / 4,
  [Mask.N95]: 1 / 6,
  [Mask.N95Sealed]: 1 / 16,
  [Mask.P100]: 1 / 3
}

export const VoiceMultiplier: { [key in ActivityVoice]: number } = {
  [ActivityVoice.Silent]: 0.2,
  [ActivityVoice.Normal]: 1,
  [ActivityVoice.Loud]: 5
}

export interface VaccineValue {
  multiplierPerDose: number[] // muliplierPerDose[n] is the multiplier for having |n| doses of vaccine.
}

export enum VaccineType {
  Pfizer,
  // Moderna,
  AstraZeneca,
  Janssen,
  CoronaVac,
  None
}

export type Vaccine = {
  type: VaccineType
  doses: number
}

export const VaccinesRiskReduction: { [key in VaccineType]: VaccineValue } = {
  [VaccineType.Pfizer]: {
    multiplierPerDose: [0.91, 0.95]
  },
  [VaccineType.AstraZeneca]: {
    multiplierPerDose: [0.67, 0.85]
  },
  [VaccineType.Janssen]: {
    multiplierPerDose: [0.77, 1, 0.95]
  },
  [VaccineType.CoronaVac]: {
    multiplierPerDose: [0, 0, 0] // todo: add values
  },
  [VaccineType.None]: {
    multiplierPerDose: [0, 0, 0, 0]
  }
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

// number of days before becoming contagious
export const omicronIncubationPeriod = 2 // days
