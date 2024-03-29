import * as fs from 'fs'
import * as path from 'path'
import { log } from '../../src/utilities'

export type PandemicRegister = {
  epiWeek: number
  date: string
  newDeaths: number
  deaths: number
  newCases: number
  totalCases: number
  deathsPer100kInhabitants: number
  totalCasesPer100kInhabitants: number
  deathsByTotalCases: number
}

export function readPandemicData(years: number[] = [2020, 2021, 2022]): PandemicRegister[] {
  try {
    log('Reading pandemic registers', { time: true, timeLabel: 'INITIALIZATION' })

    const csvFilePath = path.resolve(
      __dirname.replace('src', 'data/covid19'),
      'campinas_2020_2021_2022_cases.csv'
    )

    const content = fs.readFileSync(csvFilePath, { encoding: 'utf-8' }).split('\n').slice(1)

    const pandemicRegisters: PandemicRegister[] = []

    content.forEach((line) => {
      if (line.length > 0) {
        const [
          epi_week,
          date,
          state, // unused but read
          city, // unused but read
          ibgeID, // unused but read
          newDeaths,
          deaths,
          newCases,
          totalCases,
          deaths_per_100k_inhabitants,
          totalCases_per_100k_inhabitants,
          deaths_by_totalCases
        ] = line.split(',')

        const register: PandemicRegister = {
          epiWeek: parseInt(epi_week),
          date,
          newDeaths: parseInt(newDeaths),
          deaths: parseInt(deaths),
          newCases: parseInt(newCases),
          totalCases: parseInt(totalCases),
          deathsPer100kInhabitants: parseFloat(deaths_per_100k_inhabitants),
          totalCasesPer100kInhabitants: parseFloat(totalCases_per_100k_inhabitants),
          deathsByTotalCases: parseFloat(deaths_by_totalCases)
        }

        if (years.some((year) => register.date.includes(year.toString())))
          pandemicRegisters.push(register)
      }
    })

    return pandemicRegisters
  } catch (error) {
    log('Error when reading pandemic registers', {
      time: true,
      timeLabel: 'INITIALIZATION',
      error: error
    })
    return null
  }
}
