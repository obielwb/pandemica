import { Mask } from '../../calculus/data'
import {
  Individual,
  Occupation,
  OccupationType,
  Sex,
  TransporationMean
} from '../../population/individual'
import { fasterFilter, fisherYatesShuffle } from '../../utilities'

export type MaskRegister = {
  date: string
  type: Mask
  populationPercentage: number
  options?: Partial<{
    age: number[]
    sex: Sex
    income: number[]
    transportationMean: TransporationMean
    occupationTypes: [OccupationType?, OccupationType?]
    occupations: [Occupation?, Occupation?]
  }>
}

export class MaskTrigger {
  constructor(private maskDates: MaskRegister[]) {}

  public assign(currentDate: string, population: Individual[]) {
    const matchMasksRegisters = fasterFilter(
      this.maskDates,
      (maskDate) => maskDate.date === currentDate
    )

    if (matchMasksRegisters.length !== 0) {
      for (const matchMaskRegister of matchMasksRegisters) {
        this.implementMaskDistribution(matchMaskRegister, population)
      }
    }
  }

  private implementMaskDistribution(maskImplementation: MaskRegister, population: Individual[]) {
    this.cleanCurrentMasks(population)

    const shuffledPopulation = fisherYatesShuffle(population)
    // verify if individual is according option. If option is defined and not found in current individual, they dont go into matchedIndividuals
    let matchedIndividuals = fasterFilter(
      shuffledPopulation,
      (individual) =>
        (maskImplementation.options.age === undefined ||
          individual.age === maskImplementation.options.age) &&
        (maskImplementation.options.sex === undefined ||
          individual.sex === maskImplementation.options.sex) &&
        (maskImplementation.options.income === undefined ||
          individual.income === maskImplementation.options.income) &&
        (maskImplementation.options.transportationMean === undefined ||
          individual.transportationMean === maskImplementation.options.transportationMean) &&
        (maskImplementation.options.occupationTypes === undefined ||
          individual.occupationTypes === maskImplementation.options.occupationTypes) &&
        (maskImplementation.options.occupations === undefined ||
          individual.occupations === maskImplementation.options.occupations)
    )

    const numAffectedPeople = Math.ceil(
      maskImplementation.populationPercentage * matchedIndividuals.length
    )

    matchedIndividuals.slice(0, numAffectedPeople).forEach((individual) => {
      individual.mask = maskImplementation.type
    })
  }

  private cleanCurrentMasks(population: Individual[]) {
    population.forEach((individual) => {
      individual.mask = Mask.None
    })
  }
}
