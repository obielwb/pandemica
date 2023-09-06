import {
  ageEighteenToNineteen,
  ageFifteenToSeventeen,
  ageTwentyfiveOrMore,
  ageTwentyToTwentyFour,
  commerceAndServices,
  commerceAndServicesEmployees,
  industries,
  industriesEmployees,
  totalPopulation
} from './data'

const students =
  ageFifteenToSeventeen + ageEighteenToNineteen + ageTwentyToTwentyFour + ageTwentyfiveOrMore

const totalIndustryEmployees = industries.reduce((total, category) => total + category.count, 0)
const totalCommerceAndServicesEmployees = commerceAndServices.reduce(
  (total, category) => total + category.count,
  0
)

const industryRatios = industries.map((category) => category.count / totalIndustryEmployees)
const commerceAndServicesRatios = commerceAndServices.map(
  (category) => category.count / totalCommerceAndServicesEmployees
)
