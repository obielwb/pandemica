import { assignRoutine } from '..'
import { Individual } from '../../population/individual'

function test() {
  const labels = ['baby', 'child', 'collegeStudentAndWorker', 'regularWorker', 'retired']
  let population: Individual[] = [baby, regularWorker]

  population = assignRoutine(population)
  const weekDays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

  population.forEach((individual) => {
    console.log(labels[individual.id].toUpperCase())
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
  sex: 'm',
  age: [0, 4],
  educationStatus: 'us',
  currentActivity: undefined,
  routine: [],
  house: {
    id: 1,
    region: 'south',
    size: 4,
    housemates: [0, 1, 2, 3]
  },
  income: [0, 0],
  transportationMean: 'pu',
  occupationTypes: [],
  occupations: [],
  state: 'susceptible',
  hadCovid: false,
  vaccine: {
    type: '',
    doses: 0
  },
  mask: '',
  isInLockdown: undefined
}

const child: Individual = {
  id: 1,
  sex: 'm',
  age: [0, 4],
  educationStatus: 'ps',
  currentActivity: undefined,
  routine: [],
  house: {
    id: 1,
    region: 'south',
    size: 4,
    housemates: [0, 1, 2, 3]
  },
  income: [0, 0],
  transportationMean: 'pu',
  occupationTypes: ['s'],
  occupations: [
    {
      id: 324,
      type: 's',
      label: 's.ps',
      intervalSize: [0, 0],
      actualSize: 93
    }
  ],
  state: 'susceptible',
  hadCovid: false,
  vaccine: {
    type: '',
    doses: 0
  },
  mask: '',
  isInLockdown: undefined
}

const collegeStudentAndWorker: Individual = {
  id: 2,
  sex: 'm',
  age: [20, 24],
  educationStatus: 'ug',
  currentActivity: undefined,
  routine: [],
  house: {
    id: 1,
    region: 'south',
    size: 4,
    housemates: [0, 1, 2, 3]
  },
  income: [5, 10],
  transportationMean: 'pu',
  occupationTypes: ['s', 'w'],
  occupations: [
    {
      id: 1199,
      type: 's',
      label: 's.c',
      intervalSize: [0, 0],
      actualSize: 4295
    },
    {
      id: 18846,
      type: 'w',
      label: 'w.i.m',
      intervalSize: [100, 499],
      actualSize: 101
    }
  ],
  state: 'susceptible',
  hadCovid: false,
  vaccine: {
    type: '',
    doses: 0
  },
  mask: '',
  isInLockdown: undefined
}

const regularWorker: Individual = {
  id: 3,
  sex: 'm',
  age: [35, 39],
  educationStatus: 'ed',
  currentActivity: undefined,
  routine: [],
  house: {
    id: 1,
    region: 'south',
    size: 4,
    housemates: [0, 1, 2, 3]
  },
  income: [0.5, 1],
  transportationMean: 'pu',
  occupationTypes: ['w'],
  occupations: [
    {
      id: 135285,
      type: 'w',
      label: 'w.cs.s',
      intervalSize: [10, 49],
      actualSize: 11
    }
  ],
  state: 'susceptible',
  hadCovid: false,
  vaccine: {
    type: '',
    doses: 0
  },
  mask: '',
  isInLockdown: undefined
}

const retired: Individual = {
  id: 4,
  sex: 'm',
  age: [65, 69],
  educationStatus: 'ed',
  currentActivity: undefined,
  routine: [],
  house: {
    id: 2,
    region: 'south',
    size: 1,
    housemates: [4]
  },
  income: [0, 0],
  transportationMean: 'pr',
  occupationTypes: [],
  occupations: [],
  state: 'susceptible',
  hadCovid: false,
  vaccine: {
    type: '',
    doses: 0
  },
  mask: '',
  isInLockdown: undefined
}

test()
