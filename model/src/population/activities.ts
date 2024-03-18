export enum Category {
  Leisure,
  Errands,
  Work,
  Home,
  Transport,
  Shopping,
  Study,
  Sleep,
  Hospital
}

export enum Distance {
  Normal,
  SixFt,
  TenFt
}

export enum Setting {
  Indoor,
  Outdoor
}

export enum Voice {
  Silent,
  Normal,
  Loud
}

export class Activity {
  constructor(
    public category: Category,
    public label: Label,
    public setting: Setting,
    public duration: number,
    public distance: Distance,
    public voice: Voice,
    public maximumIndividualsEngaged: number
  ) {}

  public static serialize(activity: Activity): string {
    const serializedActivity = {
      c: activity.category,
      l: activity.label,
      s: activity.setting,
      d: activity.duration,
      di: activity.distance,
      v: activity.voice,
      m: activity.maximumIndividualsEngaged
    }
    return JSON.stringify(serializedActivity)
  }

  public static deserialize(serialized: string): Activity {
    const deserializedActivity = JSON.parse(serialized)
    const activity = new Activity(
      deserializedActivity.c,
      deserializedActivity.l,
      deserializedActivity.s,
      deserializedActivity.d,
      deserializedActivity.di,
      deserializedActivity.v,
      deserializedActivity.m
    )

    return activity
  }
}

export class IndividualActivity extends Activity {
  constructor(
    public id: number,
    category: Category,
    label: Label,
    setting: Setting,
    duration: number,
    distance: Distance,
    voice: Voice,
    maximumIndividualsEngaged: number,
    public individualsEngaged: number[],
    public activityStartedAt?: Date,
    public activityEndedAt?: Date
  ) {
    super(category, label, setting, duration, distance, voice, maximumIndividualsEngaged)
  }
}

export enum Label {
  Grocery,
  Pharmacy,
  Bakery,
  Mall,

  RestaurantIndoor,
  RestaurantOutdoor,

  Bar,
  PartyIndoor,
  PartyOutdoor,
  Park,
  Gym,
  Church,

  StayAtHome,
  Sleep5h,
  Sleep6h,
  Sleep7h,
  Sleep8h,
  Sleep9h,

  PublicTransportStation,
  PublicTransportRide,
  PrivateTransportRide,

  MicroIndustryInPerson,
  SmallIndustryInPerson,
  MediumIndustryInPerson,
  LargeIndustryInPerson,

  MicroIndustryFromHome,
  SmallIndustryFromHome,
  MediumIndustryFromHome,
  LargeIndustryFromHome,

  MicroCommerceInPerson,
  SmallCommerceInPerson,
  MediumCommerceInPerson,
  LargeCommerceInPerson,

  MicroCommerceFromHome,
  SmallCommerceFromHome,
  MediumCommerceFromHome,
  LargeCommerceFromHome,

  PreschoolInPerson,
  MiddleSchoolInPerson,
  HighSchoolInPerson,
  CollegeInPerson,

  PreschoolFromHome,
  MiddleSchoolFromHome,
  HighSchoolFromHome,
  CollegeFromHome,

  Hospitalized
}

export const groceryShopping = new Activity(
  Category.Shopping,
  Label.Grocery,
  Setting.Indoor,
  30,
  Distance.Normal,
  Voice.Normal,
  80
)

export const pharmacyShopping = new Activity(
  Category.Shopping,
  Label.Pharmacy,
  Setting.Indoor,
  15,
  Distance.Normal,
  Voice.Normal,
  20
)

export const bakeryShopping = new Activity(
  Category.Shopping,
  Label.Bakery,
  Setting.Indoor,
  10,
  Distance.Normal,
  Voice.Normal,
  20
)

export const mallShopping = new Activity(
  Category.Shopping,
  Label.Mall,
  Setting.Indoor,
  90,
  Distance.Normal,
  Voice.Loud,
  100
)

export const restaurantOutdoors = new Activity(
  Category.Errands,
  Label.RestaurantOutdoor,
  Setting.Outdoor,
  1 * 60,
  Distance.Normal,
  Voice.Normal,
  50
)

export const restaurantIndoors = new Activity(
  Category.Errands,
  Label.RestaurantIndoor,
  Setting.Indoor,
  1 * 60,
  Distance.Normal,
  Voice.Normal,
  40
)

export const bar = new Activity(
  Category.Leisure,
  Label.Bar,
  Setting.Indoor,
  2 * 60,
  Distance.Normal,
  Voice.Normal,
  30
)

export const outdoorParty = new Activity(
  Category.Leisure,
  Label.PartyOutdoor,
  Setting.Outdoor,
  3 * 60,
  Distance.Normal,
  Voice.Normal,
  50
)

export const indoorParty = new Activity(
  Category.Leisure,
  Label.PartyIndoor,
  Setting.Indoor,
  3 * 60,
  Distance.Normal,
  Voice.Normal,
  30
)

export const park = new Activity(
  Category.Leisure,
  Label.Park,
  Setting.Outdoor,
  1.5 * 60,
  Distance.SixFt,
  Voice.Normal,
  50
)

export const gym = new Activity(
  Category.Leisure,
  Label.Gym,
  Setting.Indoor,
  1 * 60,
  Distance.Normal,
  Voice.Normal,
  30
)

export const church = new Activity(
  Category.Leisure,
  Label.Church,
  Setting.Indoor,
  1 * 60,
  Distance.Normal,
  Voice.Silent,
  50
)

export const stayAtHome = new Activity(
  Category.Home,
  Label.StayAtHome,
  Setting.Indoor,
  10 * 60,
  Distance.Normal,
  Voice.Normal,
  11 // maximum number of residents per house
)

export const publicTransportStation = new Activity(
  Category.Transport,
  Label.PublicTransportStation,
  Setting.Outdoor,
  15,
  Distance.Normal,
  Voice.Normal,
  10
)

export const publicTransportRide = new Activity(
  Category.Transport,
  Label.PublicTransportRide,
  Setting.Indoor,
  45,
  Distance.Normal,
  Voice.Normal,
  50
)

export const privateTransportRide = new Activity(
  Category.Transport,
  Label.PrivateTransportRide,
  Setting.Indoor,
  30,
  Distance.Normal,
  Voice.Normal,
  5
)

export const microIndustryWorkInPerson = new Activity(
  Category.Work,
  Label.MicroIndustryInPerson,
  Setting.Indoor,
  8 * 60, // can vary to 12x36
  Distance.Normal,
  Voice.Normal,
  10
)

export const microIndustryWorkFromHome = new Activity(
  Category.Work,
  Label.MicroIndustryFromHome,
  Setting.Indoor,
  8 * 60, // can vary to 12x36
  Distance.Normal,
  Voice.Normal,
  11
)

export const smallIndustryWorkInPerson = new Activity(
  Category.Work,
  Label.SmallIndustryInPerson,
  Setting.Indoor,
  8 * 60, // can vary to 12x36
  Distance.Normal,
  Voice.Normal,
  60
)

export const smallIndustryWorkFromHome = new Activity(
  Category.Work,
  Label.SmallIndustryFromHome,
  Setting.Indoor,
  8 * 60, // can vary to 12x36
  Distance.Normal,
  Voice.Normal,
  11
)

export const mediumIndustryWorkInPerson = new Activity(
  Category.Work,
  Label.MediumIndustryInPerson,
  Setting.Indoor,
  12 * 60,
  Distance.Normal,
  Voice.Normal,
  300
)

export const mediumIndustryWorkFromHome = new Activity(
  Category.Work,
  Label.MediumIndustryFromHome,
  Setting.Indoor,
  12 * 60,
  Distance.Normal,
  Voice.Normal,
  11
)

export const largeIndustryWorkInPerson = new Activity(
  Category.Work,
  Label.LargeIndustryInPerson,
  Setting.Indoor,
  12 * 60,
  Distance.Normal,
  Voice.Normal,
  500
)

export const largeIndustryWorkFromHome = new Activity(
  Category.Work,
  Label.LargeIndustryFromHome,
  Setting.Indoor,
  12 * 60,
  Distance.Normal,
  Voice.Normal,
  11
)

export const microCommerceAndServicesWorkInPerson = new Activity(
  Category.Work,
  Label.MicroCommerceInPerson,
  Setting.Indoor,
  8 * 60,
  Distance.Normal,
  Voice.Normal,
  5
)

export const microCommerceAndServicesWorkFromHome = new Activity(
  Category.Work,
  Label.MicroCommerceFromHome,
  Setting.Indoor,
  8 * 60,
  Distance.Normal,
  Voice.Normal,
  11
)

export const smallCommerceAndServicesWorkInPerson = new Activity(
  Category.Work,
  Label.SmallCommerceInPerson,
  Setting.Indoor,
  8 * 60,
  Distance.Normal,
  Voice.Normal,
  30
)

export const smallCommerceAndServicesWorkFromHome = new Activity(
  Category.Work,
  Label.SmallCommerceFromHome,
  Setting.Indoor,
  8 * 60,
  Distance.Normal,
  Voice.Normal,
  11
)

export const mediumCommerceAndServicesWorkInPerson = new Activity(
  Category.Work,
  Label.MediumCommerceInPerson,
  Setting.Indoor,
  8 * 60,
  Distance.Normal,
  Voice.Normal,
  75
)

export const mediumCommerceAndServicesWorkFromHome = new Activity(
  Category.Work,
  Label.MediumCommerceFromHome,
  Setting.Indoor,
  8 * 60,
  Distance.Normal,
  Voice.Normal,
  11
)

export const largeCommerceAndServicesWorkInPerson = new Activity(
  Category.Work,
  Label.LargeCommerceInPerson,
  Setting.Indoor,
  8 * 60,
  Distance.Normal,
  Voice.Normal,
  200
)

export const largeCommerceAndServicesWorkFromHome = new Activity(
  Category.Work,
  Label.LargeCommerceFromHome,
  Setting.Indoor,
  8 * 60,
  Distance.Normal,
  Voice.Normal,
  11
)

export const preschoolStudy = new Activity(
  Category.Study,
  Label.PreschoolInPerson,
  Setting.Indoor,
  9 * 60,
  Distance.Normal,
  Voice.Normal,
  30
)

export const preschoolStudyFromHome = new Activity(
  Category.Study,
  Label.PreschoolFromHome,
  Setting.Indoor,
  9 * 60,
  Distance.Normal,
  Voice.Normal,
  11
)

export const middleSchoolStudy = new Activity(
  Category.Study,
  Label.MiddleSchoolInPerson,
  Setting.Indoor,
  5 * 60,
  Distance.Normal,
  Voice.Normal,
  45
)

export const middleSchoolStudyFromHome = new Activity(
  Category.Study,
  Label.MiddleSchoolFromHome,
  Setting.Indoor,
  5 * 60,
  Distance.Normal,
  Voice.Normal,
  11
)

export const highSchoolStudy = new Activity(
  Category.Study,
  Label.HighSchoolInPerson,
  Setting.Indoor,
  6 * 60,
  Distance.Normal,
  Voice.Normal,
  60
)

export const highSchoolStudyFromHome = new Activity(
  Category.Study,
  Label.HighSchoolFromHome,
  Setting.Indoor,
  6 * 60,
  Distance.Normal,
  Voice.Normal,
  11
)

export const collegeStudy = new Activity(
  Category.Study,
  Label.CollegeInPerson,
  Setting.Indoor,
  7.5 * 60,
  Distance.Normal,
  Voice.Normal,
  75
)

export const collegeStudyFromHome = new Activity(
  Category.Study,
  Label.CollegeFromHome,
  Setting.Indoor,
  8 * 60,
  Distance.Normal,
  Voice.Normal,
  11
)

export const hospitalized = new Activity(
  Category.Hospital,
  Label.Hospitalized,
  Setting.Indoor,
  16 * 60,
  Distance.Normal,
  Voice.Silent,
  2
)

export const nineHoursSleep = new Activity(
  Category.Home,
  Label.Sleep9h,
  Setting.Indoor,
  9 * 60,
  Distance.Normal,
  Voice.Normal,
  2
)

export const eightHoursSleep = new Activity(
  Category.Home,
  Label.Sleep8h,
  Setting.Indoor,
  8 * 60,
  Distance.Normal,
  Voice.Normal,
  2
)

export const sevenHoursSleep = new Activity(
  Category.Home,
  Label.Sleep7h,
  Setting.Indoor,
  7 * 60,
  Distance.Normal,
  Voice.Normal,
  2
)

export const sixHoursSleep = new Activity(
  Category.Home,
  Label.Sleep6h,
  Setting.Indoor,
  6 * 60,
  Distance.Normal,
  Voice.Normal,
  2
)

export const fiveHoursSleep = new Activity(
  Category.Home,
  Label.Sleep5h,
  Setting.Indoor,
  5 * 60,
  Distance.Normal,
  Voice.Normal,
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

export const activitiesMap = {
  [Label.Grocery]: groceryShopping,
  [Label.Pharmacy]: pharmacyShopping,
  [Label.Bakery]: bakeryShopping,
  [Label.Mall]: mallShopping,

  [Label.RestaurantIndoor]: restaurantIndoors,
  [Label.RestaurantOutdoor]: restaurantOutdoors,

  [Label.Bar]: bar,
  [Label.PartyIndoor]: indoorParty,
  [Label.PartyOutdoor]: outdoorParty,
  [Label.Park]: park,
  [Label.Gym]: gym,
  [Label.Church]: church,

  [Label.StayAtHome]: stayAtHome,
  [Label.Sleep5h]: fiveHoursSleep,
  [Label.Sleep6h]: sixHoursSleep,
  [Label.Sleep7h]: sevenHoursSleep,
  [Label.Sleep8h]: eightHoursSleep,
  [Label.Sleep9h]: nineHoursSleep,

  [Label.PublicTransportStation]: publicTransportStation,
  [Label.PublicTransportRide]: publicTransportRide,
  [Label.PrivateTransportRide]: privateTransportRide,

  [Label.MicroIndustryInPerson]: microIndustryWorkInPerson,
  [Label.SmallIndustryInPerson]: smallIndustryWorkInPerson,
  [Label.MediumIndustryInPerson]: mediumIndustryWorkInPerson,
  [Label.LargeIndustryInPerson]: largeIndustryWorkInPerson,

  [Label.MicroIndustryFromHome]: microIndustryWorkFromHome,
  [Label.SmallIndustryFromHome]: smallIndustryWorkFromHome,
  [Label.MediumIndustryFromHome]: mediumIndustryWorkFromHome,
  [Label.LargeIndustryFromHome]: largeIndustryWorkFromHome,

  [Label.MicroCommerceInPerson]: microCommerceAndServicesWorkInPerson,
  [Label.SmallCommerceInPerson]: smallCommerceAndServicesWorkInPerson,
  [Label.MediumCommerceInPerson]: mediumCommerceAndServicesWorkInPerson,
  [Label.LargeCommerceInPerson]: largeCommerceAndServicesWorkInPerson,

  [Label.MicroCommerceFromHome]: microCommerceAndServicesWorkFromHome,
  [Label.SmallCommerceFromHome]: smallCommerceAndServicesWorkFromHome,
  [Label.MediumCommerceFromHome]: mediumCommerceAndServicesWorkFromHome,
  [Label.LargeCommerceFromHome]: largeCommerceAndServicesWorkFromHome,

  [Label.PreschoolInPerson]: preschoolStudy,
  [Label.MiddleSchoolInPerson]: middleSchoolStudy,
  [Label.HighSchoolInPerson]: highSchoolStudy,
  [Label.CollegeInPerson]: collegeStudy,

  [Label.PreschoolFromHome]: preschoolStudyFromHome,
  [Label.MiddleSchoolFromHome]: middleSchoolStudyFromHome,
  [Label.HighSchoolFromHome]: highSchoolStudyFromHome,
  [Label.CollegeFromHome]: collegeStudyFromHome,

  [Label.Hospitalized]: hospitalized
}

export function getActivity(label: Label | number): Activity {
  return activitiesMap[label]
}
