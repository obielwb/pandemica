import { describe, expect, test } from 'bun:test'

import { assignSex, normalize, normalizeAge, normalizeResidentsPerHouse } from '../parameter'
import {
  totalPopulation,
  regionsPopulation,
  residentsPerHouse,
  ages,
  malePercentage
} from '../data'
import { House, Individual } from '../individual'
import { nanoid } from 'nanoid'
import { fisherYatesShuffle } from '../utilities'

let individuals = Array.from({ length: totalPopulation }, () => new Individual())

describe('Parameter', () => {
  test('Should differ if regions are not normalized', () => {
    const regionsIndividuals = regionsPopulation.reduce((acc, region) => acc + region.value, 0)

    expect(regionsIndividuals).not.toBe(totalPopulation)
  })

  test('Should normalize regions population', () => {
    const normalizedRegions = normalize('region', regionsPopulation, totalPopulation)
    const normalizedRegionsIndividuals = normalizedRegions.reduce(
      (acc, region) => acc + region.value,
      0
    )

    expect(normalizedRegionsIndividuals).toBe(totalPopulation)
  })

  test('Should normalize residents per house', () => {
    const labeledIndividuals = residentsPerHouse.reduce(
      (acc, p) => acc + p.value * (p.label as number),
      0
    )

    let labelPercentages = residentsPerHouse.map(
      (p) => (p.value * (p.label as number)) / labeledIndividuals
    )

    const unlabeledIndividuals = totalPopulation - labeledIndividuals

    const normalizedLabels = residentsPerHouse.map((p, i) => {
      const labelPercentage = labelPercentages[i]
      return {
        label: p.label,
        value: Math.round(p.value + unlabeledIndividuals * labelPercentage)
      }
    })

    let stillUnlabeledIndividuals =
      normalizedLabels.reduce((acc, p) => acc + p.value * p.label, 0) - totalPopulation
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

  test('Should assign houses', () => {
    let houses: House[] = []

    const normalizedResidentsPerHouse = normalizeResidentsPerHouse(
      residentsPerHouse,
      totalPopulation
    )

    for (let i = 0; i < normalizedResidentsPerHouse.length; i++) {
      for (let j = 0; j < normalizedResidentsPerHouse[i].value; j++) {
        const house = {
          id: nanoid(),
          region: '',
          residents: normalizedResidentsPerHouse[i].label as number
        }

        for (let k = 0; k < (normalizedResidentsPerHouse[i].label as number); k++)
          houses.push(house)
      }
    }

    houses = fisherYatesShuffle(houses)

    const normalizedRegions = normalize('region', regionsPopulation, totalPopulation)
    let index = 0
    normalizedRegions.forEach((entry) => {
      for (let i = 0; i < entry.value; i++) houses[index++].region = entry.label as string
    })

    expect(houses.length).toBe(totalPopulation)

    const regionLabels = normalizedRegions.map((entry) => entry.label as string)
    expect(houses.every((h) => regionLabels.includes(h.region))).toBe(true)

    const residentLabels = normalizedResidentsPerHouse.map((entry) => entry.label as number)
    expect(houses.every((h) => residentLabels.includes(h.residents))).toBe(true)
  })

  test('Age should be the same as total male and female', () => {
    individuals = assignSex(individuals, malePercentage)

    const femaleIndividuals = individuals.reduce(
      (acc, individual) => acc + (individual.sex === 'female' ? 1 : 0),
      0
    )
    const maleIndividuals = individuals.length - femaleIndividuals

    const normalizedAges = normalizeAge(ages, totalPopulation, malePercentage)
    const normalizedAgedFemales = normalizedAges.reduce((acc, age) => acc + age.female, 0)
    const normalizedAgedMales = normalizedAges.reduce((acc, age) => acc + age.male, 0)

    console.log(normalizedAgedFemales, femaleIndividuals, normalizedAgedMales, maleIndividuals)

    expect(normalizedAgedFemales).toBe(femaleIndividuals)
    expect(normalizedAgedMales).toBe(maleIndividuals)
  })
})
