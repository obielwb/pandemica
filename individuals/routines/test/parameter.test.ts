import { describe, expect, test } from 'bun:test'

import { normalize } from '../parameter'
import { totalPopulation, regionsPopulation, residentsPerHouse } from '../data'
import { Individual } from '../individual'

const individuals = Array.from({ length: totalPopulation }, () => new Individual())

describe('Parameter', () => {
  test('Should differ if regions are not normalized', () => {
    const regionsIndividuals = regionsPopulation.reduce((acc, region) => acc + region.value, 0)

    expect(regionsIndividuals).not.toBe(totalPopulation)
  })

  test('Should normalize regions population', () => {
    const normalizedRegions = normalize(individuals, 'region', regionsPopulation)
    const normalizedRegionsIndividuals = normalizedRegions.reduce(
      (acc, region) => acc + region.value,
      0
    )

    expect(normalizedRegionsIndividuals).toBe(totalPopulation)
  })

  test('Should normalize residents per house', () => {
    const labeledIndividuals = residentsPerHouse.reduce((acc, p) => acc + p.value * p.label, 0)

    let labelPercentages = residentsPerHouse.map((p) => (p.value * p.label) / labeledIndividuals)

    const unlabeledIndividuals = individuals.length - labeledIndividuals

    const normalizedLabels = residentsPerHouse.map((p, i) => {
      const labelPercentage = labelPercentages[i]
      return {
        label: p.label,
        value: Math.round(p.value + unlabeledIndividuals * labelPercentage)
      }
    })

    console.log(
      normalizedLabels.reduce((acc, p) => acc + (p.value * p.label) / individuals.length, 0)
    )

    // const normalizedLabeledIndividuals = normalizedLabels.reduce(
    //   (acc, normalizedLabel) => acc + normalizedLabel.value,
    //   0
    // )

    // let stillUnlabeledIndividuals = individuals.length - normalizedLabeledIndividuals
    // while (stillUnlabeledIndividuals > 0) {
    //   for (
    //     let i = 0;
    //     i < stillUnlabeledIndividuals / parameter.length;
    //     i = (i + 1) % normalizedLabels.length
    //   ) {
    //     normalizedLabels[i].value++
    //     stillUnlabeledIndividuals--
    //   }
    // }
  })
})
