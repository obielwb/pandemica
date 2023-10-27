import { Individual } from './individual'

export type Interaction = {
  label: 'oneTime' | 'workplace' | 'partner' | 'repeated'
}

export type Distance = 'intimate' | 'close' | 'normal' | 'sixFt' | 'tenFt'

export type Setting =
  | 'indoor'
  | 'outdoor'
  | 'filtered'
  | 'transit'
  | 'plane'
  | 'carWindowsDown'
  | 'partiallyEnclosed'

export type Voice = 'silent' | 'normal' | 'loud'

export type Activity = {
  category: 'leisure' | 'work' | 'home' | 'transportation' | 'shopping' | 'study'
  label: string

  setting: Setting
  distance: Distance
  duration?: number // minutes
  voice: Voice

  maximumIndvidualsEngaged: number

  interaction?: Interaction
}

export type IndividualActivity = Activity & {
  id: string

  activityStartedAt?: Date
  activityEndedAt?: Date
  engagedAt?: Date

  individualsEngaged: Individual[]
}

export const groceryShopping: Activity = {
  category: 'shopping',
  label: 'shopping.grocery',
  setting: 'indoor',
  distance: 'sixFt',
  duration: 1 * 60, // an hour
  voice: 'silent',
  maximumIndvidualsEngaged: 80
}

export const pharmacyShopping: Activity = {
  category: 'shopping',
  label: 'shopping.pharmacy',
  setting: 'indoor',
  distance: 'sixFt',
  duration: 1 * 60, // an hour
  voice: 'silent',
  maximumIndvidualsEngaged: 20
}

export const restaurantOutdoors: Activity = {
  category: 'leisure', // todo: change to proper category
  label: 'restaurant.outdoor',
  setting: 'outdoor',
  distance: 'sixFt',
  duration: 1 * 60, // an hour
  voice: 'normal',
  maximumIndvidualsEngaged: 50
}

export const restaurantIndoors: Activity = {
  category: 'leisure', // todo: change to proper category
  label: 'restaurant.indoor',
  setting: 'indoor',
  distance: 'close',
  duration: 1 * 60, // an hour
  voice: 'normal',
  maximumIndvidualsEngaged: 40
}

export const bar: Activity = {
  category: 'leisure',
  label: 'bar',
  setting: 'indoor',
  distance: 'normal',
  duration: 2 * 60, // 2 hours
  voice: 'loud',
  maximumIndvidualsEngaged: 30
}

export const outdoorParty: Activity = {
  category: 'leisure',
  label: 'party.outdoor',
  setting: 'outdoor',
  distance: 'normal',
  duration: 3 * 60, // 3 hours
  voice: 'loud',
  maximumIndvidualsEngaged: 50
}

export const indoorParty: Activity = {
  category: 'leisure',
  label: 'party.indoor',
  setting: 'indoor',
  distance: 'close',
  duration: 3 * 60, // 3 hours
  voice: 'normal',
  maximumIndvidualsEngaged: 30
}

export const house: Activity = {
  category: 'home',
  label: 'house',
  setting: 'indoor',
  distance: 'close',
  duration: 10 * 60, // 10 hours
  voice: 'normal',
  maximumIndvidualsEngaged: 11 // maximum number of residents per house
}

export const schoolClassroom: Activity = {
  category: 'study',
  label: 'school.classroom',
  setting: 'indoor',
  distance: 'normal',
  duration: 6 * 60, // 6 hours
  voice: 'normal',
  maximumIndvidualsEngaged: 30
}

// export const hospital: Activity = {
//   label: 'hospital',
//   setting: 'indoor',
//   distance: 'sixFt',
//   voice: 'normal',
//   duration: 3 * 60
// }

export const publicTransportStation: Activity = {
  category: 'transportation',
  label: 'transportation.public.station',
  setting: 'outdoor',
  distance: 'normal',
  voice: 'normal',
  duration: 20, // minutes
  maximumIndvidualsEngaged: 10
}

export const publicTransportationRide: Activity = {
  category: 'transportation',
  label: 'transportation.public.ride',
  setting: 'indoor',
  distance: 'normal',
  voice: 'normal',
  duration: 20, // minutes
  maximumIndvidualsEngaged: 50
}

export const park: Activity = {
  category: 'leisure',
  label: 'park',
  setting: 'outdoor',
  distance: 'tenFt',
  voice: 'silent',
  duration: 1.5 * 60, // a half hour
  maximumIndvidualsEngaged: 50
}

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
  // hospital,
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
