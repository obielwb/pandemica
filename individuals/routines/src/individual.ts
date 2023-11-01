import type { Activity, IndividualActivity } from './activities'

export class Individual {
  public id: string // done
  public sex: 'male' | 'female' // done
  public age: number[] // done
  public mask: Mask // done
  public studyLevel: string
  public currentActivity?: IndividualActivity
  // todo: routines should change
  // - social distancing stage
  // - quarantine stage
  // - lockdown stage
  public routine: Activity[]
  public house: House // done
  public income: string
  public vehicle: string
  public occupationType: ['study'?, 'work'?]
  public occupations?: [Occupation?, Occupation?]
  public isValid?: boolean // done
  public riskNumber: number
  public isHospitalized: boolean // done
  public isDead: boolean // done
  public vaccine: Vaccine
}

export type Occupation = {
  id: string
  label: string // occupation name, can be a industry, company or school
  size: number // number of people related to this occupation
}

export type Mask =
  | 'none'
  | 'thin'
  | 'basic'
  | 'surgical'
  | 'filtered'
  | 'n95'
  | 'n95Sealed'
  | 'p100'

export type House = {
  id: string
  region: string
  size: number
  housemates: Partial<Individual>[]
}

export type RiskProfile = {
  label: string
  shortLabel?: string
  multiplier?: number
  personalMultiplier: number
  housemates: number
  otherTraceableContacts: number
  contactsMultiplier: number
}

export type Vaccine = {
  type: 'pfizer' | 'moderna' | 'astra_zeneca' | 'johnson_johnson' | ''
  doses: number
}
