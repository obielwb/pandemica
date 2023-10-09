import fs from 'fs'
import { parse } from 'csv-parse'
import * as path from 'path'

import { calculateActivityRisk, CalculatorData } from './calculate'
import { totalPopulation } from '../individuals/routines/data'
import { Individual } from '../individuals/routines/individual'

const test_data: CalculatorData = {
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

type CampinasCases = {
  epi_week: number
  date: string
  state: string
  city: string
  ibgeID: string
  newDeaths: number
  deaths: number
  newCases: number
  totalCases: number
  deaths_per_100k_inhabitants: number
  totalCases_per_100k_inhabitants: number
  deaths_by_totalCases: number
}

let campinasCasesData: CampinasCases[] = []

const individual_one = new Individual()
const individual_two = new Individual()
