import { nanoid } from 'nanoid'
import { Age, totalPopulation } from './data'
import { House, Individual } from './individual'
import { log } from './utilities'

export type Parameter = {
  label: string | number
  value: number
}

// generic assign and normalize functions
export function assign(individuals: Individual[], label: string, parameter: Parameter[]) {
  log('Assigning `' + label + '` to individuals', { time: true, timeLabel: 'ASSIGNMENT' })

  let index = 0
  parameter.forEach((entry) => {
    for (let i = 0; i < entry.value; i++) individuals[index++][label] = entry.label
  })

  log('', { timeEnd: true, timeLabel: 'ASSIGNMENT' })

  return individuals
}

export function normalize(label: string, parameter: Parameter[], totalPopulation: number) {
  log('Normalizing `' + label + '`', { time: true, timeLabel: 'NORMALIZATION' })

  const labeledIndividuals = parameter.reduce((acc, p) => acc + p.value, 0)
  let labelPercentages = parameter.map((p) => p.value / labeledIndividuals)

  const unlabeledIndividuals = totalPopulation - labeledIndividuals

  const normalizedLabels = parameter.map((p, i) => {
    const labelPercentage = labelPercentages[i]
    return {
      label: p.label,
      value: Math.round(p.value + unlabeledIndividuals * labelPercentage)
    }
  })

  const normalizedLabeledIndividuals = normalizedLabels.reduce(
    (acc, normalizedLabel) => acc + normalizedLabel.value,
    0
  )

  let stillUnlabeledIndividuals = totalPopulation - normalizedLabeledIndividuals
  while (stillUnlabeledIndividuals > 0) {
    for (
      let i = 0;
      i < stillUnlabeledIndividuals / parameter.length;
      i = (i + 1) % normalizedLabels.length
    ) {
      normalizedLabels[i].value++
      stillUnlabeledIndividuals--
    }
  }

  log('', { timeEnd: true, timeLabel: 'NORMALIZATION' })

  return normalizedLabels
}

// specific assign and normalize functions
export function assignSex(individuals: Individual[], malePercentage: number) {
  log('Assigning `sex` to individuals', { time: true, timeLabel: 'ASSIGNMENT' })

  let i = 0
  for (; i < Math.round((malePercentage / 100) * individuals.length); i++)
    individuals[i].sex = 'male'

  for (; i < individuals.length; i++) individuals[i].sex = 'female'

  log('', { timeEnd: true, timeLabel: 'ASSIGNMENT' })

  return individuals
}

export function assignHouse(
  individuals: Individual[],
  residentsPerHouse: Parameter[],
  regionsPopulation: Parameter[]
): Individual[] {
  log('Assigning `house` to individuals', { time: true, timeLabel: 'ASSIGNMENT' })

  const houses: House[] = []

  const normalizedResidentsPerHouse = normalizeResidentsPerHouse(residentsPerHouse, totalPopulation)

  for (let i = 0; i < normalizedResidentsPerHouse.length; i++) {
    for (let j = 0; j < normalizedResidentsPerHouse[i].value; j++) {
      const house = {
        id: nanoid(),
        region: '',
        residents: normalizedResidentsPerHouse[i].label as number
      }

      for (let k = 0; k < (normalizedResidentsPerHouse[i].label as number); k++) houses.push(house)
    }
  }

  // Fisher-Yates shuffle
  let i = houses.length,
    j: number,
    house: House

  while (i) {
    j = Math.floor(Math.random() * i--)
    house = houses[i]
    houses[i] = houses[j]
    houses[j] = house
  }

  const normalizedRegions = normalize('region', regionsPopulation, totalPopulation)
  let index = 0
  normalizedRegions.forEach((entry) => {
    for (let i = 0; i < entry.value; i++) houses[index++].region = entry.label as string
  })

  log('', { timeEnd: true, timeLabel: 'NORMALIZATION' })

  for (let i = 0; i < individuals.length; i++) individuals[i].house = houses[i]

  return individuals
}

export function assignTransportationVehicle(
  individuals: Individual[],
  busPercentage: number,
  carPercentage: number
) {
  log('Assigning `transportation vehicle` to individuals')
}

export function normalizeAge(ages: Age[], totalPopulation: number) {
  log('Normalizing `age`', { time: true, timeLabel: 'NORMALIZATION' })

  const agedIndividuals = ages.reduce((acc, age) => acc + age.female + age.male, 0)
  let agePercentages = ages.map((age) => {
    return {
      interval: age.interval,
      female: age.female / agedIndividuals,
      male: age.male / agedIndividuals
    }
  })

  const unagedIndividuals = totalPopulation - agedIndividuals

  const normalizedAges = ages.map((age, i) => {
    const agePercentage = agePercentages[i]

    return {
      interval: age.interval,
      female: Math.round(age.female + unagedIndividuals * agePercentage.female),
      male: Math.round(age.male + unagedIndividuals * agePercentage.male)
    }
  })

  const normalizedAgedIndividuals = normalizedAges.reduce(
    (acc, normalizedAge) => acc + normalizedAge.male + normalizedAge.female,
    0
  )

  let stillUnagedIndividuals = totalPopulation - normalizedAgedIndividuals
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

export function normalizeResidentsPerHouse(
  residentsPerHouse: Parameter[],
  totalPopulation: number
) {
  log('Normalizing `residentsPerHouse`', { time: true, timeLabel: 'NORMALIZATION' })

  const labeledIndividuals = residentsPerHouse.reduce(
    (acc, p) => acc + p.value * (p.label as number),
    0
  )

  let labelPercentages = residentsPerHouse.map(
    (p) => (p.value * (p.label as number)) / labeledIndividuals
  )

  const unlabeledIndividuals = totalPopulation - labeledIndividuals

  const normalizedLabels = residentsPerHouse.map((p, i) => {
    const labelPercentage = labelPercentages[i]
    return {
      label: p.label,
      value: Math.round(p.value + unlabeledIndividuals * labelPercentage)
    }
  })

  let stillUnlabeledIndividuals =
    normalizedLabels.reduce((acc, p) => acc + p.value * (p.label as number), 0) - totalPopulation
  while (stillUnlabeledIndividuals > 0) {
    for (
      let i = 0;
      i < stillUnlabeledIndividuals / residentsPerHouse.length;
      i = (i + 1) % normalizedLabels.length
    ) {
      normalizedLabels[i].value--
      stillUnlabeledIndividuals -= normalizedLabels[i].label as number
    }
  }

  log('', { timeEnd: true, timeLabel: 'NORMALIZATION' })

  return normalizedLabels
}
