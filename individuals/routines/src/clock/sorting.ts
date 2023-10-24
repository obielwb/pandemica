import { Individual } from '../individual'

export function radixSort(individuals: Individual[]) {
  const maxDuration = Math.max(
    ...individuals.map((individual) => individual.currentActivity!.duration!)
  )

  for (let digit = 1; maxDuration / digit >= 1; digit *= 10) {
    const buckets = Array.from({ length: 10 }, () => [] as Individual[])

    for (const individual of individuals) {
      const bucketIndex = Math.floor((individual.currentActivity!.duration! / digit) % 10)
      buckets[bucketIndex].push(individual)
    }

    individuals = buckets.flat()
  }

  return individuals
}

export function quickSort(individuals: Individual[]): Individual[] {
  if (individuals.length <= 1) {
    return individuals
  }

  const stack: Individual[][] = [[...individuals]]

  while (stack.length) {
    const subarray = stack.pop()!

    if (subarray.length <= 1) {
      continue
    }

    const pivotIndex = Math.floor(subarray.length / 2)
    const pivot = subarray[pivotIndex]

    const less: Individual[] = []
    const greater: Individual[] = []

    for (const individual of subarray) {
      if (individual.currentActivity!.duration! < pivot.currentActivity!.duration!) {
        less.push(individual)
      } else {
        greater.push(individual)
      }
    }

    stack.push(greater)
    stack.push(less)
  }

  return individuals
}

export function mergeSort(individuals: Individual[]) {
  if (individuals.length <= 1) {
    return individuals
  }

  const middleIndex = Math.floor(individuals.length / 2)
  const left = mergeSort(individuals.slice(0, middleIndex))
  const right = mergeSort(individuals.slice(middleIndex))

  return merge(left, right)
}

function merge(left: Individual[], right: Individual[]): Individual[] {
  const result: Individual[] = []

  let leftIndex = 0
  let rightIndex = 0

  while (leftIndex < left.length && rightIndex < right.length) {
    if (left[leftIndex].currentActivity!.duration! < right[rightIndex].currentActivity!.duration!) {
      result.push(left[leftIndex])
      leftIndex++
    } else {
      result.push(right[rightIndex])
      rightIndex++
    }
  }

  return result.concat(left.slice(leftIndex)).concat(right.slice(rightIndex))
}

export function insertionSort(individuals: Individual[]) {
  for (let i = 1; i < individuals.length; i++) {
    const currentIndividual = individuals[i]
    let j = i - 1

    while (
      j >= 0 &&
      individuals[j].currentActivity!.duration! > currentIndividual.currentActivity!.duration!
    ) {
      individuals[j + 1] = individuals[j]
      j--
    }

    individuals[j + 1] = currentIndividual
  }

  return individuals
}

export function bubbleSort(individuals: Individual[]) {
  for (let i = 0; i < individuals.length - 1; i++) {
    for (let j = 0; j < individuals.length - i - 1; j++) {
      if (
        individuals[j].currentActivity!.duration! > individuals[j + 1].currentActivity!.duration!
      ) {
        const temp = individuals[j]
        individuals[j] = individuals[j + 1]
        individuals[j + 1] = temp
      }
    }
  }

  return individuals
}

export function vanillaSort(individuals: Individual[]) {
  return individuals.sort((a, b) => a.currentActivity!.duration! - b.currentActivity!.duration!)
}
