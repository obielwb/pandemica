import { CHILD_AGE } from './../../../data/census/index'
import { RETIREMENT_AGE } from '../../../data/census'
import { Activities, Activity, getActivity } from '../../population/activities'
import { Individual } from '../../population/individual'

// todo: improve classification and remove preference over a few activities
// todo?: for isef, turn into neural network?
export function selectRandomDailyActivity(
  individual: Individual,
  day: number,
  remainingTime: number,
  previousRoutine: Activity[][],
  dailyRoutine: Activity[],
  dayOff: boolean = false
): Activity {
  const previousRoutineRandomActivities = [...previousRoutine.flat()].filter(
    (activity) => activity.category === 'leisure' || activity.category === 'shopping'
  )
  const dailyRoutineRandomActivities = [...dailyRoutine].filter(
    (activity) => activity.category === 'leisure' || activity.category === 'shopping'
  )

  const labelFrequency = !dayOff
    ? calculateLabelFrequency([...previousRoutineRandomActivities, ...dailyRoutineRandomActivities])
    : {}

  const adjustedWeeklyActivityWeights = getAdjustedActivityWeights(
    individual,
    day,
    labelFrequency,
    dayOff
  )
  const activityPenalty = !dayOff ? calculateActivityPenalty([...dailyRoutineRandomActivities]) : {}
  const activityTimeSpent = calculateActivityTimeSpent([...dailyRoutineRandomActivities])

  const adjustedWeeklyActivityWeightsEntries = Object.entries(adjustedWeeklyActivityWeights)
  // convert weekly probabilities to daily by dividing by 7
  const suitableActivities = Object.fromEntries(
    (adjustedWeeklyActivityWeightsEntries.filter(
      ([activityLabel]) => getActivity(activityLabel).duration <= remainingTime
    ).length > 0
      ? adjustedWeeklyActivityWeightsEntries.filter(
          ([activityLabel]) => getActivity(activityLabel).duration <= remainingTime
        )
      : adjustedWeeklyActivityWeightsEntries
    ).map(([activity, weight]) => {
      const activityLabel = getActivity(activity).label
      const frequencyAdjustmentFactor = getLabelAdjustmentFactor(labelFrequency, activityLabel)
      const timeSpentFactor = getTimeSpentAdjustmentFactor(activityTimeSpent, activity)
      const penalty = activityPenalty[activityLabel] || 1
      return [activity, (weight / 7) * frequencyAdjustmentFactor * timeSpentFactor * penalty]
    })
  )

  const selectedActivity = weightedRandomSelection(suitableActivities)

  return selectedActivity
}

export function selectRandomDayOffActivity(
  dailyRoutine: Activity[],
  individual: Individual,
  day: number,
  remainingTime: number,
  weeklyRoutine: Activity[][],
  transportationActivities: Activity[]
) {
  const newActivities: Activity[] = []
  let newRemainingTime = remainingTime
  const stayAtHomeActivity = getActivity(Activities.StayAtHome)

  const transportationTime =
    transportationActivities.reduce((acc, activity) => acc + activity.duration, 0) * 2

  // determine if the stay-at-home activity is in the morning or afternoon
  const isMorningStayAtHome = Math.random() <= 0.5
  if (isMorningStayAtHome) {
    // morning stay-at-home
    const morningStayDuration = Math.min(6 * 60, newRemainingTime)
    newActivities.push({ ...stayAtHomeActivity, duration: morningStayDuration })
    newActivities.push(...transportationActivities)
    newRemainingTime -= morningStayDuration + transportationTime

    // add random activities within remaining time
    while (newRemainingTime > 0) {
      const randomActivity = selectRandomDailyActivity(
        individual,
        day,
        newRemainingTime,
        weeklyRoutine,
        dailyRoutine,
        true
      )
      if (!randomActivity || randomActivity.duration > newRemainingTime) break

      newActivities.push(randomActivity)
      newRemainingTime -= randomActivity.duration
    }

    newActivities.push(...transportationActivities)
  } else {
    // afternoon stay-at-home
    newActivities.push(...transportationActivities)
    newRemainingTime -= transportationTime

    // add random activities within remaining time, leaving space for the stay-at-home activity
    while (newRemainingTime > 7 * 60) {
      const randomActivity = selectRandomDailyActivity(
        individual,
        day,
        newRemainingTime - 7 * 60,
        weeklyRoutine,
        dailyRoutine,
        true
      )
      if (!randomActivity || randomActivity.duration > newRemainingTime - 7 * 60) break

      newActivities.push(randomActivity)
      newRemainingTime -= randomActivity.duration
    }

    const afternoonStayDuration = Math.min(7 * 60, newRemainingTime)
    newRemainingTime -= afternoonStayDuration
    newActivities.push(...transportationActivities)
    newActivities.push({ ...stayAtHomeActivity, duration: afternoonStayDuration })
  }

  return newActivities
}

function calculateActivityPenalty(activities: Activity[]): { [activityName: string]: number } {
  return activities.reduce((acc, activity) => {
    acc[activity.label] = (acc[activity.label] || 0.5) * 0.5
    return acc
  }, {} as { [label: string]: number })
}

function calculateActivityTimeSpent(activities: Activity[]): { [activityName: string]: number } {
  return activities.reduce((acc, activity) => {
    acc[activity.label] = (acc[activity.label] || 0) + activity.duration
    return acc
  }, {} as { [label: string]: number })
}

function getTimeSpentAdjustmentFactor(
  timeSpent: { [activityName: string]: number },
  activityName: string
): number {
  const maxDuration = 90 // set a reasonable max duration for any activity (e.g., 2 hours)
  const duration = timeSpent[activityName] || 0
  if (duration >= maxDuration) {
    return 0.1 // significantly reduce the weight if max duration is exceeded
  }
  return 1 - duration / maxDuration // reduce the weight based on the proportion of max duration used
}

function calculateLabelFrequency(activities: Activity[]): { [label: string]: number } {
  return activities.reduce((acc, activity) => {
    if (activity.category === 'leisure' || activity.category === 'shopping') {
      acc[activity.label] = (acc[activity.label] || 0) + 1
    }
    return acc
  }, {} as { [label: string]: number })
}

function getLabelAdjustmentFactor(
  labelFrequency: { [label: string]: number },
  activityLabel: string
): number {
  // higher frequency categories are penalized more to decrease their selection chance
  const baseAdjustment = 1
  const frequency = labelFrequency[activityLabel] || 0
  if (frequency === 0) {
    return baseAdjustment
  }
  return Math.max(baseAdjustment - frequency * 0.1, 0.1) // ensure adjustment factor doesn't go below a minimum threshold
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
  'shopping.grocery': 2,
  'shopping.pharmacy': 1,
  'shopping.bakery': 2,
  'shopping.mall': 1,
  'errands.restaurant.outdoor': 1,
  'errands.restaurant.indoor': 1,
  'leisure.bar': 0.5,
  'leisure.party.outdoor': 0.25,
  'leisure.party.indoor': 0.25,
  'leisure.park': 1,
  'leisure.gym': 3,
  'leisure.church': 1
}

function getAdjustedActivityWeights(
  individual: Individual,
  day: number,
  labelFrequency: { [key: string]: number },
  dayOff: boolean
): { [key: string]: number } {
  let adjustedWeights = { ...baseWeeklyActivityWeights } as { [key: string]: number }

  adjustedWeights = adjustWeightsForAge(individual, adjustedWeights)
  adjustedWeights = adjustWeightsForSex(individual, adjustedWeights)
  adjustedWeights = adjustWeightsForIncome(individual, adjustedWeights)
  adjustedWeights = adjustWeightsForOccupation(individual, adjustedWeights)
  adjustedWeights = adjustWeightsForDay(day, adjustedWeights, dayOff)

  for (const [label, frequency] of Object.entries(labelFrequency)) {
    adjustedWeights[label] -= frequency

    if (adjustedWeights[label] < 0) {
      adjustedWeights[label] = 0
    }
  }

  return adjustedWeights
}

function adjustWeightsForAge(
  individual: Individual,
  weights: { [key: string]: number }
): { [key: string]: number } {
  if (individual.age[1] <= CHILD_AGE) {
    weights['leisure.bar'] = 0
    weights['leisure.gym'] = 0
  }

  if (individual.age[1] >= CHILD_AGE && individual.age[1] <= 19) {
    weights['leisure.party.outdoor'] += 0.5
    weights['leisure.party.indoor'] += 0.5
  } else if (individual.age[1] >= RETIREMENT_AGE) {
    weights['leisure.gym'] /= 2
    weights['leisure.church'] += 1
  }

  return weights
}

function adjustWeightsForSex(
  individual: Individual,
  weights: { [key: string]: number }
): { [key: string]: number } {
  if (individual.sex === 'male') {
    weights['leisure.gym'] += 0.5
  }

  return weights
}

function adjustWeightsForIncome(
  individual: Individual,
  weights: { [key: string]: number }
): { [key: string]: number } {
  if (individual.income[0] >= 10.0) {
    weights['shopping.mall'] += 1
    weights['shopping.grocery'] += 0.5
    weights['errands.restaurant.indoor'] += 1
    weights['errands.restaurant.outdoor'] += 0.5
  }

  return weights
}

function adjustWeightsForOccupation(
  individual: Individual,
  weights: { [key: string]: number }
): { [key: string]: number } {
  // empty for now
  return weights
}

function adjustWeightsForDay(
  day: number,
  weights: { [key: string]: number },
  dayOff: boolean
): { [key: string]: number } {
  if (day === 0 || day === 6 || dayOff) {
    // increase weights for leisure activities on weekends
    weights['leisure.park'] += 0.25
    weights['shopping.mall'] += 1
    weights['leisure.party.outdoor'] += 0.5
    weights['leisure.party.indoor'] += 0.5
    weights['leisure.bar'] += 0.5
    // decrease gym weight as people might be less inclined to workout
    weights['leisure.gym'] -= 0.5
  } else {
    // weekdays adjustments
    // increase gym weight assuming more regular workout routines
    weights['leisure.gym'] += 0.5
    // decrease weights for some leisure activities assuming busier schedules
    weights['shopping.mall'] -= 0.25
    weights['leisure.party.outdoor'] -= 0.25
    weights['leisure.party.indoor'] -= 0.25
    weights['leisure.bar'] -= 0.5
  }

  for (let activity in weights) {
    if (weights[activity] < 0) {
      weights[activity] = 0
    }
  }

  return weights
}
