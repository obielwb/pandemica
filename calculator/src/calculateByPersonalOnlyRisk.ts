export interface CalculatorData {
  // Persistence
  persistedAt?: number

  // Prevalence - temos estes dados a partir da planilha de casos
  useManualEntry: number
  topLocation: string
  subLocation: string
  subSubLocation: string | null // non-US county
  population: string
  casesPastWeek: number
  casesIncreasingPercentage: number
  positiveCasePercentage: number | null
  prevalanceDataDate: Date
  percentFullyVaccinated: number | null
  unvaccinatedPrevalenceRatio: number | null
  averageFullyVaccinatedMultiplier: number | null

  // Person risk
  riskProfile: keyof typeof RiskProfile
  interaction: string
  personCount: number
  symptomsChecked: string

  // Activity risk
  setting: string
  distance: string
  duration: number
  theirMask: string
  yourMask: string
  voice: string

  // Vaccine
  yourVaccineType: string
  yourVaccineDoses: number

  theirVaccine: string

  // Preset scenario name
  scenarioName?: string
}

export const calculateLocationPersonAverage = (data: CalculatorData): number | null => {
  // prevalence

  const prevalence = calculateLocationReportedPrevalence(data)
  if (prevalence === null) {
    return null
  }

  try {
    const underreportingFactor = prevalenceRatio(
      data.positiveCasePercentage,
      data.prevalanceDataDate
    )

    const delayFactor = Math.min(
      1 + Math.max(0, data.casesIncreasingPercentage / 100),
      MAX_DELAY_FACTOR
    )

    // Points for "random person from X location"
    const personRisk = prevalence * underreportingFactor * delayFactor

    return personRisk * ONE_MILLION
  } catch (e) {
    return null
  }
}
