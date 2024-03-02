import { Individual } from '../../individual'

export const worksOrStudiesToday = (individual: Individual, day: number, workDays: number[]) =>
  (individual.occupationTypes.includes('study') && day >= 1 && day <= 5) || workDays.includes(day)

export const getWorkSize = (individual: Individual) =>
  individual.occupations.find((o) => o!.type === 'work')!.label.split('.')[2]

export function isNightShift(individual: Individual, workSize: string) {
  // individual studies and works
  if (individual.occupationTypes.includes('study')) {
    return false
  }

  let nightShiftAvailabilityProbability: number
  switch (workSize) {
    case 'large':
      nightShiftAvailabilityProbability = 0.8 // 80% chance for large sites
      break
    case 'medium':
      nightShiftAvailabilityProbability = 0.2 // 20% chance for medium sites
      break
    case 'small':
      nightShiftAvailabilityProbability = 0.1 // 10% for small sites
      break
    case 'micro':
      nightShiftAvailabilityProbability = 0.05 // 5% for micro sites
      break
  }

  if (Math.random() <= nightShiftAvailabilityProbability) {
    // based on https://bmcpublichealth.biomedcentral.com/articles/10.1186/s12889-022-13830-5
    if (individual.sex === 'male') {
      return Math.random() <= 0.224 // 22.4% chance for males
    }

    return Math.random() <= 0.1 // 10% chance for females
  }

  return false
}
