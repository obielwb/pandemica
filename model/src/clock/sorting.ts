import { Activity } from '../population/activities'

function minimumMaximum(array: number[]): number[] {
  return array.reduce(
    ([minimum, maximum], value) => [Math.min(minimum, value), Math.max(maximum, value)],
    [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]
  )
}

export function radixSort(currentActivities: Activity[]) {
  const maximumDuration = minimumMaximum(
    currentActivities.map((activity) => activity!.duration!)
  )[1]

  for (let digit = 1; maximumDuration / digit >= 1; digit *= 10) {
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

export function countingSort(currentActivities: Activity[]): Activity[] {
  const [minDuration, maxDuration] = minimumMaximum(
    currentActivities.map((activity) => activity.duration || 0)
  )

  const range = maxDuration - minDuration + 1
  const countArray = Array.from({ length: range }, () => 0)

  for (const activity of currentActivities) {
    countArray[activity.duration! - minDuration]++
  }

  let sortedActivities: Activity[] = []

  for (let i = 0; i < range; i++) {
    while (countArray[i] > 0) {
      sortedActivities.push(
        currentActivities.find((activity) => activity.duration === i + minDuration)!
      )
      countArray[i]--
    }
  }

  return sortedActivities
}

export function timSort(currentActivities: Activity[]): Activity[] {
  const minRun = 32

  function insertionSort(arr: Activity[], start: number, end: number): void {
    for (let i = start + 1; i <= end; i++) {
      const key = arr[i]
      let j = i - 1

      while (j >= start && arr[j].duration && key.duration && arr[j].duration! > key.duration) {
        arr[j + 1] = arr[j]
        j--
      }
      arr[j + 1] = key
    }
  }

  function merge(arr: Activity[], l: number, m: number, r: number): void {
    const len1 = m - l + 1
    const len2 = r - m

    const left = new Array(len1)
    const right = new Array(len2)

    for (let i = 0; i < len1; i++) {
      left[i] = arr[l + i]
    }

    for (let i = 0; i < len2; i++) {
      right[i] = arr[m + i + 1]
    }

    let i = 0,
      j = 0,
      k = l

    while (i < len1 && j < len2) {
      if (left[i].duration && right[j].duration && left[i].duration <= right[j].duration) {
        arr[k] = left[i]
        i++
      } else {
        arr[k] = right[j]
        j++
      }
      k++
    }

    while (i < len1) {
      arr[k] = left[i]
      i++
      k++
    }

    while (j < len2) {
      arr[k] = right[j]
      j++
      k++
    }
  }

  const n = currentActivities.length

  for (let i = 0; i < n; i += minRun) {
    insertionSort(currentActivities, i, Math.min(i + minRun - 1, n - 1))
  }

  for (let size = minRun; size < n; size = 2 * size) {
    for (let left = 0; left < n; left += 2 * size) {
      const mid = Math.min(left + size - 1, n - 1)
      const right = Math.min(left + 2 * size - 1, n - 1)

      if (left < mid && mid < right) {
        merge(currentActivities, left, mid, right)
      }
    }
  }

  return currentActivities
}

export function heapSort(currentActivities: Activity[]): Activity[] {
  function heapify(arr: Activity[], n: number, i: number): void {
    let largest = i
    const left = 2 * i + 1
    const right = 2 * i + 2

    if (
      left < n &&
      arr[left].duration &&
      arr[i].duration &&
      arr[left].duration! > arr[i].duration!
    ) {
      largest = left
    }

    if (
      right < n &&
      arr[right].duration &&
      arr[largest].duration &&
      arr[right].duration! > arr[largest].duration!
    ) {
      largest = right
    }

    if (largest !== i) {
      ;[arr[i], arr[largest]] = [arr[largest], arr[i]]
      heapify(arr, n, largest)
    }
  }

  const n = currentActivities.length

  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    heapify(currentActivities, n, i)
  }

  for (let i = n - 1; i > 0; i--) {
    ;[currentActivities[0], currentActivities[i]] = [currentActivities[i], currentActivities[0]]
    heapify(currentActivities, i, 0)
  }

  return currentActivities
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
