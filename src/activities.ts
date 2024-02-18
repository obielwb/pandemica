export type Category =
  | 'leisure'
  | 'errands'
  | 'work'
  | 'home'
  | 'transport'
  | 'shopping'
  | 'study'
  | 'sleep'
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

  private static categoryFromShortString(shortString: string): Category {
    const map = {
      l: 'leisure',
      e: 'errands',
      w: 'work',
      h: 'home',
      t: 'transport',
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

export const bakeryShopping = new Activity(
  'shopping',
  'shopping.bakery',
  'indoor',
  15,
  'normal',
  'normal',
  10
)

export const restaurantOutdoors = new Activity(
  'errands',
  'restaurant.outdoor',
  'outdoor',
  1 * 60,
  'normal',
  'normal',
  50
)

export const restaurantIndoors = new Activity(
  'errands',
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

export const park = new Activity('leisure', 'park', 'outdoor', 1.5 * 60, 'normal', 'normal', 50)
export const gym = new Activity('leisure', 'gym', 'indoor', 1 * 60, 'normal', 'normal', 30)
export const church = new Activity('leisure', 'church', 'indoor', 1 * 60, 'normal', 'normal', 50)

export const stayAtHome = new Activity(
  'home',
  'home',
  'indoor',
  10 * 60,
  'normal',
  'normal',
  11 // maximum number of residents per house
)

export const publicTransportStation = new Activity(
  'transport',
  'transport.public.station',
  'outdoor',
  15,
  'normal',
  'normal',
  10
)

export const publicTransportRide = new Activity(
  'transport',
  'transport.public.ride',
  'indoor',
  45,
  'normal',
  'normal',
  50
)

export const privateTransportRide = new Activity(
  'transport',
  'transport.public.ride',
  'indoor',
  30,
  'normal',
  'normal',
  5
)

export const microIndustryWorkInPerson = new Activity(
  'work',
  'work.industry.micro',
  'indoor',
  8 * 60, // can vary to 12x36
  'normal',
  'normal',
  10
)

export const smallIndustryWorkInPerson = new Activity(
  'work',
  'work.industry.small',
  'indoor',
  8 * 60, // can vary to 12x36
  'normal',
  'normal',
  60
)

export const mediumIndustryWorkInPerson = new Activity(
  'work',
  'work.industry.medium',
  'indoor',
  12 * 60,
  'normal',
  'normal',
  300
)

export const largeIndustryWorkInPerson = new Activity(
  'work',
  'work.industry.large',
  'indoor',
  12 * 60,
  'normal',
  'normal',
  500
)

export const microCommerceAndServicesWorkInPerson = new Activity(
  'work',
  'work.commerce_services.micro',
  'indoor',
  8 * 60,
  'normal',
  'normal',
  5
)

export const smallCommerceAndServicesWorkInPerson = new Activity(
  'work',
  'work.commerce_services.small',
  'indoor',
  8 * 60,
  'normal',
  'normal',
  30
)

export const mediumCommerceAndServicesWorkInPerson = new Activity(
  'work',
  'work.commerce_services.medium',
  'indoor',
  8 * 60,
  'normal',
  'normal',
  75
)

export const largeCommerceAndServicesWorkInPerson = new Activity(
  'work',
  'work.commerce_services.medium',
  'indoor',
  8 * 60,
  'normal',
  'normal',
  200
)

export const preschoolStudy = new Activity(
  'study',
  'study.preschool',
  'indoor',
  5 * 60,
  'normal',
  'normal',
  30
)

export const preschoolStudyFromHome = new Activity(
  'study',
  'study.preschool_from_home',
  'indoor',
  5 * 60,
  'normal',
  'normal',
  -1 // set to the number of residents in the house
)

export const middleSchoolStudy = new Activity(
  'study',
  'study.middle_school',
  'indoor',
  6 * 60,
  'normal',
  'normal',
  45
)

export const middleSchoolStudyFromHome = new Activity(
  'study',
  'study.middle_school_from_home',
  'indoor',
  6 * 60,
  'normal',
  'normal',
  -1 // set to the number of residents in the house
)

export const highSchoolStudy = new Activity(
  'study',
  'study.high_school',
  'indoor',
  7 * 60,
  'normal',
  'normal',
  60
)

export const highSchoolStudyFromHome = new Activity(
  'study',
  'study.high_school_from_home',
  'indoor',
  7 * 60,
  'normal',
  'normal',
  -1 // set to the number of residents in the house
)

export const collegeStudy = new Activity(
  'study',
  'study.college',
  'indoor',
  8 * 60,
  'normal',
  'normal',
  75
)

export const collegeStudyFromHome = new Activity(
  'study',
  'study.high_school_from_home',
  'indoor',
  8 * 60,
  'normal',
  'normal',
  -1 // set to the number of residents in the house
)

export const nineHoursSleep = new Activity(
  'home',
  'sleep.six_hours',
  'indoor',
  9 * 60,
  'normal',
  'normal',
  2
)

export const eightHoursSleep = new Activity(
  'home',
  'sleep.eight_hours',
  'indoor',
  8 * 60,
  'normal',
  'normal',
  2
)

export const sevenHoursSleep = new Activity(
  'home',
  'sleep.seven_hours',
  'indoor',
  7 * 60,
  'normal',
  'normal',
  2
)

export const sixHoursSleep = new Activity(
  'home',
  'sleep.six_hours',
  'indoor',
  6 * 60,
  'normal',
  'normal',
  2
)

export const fiveHoursSleep = new Activity(
  'home',
  'sleep.six_hours',
  'indoor',
  5 * 60,
  'normal',
  'normal',
  2
)

export const activities: { [activity: string]: Activity } = {
  groceryShopping,
  pharmacyShopping,
  bakeryShopping,

  restaurantOutdoors,
  restaurantIndoors,

  bar,
  outdoorParty,
  indoorParty,
  park,
  gym,
  church,

  stayAtHome,

  publicTransportStation,
  publicTransportRide,
  privateTransportRide,

  microIndustryWorkInPerson,
  smallIndustryWorkInPerson,
  mediumIndustryWorkInPerson,
  largeIndustryWorkInPerson,

  microCommerceAndServicesWorkInPerson,
  smallCommerceAndServicesWorkInPerson,
  mediumCommerceAndServicesWorkInPerson,
  largeCommerceAndServicesWorkInPerson,

  preschoolStudy,
  middleSchoolStudy,
  highSchoolStudy,
  collegeStudy,

  fiveHoursSleep,
  sixHoursSleep,
  sevenHoursSleep,
  eightHoursSleep,
  nineHoursSleep
}

export const activitiesList = [
  groceryShopping,
  pharmacyShopping,
  bakeryShopping,

  restaurantOutdoors,
  restaurantIndoors,

  bar,
  outdoorParty,
  indoorParty,
  park,
  gym,
  church,

  stayAtHome,

  publicTransportStation,
  publicTransportRide,
  privateTransportRide,

  microIndustryWorkInPerson,
  smallIndustryWorkInPerson,
  mediumIndustryWorkInPerson,
  largeIndustryWorkInPerson,

  microCommerceAndServicesWorkInPerson,
  smallCommerceAndServicesWorkInPerson,
  mediumCommerceAndServicesWorkInPerson,
  largeCommerceAndServicesWorkInPerson,

  preschoolStudy,
  middleSchoolStudy,
  highSchoolStudy,
  collegeStudy,

  fiveHoursSleep,
  sixHoursSleep,
  sevenHoursSleep,
  eightHoursSleep,
  nineHoursSleep
]

export enum ActivityType {
  GroceryShopping = 'groceryShopping',
  PharmacyShopping = 'pharmacyShopping',
  BakeryShopping = 'bakeryShopping',

  RestaurantOutdoors = 'restaurantOutdoors',
  RestaurantIndoors = 'restaurantIndoors',

  Bar = 'bar',
  OutdoorParty = 'outdoorParty',
  IndoorParty = 'indoorParty',
  Park = 'park',
  Gym = 'gym',
  Church = 'church',

  StayAtHome = 'stayAtHome',

  PublicTransportStation = 'publicTransportStation',
  PublicTransportRide = 'publicTransportRide',
  PrivateTransportRide = 'privateTransportRide',

  MicroIndustryWorkInPerson = 'work.industry.micro',
  SmallIndustryWorkInPerson = 'work.industry.small',
  MediumIndustryWorkInPerson = 'work.industry.medium',
  LargeIndustryWorkInPerson = 'work.industry.large',

  MicroCommerceAndServicesWorkInPerson = 'work.commerce_services.micro',
  SmallCommerceAndServicesWorkInPerson = 'work.commerce_services.small',
  MediumCommerceAndServicesWorkInPerson = 'work.commerce_services.medium',
  LargeCommerceAndServicesWorkInPerson = 'work.commerce_services.large',

  PreschoolStudy = 'preschoolStudy',
  MiddleSchoolStudy = 'middleSchoolStudy',
  HighSchoolStudy = 'highSchoolStudy',
  CollegeStudy = 'collegeStudy',

  FiveHoursSleep = 'fiveHoursSleep',
  SixHoursSleep = 'sixHoursSleep',
  SevenHoursSleep = 'sevenHoursSleep',
  EightHoursSleep = 'eightHoursSleep',
  NineHoursSleep = 'nineHoursSleep'
}

// convert activitiesList to a map for easy access
export const activitiesMap = activitiesList.reduce((acc, activity) => {
  acc[activity.label] = activity
  return acc
}, {})

export function getWorkActivity(label: string): Activity | undefined {
  return activitiesMap[label]
}
