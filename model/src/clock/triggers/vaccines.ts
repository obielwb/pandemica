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
  ibgeID: number
  vaccine: VaccineType
  sex: Sex
  age: string
  dose: number
  pop2021: number
  count: number
}

export class VaccineTrigger {
  private vaccineRegisters: VaccineRegister[] = []

  public assign(currentDate: string, population: Individual[]) {
    if (this.vaccineRegisters !== null) {
      const registersOfTheDay = fasterFilter(
        this.vaccineRegisters,
        (data) => data.date === currentDate
      )

      for (const register of registersOfTheDay) {
        const matchCharacteristics = fasterFilter(
          population,
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
      log('Reading Vaccine Data', { time: true, timeLabel: 'INITIALIZATION' })

      const csvFilePath = path.resolve(
        path.join(__dirname, 'data', 'covid19', 'campinas_2021_vaccines.csv')
      )

      const content = fs.readFileSync(csvFilePath, { encoding: 'utf-8' }).split('\n').slice(1)

      const vaccineRegisters: VaccineRegister[] = []

      content.forEach((line) => {
        if (line.length > 0) {
          const [date, state, city, ibgeID, vaccine, sex, age, dose, pop2021, count] =
            line.split(',')

          const stringToVaccineMap = new Map<string, VaccineType>([
            ['Sinovac', VaccineType.CoronaVac],
            ['Janssen', VaccineType.Janssen],
            ['Pfizer/BioNTech', VaccineType.Pfizer],
            ['AstraZeneca', VaccineType.AstraZeneca]
          ])

          const register: VaccineRegister = {
            date: date,
            state: state,
            city: city,
            ibgeID: parseInt(ibgeID),
            vaccine: stringToVaccineMap[vaccine.split('-')[0].trim()],
            sex: sex == 'F' ? Sex.Female : Sex.Male,
            age: age,
            dose: parseInt(dose),
            pop2021: parseInt(pop2021),
            count: parseInt(count)
          }

          vaccineRegisters.push(register)
        }
      })

      return vaccineRegisters
    } catch (error) {
      log(error, { time: true, timeLabel: 'VACCINE IMPLEMENTATION ERROR' })
      return null
    }
  }
}
