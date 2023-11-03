import { Activity } from '../../individuals/routines/src/activities'
import { Individual, Vaccine } from '../../individuals/routines/src/individual'
import {
  Distance,
  FormValue,
  Interaction,
  Setting,
  TheirMask,
  Vaccines,
  Voice,
  YourMask,
  intimateDurationFloor,
  partnerMult
} from './data'
import { Prevalence } from './prevalence'

const MAX_DELAY_FACTOR = 2

export const DAY_0 = new Date(2020, 1, 12)
const MS_PER_DAY = 1000 * 60 * 60 * 24

// From https://covid19-projections.com/estimating-true-infections-revisited/
// TODO: change the way treat time
const prevalenceRatio = (positivityPercent: number, date: Date) => {
  const day_i = (date.getTime() - DAY_0.getTime()) / MS_PER_DAY

  const positivityRate = positivityPercent / 100
  return (1000 / (day_i + 10)) * positivityRate ** 0.5 + 2
}

export const ONE_MILLION = 1e6 // 100% of chance of being contaminated with covid
export const MAX_ACTIVITY_RISK = partnerMult
export const MAX_POINTS = 100000

export const calculateLocationReportedPrevalence = (data: Prevalence): number => {
  const population = data.population
  const lastWeek = data.casesPastWeek

  // additive smoothing, only relevant for super low case numbers
  const prevalence = (lastWeek + 1) / population
  return prevalence
}

export const calculateLocationPersonAverage = (data: Prevalence): number => {
  const prevalence = calculateLocationReportedPrevalence(data)

  const underreportingFactor = prevalenceRatio(data.positiveCasePercentage, data.prevalanceDataDate)

  const delayFactor = Math.min(
    1 + Math.max(0, data.casesIncreasingPercentage / 100),
    MAX_DELAY_FACTOR
  )

  // Points for "random person from X location"
  const personRisk = prevalence * underreportingFactor * delayFactor

  return personRisk * ONE_MILLION
}

const getVaccineMultiplier = (vaccine: Vaccine): number => {
  if (vaccine.type === '') {
    return 1
  }
  const vaccineMultiplierPerDose = Vaccines[vaccine.type].multiplierPerDose

  return vaccineMultiplierPerDose[vaccine.doses]
}

export const calculatePersonRiskEach = (individual: Individual, prevalence: Prevalence): number => {
  const averagePersonRisk = calculateLocationPersonAverage(prevalence)

  if (individual.hasCovid) return individual.riskNumber

  const unadjustedRisk = averagePersonRisk * individual.riskNumber

  return unadjustedRisk
}

/*

Interaction * Duration * Setting * Voice * mask * VaccineMultiplier *
(lastweek + 1 / population) * underreportingFactor * delayFactor) * riskNumber


*/

export const calculateActivityRisk = (activity: Activity): number => {
  // const vaccineMultiplier = getVaccineMultiplier(individualsPair[0].vaccine)
  // multiplier *= mulFor(YourMask, individualsPair[0].mask)

  let multiplier = Interaction[activity.interaction.label].multiplier

  const mulFor = (table: { [key: string]: FormValue }, given: string): number =>
    given === '' ? 1 : table[given].multiplier

  let effectiveDuration = activity.duration

  multiplier *= mulFor(Distance, activity.distance)
  multiplier *= mulFor(Setting, activity.setting)
  multiplier *= mulFor(Voice, activity.voice)

  multiplier *= effectiveDuration / 60.0
  if (multiplier > MAX_ACTIVITY_RISK) {
    multiplier = MAX_ACTIVITY_RISK
  }

  return multiplier
}

export const calculate = (
  activity: Activity,
  individuals: Individual[],
  prevalence: Prevalence
): number => {
  const personRiskEach = calculatePersonRiskEach(prevalence)

  const activityRisk = calculateActivityRisk(activity)
  let totalPersonRiskCombine = 0
  for (let i = 0; i < individuals.length; i++) {
    for (let j = i + 1; j < individuals.length; j++) {
      let individualsPair = [individuals[i], individuals[j]]

      individualsPair = [individuals[j], individuals[i]]
      totalPersonRiskCombine += calculateActivityRisk(activity, individualsPair)
    }
  }

  const pointsNaive = personRiskEach * activityRisk
  if (pointsNaive < MAX_POINTS) {
    return pointsNaive
  }

  const riskMean = personRiskEach * activityRisk * 1e-6

  return riskMean
}
