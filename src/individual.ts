import { Activity, IndividualActivity } from './activities'

// todo: routines should change
// - social distancing stage
// - quarantine stage
// - lockdown stage
export class Individual {
  public id: number
  public sex: 'male' | 'female'
  public age: number[]
  public educationStatus: string
  public currentActivity?: IndividualActivity
  public routine: Activity[][]
  public house: House
  public income: number[]
  public transportationMean: 'private' | 'public'
  public occupationTypes: [OccupationType?, OccupationType?]
  public occupations: [Occupation?, Occupation?]

  public state: 'susceptible' | 'exposed' | 'infectious' | 'recovered' | 'dead'
  public hadCovid: boolean

  public vaccine: Vaccine
  public mask: Mask

  public serialize?(): string {
    const educationStatusMap = {
      preschool: 'ps',
      middle_school: 'ms',
      high_school: 'hs',
      undergraduate: 'ug',
      graduate: 'gr',
      unschooled: 'us',
      educated: 'ed'
    }

    const serializedIndividual = {
      i: this.id,
      s: this.sex === 'male' ? 0 : 1,
      a: this.age,
      es: educationStatusMap[this.educationStatus],
      ca: this.currentActivity ? this.currentActivity.serialize() : null,
      r: this.routine.map((row) => row.map((activity) => activity.serialize())),
      h: this.house.serialize!!(),
      inc: this.income,
      tm: this.transportationMean === 'private' ? 0 : 1,
      ot: this.occupationTypes.map((o) => (o ? 1 : 0)),
      oc: this.occupations.map((o) => (o ? o.id : null)),
      st: this.state,
      hdc: this.hadCovid ? 1 : 0,
      v: this.vaccine.type !== 'none' ? { t: this.vaccine.type, d: this.vaccine.doses } : null,
      m: this.mask !== 'none' ? this.mask : null
    }

    return JSON.stringify(serializedIndividual)
  }

  public static deserialize(serialized: string): Individual {
    const deserializedIndividual = JSON.parse(serialized)

    const individual = new Individual()
    individual.id = deserializedIndividual.i
    individual.sex = deserializedIndividual.s === 0 ? 'male' : 'female'
    individual.age = deserializedIndividual.a
    individual.educationStatus = deserializedIndividual.es
    individual.currentActivity = deserializedIndividual.ca
      ? IndividualActivity.deserialize(deserializedIndividual.ca)
      : undefined
    individual.routine = deserializedIndividual.r.map((row: string[]) =>
      row.map((activitySerialized) => Activity.deserialize(activitySerialized))
    )
    individual.house = House.deserialize(deserializedIndividual.h)
    individual.income = deserializedIndividual.inc || []
    individual.transportationMean = deserializedIndividual.tm === 0 ? 'private' : 'public'
    individual.occupationTypes = deserializedIndividual.ot.map((o: number) =>
      o ? 'study' : 'work'
    )
    individual.occupations = deserializedIndividual.oc.map((o) =>
      o ? Occupation.deserialize(o) : null
    )
    individual.state = deserializedIndividual.st
    individual.vaccine = deserializedIndividual.v
      ? { type: deserializedIndividual.v.t, doses: deserializedIndividual.v.d }
      : { type: 'none', doses: 0 }
    individual.mask = deserializedIndividual.m || 'none'

    return individual
  }
}

type OccupationType = 'study' | 'work'

export class Occupation {
  constructor(
    public id: number,
    public type: OccupationType,
    public label: string,
    public intervalSize: [number, number],
    public actualSize: number
  ) {}

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
      deserializedOccupation.t === 's' ? 'study' : 'work',
      deserializedOccupation.l,
      deserializedOccupation.is,
      deserializedOccupation.as
    )
  }
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

export class House {
  constructor(
    public id: number,
    public region: string,
    public size: number,
    public housemates: number[]
  ) {}

  public serialize?(): string {
    const serializedHouse = {
      i: this.id,
      r: this.region,
      s: this.size,
      h: this.housemates
    }
    return JSON.stringify(serializedHouse)
  }

  public static deserialize(serialized: string): House {
    const deserializedHouse = JSON.parse(serialized)
    const house = new House(
      deserializedHouse.i,
      deserializedHouse.r,
      deserializedHouse.s,
      deserializedHouse.h
    )
    return house
  }
}

export type Vaccine = {
  type: 'pfizer' | 'moderna' | 'astra_zeneca' | 'johnson_johnson' | 'none'
  doses: number
}
