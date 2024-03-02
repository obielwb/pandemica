import { assignRoutine } from '..'
import { Individual } from '../../population/individual'

function test() {
  let population: Individual[] = [baby, child, collegeStudentAndWorker, regularWorker, retired]

  population = assignRoutine(population)
  const weekDays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

  population.forEach((individual) => {
    console.log(individual.occupationTypes)
    individual.routine.forEach((day, i) => {
      console.log('\n' + weekDays[i].toUpperCase())

      let totalTime = 0
      day.forEach((activity) => {
        console.log(activity.label)
        totalTime += activity.duration
      })

      console.log(totalTime)
    })
  })
}

const baby: Individual = {
  id: 1,
  sex: 'male',
  age: [0, 4],
  educationStatus: 'unschooled',
  currentActivity: undefined,
  routine: [],
  house: {
    id: 298999,
    region: 'south',
    size: 4,
    housemates: [285377, 134216, 551275, 1]
  },
  income: [0, 0],
  transportationMean: 'public',
  occupationTypes: [],
  occupations: [],
  state: 'susceptible',
  hadCovid: false,
  vaccine: {
    type: 'none',
    doses: 0
  },
  mask: 'none',
  isInLockdown: undefined
}

const child: Individual = {
  id: 0,
  sex: 'male',
  age: [0, 4],
  educationStatus: 'preschool',
  currentActivity: undefined,
  routine: [],
  house: {
    id: 276265,
    region: 'south',
    size: 4,
    housemates: [291122, 0, 89097, 129168]
  },
  income: [0, 0],
  transportationMean: 'public',
  occupationTypes: ['study'],
  occupations: [
    {
      id: 324,
      type: 'study',
      label: 'preschool',
      intervalSize: [0, 0],
      actualSize: 93
    }
  ],
  state: 'susceptible',
  hadCovid: false,
  vaccine: {
    type: 'none',
    doses: 0
  },
  mask: 'none',
  isInLockdown: undefined
}

const collegeStudentAndWorker: Individual = {
  id: 147174,
  sex: 'male',
  age: [20, 24],
  educationStatus: 'undergraduate',
  currentActivity: undefined,
  routine: [],
  house: {
    id: 119150,
    region: 'north',
    size: 2,
    housemates: [294654, 147174]
  },
  income: [5, 10],
  transportationMean: 'public',
  occupationTypes: ['study', 'work'],
  occupations: [
    {
      id: 1199,
      type: 'study',
      label: 'college',
      intervalSize: [0, 0],
      actualSize: 4295
    },
    {
      id: 18846,
      type: 'work',
      label: 'work.industry.medium',
      intervalSize: [100, 499],
      actualSize: 101
    }
  ],
  state: 'susceptible',
  hadCovid: false,
  vaccine: {
    type: 'none',
    doses: 0
  },
  mask: 'none',
  isInLockdown: undefined
}

const regularWorker: Individual = {
  id: 300000,
  sex: 'male',
  age: [35, 39],
  educationStatus: 'educated',
  currentActivity: undefined,
  routine: [],
  house: {
    id: 108711,
    region: 'northwest',
    size: 2,
    housemates: [509013, 300000]
  },
  income: [0.5, 1],
  transportationMean: 'public',
  occupationTypes: ['work'],
  occupations: [
    {
      id: 135285,
      type: 'work',
      label: 'work.commerce_services.small',
      intervalSize: [10, 49],
      actualSize: 11
    }
  ],
  state: 'susceptible',
  hadCovid: false,
  vaccine: {
    type: 'none',
    doses: 0
  },
  mask: 'none',
  isInLockdown: undefined
}

const retired: Individual = {
  id: 482354,
  sex: 'male',
  age: [65, 69],
  educationStatus: 'educated',
  currentActivity: undefined,
  routine: [],
  house: {
    id: 336806,
    region: 'south',
    size: 6,
    housemates: [1017053, 172220, 293504, 311691, 947988, 482354]
  },
  income: [0, 0],
  transportationMean: 'private',
  occupationTypes: [],
  occupations: [],
  state: 'susceptible',
  hadCovid: false,
  vaccine: {
    type: 'none',
    doses: 0
  },
  mask: 'none',
  isInLockdown: undefined
}

test()
