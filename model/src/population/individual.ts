import { Activity, IndividualActivity, Label } from './activities'
import { Mask, Vaccine, VaccineType } from '../calculus/data'
import { Region } from '../../data/census'

// todo: routines should change
// - social distancing stage
// - quarantine stage
// - lockdown stage
export class Individual {
  public id: number
  public sex: Sex
  public age: number[]
  public educationStatus: EducationStatus
  public currentActivity?: IndividualActivity
  public routine: Activity[][]
  public preInfectedRoutine?: Activity[][]
  public house: House
  public income: number[]
  public transportationMean: TransporationMean
  public occupationTypes: [OccupationType?, OccupationType?]
  public occupations: [Occupation?, Occupation?]

  public state: State
  public hadCovid: boolean

  public vaccine: Vaccine
  public mask: Mask

  public isInLockdown: boolean
  public daysSinceExposed?: number
  public deadAfterDaysSinceExposed?: number
  public hospitalizedAfterDaysSinceExposed?: number

  public static serialize(individual: Individual): string {
    const serializedIndividual = {
      i: individual.id,
      s: individual.sex,
      a: individual.age,
      es: individual.educationStatus,
      r: individual.routine.map((day) => day.map((activity) => Activity.serialize(activity))),
      h: House.serialize(individual.house),
      inc: individual.income,
      tm: individual.transportationMean,
      ot: individual.occupationTypes,
      oc: individual.occupations.map((o) => Occupation.serialize(o)),
      st: individual.state,
      v:
        individual.vaccine.type !== VaccineType.None
          ? { t: individual.vaccine.type, d: individual.vaccine.doses }
          : null,
      m: individual.mask
    }

    return JSON.stringify(serializedIndividual)
  }

  public static deserialize(serialized: string): Individual {
    const deserializedIndividual = JSON.parse(serialized)

    const individual = new Individual()
    individual.id = deserializedIndividual.i
    individual.sex = deserializedIndividual.s
    individual.age = deserializedIndividual.a
    individual.educationStatus = deserializedIndividual.es
    individual.currentActivity = null
    individual.routine = deserializedIndividual.r.map((day: string[]) =>
      day.map((activitySerialized) => Activity.deserialize(activitySerialized))
    )
    individual.house = House.deserialize(deserializedIndividual.h)
    individual.income = deserializedIndividual.inc || []
    individual.transportationMean = deserializedIndividual.tm
    individual.occupationTypes = deserializedIndividual.ot
    individual.occupations = deserializedIndividual.oc.map((o) => Occupation.deserialize(o))
    individual.state = deserializedIndividual.st
    individual.hadCovid = false
    individual.vaccine = deserializedIndividual.v
      ? { type: deserializedIndividual.v.t, doses: deserializedIndividual.v.d }
      : { type: '', doses: 0 }
    individual.mask = deserializedIndividual.m
    individual.isInLockdown = false
    individual.daysSinceExposed = null
    individual.hospitalizedAfterDaysSinceExposed = null
    individual.deadAfterDaysSinceExposed = null

    return individual
  }
}

export enum EducationStatus {
  None,
  Preschooler,
  MiddleSchooler,
  HighSchooler,
  Undergraduate,
  Graduate,
  Educated,
  Unschooled
}

export enum Sex {
  Male,
  Female
}

export enum TransporationMean {
  Public,
  Private
}

export enum State {
  Susceptible,
  Exposed,
  Infectious,
  Recovered,
  Hospitalized,
  Dead
}

export enum OccupationType {
  Study,
  Work
}

export class Occupation {
  constructor(
    public id: number,
    public type: OccupationType,
    public label: Label,
    public intervalSize: [number, number],
    public actualSize: number,
    public prototype?: any
  ) {}

  public static serialize(occupation: Occupation): string {
    const serializedOccupation = {
      i: occupation.id,
      t: occupation.type,
      l: occupation.label,
      is: occupation.intervalSize,
      as: occupation.actualSize,
      p: occupation.prototype
    }

    return JSON.stringify(serializedOccupation)
  }

  public static deserialize(serialized: string): Occupation {
    const deserializedOccupation = JSON.parse(serialized)
    return new Occupation(
      deserializedOccupation.i,
      deserializedOccupation.t,
      deserializedOccupation.l,
      deserializedOccupation.is,
      deserializedOccupation.as,
      deserializedOccupation.p
    )
  }
}

export class House {
  constructor(
    public id: number,
    public region: Region,
    public size: number,
    public housemates: number[]
  ) {}

  public static serialize(house: House): string {
    const serializedHouse = {
      i: house.id,
      r: house.region,
      s: house.size,
      h: house.housemates
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
