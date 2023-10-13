import { nanoid } from 'nanoid'

import { type Age } from './data'
import { type House, type Individual } from './individual'
import { fisherYatesShuffle, log } from './utilities'

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

export function assignAge(individuals: Individual[], ages: Age[]) {
  log('Assigning `age` to individuals', { time: true, timeLabel: 'ASSIGNMENT' })

  individuals = individuals.sort((a, b) => a.sex.localeCompare(b.sex))

  let index = 0
  ages.forEach((age) => {
    for (let i = 0; i < age.female; i++) individuals[index++].age = age.interval
  })

  ages.forEach((age) => {
    for (let i = 0; i < age.male; i++) {
      individuals[index++].age = age.interval
    }
  })

  log('', { timeEnd: true, timeLabel: 'ASSIGNMENT' })

  return fisherYatesShuffle(individuals)
}

export function assignHouse(
  individuals: Individual[],
  residentsPerHouse: Parameter[],
  regionsPopulation: Parameter[]
): Individual[] {
  log('Assigning `house` to individuals', { time: true, timeLabel: 'ASSIGNMENT' })

  let houses: House[] = []

  // categorization logic might need enhancements
  let children = individuals.filter(ind => ind.age[1] < 18);
  let youngAdults = individuals.filter(ind => ind.age[0] >= 18 && ind.age[1] < 40);
  let middleAge = individuals.filter(ind => ind.age[0] >= 40 && ind.age[1] <= 65);
  let elderly = individuals.filter(ind => ind.age[0] > 65);

  let couples: Individual[][] = [];

  while (youngAdults.length > 0) {
    let partnerA = youngAdults.pop();

    let partnerB = youngAdults.find(ind => ind.sex !== partnerA!.sex);

    if (partnerB) {
      youngAdults = youngAdults.filter(ind => ind !== partnerB);
      couples.push([partnerA!, partnerB]);
    } else if (partnerA) {
      houses.push({
        id: nanoid(),
        region: '',
        housemates: [partnerA]
      });
    }
  }

  couples.forEach(couple => {
    let numChildren = Math.floor(Math.random() * 3); // 0-2 children
    for (let i = 0; i < numChildren; i++) {
      if (children.length > 0) {
        let childIndex = Math.floor(Math.random() * children.length);
        couple.push(children[childIndex]);
        children.splice(childIndex, 1);
      }
    }
    houses.push({
      id: nanoid(),
      region: '',
      housemates: couple
    });
  });

  function selectHouseSize(residentsPerHouse: Parameter[]): number {
    const total = residentsPerHouse.reduce((acc, p) => acc + p.value, 0);
    const rand = Math.floor(Math.random() * total);
    let sum = 0;

    for (let p of residentsPerHouse) {
      sum += p.value;
      if (rand < sum) return p.label as number;
    }

    return residentsPerHouse[0].label as number;
  }

  [children, middleAge, elderly].forEach(group => {
    while (group.length > 0) {
      const houseSize = selectHouseSize(residentsPerHouse);
      const housemates: Individual[] = group.splice(0, houseSize);
      houses.push({
        id: nanoid(),
        region: '',
        housemates: housemates
      });
    }
  });

  let regionIndex = 0;
  houses.forEach(house => {
    house.region = String(regionsPopulation[regionIndex].label);
    regionIndex = (regionIndex + 1) % regionsPopulation.length;
  });

  houses.forEach(house => {
    house.housemates.forEach(individual => {
      individual.house = house;
    });
  });

  log('', { timeEnd: true, timeLabel: 'ASSIGNMENT' })

  return individuals;
}

export function assignTransportationVehicle(
  individuals: Individual[],
  busPercentage: number,
  carPercentage: number
) {
  log('Assigning `transportation vehicle` to individuals')
}

// apparently, there are more men then women in the data set
// this normalization function properly scales the different sex-based age groups
// to the total population while also normalizing the men-women difference, resulting
// in a accurate, scaled and proportional data set
export function normalizeAge(ages: Age[], totalPopulation: number, malePercentage: number) {
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

  let normalizedAges = ages.map((age, i) => {
    const agePercentage = agePercentages[i]

    return {
      interval: age.interval,
      female: Math.round(age.female + unagedIndividuals * agePercentage.female),
      male: Math.round(age.male + unagedIndividuals * agePercentage.male)
    }
  })

  const totalMales = Math.round(totalPopulation * (malePercentage / 100))
  const totalFemales = totalPopulation - totalMales

  let normalizedAgedFemales = normalizedAges.reduce((acc, age) => acc + age.female, 0)
  let normalizedAgedMales = normalizedAges.reduce((acc, age) => acc + age.male, 0)

  let normalizedAgedFemalesDifference = totalFemales - normalizedAgedFemales
  let normalizedAgedMalesDifference = totalMales - normalizedAgedMales

  const normalizedAgePercentages = normalizedAges.map((age) => {
    return {
      interval: age.interval,
      female: age.female / normalizedAgedFemales,
      male: age.male / normalizedAgedMales
    }
  })

  normalizedAges = normalizedAges.map((age, i) => {
    const agePercentage = normalizedAgePercentages[i]

    return {
      interval: age.interval,
      female: Math.round(age.female + normalizedAgedFemalesDifference * agePercentage.female),
      male: Math.round(age.male + normalizedAgedMalesDifference * agePercentage.male)
    }
  })

  normalizedAgedFemales = normalizedAges.reduce((acc, age) => acc + age.female, 0)
  normalizedAgedMales = normalizedAges.reduce((acc, age) => acc + age.male, 0)

  let stillUnagedFemales = totalFemales - normalizedAgedFemales
  for (let i = 0; stillUnagedFemales > 0; i = (i + 1) % normalizedAges.length) {
    normalizedAges[i].female++
    stillUnagedFemales--
  }

  let stillUnagedMales = totalMales - normalizedAgedMales
  for (let i = 0; stillUnagedMales > 0; i = (i + 1) % normalizedAges.length) {
    normalizedAges[i].male++
    stillUnagedMales--
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
