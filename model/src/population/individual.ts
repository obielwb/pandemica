import { Activity, IndividualActivity } from './activities'
import { MaskType, Vaccine } from '../calculus/data'

// todo: routines should change
// - social distancing stage
// - quarantine stage
// - lockdown stage
export class Individual {
  public id: number
  public sex: 'm' | 'f'
  public age: number[]
  public educationStatus: string
  public currentActivity?: IndividualActivity
  public routine: Activity[][]
  public house: House
  public income: number[]
  public transportationMean: 'pr' | 'pu'
  public occupationTypes: [OccupationType?, OccupationType?]
  public occupations: [Occupation?, Occupation?]

  public state: 'susceptible' | 'exposed' | 'infectious' | 'recovered' | 'hospitalized' | 'dead'
  public hadCovid: boolean

  public vaccine: Vaccine
  public mask: MaskType

  public isInLockdown: boolean
  public daysSinceExposed?: number

  public serialize?(): string {
    const educationStatusMap = {
      ps: 'ps',
      ms: 'ms',
      hs: 'hs',
      ug: 'ug',
      g: 'gr',
      us: 'us',
      ed: 'ed'
    }

    const serializedIndividual = {
      i: this.id,
      s: this.sex === 'm' ? 0 : 1,
      a: this.age,
      es: educationStatusMap[this.educationStatus],
      ca: this.currentActivity ? this.currentActivity.serialize() : null,
      r: this.routine.map((row) => row.map((activity) => activity.serialize())),
      h: this.house.serialize!!(),
      inc: this.income,
      tm: this.transportationMean === 'pr' ? 0 : 1,
      ot: this.occupationTypes.map((o) => (o === 's' ? 1 : 0)),
      oc: this.occupations.map((o) => (o ? o.serialize!!() : null)),
      st: this.state[0],
      hdc: this.hadCovid ? 1 : 0,
      v: this.vaccine.type !== '' ? { t: this.vaccine.type, d: this.vaccine.doses } : null,
      m: this.mask !== '' ? this.mask : null,
      l: this.isInLockdown ? 1 : 0,
      dse: this.daysSinceExposed ? this.daysSinceExposed : null
    }

    return JSON.stringify(serializedIndividual)
  }

  public static deserialize(serialized: string): Individual {
    const deserializedIndividual = JSON.parse(serialized)

    const stateReverseMap = {
      s: 'susceptible',
      e: 'exposed',
      i: 'infectious',
      r: 'recovered',
      h: 'hospitalized',
      d: 'dead'
    }

    const educationStatusReverseMap = {
      ps: 'preschool',
      ms: 'middle_school',
      hs: 'high_school',
      ug: 'ug',
      gr: 'g',
      us: 'us',
      ed: 'ed'
    }

    const individual = new Individual()
    individual.id = deserializedIndividual.i
    individual.sex = deserializedIndividual.s === 0 ? 'm' : 'f'
    individual.age = deserializedIndividual.a
    individual.educationStatus = educationStatusReverseMap[deserializedIndividual.es]
    individual.currentActivity = deserializedIndividual.ca
      ? IndividualActivity.deserialize(deserializedIndividual.ca)
      : undefined
    individual.routine = deserializedIndividual.r.map((row: string[]) =>
      row.map((activitySerialized) => Activity.deserialize(activitySerialized))
    )
    individual.house = House.deserialize(deserializedIndividual.h)
    individual.income = deserializedIndividual.inc || []
    individual.transportationMean = deserializedIndividual.tm === 0 ? 'pr' : 'pu'
    individual.occupationTypes = deserializedIndividual.ot.map((o: number) => (o === 1 ? 's' : 'w'))
    individual.occupations = deserializedIndividual.oc.map((o) =>
      o ? Occupation.deserialize(o) : null
    )
    individual.state = stateReverseMap[deserializedIndividual.st]
    individual.hadCovid = deserializedIndividual.hdc === 1
    individual.vaccine = deserializedIndividual.v
      ? { type: deserializedIndividual.v.t, doses: deserializedIndividual.v.d }
      : { type: '', doses: 0 }
    individual.mask = deserializedIndividual.m || ''
    individual.isInLockdown = deserializedIndividual.l === 1
    individual.daysSinceExposed = deserializedIndividual.dse

    return individual
  }
}

export type OccupationType = 's' | 'w'

export class Occupation {
  public label: string

  constructor(
    public id: number,
    public type: OccupationType,
    label: string,
    public intervalSize: [number, number],
    public actualSize: number
  ) {
    this.label = `${this.type}.${label}`
  }

  public serialize?(): string {
    const serializedOccupation = {
      i: this.id,
      t: this.type[0],
      l: this.label,
      is: this.intervalSize,
      as: this.actualSize
    }

    return JSON.stringify(serializedOccupation)
  }

  public static deserialize(serialized: string): Occupation {
    const deserializedOccupation = JSON.parse(serialized)
    return new Occupation(
      deserializedOccupation.i,
      deserializedOccupation.t === 's' ? 's' : 'w',
      deserializedOccupation.l,
      deserializedOccupation.is,
      deserializedOccupation.as
    )
  }
}

export class House {
  constructor(
    public id: number,
    public region: string,
    public size: number,
    public housemates: number[]
  ) {}

  public serialize?(): string {
    const regionMap = (region: string) => {
      let serializedRegion = region[0]
      if (region.endsWith('west')) serializedRegion += 'w'
      return serializedRegion
    }

    const serializedHouse = {
      i: this.id,
      r: regionMap(this.region),
      s: this.size,
      h: this.housemates
    }

    return JSON.stringify(serializedHouse)
  }

  public static deserialize(serialized: string): House {
    const deserializedHouse = JSON.parse(serialized)

    const regionReverseMap = {
      s: 'south',
      sw: 'southwest',
      e: 'east',
      n: 'north',
      nw: 'northwest'
    }

    const house = new House(
      deserializedHouse.i,
      regionReverseMap[deserializedHouse.r],
      deserializedHouse.s,
      deserializedHouse.h
    )

    return house
  }
}
