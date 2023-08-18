/*
 * generate random age
 * generate random sex
 * generate activities:
 *    - search in microCovid to see if what they have
 * generate basic routines based on age, sex, location, etc
 *    variables:
 *    - house location
 *    - have car / dont have car
 *    - work location
 *    - school location
 *    -
 *
 *
 * for simplicity, the population does not have a growth rate
 */

// Relatório de Informações Sociais 2016
export const totalPopulation = 1138309
export const eastPopulation = 248939
export const northwestPopulation = 133086
export const northPopulation = 212342
export const southwestPopulation = 253061
export const southPopulation = 316671

export const malePercentage = 51.78
export const femalePercentage = 48.22

// IBGE 2010
export const zeroToFourHabitants = {
  female: 31330,
  male: 32541
}

export const fiveToNineHabitants = {
  female: 32214,
  male: 33570
}

export const tenToFourteenHabitants = {
  female: 38690,
  male: 39891
}

export const fifteenToNineteenHabitants = {
  female: 40346,
  male: 41344
}

export const twentyToTwentyfourHabitants = {
  female: 48593,
  male: 48225
}

export const twentyfiveToTwentynineHabitants = {
  female: 52883,
  male: 51178
}

export const thirtyToThirtyfourHabitants = {
  female: 49301,
  male: 47315
}

export const thirtyfiveToThirtynineHabitants = {
  female: 43304,
  male: 40812
}

export const fourtyToFourtyfourHabitants = {
  female: 41335,
  male: 37975
}

export const fourtyfiveToFourtynineHabitants = {
  female: 38876,
  male: 34630
}

export const fiftyToFiftyfourHabitants = {
  female: 35795,
  male: 31354
}

export const fiftyfiveToFiftynineHabitants = {
  female: 29515,
  male: 25295
}

export const sixtyToSixtyfourHabitants = {
  female: 23211,
  male: 19059
}

export const sixtyfiveToSixtynineHabitants = {
  female: 16986,
  male: 13776
}

export const seventyToSeventyfourHabitants = {
  female: 13743,
  male: 10457
}

export const seventyfiveToSeventynineHabitants = {
  female: 6832,
  male: 10260
}

export const eightyToEightyfourHabitants = {
  female: 7291,
  male: 4094
}

// IBGE 2022
export const car = 623743
export const motorcycle = 130933
export const bus = 5418
export const uttility = 13218

// IBGE 2010 - Habitantes por faixa de renda
export const zeroToHalfBasicSalary = 10400
export const halfToOneBasicSalary = 98800
export const oneToTwoBasicSalary = 225500
export const twoToThreeBasicSalary = 98600
export const threeToFiveBasicSalary = 89300
export const fiveToTenBasicSalary = 72300
export const tenToFifteenBasicSalary = 15700
export const fifteenToTwentyBasicSalary = 13400
export const twentyOrMoreBasicSalary = 10400
export const withoutSalary = 316000

// IBGE 2010 - Frequência em escola ou crechê
export const attendSchools = 324646
export const ageZeroToThree = 21685
export const ageFourToFive = 21201
export const ageSix = 12535
export const ageSevenToFourteen = 113766
export const ageFifteenToSeventeen = 41497
export const ageEighteenToNineteen = 15200
export const ageTwentyToTwentyFour = 29289
export const ageTwentyfiveOrMore = 69474
export const alreadyAttended = 687104
export const neverAttended = 68363
export interface Activity {
  // Activity Risk
  setting: string
  distance: string
  duration?: number // minutes
  voice: string

  // Activity Setting
  // coordinate: {
  //   x: number;
  //   y: number;
  // };
}

export const activities: { [key: string]: Activity } = {
  shopping: {
    setting: 'indoor',
    distance: 'sixFt',
    duration: 60,
    voice: 'silent'
  },
  restaurantOutdoors: {
    setting: 'outdoor',
    distance: 'sixFt',
    duration: 90,
    voice: 'normal'
  },
  restaurantIndoors: {
    setting: 'outdoor',
    distance: 'sixFt',
    duration: 90,
    voice: 'normal'
  },
  bar: {
    setting: 'indoor',
    distance: 'sixFt',
    duration: 120,
    voice: 'loud'
  },
  outdoorParty: {
    setting: 'outdoor',
    distance: 'normal',
    duration: 180,
    voice: 'loud'
  },
  indoorParty: {
    setting: 'indoor',
    distance: 'normal',
    duration: 180,
    voice: 'normal'
  },
  house: {
    setting: 'indoor',
    distance: 'intimate',
    duration: 600,
    voice: 'normal'
  },
  school: {
    setting: 'indoor',
    distance: 'normal',
    duration: 480, // 8 hours
    voice: 'normal'
  },
  hospital: {
    setting: 'indoor',
    distance: 'sixFt',
    voice: 'normal'
  },
  publicTransportStation: {
    setting: 'outdoor',
    distance: 'normal',
    voice: 'normal',
    duration: 60
  },
  publicTransportStationCrowded: {
    setting: 'outdoor',
    distance: 'close',
    voice: 'normal',
    duration: 60
  },
  parks: {
    setting: 'outdoor',
    distance: 'tenFt',
    voice: 'silent',
    duration: 90
  }
}

/*
Questões em aberto:
  - fazer a linha de produção
  - coordenadas
  - duração
  - symptoms checked - hospital capacity
*/
