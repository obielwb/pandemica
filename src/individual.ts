import type { Activity, Distance, IndividualActivity, Voice } from './activities'

// todo: routines should change
// - social distancing stage
// - quarantine stage
// - lockdown stage
export class Individual {
  public id: string // done
  public sex: 'male' | 'female' // done
  public age: number[] // done
  public studyLevel: string
  public currentActivity?: IndividualActivity
  public routine: Activity[]
  public house: House // done
  public income: string
  public vehicle: string
  public occupationType: ['study'?, 'work'?]
  public occupations?: [Occupation?, Occupation?]
  public isValid?: boolean // done

  public isHospitalized: boolean // done
  public isDead: boolean // done
  public hasCovid: boolean

  public vaccine: Vaccine
  public mask: Mask // done
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
