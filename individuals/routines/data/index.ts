/*
 * generate activities:
 *    - search in microCovid to see if what they've done
 */

// ibge 2010
export const totalPopulation = 1080113

// 2016 social information report - needs normalization down
export const eastPopulation = {
  label: 'east',
  value: 248939
}
export const northwestPopulation = {
  label: 'northwest',
  value: 133086
}
export const northPopulation = {
  label: 'north',
  value: 212342
}
export const southwestPopulation = {
  label: 'southwest',
  value: 253061
}
export const southPopulation = {
  label: 'south',
  value: 316671
}
export const regionsPopulation = [
  eastPopulation,
  northwestPopulation,
  northPopulation,
  southwestPopulation,
  southPopulation
]

// ibge 2010
export const malePercentage = (520865 / 1080113) * 100
export const femalePercentage = (559248 / 1080113) * 100

export const car = 226053

export type Age = {
  interval: [number, number]
  female: number
  male: number
}

// 2010 ibge
export const zeroToFourYears: Age = {
  interval: [0, 4],
  female: 31745,
  male: 32660
}
export const fiveToNineYears: Age = {
  interval: [5, 9],
  female: 32214,
  male: 33570
}
export const tenToFourteenYears: Age = {
  interval: [10, 14],
  female: 38690,
  male: 39891
}
export const fifteenToNineteenYears: Age = {
  interval: [15, 19],
  female: 40346,
  male: 41344
}
export const twentyToTwentyfourYears: Age = {
  interval: [20, 24],
  female: 48593,
  male: 48225
}
export const twentyfiveToTwentynineYears: Age = {
  interval: [25, 29],
  female: 52883,
  male: 51178
}
export const thirtyToThirtyfourYears: Age = {
  interval: [30, 34],
  female: 49301,
  male: 47315
}
export const thirtyfiveToThirtynineYears: Age = {
  interval: [35, 39],
  female: 43304,
  male: 40812
}
export const fourtyToFourtyfourYears: Age = {
  interval: [40, 44],
  female: 41335,
  male: 37975
}
export const fourtyfiveToFourtynineYears: Age = {
  interval: [45, 49],
  female: 38876,
  male: 34630
}
export const fiftyToFiftyfourYears: Age = {
  interval: [50, 54],
  female: 35795,
  male: 31354
}
export const fiftyfiveToFiftynineYears: Age = {
  interval: [55, 59],
  female: 29515,
  male: 25295
}
export const sixtyToSixtyfourYears: Age = {
  interval: [60, 64],
  female: 23211,
  male: 19059
}
export const sixtyfiveToSixtynineYears: Age = {
  interval: [65, 69],
  female: 16986,
  male: 13776
}
export const seventyToSeventyfourYears: Age = {
  interval: [70, 74],
  female: 13743,
  male: 10457
}
export const seventyfiveToSeventynineYears: Age = {
  interval: [75, 79],
  female: 6832,
  male: 10260
}
export const eightyToEightyfourYears: Age = {
  interval: [80, 84],
  female: 7291,
  male: 4094
}
export const ages = [
  zeroToFourYears,
  fiveToNineYears,
  tenToFourteenYears,
  fifteenToNineteenYears,
  twentyToTwentyfourYears,
  twentyfiveToTwentynineYears,
  thirtyToThirtyfourYears,
  thirtyfiveToThirtynineYears,
  fourtyToFourtyfourYears,
  fourtyfiveToFourtynineYears,
  fiftyToFiftyfourYears,
  fiftyfiveToFiftynineYears,
  sixtyToSixtyfourYears,
  sixtyfiveToSixtynineYears,
  seventyToSeventyfourYears,
  seventyfiveToSeventynineYears,
  eightyToEightyfourYears
]

// 2010 ibge - habitants by income - 950.400 - desconsidera pessoas abaixo de 10 anos
export const zeroToHalfMinimumSalaries = {
  label: 'zero_to_half_minimum_salaries',
  value: 10400
}
export const halfToOneMinimumSalaries = {
  label: 'half_to_one_minimum_salaries',
  value: 98800
}
export const oneToTwoMinimumSalaries = {
  label: 'one_to_two_minimum_salaries',
  value: 225500
}
export const twoToThreeMinimumSalaries = {
  label: 'two_to_three_minimum_salaries',
  value: 98600
}
export const threeToFiveMinimumSalaries = {
  label: 'three_to_five_minimum_salaries',
  value: 89300
}
export const fiveToTenMinimumSalaries = {
  label: 'five_to_ten_minimum_salaries',
  value: 72300
}
export const tenToFifteenMinimumSalaries = {
  label: 'ten_to_fifteen_minimum_salaries',
  value: 15700
}
export const fifteenToTwentyMinimumSalaries = {
  label: 'fifteen_to_twenty_minimum_salaries',
  value: 13400
}
export const twentyOrMoreMinimumSalaries = {
  label: 'twenty_or_more_minimum_salaries',
  value: 10400
}
export const withoutSalary = {
  label: 'none',
  value: 316000
}
export const salaries = [
  zeroToHalfMinimumSalaries,
  halfToOneMinimumSalaries,
  oneToTwoMinimumSalaries,
  twoToThreeMinimumSalaries,
  threeToFiveMinimumSalaries,
  fiveToTenMinimumSalaries,
  tenToFifteenMinimumSalaries,
  fifteenToTwentyMinimumSalaries,
  twentyOrMoreMinimumSalaries,
  withoutSalary
]

// todo: fix relation between withoutSalary and ages bellow ageSevenToFourteen

// 2010 ibge - preschool and school attendants
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

// igbe 2021
export const elementarySchools = 313
export const highSchools = 150

export const houses = 348268

// Número de moradores nas residências - 1.068.980 moradores
export const oneResident = {
  label: 1,
  value: 48687
}
export const twoResidents = {
  label: 2,
  value: 87532
}
export const threeResidents = {
  label: 3,
  value: 87969
}
export const fourResidents = {
  label: 4,
  value: 72222
}
export const fiveResidents = {
  label: 5,
  value: 31014
}
export const sixResidents = {
  label: 6,
  value: 11744
}
export const sevenResidents = {
  label: 7,
  value: 4937
}
export const eightResidents = {
  label: 8,
  value: 2137
}
export const nineResidents = {
  label: 9,
  value: 1027
}
export const tenResidents = {
  label: 10,
  value: 532
}
export const elevenOrMoreResidents = {
  label: 11,
  value: 467
}
export const residentsPerHouse = [
  oneResident,
  twoResidents,
  threeResidents,
  fourResidents,
  fiveResidents,
  sixResidents,
  sevenResidents,
  eightResidents,
  nineResidents,
  tenResidents,
  elevenOrMoreResidents
]

export type Interaction = {
  label: 'oneTime' | 'workplace' | 'partner' | 'repeated'
}
export type Activity = {
  id: string
  name: string

  setting: string
  distance: string
  duration?: number // minutes
  voice: string
  interaction?: Interaction
}

export const activities: { [key: string]: Activity } = {
  shopping: {
    id: 'e67985c7-e0e5-4f2a-8a74-79d5e8848d1e',
    name: 'shopping',
    setting: 'indoor',
    distance: 'sixFt',
    duration: 60,
    voice: 'silent'
  }
  // restaurantOutdoors: {
  //   setting: 'outdoor',
  //   distance: 'sixFt',
  //   duration: 90,
  //   voice: 'normal'
  // },
  // restaurantIndoors: {
  //   setting: 'outdoor',
  //   distance: 'sixFt',
  //   duration: 90,
  //   voice: 'normal'
  // },
  // bar: {
  //   setting: 'indoor',
  //   distance: 'sixFt',
  //   duration: 120,
  //   voice: 'loud'
  // },
  // outdoorParty: {
  //   setting: 'outdoor',
  //   distance: 'normal',
  //   duration: 180,
  //   voice: 'loud'
  // },
  // indoorParty: {
  //   setting: 'indoor',
  //   distance: 'normal',
  //   duration: 180,
  //   voice: 'normal'
  // },
  // house: {
  //   setting: 'indoor',
  //   distance: 'intimate',
  //   duration: 600,
  //   voice: 'normal'
  // },
  // school: {
  //   setting: 'indoor',
  //   distance: 'normal',
  //   duration: 480, // 8 hours
  //   voice: 'normal'
  // },
  // hospital: {
  //   setting: 'indoor',
  //   distance: 'sixFt',
  //   voice: 'normal'
  // },
  // publicTransportStation: {
  //   setting: 'outdoor',
  //   distance: 'normal',
  //   voice: 'normal',
  //   duration: 60
  // },
  // publicTransportStationCrowded: {
  //   setting: 'outdoor',
  //   distance: 'close',
  //   voice: 'normal',
  //   duration: 60
  // },
  // parks: {
  //   setting: 'outdoor',
  //   distance: 'tenFt',
  //   voice: 'silent',
  //   duration: 90
  // }
}

// ibge 2018
export const microIndustries = {
  value: 14398,
  label: 'industry.micro'
}
export const smallIndustries = {
  value: 2846,
  label: 'industry.small'
}
export const mediumIndustries = {
  value: 724,
  label: 'industry.medium'
}
export const largeIndustries = {
  value: 160,
  label: 'industry.large'
}
export const industries = [microIndustries, smallIndustries, mediumIndustries, largeIndustries]

export const microCommerceAndServices = {
  value: 109612,
  label: 'commerce_services.micro'
}
export const smallCommerceAndServices = {
  value: 7834,
  label: 'commerce_services.small'
}
export const mediumCommerceAndServices = {
  value: 1202,
  label: 'commerce_services.medium'
}
export const largeCommerceAndServices = {
  value: 0,
  label: 'commerce_services.large'
}
export const commerceAndServices = [
  microCommerceAndServices,
  smallCommerceAndServices,
  mediumCommerceAndServices,
  largeCommerceAndServices
]

// mte 2016
export const microIndustriesEmployees = [1, 19]
export const smallIndustriesEmployees = [20, 99]
export const mediumIndustriesEmployees = [100, 499]
export const largeIndustriesEmployees = [500, 899]
export const industriesEmployees = [
  microIndustriesEmployees,
  smallIndustriesEmployees,
  mediumIndustriesEmployees,
  largeIndustriesEmployees
]

export const employees = 428584
export const selfEmployeds = 92989
export const employers = 14474
export const totalEmployees = employees + selfEmployeds + employers

export const microCommerceAndServicesEmployees = [1, 9]
export const smallCommerceAndServicesEmployees = [10, 49]
export const mediumCommerceAndServicesEmployees = [50, 99]
export const largeCommerceAndServicesEmployees = [100, 299]
export const commerceAndServicesEmployees = [
  microCommerceAndServicesEmployees,
  smallCommerceAndServicesEmployees,
  mediumCommerceAndServicesEmployees,
  largeCommerceAndServicesEmployees
]
