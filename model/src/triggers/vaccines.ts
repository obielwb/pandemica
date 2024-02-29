import * as fs from 'fs'
import * as path from 'path'
import { parse } from 'csv-parse'
import { Individual } from '../individual'
import { log, shuffle } from '../utilities'
import { VaccineType } from '../data'

/*
  Note: this code is used for validation purpose only.
*/

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

export class VaccineTrigger {
  private vaccineRegisters: VaccineRegister[]

  constructor(public population: Individual[]) {}

  public assign(currentDate: string) {
    if (this.vaccineRegisters !== null) {
      const registersOfTheDay = this.vaccineRegisters.filter((data) => data.date === currentDate)

      for (const register of registersOfTheDay) {
        const matchCharacteristics = this.population.filter(
          (individual) =>
            register.age.includes(individual.age[0].toString()) &&
            individual.sex === register.sex &&
            individual.vaccine.doses === register.dose - 1 && // only people with first dose takes the second dose vaccine
            (individual.vaccine.type === register.vaccine || individual.vaccine.type === 'none')
        )

        const shuffledIndividuals = shuffle(matchCharacteristics)
        const selectedIndividuals = shuffledIndividuals.slice(0, register.count)

        for (const individual of selectedIndividuals) {
          individual.vaccine.type = register.vaccine as VaccineType
          individual.vaccine.doses = register.dose
        }
      }
    }
  }

  public async readVaccineData() {
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

                if (context.column == 'sex' && columnValue == 'F') return 'female'
                if (context.column == 'sex' && columnValue == 'M') return 'male'

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
      this.vaccineRegisters = result
    } catch (error) {
      log(error, { time: true, timeLabel: 'VACCINE IMPLEMENTATION ERROR' })
      return null
    }
  }
}
