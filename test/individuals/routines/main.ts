import {
  zeroToHalfBasicSalary,
  halfToOneBasicSalary,
  oneToTwoBasicSalary,
  twoToThreeBasicSalary,
  threeToFiveBasicSalary,
  fiveToTenBasicSalary,
  tenToFifteenBasicSalary,
  fifteenToTwentyBasicSalary,
  twentyOrMoreBasicSalary,
  withoutSalary
} from './data'

const salaries = [
  zeroToHalfBasicSalary,
  halfToOneBasicSalary,
  oneToTwoBasicSalary,
  twoToThreeBasicSalary,
  threeToFiveBasicSalary,
  fiveToTenBasicSalary,
  tenToFifteenBasicSalary,
  fifteenToTwentyBasicSalary,
  twentyOrMoreBasicSalary,
  withoutSalary
]

console.log(salaries.reduce((sum, salary) => sum + salary, 0))
