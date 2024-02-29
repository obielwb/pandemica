import { MaskType } from '../data'
import { Individual, Occupation, OccupationType } from '../individual'
import { shuffle } from '../utilities'

export type MaskRegister = {
  date: string
  type: MaskType
  populationPercentage: number
  options?: Partial<{
    age: number[]
    sex: 'male' | 'female'
    income: number[]
    transportationMean: 'private' | 'public'
    occupationTypes: [OccupationType?, OccupationType?]
    occupations: [Occupation?, Occupation?]
  }>
}

// todo: assign another name for MaskRegister and maskDates
export class MaskTrigger {
  private maskDates: MaskRegister[]

  constructor(public population: Individual[], maskDates: MaskRegister[]) {
    this.maskDates = maskDates
  }

  public assign(currentDate: string) {
    const matchMasksRegisters = this.maskDates.filter((maskDate) => maskDate.date === currentDate)

    if (matchMasksRegisters.length !== 0) {
      for (const matchMaskRegister of matchMasksRegisters) {
        this.implementMaskDistribution(matchMaskRegister)
      }
    }
  }

  private implementMaskDistribution(maskImplementation: MaskRegister) {
    this.cleanCurrentMasks()

    const shuffledPopulation = shuffle(this.population)
    // verify if individual is according option. If option is defined and not found in current individual, they dont go into matchedIndividuals
    let matchedIndividuals = shuffledPopulation.filter(
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
      individual.mask = 'none'
    })
  }
}
