import fs from 'fs'
import { parse } from 'csv-parse'
import * as path from 'path'

import { calculateActivityRisk, CalculatorData } from './calculate'
import { totalPopulation } from '../individuals/routines/data'

const test_data: CalculatorData = {
  riskBudget: 10000,
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

async function readData() {
  const csvFilePath = path.resolve(__dirname, './data/campinas_2020_21_cases.csv')
  const headers = [
    'epi_week',
    'date',
    'state',
    'city',
    'ibgeID',
    'newDeaths',
    'deaths',
    'newCases',
    'totalCases',
    'deaths_per_100k_inhabitants',
    'totalCases_per_100k_inhabitants',
    'deaths_by_totalCases'
  ]

  const data = fs.readFileSync(csvFilePath, { encoding: 'utf-8' })

  parse(
    data,
    {
      delimiter: ',',
      columns: headers
    },
    (error, result: CampinasCases[]) => {
      if (error) {
        console.error(error)
      }

      campinasCasesData = result
    }
  )
}

console.log(calculateActivityRisk(test_data))
