import { RETIREMENT_AGE } from '../../../data/census'
import { Activity, getActivity } from '../../population/activities'
import { Individual } from '../../population/individual'

export function selectRandomDailyActivity(individual: Individual, day: number): Activity {
  const adjustedWeeklyActivityWeights = getAdjustedActivityWeights(individual, day)

  // convert weekly probabilities to daily by dividing by 7
  const dailyWeights = Object.fromEntries(
    Object.entries(adjustedWeeklyActivityWeights).map(([activity, weight]) => [
      activity,
      weight / 7
    ])
  )

  const selectedActivity = weightedRandomSelection(dailyWeights)

  return selectedActivity
}

function weightedRandomSelection(weights: { [activity: string]: number }): Activity {
  let totalWeight = Object.values(weights).reduce((acc, weight) => acc + weight, 0)
  let random = Math.floor(Math.random() * totalWeight)
  for (const [activity, weight] of Object.entries(weights)) {
    random -= weight
    if (random < 0) {
      return getActivity(activity)
    }
  }

  // fallback in case of rounding errors, shouldn't be normally reached
  return getActivity(Object.keys(weights)[0])
}

const baseWeeklyActivityWeights = {
  'shopping.grocery': 2.5,
  'shopping.pharmacy': 1,
  'shopping.bakery': 1.5,
  'shopping.mall': 1,
  'restaurant.outdoor': 1,
  'restaurant.indoor': 1,
  bar: 0.5,
  'party.outdoor': 0.2,
  'party.indoor': 0.2,
  park: 1,
  gym: 3,
  church: 1
}

function getAdjustedActivityWeights(
  individual: Individual,
  day: number
): { [key: string]: number } {
  let adjustedWeights = { ...baseWeeklyActivityWeights }

  adjustWeightsForAge(individual, adjustedWeights)
  adjustWeightsForSex(individual, adjustedWeights)
  adjustWeightsForIncome(individual, adjustedWeights)
  adjustWeightsForOccupation(individual, adjustedWeights)
  adjustWeightsForDay(day, adjustedWeights)

  return adjustedWeights
}

function adjustWeightsForAge(individual: Individual, weights: { [key: string]: number }): void {
  if (individual.age[1] < 19) {
    weights['bar'] = 0
    weights['party.outdoor'] = 0.5
    weights['party.indoor'] = 0.5
  } else if (individual.age[1] >= RETIREMENT_AGE) {
    weights['gym'] = 1.5
  }
}

function adjustWeightsForSex(individual: Individual, weights: { [key: string]: number }): void {
  if (individual.sex === 'male') {
    weights['gym'] += 0.5
  }
}

function adjustWeightsForIncome(individual: Individual, weights: { [key: string]: number }): void {
  if (individual.income[0] >= 10.0) {
    weights['shopping.mall'] += 1
    weights['shopping.grocery'] += 0.5
    weights['restaurant.indoor'] += 1
    weights['restaurant.outdoor'] += 0.5
  }
}

function adjustWeightsForOccupation(
  individual: Individual,
  weights: { [key: string]: number }
): void {
  // empty for now
}

function adjustWeightsForDay(day: number, weights: { [key: string]: number }): void {
  if (day === 0 || day === 6) {
    // increase weights for leisure activities on weekends
    weights['park'] += 0.2
    weights['shopping.mall'] += 0.5
    weights['party.outdoor'] += 0.2
    weights['party.indoor'] += 0.2
    weights['bar'] += 0.2
    // decrease gym weight as people might be less inclined to workout
    weights['gym'] -= 0.5
  } else {
    // weekdays adjustments
    // increase gym weight assuming more regular workout routines
    weights['gym'] += 0.5
    // decrease weights for some leisure activities assuming busier schedules
    weights['shopping.mall'] -= 0.2
    weights['party.outdoor'] -= 0.2
    weights['party.indoor'] -= 0.2
    weights['bar'] -= 0.1
  }

  for (let activity in weights) {
    if (weights[activity] < 0) {
      weights[activity] = 0
    }
  }
}
