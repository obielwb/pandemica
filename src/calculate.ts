import { Activity, IndividualActivity } from './activities'
import {
  AgeMultipler,
  DistanceMultiplier,
  MaskMultiplier,
  SettingMultiplier,
  VaccinesRiskReduction,
  VoiceMultiplier
} from './data'
import { Individual } from './individual'

export function calculate(
  activity: IndividualActivity,
  individualsWithCovid: Individual[],
  individualInFocus: Individual
): number {
  const setting = SettingMultiplier[activity.setting]
  const distance = DistanceMultiplier[activity.distance]
  const environment = setting * distance * activity.duration

  let withCovidMultiplier = 0
  individualsWithCovid.forEach((individual) => {
    const vaccineMultiplier =
      1 - VaccinesRiskReduction[individual.vaccine.type].multiplierPerDose[individual.vaccine.doses]

    withCovidMultiplier +=
      MaskMultiplier[individual.mask] * VoiceMultiplier[activity.voice] * vaccineMultiplier * 1
  })

  const vaccineMultiplier =
    1 -
    VaccinesRiskReduction[individualInFocus.vaccine.type].multiplierPerDose[
      individualInFocus.vaccine.doses
    ]

  // values used in death and hospitalization calculation
  let deathRate = 0
  let hospitalizationRate = 0
  for (const age in AgeMultipler) {
    if (individualInFocus.age[1] <= AgeMultipler[age].interval[1]) {
      deathRate = AgeMultipler[age].deathRate
      hospitalizationRate = AgeMultipler[age].hospitalizationRate
    }
  }

  let individualMultiplier = MaskMultiplier[individualInFocus.mask] * vaccineMultiplier
  if (individualInFocus.hadCovid) individualMultiplier * 0.08

  return environment * withCovidMultiplier * individualMultiplier
}
