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

  public state: 'susceptible' | 'exposed' | 'infectious' | 'recovered' | 'hospitalized' | 'dead'
  public hadCovid: boolean

  public vaccine: Vaccine
  public mask: Mask

  public isInLockdown: boolean

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
      oc: this.occupations.map((o) => (o ? o.serialize!!() : null)),
      st: this.state[0],
      hdc: this.hadCovid ? 1 : 0,
      v: this.vaccine.type !== 'none' ? { t: this.vaccine.type, d: this.vaccine.doses } : null,
      m: this.mask !== 'none' ? this.mask : null
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
      ug: 'undergraduate',
      gr: 'graduate',
      us: 'unschooled',
      ed: 'educated'
    }

    const individual = new Individual()
    individual.id = deserializedIndividual.i
    individual.sex = deserializedIndividual.s === 0 ? 'male' : 'female'
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
    individual.transportationMean = deserializedIndividual.tm === 0 ? 'private' : 'public'
    individual.occupationTypes = deserializedIndividual.ot.map((o: number) =>
      o ? 'study' : 'work'
    )
    individual.occupations = deserializedIndividual.oc.map((o) =>
      o ? Occupation.deserialize(o) : null
    )
    individual.state = stateReverseMap[deserializedIndividual.st]
    individual.hadCovid = deserializedIndividual.hdc === 1
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

export type VaccineType = 'pfizer' | 'moderna' | 'astra_zeneca' | 'johnson_johnson' | 'none'

export type Vaccine = {
  type: VaccineType
  doses: number
}
