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
  label: 'restaurant.outdoor',
  setting: 'outdoor',
  distance: 'sixFt',
  duration: 1 * 60, // an hour
  voice: 'normal',
  maximumIndvidualsEngaged: 50
}

export const restaurantIndoors: Activity = {
  label: 'restaurant.indoor',
  setting: 'outdoor',
  distance: 'sixFt',
  duration: 1.5 * 60,
  voice: 'normal'
}

export const bar: Activity = {
  label: 'bar',
  setting: 'indoor',
  distance: 'sixFt',
  duration: 2 * 60,
  voice: 'loud'
}

export const outdoorParty: Activity = {
  label: 'party.outdoor',
  setting: 'outdoor',
  distance: 'normal',
  duration: 3 * 60,
  voice: 'loud'
}

export const indoorParty: Activity = {
  label: 'party.indoor',
  setting: 'indoor',
  distance: 'normal',
  duration: 3 * 60,
  voice: 'normal'
}

export const house: Activity = {
  label: 'house',
  setting: 'indoor',
  distance: 'close',
  duration: 10 * 60, // 10 hours
  voice: 'normal'
}

export const school: Activity = {
  label: 'school',
  setting: 'indoor',
  distance: 'normal',
  duration: 6 * 60, // 6 hours
  voice: 'normal'
}

export const hospital: Activity = {
  label: 'hospital',
  setting: 'indoor',
  distance: 'sixFt',
  voice: 'normal',
  duration: 3 * 60
}

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

export const parks: Activity = {
  label: 'park',
  setting: 'outdoor',
  distance: 'tenFt',
  voice: 'silent',
  duration: 90
}

export const activities: { [activity: string]: Activity } = {
  grocery,
  restaurantOutdoors,
  restaurantIndoors,
  bar,
  outdoorParty,
  indoorParty,
  house,
  school,
  hospital,
  publicTransportStation,
  parks
}

export const activitiesList = [
  grocery,
  restaurantOutdoors,
  restaurantIndoors,
  bar,
  outdoorParty,
  indoorParty,
  house,
  school,
  hospital,
  publicTransportStation,
  parks
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
