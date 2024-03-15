import { assignRoutine } from '..'
import { Individual } from '../../population/individual'

function test() {
  const labels = ['baby', 'child', 'collegeStudentAndWorker', 'regularWorker', 'retired']
  let population: Individual[] = [baby, child, collegeStudentAndWorker, regularWorker, retired]

  population = assignRoutine(population)
  const weekDays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

  population.forEach((individual) => {
    console.log(labels[individual.id].toUpperCase())
    individual.routine.forEach((day, i) => {
      const totalTime = day.reduce((acc, activity) => acc + activity.duration, 0)
      if (totalTime !== 1440) {
        console.log('\n' + weekDays[i].toUpperCase())

        day.forEach((activity) => {
          console.log(activity.label, activity.duration)
        })

        console.log(totalTime)
      }
    })
  })
}

const baby: Individual = {
  id: 0,
  sex: 0,
  age: [0, 4],
  educationStatus: 7,
  currentActivity: undefined,
  routine: [],
  preInfectedRoutine: undefined,
  house: {
    id: 0,
    region: 0,
    size: 5,
    housemates: [0, 1, 2, 3, 4]
  },
  income: [0, 0],
  transportationMean: 0,
  occupationTypes: [],
  occupations: [],
  state: 0,
  hadCovid: false,
  vaccine: {
    doses: 0,
    type: 0
  },
  mask: 0,
  isInLockdown: false,
  daysSinceExposed: undefined,
  deadAfterDaysSinceExposed: undefined,
  hospitalizedAfterDaysSinceExposed: undefined
}

const child: Individual = {
  id: 1,
  sex: 0,
  age: [0, 4],
  educationStatus: 1,
  currentActivity: undefined,
  routine: [],
  preInfectedRoutine: undefined,
  house: {
    id: 0,
    region: 0,
    size: 5,
    housemates: [0, 1, 2, 3, 4]
  },
  income: [0, 0],
  transportationMean: 0,
  occupationTypes: [0],
  occupations: [
    {
      id: 460,
      type: 0,
      label: 37,
      intervalSize: [72, 72],
      actualSize: 72,
      prototype: undefined
    }
  ],
  state: 0,
  hadCovid: false,
  vaccine: {
    doses: 0,
    type: 0
  },
  mask: 0,
  isInLockdown: false,
  daysSinceExposed: undefined,
  deadAfterDaysSinceExposed: undefined,
  hospitalizedAfterDaysSinceExposed: undefined
}

const collegeStudentAndWorker: Individual = {
  id: 2,
  sex: 0,
  age: [20, 24],
  educationStatus: 4,
  currentActivity: undefined,
  routine: [],
  preInfectedRoutine: undefined,
  house: {
    id: 0,
    region: 0,
    size: 5,
    housemates: [0, 1, 2, 3, 4]
  },
  income: [0.5, 1],
  transportationMean: 1,
  occupationTypes: [0, 1],
  occupations: [
    {
      id: 1199,
      type: 0,
      label: 40,
      intervalSize: [4295, 4295],
      actualSize: 4295,
      prototype: undefined
    },
    {
      id: 35001,
      type: 1,
      label: 29,
      intervalSize: [1, 9],
      actualSize: 3,
      prototype: {
        size: 2
      }
    }
  ],
  state: 0,
  hadCovid: false,
  vaccine: {
    doses: 0,
    type: 0
  },
  mask: 0,
  isInLockdown: false,
  daysSinceExposed: undefined,
  deadAfterDaysSinceExposed: undefined,
  hospitalizedAfterDaysSinceExposed: undefined
}

const regularWorker: Individual = {
  id: 3,
  sex: 0,
  age: [20, 24],
  educationStatus: 4,
  currentActivity: undefined,
  routine: [],
  preInfectedRoutine: undefined,
  house: {
    id: 0,
    region: 0,
    size: 5,
    housemates: [0, 1, 2, 3, 4]
  },
  income: [0.5, 1],
  transportationMean: 1,
  occupationTypes: [1],
  occupations: [
    {
      id: 35001,
      type: 1,
      label: 29,
      intervalSize: [1, 9],
      actualSize: 3,
      prototype: {
        size: 2
      }
    }
  ],
  state: 0,
  hadCovid: false,
  vaccine: {
    doses: 0,
    type: 0
  },
  mask: 0,
  isInLockdown: false,
  daysSinceExposed: undefined,
  deadAfterDaysSinceExposed: undefined,
  hospitalizedAfterDaysSinceExposed: undefined
}

const retired: Individual = {
  id: 4,
  sex: 0,
  age: [50, 54],
  educationStatus: 4,
  currentActivity: undefined,
  routine: [],
  preInfectedRoutine: undefined,
  house: {
    id: 0,
    region: 0,
    size: 5,
    housemates: [0, 1, 2, 3, 4]
  },
  income: [0.5, 1],
  transportationMean: 1,
  occupationTypes: [],
  occupations: [],
  state: 0,
  hadCovid: false,
  vaccine: {
    doses: 0,
    type: 0
  },
  mask: 0,
  isInLockdown: false,
  daysSinceExposed: undefined,
  deadAfterDaysSinceExposed: undefined,
  hospitalizedAfterDaysSinceExposed: undefined
}

test()
