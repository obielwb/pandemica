import { MaskType } from '../../calculus/data'
import { Individual, Occupation, OccupationType } from '../../population/individual'
import { fasterFilter, fisherYatesShuffle, shuffle } from '../../utilities'

export type MaskRegister = {
  date: string
  type: MaskType
  populationPercentage: number
  options?: Partial<{
    age: number[]
    sex: 'm' | 'f'
    income: number[]
    transportationMean: 'pr' | 'pu'
    occupationTypes: [OccupationType?, OccupationType?]
    occupations: [Occupation?, Occupation?]
  }>
}

export class MaskTrigger {
  constructor(public population: Individual[], private maskDates: MaskRegister[]) {}

  public assign(currentDate: string) {
    const matchMasksRegisters = fasterFilter(
      this.maskDates,
      (maskDate) => maskDate.date === currentDate
    )

    if (matchMasksRegisters.length !== 0) {
      for (const matchMaskRegister of matchMasksRegisters) {
        this.implementMaskDistribution(matchMaskRegister)
      }
    }
  }

  private implementMaskDistribution(maskImplementation: MaskRegister) {
    this.cleanCurrentMasks()

    const shuffledPopulation = fisherYatesShuffle(this.population)
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

  private cleanCurrentMasks() {
    this.population.forEach((individual) => {
      individual.mask = ''
    })
  }
}
