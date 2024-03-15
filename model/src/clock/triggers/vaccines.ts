import * as fs from 'fs'
import * as path from 'path'
import { parse } from 'csv-parse'
import { Individual, Sex } from '../../population/individual'
import { fasterFilter, fisherYatesShuffle, log } from '../../utilities'
import { VaccineType } from '../../calculus/data'

/*
  Note: this code is used for validation purposes only
*/

type VaccineRegister = {
  date: string
  state: string
  city: string
  ibgeID: string
  vaccine: VaccineType
  sex: Sex
  age: string
  dose: number
  pop2021: number
  count: number
}

export class VaccineTrigger {
  private vaccineRegisters: VaccineRegister[] = []

  constructor(public population: Individual[]) {}

  public assign(currentDate: string) {
    if (this.vaccineRegisters !== null) {
      const registersOfTheDay = fasterFilter(
        this.vaccineRegisters,
        (data) => data.date === currentDate
      )

      for (const register of registersOfTheDay) {
        const matchCharacteristics = fasterFilter(
          this.population,
          (individual) =>
            register.age.includes(individual.age[0].toString()) &&
            individual.sex === register.sex &&
            individual.vaccine.doses === register.dose - 1 && // only people with first dose takes the second dose vaccine
            (individual.vaccine.type === register.vaccine ||
              individual.vaccine.type === VaccineType.None)
        )

        const shuffledIndividuals = fisherYatesShuffle(matchCharacteristics)
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
      const csvFilePath = path.resolve(
        path.join(__dirname, 'data', 'covid19', 'campinas_2021_vaccines.csv')
      )
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
                  context.column === 'count' ||
                  context.column === 'pop2021' ||
                  context.column === 'dose'
                ) {
                  return parseInt(columnValue)
                }

                if (context.column === 'sex' && columnValue == 'F') return Sex.Female
                if (context.column === 'sex' && columnValue == 'M') return Sex.Male

                if (context.column === 'vaccine') {
                  switch (columnValue) {
                    case 'Sinovac':
                      return VaccineType.CoronaVac
                    case 'Janssen':
                      return VaccineType.Janssen
                    case 'Pfizer/BioNTech':
                      return VaccineType.Pfizer
                    case 'AstraZeneca':
                      return VaccineType.AstraZeneca
                    default:
                      return VaccineType.None
                  }
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
      this.vaccineRegisters = result
    } catch (error) {
      log(error, { time: true, timeLabel: 'VACCINE IMPLEMENTATION ERROR' })
      return null
    }
  }
}
