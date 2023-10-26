import { Activity } from '../activities'

export function radixSort(currentActivities: Activity[]) {
  const maxDuration = Math.max(...currentActivities.map((activity) => activity!.duration!))

  for (let digit = 1; maxDuration / digit >= 1; digit *= 10) {
    const buckets = Array.from({ length: 10 }, () => [] as Activity[])

    for (const activity of currentActivities) {
      const bucketIndex = Math.floor((activity!.duration! / digit) % 10)
      buckets[bucketIndex].push(activity)
    }

    currentActivities = buckets.flat()
  }

  return currentActivities
}

export function quickSort(
  currentActivities: Activity[],
  left: number = 0,
  right: number = currentActivities.length - 1
) {
  let index: number

  if (currentActivities.length > 1) {
    index = partition(currentActivities, left, right)

    if (left < index - 1) {
      quickSort(currentActivities, left, index - 1)
    }

    if (index < right) {
      quickSort(currentActivities, index, right)
    }
  }

  return currentActivities
}

function partition(
  currentActivities: Activity[],
  left: number = 0,
  right: number = currentActivities.length - 1
) {
  const pivot = currentActivities[Math.floor((right + left) / 2)]!.duration!
  let i = left
  let j = right

  while (i <= j) {
    while (currentActivities[i]!.duration! < pivot) {
      i++
    }

    while (currentActivities[j]!.duration! > pivot) {
      j--
    }

    if (i <= j) {
      ;[currentActivities[i], currentActivities[j]] = [currentActivities[j], currentActivities[i]]
      i++
      j--
    }
  }

  return i
}

export function mergeSort(currentActivities: Activity[]) {
  if (currentActivities.length <= 1) {
    return currentActivities
  }

  const middleIndex = Math.floor(currentActivities.length / 2)
  const left = mergeSort(currentActivities.slice(0, middleIndex))
  const right = mergeSort(currentActivities.slice(middleIndex))

  return merge(left, right)
}

function merge(left: Activity[], right: Activity[]): Activity[] {
  const result: Activity[] = []

  let leftIndex = 0
  let rightIndex = 0

  while (leftIndex < left.length && rightIndex < right.length) {
    if (left[leftIndex]!.duration! < right[rightIndex]!.duration!) {
      result.push(left[leftIndex])
      leftIndex++
    } else {
      result.push(right[rightIndex])
      rightIndex++
    }
  }

  return result.concat(left.slice(leftIndex)).concat(right.slice(rightIndex))
}

export function insertionSort(currentActivities: Activity[]) {
  for (let i = 1; i < currentActivities.length; i++) {
    const activity = currentActivities[i]
    let j = i - 1

    while (j >= 0 && currentActivities[j]!.duration! > activity!.duration!) {
      currentActivities[j + 1] = currentActivities[j]
      j--
    }

    currentActivities[j + 1] = activity
  }

  return currentActivities
}

export function bubbleSort(currentActivities: Activity[]) {
  for (let i = 0; i < currentActivities.length - 1; i++) {
    for (let j = 0; j < currentActivities.length - i - 1; j++) {
      if (currentActivities[j]!.duration! > currentActivities[j + 1]!.duration!) {
        const temp = currentActivities[j]
        currentActivities[j] = currentActivities[j + 1]
        currentActivities[j + 1] = temp
      }
    }
  }

  return currentActivities
}

export function vanillaSort(currentActivities: Activity[]) {
  return currentActivities.sort((a, b) => a!.duration! - b!.duration!)
}
