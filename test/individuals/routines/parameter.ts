import { Age } from './data'
import { Individual } from './individual'
import { log } from './utilities'

export type Parameter = {
  label: string | number
  value: number
}

// generic assign and normalize functions
export const assign = (individuals: Individual[], label: string, parameter: Parameter[]) => {
  log('Assigning `' + label + '` to individuals', { time: true, timeLabel: 'ASSIGNMENT' })

  let index = 0
  parameter.forEach((entry) => {
    for (let i = 0; i < entry.value; i++) individuals[index++][label] = entry.label
  })

  log('', { timeEnd: true, timeLabel: 'ASSIGNMENT' })

  return individuals
}

export const normalize = (individuals: Individual[], label: string, parameter: Parameter[]) => {}

// specific assign and normalize functions
export const assignSex = (individuals: Individual[], malePercentage: number) => {
  log('Assigning `sex` to individuals', { time: true, timeLabel: 'ASSIGNMENT' })

  let i = 0
  for (; i < Math.round((malePercentage / 100) * individuals.length); i++)
    individuals[i].sex = 'male'

  for (; i < individuals.length; i++) individuals[i].sex = 'female'

  log('', { timeEnd: true, timeLabel: 'ASSIGNMENT' })

  return individuals
}

export const asignTransportationVehicle = (
  individuals: Individual[],
  busPercentage: number,
  carPercentage: number
) => {
  log('Assigning `transportation vehicle` to individuals')
}

export const normalizeAge = (ages: Age[], individuals: Individual[]) => {
  log('Normalizing `age`', { time: true, timeLabel: 'NORMALIZATION' })

  const agedIndividuals = ages.reduce((total, age) => total + age.female + age.male, 0)
  let agePercentages = ages.map((age) => {
    return {
      interval: age.interval,
      female: age.female / agedIndividuals,
      male: age.male / agedIndividuals
    }
  })

  const unagedIndividuals = individuals.length - agedIndividuals

  const normalizedAges = ages.map((age, i) => {
    const agePercentage = agePercentages[i]

    return {
      interval: age.interval,
      female: Math.round(age.female + unagedIndividuals * agePercentage.female),
      male: Math.round(age.male + unagedIndividuals * agePercentage.male)
    }
  })

  const normalizedAgesCount = normalizedAges.reduce(
    (total, normalizedAge) => total + normalizedAge.male + normalizedAge.female,
    0
  )

  let stillUnagedIndividuals = individuals.length - normalizedAgesCount
  while (stillUnagedIndividuals > 0) {
    for (let i = 0; i < stillUnagedIndividuals / 2; i = (i + 1) % normalizedAges.length) {
      normalizedAges[i].female++
      normalizedAges[i].male++
      stillUnagedIndividuals -= 2
    }
  }

  log('', { timeEnd: true, timeLabel: 'NORMALIZATION' })

  return normalizedAges
}

// da tabela
