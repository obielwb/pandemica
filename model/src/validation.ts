import { PandemicRegister } from '../data/covid19'

export type PandemicOverview = {
  totalCases: number
  totalDeaths: number
}

export function calculateModelAccuracyByTimeConsistency(
  pandemicRegisters: PandemicRegister[],
  simulatedPandmicRegisters: PandemicRegister[]
) {
  // acceptable errors for each attribute
  const thresholds = {
    newDeaths: 1,
    newCases: 1
  }
}

export function calculateModelAccuracyByTotalNumbers(
  pandemicOverview: PandemicOverview,
  simulatedPandemicOverview: PandemicOverview
): { casesAccuary: number; deathsAccuracy: number } {
  const casesAccuracy = (simulatedPandemicOverview.totalCases / pandemicOverview.totalCases) * 100
  const deathsAccuracy =
    (simulatedPandemicOverview.totalDeaths / pandemicOverview.totalDeaths) * 100

  return {
    casesAccuary: casesAccuracy,
    deathsAccuracy: deathsAccuracy
  }
}
