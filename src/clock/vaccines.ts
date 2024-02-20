import * as fs from 'fs'
import * as path from 'path'
import { parse } from 'csv-parse'
import { Individual } from '../individual'
import { log } from '../utilities'
import { time } from 'console'

type VaccineRegister = {
  date: string
  state: string
  city: string
  ibgeID: string
  vaccine: string
  sex: string
  age: string
  dose: number
  pop2021: number
  count: number
}

export async function readVaccineData() {
  try {
    const csvFilePath = path.resolve(__dirname, 'datacovid19campinas_2021_vaccines.csv')
    const headers = [
      'date',
      'state',
      'city',
      'ibgeID',
      'vaccine',
      'sex',
      'age',
      'dose',
      'pop2021',
      'count'
    ]

    const content = await fs.promises.readFile(csvFilePath, { encoding: 'utf-8' })

    const parseData = () =>
      new Promise<VaccineRegister[]>((resolve, reject) => {
        parse(
          content,
          {
            delimiter: ',',
            columns: headers,
            fromLine: 2,
            cast: (columnValue, context) => {
              if (
                context.column == 'count' ||
                context.column == 'pop2021' ||
                context.column == 'dose'
              ) {
                return parseInt(columnValue)
              }

              return columnValue
            }
          },
          (error, result: VaccineRegister[]) => {
            if (error) reject(error)
            else resolve(result)
          }
        )
      })

    const result = await parseData()
    return result
  } catch (error) {
    log(error, { time: true, timeLabel: 'VACCINE IMPLEMENTATION ERROR' })
    return null
  }
}

export async function implementVaccines(
  day: number,
  month: number,
  year: number,
  population: Individual[]
) {
  const vaccineRegisters = await readVaccineData()
  if (vaccineRegisters !== null) {
    for (const register of vaccineRegisters) {
    }
  }
}
