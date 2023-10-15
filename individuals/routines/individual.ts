import { Activity } from './data'

export class Individual {
  public id: string // done
  public sex: 'male' | 'female' // done
  public age: number[] // done
  public isWearingMask: boolean // done
  public studyLevel: string
  public currentActivity: Activity
  public routine: Activity[]
  public house: House // done
  public income: boolean
  public vehicle: string
  public occupationType: ['study'?, 'work'?]
  public occupations?: [Occupation?, Occupation?]
  public isValid?: boolean // done
  public riskProfile: RiskProfile
  public isHospitalized: boolean // done
  public isDead: boolean // done
}

export type Occupation = {
  id: string
  label: string // occupation name, can be a industry, company or school
  size: number // number of people related to this occupation
}

export type Workstation = Occupation
export type Study = Occupation

export type House = {
  id: string
  region: string
  housemates: Individual[]
}

export type RiskProfile = {
  label: string
  label_short?: string
  multiplier?: number
  personalMultiplier: number
  housemates: number
  otherTraceableContacts: number
  contactsMultiplier: number
}
