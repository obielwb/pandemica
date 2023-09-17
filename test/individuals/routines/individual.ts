import { Activity } from './data'
import { Occupation } from './occupation'

export class Individual {
  public id: string
  public sex: 'male' | 'female'
  public age: number[]
  public isWearingMask: boolean
  public housemates: number
  public studyLevel: string
  public currentActivity?: Activity
  public region: string
  public income: boolean
  public occupationType: ['study'?, 'work'?]
  public occupations?: [Occupation?, Occupation?]
  public isValid?: boolean
  public riskProfile: {
    label: string
    label_short?: string
    multiplier?: number
    personalMultiplier: number
    housemates: number
    otherTraceableContacts: number
    contactsMultiplier: number
  }
  public isHospitalized: boolean
  public isDead: boolean
}
