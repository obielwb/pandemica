import { WorkSize } from '../../../../data/census'
import { Individual, OccupationType, Sex } from '../../../population/individual'

export const worksOrStudiesToday = (individual: Individual, day: number, workDays: number[]) =>
  (individual.occupationTypes.includes(OccupationType.Study) && day >= 1 && day <= 5) ||
  workDays.includes(day)

export const getWorkSize = (individual: Individual) =>
  individual.occupations.find((o) => o.type === OccupationType.Work)!.prototype.size

export function isNightShift(individual: Individual, workSize: WorkSize) {
  // individual studies and works
  if (individual.occupationTypes.includes(OccupationType.Study)) {
    return false
  }

  let nightShiftAvailabilityProbability: number
  switch (workSize) {
    case WorkSize.Large:
      nightShiftAvailabilityProbability = 0.8 // 80% chance for l sites
      break
    case WorkSize.Medium:
      nightShiftAvailabilityProbability = 0.2 // 20% chance for m sites
      break
    case WorkSize.Small:
      nightShiftAvailabilityProbability = 0.1 // 10% for s sites
      break
    case WorkSize.Micro:
      nightShiftAvailabilityProbability = 0.05 // 5% for xs sites
      break
  }

  if (Math.random() <= nightShiftAvailabilityProbability) {
    // based on https://bmcpublichealth.biomedcentral.com/articles/10.1186/s12889-022-13830-5
    if (individual.sex === Sex.Male) {
      return Math.random() <= 0.224 // 22.4% chance for males
    }

    return Math.random() <= 0.1 // 10% chance for females
  }

  return false
}
