import { type Age } from '../data/census'
import { House, Occupation, type Individual } from './individual'
import { fisherYatesShuffle, log } from './utilities'

export type Parameter = {
  label: string | number | string[] | number[]
  value: number
}

// base generic conception of assign and normalize functions
// the specific and parameter-customized implementations bellow
// follow the same ideas of these basic implementations
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

  let houseIds = 0
  residentsPerHouse.forEach((house) => {
    for (let i = 0; i < house.value; i++) {
      houses.push(new House(houseIds++, '', house.label as number, []))
    }
  })

  const houseRegions = normalize('region', regionsPopulation, houses.length)

  let index = 0
  houseRegions.forEach((region) => {
    for (let i = 0; i < region.value; i++) {
      houses[index++].region = region.label as string
    }
  })

  individuals = fisherYatesShuffle(individuals)
  houses = fisherYatesShuffle(houses)

  const underageIndividuals = individuals.filter((individual) => individual.age[1] <= 19)
  const ofAgeIndividuals = individuals.filter((individual) => individual.age[0] >= 20)

  let ofAgeIndex = 0
  let underageIndex = 0

  houses.forEach((house) => {
    if (ofAgeIndex < ofAgeIndividuals.length) {
      house.housemates.push(ofAgeIndividuals[ofAgeIndex].id)
      ofAgeIndividuals[ofAgeIndex++].house = house
    }
  })

  houses = fisherYatesShuffle(houses)

  houses.forEach((house) => {
    let remainingSpace = house.size - house.housemates.length

    while (remainingSpace > 0) {
      if (ofAgeIndex < ofAgeIndividuals.length) {
        house.housemates.push(ofAgeIndividuals[ofAgeIndex].id)
        ofAgeIndividuals[ofAgeIndex++].house = house
      } else if (underageIndex < underageIndividuals.length) {
        house.housemates.push(underageIndividuals[underageIndex].id)
        underageIndividuals[underageIndex++].house = house
      }
      remainingSpace--
    }
  })

  log('', { timeEnd: true, timeLabel: 'ASSIGNMENT' })

  return fisherYatesShuffle([...underageIndividuals, ...ofAgeIndividuals])
}

// didn't work properly
export function assignIncomeByNormalDistributionFunction(
  individuals: Individual[],
  ages: Age[],
  incomes: Parameter[]
) {
  const zeroIncome = incomes.find((income) => income.label[1] === 0)!
  const zeroIncomeIndex = incomes.indexOf(zeroIncome)
  const underageIndividuals = individuals.filter((individual) => individual.age[1] <= 19)

  underageIndividuals.forEach((individual) => {
    individual.income = zeroIncome.label as number[]
    incomes[zeroIncomeIndex].value--
  })

  const ofAgeIndividuals = individuals.filter((individual) => individual.age[0] >= 20)
  ofAgeIndividuals.sort((a, b) => a.age[0] - b.age[0])

  const ofAgeIndividualsAgeLabels = ages.filter((age) => age.interval[0] >= 20)

  const middleAge = ofAgeIndividualsAgeLabels[Math.floor(ofAgeIndividualsAgeLabels.length / 2)]

  const weightedIncomes = incomes.map((income) => {
    return { ...income, weight: income.value / ofAgeIndividuals.length }
  })
  weightedIncomes.sort((a, b) => a.weight[0] - b.weight[0])

  const cumulativeWeights: number[] = []
  let cumulativeWeight = 0

  for (const income of weightedIncomes) {
    cumulativeWeight += income.weight
    cumulativeWeights.push(cumulativeWeight)
  }

  const incomeMean = (income: Parameter) => {
    return (
      (income.label[0] + (income.label[1] === Infinity ? 0 : income.label[1])) /
      (income.label[1] === Infinity ? 1 : 2)
    )
  }

  const totalIncome = incomes.reduce((sum, income) => sum + incomeMean(income) * income.value, 0)
  const totalIndividuals = incomes.reduce((sum, income) => sum + income.value, 0)
  const meanIncome = totalIncome / totalIndividuals

  const variance =
    incomes.reduce((varianceSum, income) => {
      const diff = incomeMean(income) * income.value - meanIncome
      return varianceSum + diff * diff * income.value
    }, 0) / totalIndividuals

  const stdDevIncome = Math.sqrt(variance)

  console.log(meanIncome, stdDevIncome)

  ofAgeIndividuals.forEach((individual) => {
    const ageFactor =
      (middleAge.interval[0] - individual.age[0] + middleAge.interval[1] - individual.age[1]) / 100

    // probability density function
    const pdf = (x: number, mean: number, stdDev: number) =>
      Math.exp(-((x - mean) ** 2) / (2 * stdDev ** 2)) / (stdDev * Math.sqrt(2 * Math.PI))

    const incomeProbabilities = incomes.map((income) => ({
      income: income.label as number[],
      probability: pdf(income.label[0], meanIncome, stdDevIncome)
    }))

    const totalProbability = incomeProbabilities.reduce(
      (sum, { probability }) => sum + probability,
      0
    )
    incomeProbabilities.forEach((prob) => (prob.probability /= totalProbability))

    const randomValue = Math.random()
    let cumulativeProbability = 0

    for (const { income, probability } of incomeProbabilities) {
      cumulativeProbability += probability
      if (randomValue <= cumulativeProbability) {
        individual.income = income
        break
      }
    }

    const index = incomes.findIndex((income) => income.label === individual.income)
    if (index !== -1) {
      incomes[index].value--
    }
  })

  console.log(
    ofAgeIndividuals.filter((individual) => individual.age[1] === 24 && individual.income[0] === 20)
      .length
  )

  return fisherYatesShuffle([...underageIndividuals, ...ofAgeIndividuals])
}

// didn't work properly as well
export function assignIncomeByCumulativeDistributionFunction(
  individuals: Individual[],
  ages: Age[],
  incomes: Parameter[]
) {
  const underageIndividuals = individuals.filter((ind) => ind.age[1] <= 19)
  underageIndividuals.forEach((ind) => (ind.income = [0, 0]))

  // weighted average for income
  let totalValue = 0,
    totalWeight = 0
  incomes.forEach((income) => {
    const midpoint =
      income.label[1] === Infinity ? income.label[0] * 2 : (income.label[0] + income.label[1]) / 2
    totalValue += income.value * midpoint
    totalWeight += income.value
  })

  let cumulativeValue = 0
  const cdf = incomes.map((income) => {
    cumulativeValue += income.value
    return { label: income.label, cumulativeValue }
  })

  const ofAgeIndividuals = individuals
    .filter((ind) => ind.age[0] >= 20)
    .map((individual) => {
      let randomValue = Math.random() * totalWeight
      for (const income of cdf) {
        if (randomValue <= income.cumulativeValue) {
          individual.income =
            income.label[1] === Infinity ? income.label[0] : (income.label[0] + income.label[1]) / 2
          break
        }
      }
    })

  return fisherYatesShuffle([...underageIndividuals, ...ofAgeIndividuals])
}

// didn't work too
export function assignIncomeByGaussianDistribution(
  individuals: Individual[],
  incomes: Parameter[]
) {
  const zeroIncome = incomes.find((income) => income.label[1] === 0)!
  const zeroIncomeIndex = incomes.indexOf(zeroIncome)
  const underageIndividuals = individuals.filter((individual) => individual.age[1] <= 19)

  underageIndividuals.forEach((individual) => {
    individual.income = zeroIncome.label as number[]
    incomes[zeroIncomeIndex].value--
  })

  const ofAgeIndividuals = individuals.filter((individual) => individual.age[0] >= 20)
  ofAgeIndividuals.sort((a, b) => a.age[0] - b.age[0])

  const middleOfAgeAge = [50, 54]
  function incomeProbability(age: number[], incomeLabel: number[]) {
    const distance = Math.max(middleOfAgeAge[0] - age[0], age[1] - middleOfAgeAge[1], 0)
    const incomeFactor = incomeLabel[1]
    return Math.exp(-Math.pow(distance, 2) / 10) / incomeFactor
  }

  ofAgeIndividuals.forEach((individual) => {
    const probabilities = incomes.map((income) => ({
      income: income,
      probability:
        income.value > 0 ? incomeProbability(individual.age, income.label as number[]) : 0
    }))

    probabilities.sort((a, b) => b.probability - a.probability)

    const selectedIncome = probabilities.find((p) => p.probability > 0)?.income
    if (selectedIncome) {
      individual.income = selectedIncome.label as number[]
      incomes[incomes.findIndex((income) => income.label === selectedIncome.label)].value--
    }
  })

  console.log(
    ofAgeIndividuals.filter((individual) => individual.age[1] === 54 && individual.income[0] === 20)
      .length
  )

  return fisherYatesShuffle([...underageIndividuals, ...ofAgeIndividuals])
}

// simplistic approach, age does not affect income
export function assignIncome(individuals: Individual[], incomes: Parameter[]) {
  log('Assigning `income` to individuals', { time: true, timeLabel: 'ASSIGNMENT' })

  const zeroIncome = incomes.find((income) => income.label[1] === 0)!
  const zeroIncomeIndex = incomes.indexOf(zeroIncome)
  const underageIndividuals = individuals.filter((individual) => individual.age[1] <= 19)

  underageIndividuals.forEach((individual) => {
    individual.income = zeroIncome.label as number[]
    incomes[zeroIncomeIndex].value--
  })

  const ofAgeIndividuals = individuals.filter((individual) => individual.age[0] >= 20)

  const weightedIncomes = incomes.map((income) => {
    return {
      ...income,
      probability: income.value / ofAgeIndividuals.length
    }
  })

  weightedIncomes.sort((a, b) => a.probability - b.probability)

  for (let i = 1; i < weightedIncomes.length; i++) {
    weightedIncomes[i].probability += weightedIncomes[i - 1].probability
  }

  ofAgeIndividuals.sort((a, b) => {
    const aHasWork = a.occupationTypes.some((occupationType) => occupationType === 'work')
    const bHasWork = b.occupationTypes.some((occupationType) => occupationType === 'work')

    if (aHasWork === bHasWork) {
      const educationRank = { graduate: 3, undergraduate: 2, educated: 1 }

      const aEducationRank = educationRank[a.educationStatus] || 0
      const bEducationRank = educationRank[b.educationStatus] || 0

      return bEducationRank - aEducationRank
    }

    return aHasWork ? -1 : 1
  })

  ofAgeIndividuals.forEach((individual, i) => {
    let selectedIncome

    const hasWork = individual.occupationTypes.includes('work')

    while (!selectedIncome) {
      selectedIncome = weightedIncomes.find((income) => {
        if (hasWork) {
          return Math.random() <= income.probability && income.value > 0 && income.label[0] > 0
        }

        return Math.random() <= income.probability && income.value > 0
      })
    }

    if (selectedIncome) {
      individual.income = selectedIncome.label as number[]
      weightedIncomes[weightedIncomes.findIndex((income) => income === selectedIncome)].value--
    }
  })

  log('', { timeEnd: true, timeLabel: 'ASSIGNMENT' })

  return fisherYatesShuffle([...underageIndividuals, ...ofAgeIndividuals])
}

export function assignEducationStatus(
  individuals: Individual[],
  preschoolers: Parameter,
  middleSchoolers: Parameter,
  highSchoolers: Parameter,
  undergradStudents: Parameter,
  gradStudents: Parameter,
  alreadyAttended: number,
  neverAttended: number
) {
  log('Assigning `educationStatus` to individuals', { time: true, timeLabel: 'ASSIGNMENT' })

  function assignEducationLevel(
    individuals: Individual[],
    ageRangeParameter: Parameter,
    studyLevelLabel: string
  ) {
    return individuals.map((individual) => {
      if (
        individual.age[0] >= ageRangeParameter.label[0] &&
        individual.age[1] <= ageRangeParameter.label[1] &&
        ageRangeParameter.value > 0
      ) {
        individual.educationStatus = studyLevelLabel
        individual.occupationTypes = ['study']
        ageRangeParameter.value--
      }
      return individual
    })
  }

  individuals = assignEducationLevel(individuals, preschoolers, 'preschool')
  individuals = assignEducationLevel(individuals, middleSchoolers, 'middle_school')
  individuals = assignEducationLevel(individuals, highSchoolers, 'high_school')
  individuals = assignEducationLevel(individuals, undergradStudents, 'undergraduate')
  individuals = assignEducationLevel(individuals, gradStudents, 'graduate')

  individuals.forEach((individual) => {
    if (!individual.educationStatus && individual.age[1] <= highSchoolers.label[1]) {
      if (neverAttended > 0) {
        individual.educationStatus = 'unschooled'
        neverAttended--
      }
    }
  })

  individuals.forEach((individual) => {
    if (!individual.educationStatus && individual.age[0] > highSchoolers.label[1]) {
      if (neverAttended > 0) {
        individual.educationStatus = 'unschooled'
        neverAttended--
      } else if (alreadyAttended > 0) {
        individual.educationStatus = 'educated'
        alreadyAttended--
      }
    }
  })

  log('', { timeEnd: true, timeLabel: 'ASSIGNMENT' })

  return individuals
}

export function assignTransportationMean(
  individuals: Individual[],
  housesWithVehicles: number
): Individual[] {
  log('Assigning `transportationMean` to individuals', { time: true, timeLabel: 'ASSIGNMENT' })

  individuals.sort((a, b) => b.income[0] - a.income[0])

  const individualMap = new Map<number, Individual>()
  individuals.forEach((individual) => individualMap.set(individual.id, individual))

  const individualsWithTransportationMean: Individual[] = []

  const processedHouses = new Set<number>()

  individuals.forEach((individual) => {
    if (!processedHouses.has(individual.house.id)) {
      individual.house.housemates.forEach((individualId) => {
        const individual = individualMap.get(individualId)!

        if (housesWithVehicles > 0) {
          individual.transportationMean = 'private'
          housesWithVehicles--
        } else {
          individual.transportationMean = 'public'
        }

        individualsWithTransportationMean.push(individual)
      })

      processedHouses.add(individual.house.id)
    }
  })

  log('', { timeEnd: true, timeLabel: 'ASSIGNMENT' })

  return individualsWithTransportationMean
}

export function assignStudyOccupations(
  individuals: Individual[],
  preschools: number,
  middleSchools: number,
  highSchools: number,
  colleges: number
) {
  log('Assigning `studyOccupations` to individuals', { time: true, timeLabel: 'ASSIGNMENT' })

  const preschoolStudents = individuals.filter(
    (individual) => individual.educationStatus === 'preschool'
  )
  const middleSchoolStudents = individuals.filter(
    (individual) => individual.educationStatus === 'middle_school'
  )
  const highSchoolStudents = individuals.filter(
    (individual) => individual.educationStatus === 'high_school'
  )
  const collegeStudents = individuals.filter(
    (individual) =>
      individual.educationStatus === 'undergraduate' || individual.educationStatus === 'graduate'
  )
  const nonStudents = individuals.filter(
    (individual) =>
      individual.educationStatus === 'unschooled' || individual.educationStatus === 'educated'
  )

  const sites: Occupation[] = []

  let siteIds = 0
  ;[
    {
      label: 'preschool',
      studentsPerSite: Math.ceil(preschoolStudents.length / preschools),
      totalSites: preschools
    },
    {
      label: 'middle_school',
      studentsPerSite: Math.ceil(middleSchoolStudents.length / middleSchools),
      totalSites: middleSchools
    },
    {
      label: 'high_school',
      studentsPerSite: Math.ceil(highSchoolStudents.length / highSchools),
      totalSites: highSchools
    },
    {
      label: 'college',
      studentsPerSite: Math.ceil(collegeStudents.length / colleges),
      totalSites: colleges
    }
  ].forEach((educationalLevel) => {
    for (let i = 0; i < educationalLevel.totalSites; i++) {
      const size = educationalLevel.studentsPerSite
      sites.push(new Occupation(siteIds++, 'study', educationalLevel.label, [size, size], size))
    }
  })

  const siteData = {
    preschool: {
      index: 0,
      students: preschoolStudents
    },
    middle_school: {
      index: 0,
      students: middleSchoolStudents
    },
    high_school: {
      index: 0,
      students: highSchoolStudents
    },
    college: {
      index: 0,
      students: collegeStudents
    }
  }

  sites.forEach((site) => {
    let { index, students } = siteData[site.label]

    for (let i = 0; i < site.actualSize; i++)
      if (index < students.length) students[index++].occupations = [site]

    siteData[site.label] = {
      index,
      students
    }
  })

  log('', { timeEnd: true, timeLabel: 'ASSIGNMENT' })

  return {
    individuals: [
      ...nonStudents,
      ...siteData.preschool.students,
      ...siteData.middle_school.students,
      ...siteData.high_school.students,
      ...siteData.college.students
    ],
    lastOccupationId: siteIds
  }
}

export function assignWorkOccupations(
  individuals: Individual[],
  lastOccupationId: number,
  industries: Parameter[],
  industriesEmployees: number[][],
  commerceAndServices: Parameter[],
  commerceAndServicesEmployees: number[][]
) {
  log('Assigning `workOccupations` to individuals', { time: true, timeLabel: 'ASSIGNMENT' })

  const RETIRED_AGE = 64

  const workers = fisherYatesShuffle(
    individuals.filter((individual) => individual.age[0] > 19 && individual.age[1] <= RETIRED_AGE)
  )
  const nonWorkers = individuals.filter(
    (individual) => individual.age[1] <= 19 || individual.age[0] > RETIRED_AGE
  )

  let siteIds = lastOccupationId
  function createWorkstations(categories: Parameter[], employeesRanges: number[][]): Occupation[] {
    const workstations: Occupation[] = []
    categories.forEach((category, index) => {
      const [minEmployees, maxEmployees] = employeesRanges[index]

      for (let i = 0; i < category.value; i++) {
        const workstation = new Occupation(
          siteIds++,
          'work',
          'work.' + category.label,
          [minEmployees, maxEmployees],
          0
        )

        workstations.push(workstation)
      }
    })

    return workstations
  }

  const industryWorkstations = createWorkstations(industries, industriesEmployees)

  const commerceAndServicesWorkstations = createWorkstations(
    commerceAndServices,
    commerceAndServicesEmployees
  )

  const workstations = [...industryWorkstations, ...commerceAndServicesWorkstations]

  const sizePriority = (size: string) => {
    const workstationPriorities = {
      micro: 4,
      small: 3,
      medium: 2,
      large: 1
    }

    return workstationPriorities[size]
  }

  let index = 0
  workstations.forEach((workstation) => {
    for (let i = 0; i < workstation.intervalSize![0]; i++) {
      workers[index].occupationTypes.push('work')
      workers[index++].occupations.push(workstation)
      workstation.actualSize++
    }
  })

  workstations.sort((a, b) => {
    const sizeA = sizePriority(a.label.split('.')[2])
    const sizeB = sizePriority(b.label.split('.')[2])
    return sizeB - sizeA
  })
  let workstationIndex = 0

  workers.forEach((worker) => {
    if (!worker.occupations.find((occupation) => occupation?.type === 'work')) {
      workstations[workstationIndex].actualSize++
      worker.occupationTypes.push('work')
      worker.occupations.push(workstations[workstationIndex])
      workstationIndex = (workstationIndex + 1) % workstations.length
    }
  })

  log('', { timeEnd: true, timeLabel: 'ASSIGNMENT' })

  return [...workers, ...nonWorkers]
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

export function normalizeIncomes(incomes: Parameter[], individuals: Individual[]) {
  log('Normalizing `incomes`', { time: true, timeLabel: 'NORMALIZATION' })

  const workers = individuals.reduce(
    (acc, individual) => acc + (individual.occupationTypes.includes('work') ? 1 : 0),
    0
  )

  const nonZeroIncomes = incomes.filter((income) => income.label[0] !== 0)
  const nonZeroIncomesCount = nonZeroIncomes.reduce((acc, income) => acc + income.value, 0)
  let nonZeroIncomesPercentages = nonZeroIncomes.map((income) => income.value / nonZeroIncomesCount)

  const unlabeledNonZeroIncomes = workers - nonZeroIncomesCount

  const normalizedNonZeroIncomes = nonZeroIncomes.map((income, i) => {
    const labelPercentage = nonZeroIncomesPercentages[i]
    return {
      label: income.label,
      value: Math.round(income.value + unlabeledNonZeroIncomes * labelPercentage)
    }
  })

  const normalizedNonZeroIncomesCount = normalizedNonZeroIncomes.reduce(
    (acc, normalizedNonZeroIncome) => acc + normalizedNonZeroIncome.value,
    0
  )

  let stillNonZeroIncomes = workers - normalizedNonZeroIncomesCount
  while (stillNonZeroIncomes > 0) {
    for (
      let i = 0;
      i < stillNonZeroIncomes / nonZeroIncomes.length;
      i = (i + 1) % normalizedNonZeroIncomes.length
    ) {
      normalizedNonZeroIncomes[i].value++
      stillNonZeroIncomes--
    }
  }

  const zeroIncomes = incomes.filter((income) => income.label[0] === 0)

  log('', { timeEnd: true, timeLabel: 'NORMALIZATION' })

  return [
    ...normalize('zero incomes', zeroIncomes, individuals.length - workers),
    ...normalizedNonZeroIncomes
  ]
}