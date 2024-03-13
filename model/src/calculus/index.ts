import { IndividualActivity } from '../population/activities'
import {
  AgeMultipler,
  DistanceMultiplier,
  MaskMultiplier,
  SettingMultiplier,
  VaccinesRiskReduction,
  VoiceMultiplier
} from './data'
import { Individual } from '../population/individual'
import { log } from '../utilities'

const contractionProbabilityThreshold = 0.3

// todo: verify if calculate function should be called when the individual is asleep
export function calculate(
  activity: IndividualActivity,
  individualsWithCovid: Individual[],
  individualInFocus: Individual,
  threshold: number = contractionProbabilityThreshold
) {
  const setting = SettingMultiplier[activity.setting]
  const distance = DistanceMultiplier[activity.distance]
  const environment = setting * distance * (activity.duration / 60)

  let withCovidMultiplier = 0
  individualsWithCovid.forEach((individual) => {
    let vaccineMultiplier = 1
    if (individual.vaccine.type !== '') {
      vaccineMultiplier =
        1 -
        VaccinesRiskReduction[individual.vaccine.type].multiplierPerDose[
          individual.vaccine.doses - 1
        ]
    }

    withCovidMultiplier +=
      MaskMultiplier[individual.mask] * VoiceMultiplier[activity.voice] * vaccineMultiplier * 1
  })

  let vaccineMultiplier = 1
  if (individualInFocus.vaccine.type !== '') {
    vaccineMultiplier =
      1 -
      VaccinesRiskReduction[individualInFocus.vaccine.type].multiplierPerDose[
        individualInFocus.vaccine.doses - 1
      ]
  }

  // values used in death and hospitalization calculation
  let deathProbability = 0
  let hospitalizationProbability = 0
  for (const age in AgeMultipler) {
    if (individualInFocus.age[1] <= AgeMultipler[age].interval[1]) {
      deathProbability = AgeMultipler[age].deathRate
      hospitalizationProbability = AgeMultipler[age].hospitalizationRate
      break
    }
  }

  let individualMultiplier = MaskMultiplier[individualInFocus.mask] * vaccineMultiplier
  if (individualInFocus.hadCovid) individualMultiplier * 0.08

  const contractionProbability = environment * withCovidMultiplier * individualMultiplier
  log('Contraction Probability: ' + contractionProbability)

  let acquiredCovid = false
  if (contractionProbability >= threshold) acquiredCovid = true

  return {
    deathProbability,
    hospitalizationProbability,
    acquiredCovid
  }
}
