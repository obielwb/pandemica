import { Individual } from './individual'

export type Category = 'leisure' | 'work' | 'home' | 'transportation' | 'shopping' | 'study'
export type Distance = 'normal' | 'sixFt' | 'tenFt'
export type Setting = 'indoor' | 'outdoor'
export type Voice = 'silent' | 'normal' | 'loud'

export class Activity {
  constructor(
    public category: Category,
    public label: string,
    public setting: Setting,
    public duration: number,
    public distance: Distance,
    public voice: Voice,
    public maximumIndividualsEngaged: number
  ) {}

  public serialize(): string {
    const serializedActivity = {
      c: this.category[0],
      l: this.label,
      s: this.setting[0],
      d: this.duration,
      dst: this.distance,
      v: this.voice[0],
      m: this.maximumIndividualsEngaged
    }
    return JSON.stringify(serializedActivity)
  }

  public static deserialize(serialized: string): Activity {
    const deserializedActivity = JSON.parse(serialized)
    const activity = new Activity(
      Activity.categoryFromShortString(deserializedActivity.c),
      deserializedActivity.l,
      Activity.settingFromShortString(deserializedActivity.s),
      deserializedActivity.d,
      deserializedActivity.dst as Distance,
      Activity.voiceFromShortString(deserializedActivity.v),
      deserializedActivity.m
    )

    return activity
  }

  private static categoryFromShortString(
    shortString: string
  ): 'leisure' | 'work' | 'home' | 'transportation' | 'shopping' | 'study' {
    const map = {
      l: 'leisure',
      w: 'work',
      h: 'home',
      t: 'transportation',
      s: 'shopping',
      y: 'study'
    }
    return map[shortString] || 'leisure'
  }

  private static settingFromShortString(shortString: string): Setting {
    return shortString === 'i' ? 'indoor' : 'outdoor'
  }

  private static voiceFromShortString(shortString: string): Voice {
    const map = {
      s: 'silent',
      n: 'normal',
      l: 'loud'
    }
    return map[shortString] || 'normal'
  }
}

export class IndividualActivity extends Activity {
  constructor(
    public id: number,
    category: Category,
    label: string,
    setting: Setting,
    duration: number,
    distance: Distance,
    voice: Voice,
    maximumIndividualsEngaged: number,
    public individualsEngaged: number[],
    public activityStartedAt?: Date,
    public activityEndedAt?: Date,
    public engagedAt?: Date
  ) {
    super(category, label, setting, duration, distance, voice, maximumIndividualsEngaged)
  }

  public serialize(): string {
    const serializedData = {
      ...JSON.parse(super.serialize()),
      id: this.id,
      ie: this.individualsEngaged,
      sa: this.activityStartedAt?.toISOString(),
      aea: this.activityEndedAt?.toISOString(),
      ea: this.engagedAt?.toISOString()
    }
    return JSON.stringify(serializedData)
  }

  public static deserialize(serialized: string): IndividualActivity {
    const deserializedData = JSON.parse(serialized)
    const activity = super.deserialize(JSON.stringify(deserializedData))

    const individualActivity = new IndividualActivity(
      deserializedData.id,
      activity.category,
      activity.label,
      activity.setting,
      activity.duration,
      activity.distance,
      activity.voice,
      activity.maximumIndividualsEngaged,
      deserializedData.ie,
      deserializedData.sa ? new Date(deserializedData.sa) : undefined,
      deserializedData.aea ? new Date(deserializedData.aea) : undefined,
      deserializedData.ea ? new Date(deserializedData.ea) : undefined
    )

    return individualActivity
  }
}

// todo: consertar voz e distância para fazer sentido
export const groceryShopping = new Activity(
  'shopping',
  'shopping.grocery',
  'indoor',
  1 * 60,
  'normal',
  'normal',
  80
)

export const pharmacyShopping = new Activity(
  'shopping',
  'shopping.pharmacy',
  'indoor',
  1 * 60,
  'normal',
  'normal',
  20
)

export const restaurantOutdoors = new Activity(
  'leisure',
  'restaurant.outdoor',
  'outdoor',
  1 * 60,
  'normal',
  'normal',
  50
)

export const restaurantIndoors = new Activity(
  'leisure',
  'restaurant.indoor',
  'indoor',
  1 * 60,
  'normal',
  'normal',
  40
)

export const bar = new Activity('leisure', 'bar', 'indoor', 2 * 60, 'normal', 'normal', 30)

export const outdoorParty = new Activity(
  'leisure',
  'party.outdoor',
  'outdoor',
  3 * 60,
  'normal',
  'normal',
  50
)

export const indoorParty = new Activity(
  'leisure',
  'party.indoor',
  'indoor',
  3 * 60,
  'normal',
  'normal',
  30
)

export const house = new Activity(
  'home',
  'house',
  'indoor',
  10 * 60,
  'normal',
  'normal',
  11 // maximum number of residents per house
)

export const schoolClassroom = new Activity(
  'study',
  'school.classroom',
  'indoor',
  6 * 60,
  'normal',
  'normal',
  30
)

export const publicTransportStation = new Activity(
  'transportation',
  'transportation.public.station',
  'outdoor',
  20,
  'normal',
  'normal',
  10
)

export const publicTransportationRide = new Activity(
  'transportation',
  'transportation.public.ride',
  'indoor',
  20,
  'normal',
  'normal',
  50
)

export const park = new Activity('leisure', 'park', 'outdoor', 1.5 * 60, 'normal', 'normal', 50)

export const activities: { [activity: string]: Activity } = {
  groceryShopping,
  pharmacyShopping,
  restaurantOutdoors,
  restaurantIndoors,
  bar,
  outdoorParty,
  indoorParty,
  house,
  schoolClassroom,
  publicTransportStation,
  park
}

export const activitiesList = [
  groceryShopping,
  pharmacyShopping,
  restaurantOutdoors,
  restaurantIndoors,
  bar,
  outdoorParty,
  indoorParty,
  house,
  schoolClassroom,
  // hospital,
  publicTransportStation,
  park
]

export enum ActivityType {
  Grocery = 'grocery',
  RestaurantOutdoors = 'restaurantOutdoors',
  RestaurantIndoors = 'restaurantIndoors',
  Bar = 'bar',
  OutdoorParty = 'outdoorParty',
  IndoorParty = 'indoorParty',
  House = 'house',
  School = 'school',
  Hospital = 'hospital',
  PublicTransportStation = 'publicTransportStation',
  PublicTransportStationCrowded = 'publicTransportStationCrowded',
  Parks = 'parks'
}

export const pastActivities: IndividualActivity[] = []
