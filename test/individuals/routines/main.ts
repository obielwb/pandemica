import {
  industries,
  commerceAndServices,
  industriesEmployees,
  commerceAndServicesEmployees,
  totalPopulation
} from './data'

const totalIndustryEmployees = industries.reduce((total, category) => total + category.count, 0)
const totalCommerceEmployees = commerceAndServices.reduce(
  (total, category) => total + category.count,
  0
)

const industryRatios = industries.map((category) => category.count / totalIndustryEmployees)
const commerceRatios = commerceAndServices.map(
  (category) => category.count / totalCommerceEmployees
)
