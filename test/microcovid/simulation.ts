import { calculateActivityRisk, CalculatorData } from './calculate'
import { totalPopulation } from '../individuals/routines/data'

const test_data: CalculatorData = {
  riskBudget: 0,
  useManualEntry: 0,
  topLocation: '',
  subLocation: '',
  subSubLocation: null,
  population: totalPopulation.toString(),
  casesPastWeek: 1918,
  casesIncreasingPercentage: 0,
  positiveCasePercentage: 2,
  prevalanceDataDate: new Date(),
  percentFullyVaccinated: 0,
  unvaccinatedPrevalenceRatio: 100,
  averageFullyVaccinatedMultiplier: null,
  riskProfile: 'average',
  interaction: 'repeated',
  personCount: 2,
  symptomsChecked: '',
  setting: 'indoor',
  distance: 'normal',
  duration: 60,
  theirMask: 'none',
  yourMask: 'none',
  voice: 'normal',
  yourVaccineType: '',
  yourVaccineDoses: 0,
  theirVaccine: 'undefined'
}

const result = calculateActivityRisk(test_data)

console.log(result)
