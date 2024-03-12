import { assignRoutine } from '..'
import { Individual } from '../../population/individual'

function test() {
  let population: Individual[] = [collegeStudentAndWorker]

  population = assignRoutine(population)
  const weekDays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

  population.forEach((individual) => {
    console.log(individual.occupationTypes)
    individual.routine.forEach((day, i) => {
      console.log('\n' + weekDays[i].toUpperCase())

      let totalTime = 0
      day.forEach((activity) => {
        console.log(activity.label, activity.duration)
        totalTime += activity.duration
      })

      console.log(totalTime)
    })
  })
}

const baby: Individual = {
  id: 0,
  sex: 'male',
  age: [0, 4],
  educationStatus: 'unschooled',
  currentActivity: undefined,
  routine: [],
  house: {
    id: 1,
    region: 'south',
    size: 4,
    housemates: [0, 1, 2, 3]
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
  id: 1,
  sex: 'male',
  age: [0, 4],
  educationStatus: 'preschool',
  currentActivity: undefined,
  routine: [],
  house: {
    id: 1,
    region: 'south',
    size: 4,
    housemates: [0, 1, 2, 3]
  },
  income: [0, 0],
  transportationMean: 'public',
  occupationTypes: ['study'],
  occupations: [
    {
      id: 324,
      type: 'study',
      label: 'study.preschool',
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
  id: 2,
  sex: 'male',
  age: [20, 24],
  educationStatus: 'undergraduate',
  currentActivity: undefined,
  routine: [],
  house: {
    id: 1,
    region: 'south',
    size: 4,
    housemates: [0, 1, 2, 3]
  },
  income: [5, 10],
  transportationMean: 'public',
  occupationTypes: ['study', 'work'],
  occupations: [
    {
      id: 1199,
      type: 'study',
      label: 'study.college',
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
  id: 3,
  sex: 'male',
  age: [35, 39],
  educationStatus: 'educated',
  currentActivity: undefined,
  routine: [],
  house: {
    id: 1,
    region: 'south',
    size: 4,
    housemates: [0, 1, 2, 3]
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
  id: 4,
  sex: 'male',
  age: [65, 69],
  educationStatus: 'educated',
  currentActivity: undefined,
  routine: [],
  house: {
    id: 2,
    region: 'south',
    size: 1,
    housemates: [4]
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
