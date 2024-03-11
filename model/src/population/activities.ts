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
  public label: string

  constructor(
    public category: Category,
    label: string,
    public setting: Setting,
    public duration: number,
    public distance: Distance,
    public voice: Voice,
    public maximumIndividualsEngaged: number
  ) {
    this.label = `${this.category}.${label}`
  }

  public serialize?(): string {
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
  'grocery',
  'indoor',
  30,
  'normal',
  'normal',
  80
)

export const pharmacyShopping = new Activity(
  'shopping',
  'pharmacy',
  'indoor',
  15,
  'normal',
  'normal',
  20
)

export const bakeryShopping = new Activity(
  'shopping',
  'bakery',
  'indoor',
  10,
  'normal',
  'normal',
  20
)

export const mallShopping = new Activity('shopping', 'mall', 'indoor', 90, 'normal', 'loud', 100)

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
  'stay_at_home',
  'indoor',
  10 * 60,
  'normal',
  'normal',
  11 // maximum number of residents per house
)

export const publicTransportStation = new Activity(
  'transport',
  'public.station',
  'outdoor',
  15,
  'normal',
  'normal',
  10
)

export const publicTransportRide = new Activity(
  'transport',
  'public.ride',
  'indoor',
  45,
  'normal',
  'normal',
  50
)

export const privateTransportRide = new Activity(
  'transport',
  'private.ride',
  'indoor',
  30,
  'normal',
  'normal',
  5
)

export const microIndustryWorkInPerson = new Activity(
  'work',
  'industry.micro',
  'indoor',
  8 * 60, // can vary to 12x36
  'normal',
  'normal',
  10
)

export const microIndustryWorkFromHome = new Activity(
  'work',
  'industry.micro.from_home',
  'indoor',
  8 * 60, // can vary to 12x36
  'normal',
  'normal',
  11
)

export const smallIndustryWorkInPerson = new Activity(
  'work',
  'industry.small',
  'indoor',
  8 * 60, // can vary to 12x36
  'normal',
  'normal',
  60
)

export const smallIndustryWorkFromHome = new Activity(
  'work',
  'industry.small.from_home',
  'indoor',
  8 * 60, // can vary to 12x36
  'normal',
  'normal',
  11
)

export const mediumIndustryWorkInPerson = new Activity(
  'work',
  'industry.medium',
  'indoor',
  12 * 60,
  'normal',
  'normal',
  300
)

export const mediumIndustryWorkFromHome = new Activity(
  'work',
  'industry.medium.from_home',
  'indoor',
  12 * 60,
  'normal',
  'normal',
  11
)

export const largeIndustryWorkInPerson = new Activity(
  'work',
  'industry.large',
  'indoor',
  12 * 60,
  'normal',
  'normal',
  500
)

export const largeIndustryWorkFromHome = new Activity(
  'work',
  'industry.large.from_home',
  'indoor',
  12 * 60,
  'normal',
  'normal',
  11
)

export const microCommerceAndServicesWorkInPerson = new Activity(
  'work',
  'industry.commerce_services.micro',
  'indoor',
  8 * 60,
  'normal',
  'normal',
  5
)

export const microCommerceAndServicesWorkFromHome = new Activity(
  'work',
  'commerce_services.micro.from_home',
  'indoor',
  8 * 60,
  'normal',
  'normal',
  11
)

export const smallCommerceAndServicesWorkInPerson = new Activity(
  'work',
  'commerce_services.small',
  'indoor',
  8 * 60,
  'normal',
  'normal',
  30
)

export const smallCommerceAndServicesWorkFromHome = new Activity(
  'work',
  'commerce_services.small.from_home',
  'indoor',
  8 * 60,
  'normal',
  'normal',
  11
)

export const mediumCommerceAndServicesWorkInPerson = new Activity(
  'work',
  'commerce_services.medium',
  'indoor',
  8 * 60,
  'normal',
  'normal',
  75
)

export const mediumCommerceAndServicesWorkFromHome = new Activity(
  'work',
  'commerce_services.medium.from_home',
  'indoor',
  8 * 60,
  'normal',
  'normal',
  11
)

export const largeCommerceAndServicesWorkInPerson = new Activity(
  'work',
  'commerce_services.large',
  'indoor',
  8 * 60,
  'normal',
  'normal',
  200
)

export const largeCommerceAndServicesWorkFromHome = new Activity(
  'work',
  'commerce_services.large.from_home',
  'indoor',
  8 * 60,
  'normal',
  'normal',
  11
)

export const preschoolStudy = new Activity(
  'study',
  'preschool',
  'indoor',
  9 * 60,
  'normal',
  'normal',
  30
)

export const preschoolStudyFromHome = new Activity(
  'study',
  'preschool.from_home',
  'indoor',
  9 * 60,
  'normal',
  'normal',
  11 // max residents per house
)

export const middleSchoolStudy = new Activity(
  'study',
  'middle_school',
  'indoor',
  5 * 60,
  'normal',
  'normal',
  45
)

export const middleSchoolStudyFromHome = new Activity(
  'study',
  'middle_school.from_home',
  'indoor',
  5 * 60,
  'normal',
  'normal',
  11 // max residents per house
)

export const highSchoolStudy = new Activity(
  'study',
  'high_school',
  'indoor',
  6 * 60,
  'normal',
  'normal',
  60
)

export const highSchoolStudyFromHome = new Activity(
  'study',
  'high_school.from_home',
  'indoor',
  6 * 60,
  'normal',
  'normal',
  11 // max residents per house
)

export const collegeStudy = new Activity(
  'study',
  'college',
  'indoor',
  7.5 * 60,
  'normal',
  'normal',
  75
)

export const collegeStudyFromHome = new Activity(
  'study',
  'high_school.from_home',
  'indoor',
  8 * 60,
  'normal',
  'normal',
  11 // max residents per house
)

export const nineHoursSleep = new Activity(
  'home',
  'sleep.nine_hours',
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
  'sleep.five_hours',
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

  microIndustryWorkFromHome,
  smallIndustryWorkFromHome,
  mediumIndustryWorkFromHome,
  largeIndustryWorkFromHome,

  microCommerceAndServicesWorkInPerson,
  smallCommerceAndServicesWorkInPerson,
  mediumCommerceAndServicesWorkInPerson,
  largeCommerceAndServicesWorkInPerson,

  microCommerceAndServicesWorkFromHome,
  smallCommerceAndServicesWorkFromHome,
  mediumCommerceAndServicesWorkFromHome,
  largeCommerceAndServicesWorkFromHome,

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
  mallShopping,

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

export enum Activities {
  GroceryShopping = 'shopping.grocery',
  PharmacyShopping = 'shopping.pharmacy',
  BakeryShopping = 'shopping.bakery',
  MallShopping = 'shopping.mall',

  RestaurantOutdoors = 'errands.restaurant.outdoor',
  RestaurantIndoors = 'errands.restaurant.indoor',

  Bar = 'leisure.bar',
  OutdoorParty = 'leisure.party.outdoor',
  IndoorParty = 'leisure.party.indoor',
  Park = 'leisure.park',
  Gym = 'leisure.gym',
  Church = 'leisure.church',

  StayAtHome = 'home.stay_at_home',

  PublicTransportStation = 'transport.public.station',
  PublicTransportRide = 'transport.public.ride',
  PrivateTransportRide = 'transport.private.ride',

  MicroIndustryWorkInPerson = 'work.industry.micro',
  SmallIndustryWorkInPerson = 'work.industry.small',
  MediumIndustryWorkInPerson = 'work.industry.medium',
  LargeIndustryWorkInPerson = 'work.industry.large',

  MicroCommerceAndServicesWorkInPerson = 'work.commerce_services.micro',
  SmallCommerceAndServicesWorkInPerson = 'work.commerce_services.small',
  MediumCommerceAndServicesWorkInPerson = 'work.commerce_services.medium',
  LargeCommerceAndServicesWorkInPerson = 'work.commerce_services.large',

  PreschoolStudyInPerson = 'study.preschool',
  MiddleSchoolStudyInPeron = 'study.middle_school',
  HighSchoolStudyInPerson = 'study.high_school',
  CollegeStudyInPerson = 'study.college',

  FiveHoursSleep = 'home.sleep.five_hours',
  SixHoursSleep = 'home.sleep.six_hours',
  SevenHoursSleep = 'home.sleep.seven_hours',
  EightHoursSleep = 'home.sleep.eight_hours',
  NineHoursSleep = 'home.sleep.nine_hours'
}

export enum DailyActivities {
  GroceryShopping = 'grocery',
  PharmacyShopping = 'pharmacy',
  BakeryShopping = 'bakery',
  MallShopping = 'mall',

  RestaurantOutdoors = 'outdoor',
  RestaurantIndoors = 'indoor',

  Bar = 'bar',
  OutdoorParty = 'party.outdoor',
  IndoorParty = 'party.indoor',
  Park = 'park',
  Gym = 'gym',
  Church = 'church',

  StayAtHome = 'stay_at_home'
}

// convert activitiesList to a map for easy access
export const activitiesMap = activitiesList.reduce((acc, activity) => {
  acc[activity.label] = activity
  return acc
}, {})

export function getActivity(label: Activities | string): Activity {
  return activitiesMap[label]
}
