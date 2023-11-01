import {
  Distance,
  FormValue,
  Interaction,
  PersonRiskValue,
  RiskProfile,
  RiskProfilesUnaffectedByVaccines,
  Setting,
  TheirMask,
  VaccineValue,
  Vaccines,
  Voice,
  YourMask,
  intimateDurationFloor,
  partnerMult,
  personRiskMultiplier
} from './data'
import { PartialData, prepopulated } from './prepopulated'

export interface CalculatorData {
  persistedAt?: number

  population: number
  casesPastWeek: number
  casesIncreasingPercentage: number
  positiveCasePercentage: number
  prevalanceDataDate: Date
  percentFullyVaccinated: number
  unvaccinatedPrevalenceRatio: number
  averageFullyVaccinatedMultiplier: number

  interaction: string
  personCount: number
  symptomsChecked: string

  setting: string
  distance: string
  duration: number
  theirMask: string
  yourMask: string
  voice: string

  yourVaccineType: string
  yourVaccineDoses: number

  theirVaccine: string
}

const MAX_DELAY_FACTOR = 2

export const DAY_0 = new Date(2020, 1, 12)
const MS_PER_DAY = 1000 * 60 * 60 * 24

// From https://covid19-projections.com/estimating-true-infections-revisited/
const prevalenceRatio = (positivityPercent: number, date: Date) => {
  const day_i = (date.getTime() - DAY_0.getTime()) / MS_PER_DAY
  if (positivityPercent === null || positivityPercent > 100) {
    // No positivity data, assume the worst.
    positivityPercent = 100
  }
  const positivityRate = positivityPercent / 100
  return (1000 / (day_i + 10)) * positivityRate ** 0.5 + 2
}

export const ONE_MILLION = 1e6 // 100% of chance of being contaminated with covid
export const MAX_ACTIVITY_RISK = partnerMult
export const MAX_POINTS = 100000

export const calculateLocationReportedPrevalence = (data: CalculatorData): number => {
  const population = data.population
  const lastWeek = data.casesPastWeek

  // additive smoothing, only relevant for super low case numbers
  const prevalence = (lastWeek + 1) / population
  return prevalence
}

export const calculateLocationPersonAverage = (data: CalculatorData): number => {
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

export const calculatePersonRiskEach = (data: CalculatorData): number => {
  const averagePersonRisk = calculateLocationPersonAverage(data)

  if (data.riskProfile === RiskProfilesUnaffectedByVaccines.HAS_COVID) {
    return ONE_MILLION
  }

  const unadjustedRisk = averagePersonRisk * individual.riskNumber

  if (data.percentFullyVaccinated === null || data.averageFullyVaccinatedMultiplier === null) {
    return unadjustedRisk
  }
  const fractionFullyVaccinated = data.percentFullyVaccinated / 100
  const unvaccinatedPrevalenceRatio =
    data.unvaccinatedPrevalenceRatio ??
    1 /
      (data.averageFullyVaccinatedMultiplier * fractionFullyVaccinated +
        (1 - fractionFullyVaccinated))

  switch (data.theirVaccine) {
    case 'vaccinated':
      return unadjustedRisk * unvaccinatedPrevalenceRatio * data.averageFullyVaccinatedMultiplier
    case 'unvaccinated':
      return unadjustedRisk * unvaccinatedPrevalenceRatio
    case 'undefined':
      return unadjustedRisk
    default:
      console.error(`Unrecognized vaccination state: ${data.theirVaccine}`)
      return null
  }

  // these are risk profiles that were set up for unvaccinated people.
  switch (data.theirVaccine) {
    case 'vaccinated':
      return unadjustedRisk * data.averageFullyVaccinatedMultiplier
    case 'unvaccinated':
      return unadjustedRisk
    case 'undefined':
      // data.unvaccinatedPrevalenceRatio is the average vaccine modifier
      // applied across the entire population, including unvaccinated
      // and partially vaccinated individuals
      //
      // see the comment above unvaccinated_relative_prevalence() in
      // update_prevalence.py for more details on how it is calculated
      return unadjustedRisk / unvaccinatedPrevalenceRatio
    default:
      console.error(`Unrecognized vaccination state: ${data.theirVaccine}`)
      return null
  }
}

const getVaccineMultiplier = (data: CalculatorData): number => {
  if (data.yourVaccineType === '') {
    return 1
  }
  const vaccineMultiplierPerDose = Vaccines[data.yourVaccineType].multiplierPerDose

  return vaccineMultiplierPerDose[data.yourVaccineDoses]
}

export const calculateActivityRisk = (data: CalculatorData): number => {
  const vaccineMultiplier = getVaccineMultiplier(data)

  if (data.interaction === 'partner' || data.interaction === 'repeated') {
    return Interaction[data.interaction].multiplier * vaccineMultiplier
  }

  let multiplier = Interaction[data.interaction].multiplier

  const mulFor = (table: { [key: string]: FormValue }, given: string): number =>
    given === '' ? 1 : table[given].multiplier

  let effectiveDuration = data.duration
  multiplier *= mulFor(Distance, data.distance)
  if (data.distance === 'intimate') {
    effectiveDuration = Math.max(effectiveDuration, intimateDurationFloor)
  } else {
    if (data.distance !== 'close') {
      multiplier *= mulFor(Setting, data.setting)
    }
    multiplier *= mulFor(Voice, data.voice)

    multiplier *= mulFor(TheirMask, data.theirMask)
    multiplier *= mulFor(YourMask, data.yourMask)
  }

  multiplier *= effectiveDuration / 60.0
  if (multiplier > MAX_ACTIVITY_RISK) {
    multiplier = MAX_ACTIVITY_RISK
  }

  return multiplier * vaccineMultiplier
}

export const calculate = (data: CalculatorData): number => {
  const personRiskEach = calculatePersonRiskEach(data)

  const activityRisk = calculateActivityRisk(data)

  const pointsNaive = personRiskEach * activityRisk
  if (pointsNaive < MAX_POINTS) {
    return pointsNaive
  }

  const riskMean = personRiskEach * activityRisk * 1e-6

  return riskMean
}
