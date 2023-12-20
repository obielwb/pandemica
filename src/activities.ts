import { Individual } from './individual'

export type Distance = 'normal' | 'sixFt' | 'tenFt'

export type Setting = 'indoor' | 'outdoor'

export type Voice = 'silent' | 'normal' | 'loud'

export type Activity = {
  category: 'leisure' | 'work' | 'home' | 'transportation' | 'shopping' | 'study'
  label: string

  setting: Setting
  duration: number // minutes
  distance: Distance
  voice: Voice

  maximumIndvidualsEngaged: number
}

export type IndividualActivity = Activity & {
  id: string

  activityStartedAt?: Date
  activityEndedAt?: Date
  engagedAt?: Date

  individualsEngaged: Individual[]
}

// todo: consertar voz e distância para fazer sentido
export const groceryShopping: Activity = {
  category: 'shopping',
  label: 'shopping.grocery',
  setting: 'indoor',

  duration: 1 * 60,
  maximumIndvidualsEngaged: 80,
  distance: 'normal',
  voice: 'normal'
}

export const pharmacyShopping: Activity = {
  category: 'shopping',
  label: 'shopping.pharmacy',
  setting: 'indoor',

  duration: 1 * 60,
  maximumIndvidualsEngaged: 20,
  distance: 'normal',
  voice: 'normal'
}

export const restaurantOutdoors: Activity = {
  category: 'leisure',
  label: 'restaurant.outdoor',
  setting: 'outdoor',

  duration: 1 * 60,

  maximumIndvidualsEngaged: 50,
  distance: 'normal',
  voice: 'normal'
}

export const restaurantIndoors: Activity = {
  category: 'leisure',
  label: 'restaurant.indoor',
  setting: 'indoor',
  duration: 1 * 60,

  maximumIndvidualsEngaged: 40,
  distance: 'normal',
  voice: 'normal'
}

export const bar: Activity = {
  category: 'leisure',
  label: 'bar',
  setting: 'indoor',

  duration: 2 * 60,

  maximumIndvidualsEngaged: 30,
  distance: 'normal',
  voice: 'normal'
}

export const outdoorParty: Activity = {
  category: 'leisure',
  label: 'party.outdoor',
  setting: 'outdoor',

  duration: 3 * 60,

  maximumIndvidualsEngaged: 50,
  distance: 'normal',
  voice: 'normal'
}

export const indoorParty: Activity = {
  category: 'leisure',
  label: 'party.indoor',
  setting: 'indoor',

  duration: 3 * 60,

  maximumIndvidualsEngaged: 30,
  distance: 'normal',
  voice: 'normal'
}

export const house: Activity = {
  category: 'home',
  label: 'house',
  setting: 'indoor',

  duration: 10 * 60,

  maximumIndvidualsEngaged: 11, // maximum number of residents per house
  distance: 'normal',
  voice: 'normal'
}

export const schoolClassroom: Activity = {
  category: 'study',
  label: 'school.classroom',
  setting: 'indoor',

  duration: 6 * 60,

  maximumIndvidualsEngaged: 30,
  distance: 'normal',
  voice: 'normal'
}

export const publicTransportStation: Activity = {
  category: 'transportation',
  label: 'transportation.public.station',
  setting: 'outdoor',

  duration: 20,
  maximumIndvidualsEngaged: 10,
  distance: 'normal',
  voice: 'normal'
}

export const publicTransportationRide: Activity = {
  category: 'transportation',
  label: 'transportation.public.ride',
  setting: 'indoor',

  duration: 20,
  maximumIndvidualsEngaged: 50,
  distance: 'normal',
  voice: 'normal'
}

export const park: Activity = {
  category: 'leisure',
  label: 'park',
  setting: 'outdoor',

  duration: 1.5 * 60,
  maximumIndvidualsEngaged: 50,
  distance: 'normal',
  voice: 'normal'
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
