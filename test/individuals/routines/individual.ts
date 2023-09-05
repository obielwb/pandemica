import { Activity } from './data'
import { Workstation } from './workstation'

export class Individual {
  public id: string
  public sex: 'male' | 'female'
  public age: number[]
  public isWearingMask: boolean
  public housemates: number
  public studyLevel: string
  public currentActivity?: Activity
  public income: boolean
  public workstation?: Workstation
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
