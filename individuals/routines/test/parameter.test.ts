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
    const labeledIndividuals = residentsPerHouse.reduce(
      (acc, p) => acc + p.value * Number(p.label),
      0
    )

    let labelPercentages = residentsPerHouse.map(
      (p) => (p.value * Number(p.label)) / labeledIndividuals
    )

    const unlabeledIndividuals = individuals.length - labeledIndividuals

    const normalizedLabels = residentsPerHouse.map((p, i) => {
      const labelPercentage = labelPercentages[i]
      return {
        label: p.label,
        value: Math.round(p.value + unlabeledIndividuals * labelPercentage)
      }
    })

    let stillUnlabeledIndividuals =
      normalizedLabels.reduce((acc, p) => acc + p.value * p.label, 0) - individuals.length
    while (stillUnlabeledIndividuals > 0) {
      for (
        let i = 0;
        i < stillUnlabeledIndividuals / residentsPerHouse.length;
        i = (i + 1) % normalizedLabels.length
      ) {
        normalizedLabels[i].value--
        stillUnlabeledIndividuals -= normalizedLabels[i].label
      }
    }

    expect(
      normalizedLabels.reduce((acc, p) => acc + (p.value * p.label) / totalPopulation, 0)
    ).toBe(1)
  })
})
