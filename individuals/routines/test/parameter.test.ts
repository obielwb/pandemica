import { describe, expect, test } from 'bun:test'

import { normalize } from '../parameter'
import { totalPopulation, regionsPopulation } from '../data'
import { Individual } from '../individual'

const individuals = Array.from({ length: totalPopulation }, () => new Individual())

describe('Parameter', () => {
  test('Should differ if regions are not normalized', () => {
    const regionsIndividuals = regionsPopulation.reduce((acc, region) => acc + region.value, 0)

    expect(totalPopulation).not.toBe(regionsIndividuals)
  })

  test('Should normalize regions population', () => {
    const normalizedRegions = normalize(individuals, 'region', regionsPopulation)
    const normalizedRegionsIndividuals = normalizedRegions.reduce(
      (acc, region) => acc + region.value,
      0
    )

    expect(totalPopulation).toBe(normalizedRegionsIndividuals)
  })
})
