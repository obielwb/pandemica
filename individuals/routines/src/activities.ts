import { Individual } from './individual'

export type Interaction = {
  label: 'oneTime' | 'workplace' | 'partner' | 'repeated'
}

export type Distance = 'normal' | 'sixFt' | 'tenFt'

export type Setting = 'indoor' | 'outdoor'

export type Voice = 'silent' | 'normal' | 'loud'

export type Activity = {
  category: 'leisure' | 'work' | 'home' | 'transportation' | 'shopping' | 'study'
  label: string

  setting: Setting
  distance: Distance
  duration: number // minutes
  voice: Voice

  maximumIndvidualsEngaged: number

  interaction: Interaction
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
  duration: 1 * 60,
  voice: 'silent',
  maximumIndvidualsEngaged: 80,
  interaction: {
    label: 'oneTime'
  }
}

export const pharmacyShopping: Activity = {
  category: 'shopping',
  label: 'shopping.pharmacy',
  setting: 'indoor',
  distance: 'sixFt',
  duration: 1 * 60,
  voice: 'silent',
  maximumIndvidualsEngaged: 20,
  interaction: {
    label: 'oneTime'
  }
}

export const restaurantOutdoors: Activity = {
  category: 'leisure',
  label: 'restaurant.outdoor',
  setting: 'outdoor',
  distance: 'sixFt',
  duration: 1 * 60,
  voice: 'normal',
  maximumIndvidualsEngaged: 50,
  interaction: {
    label: 'oneTime'
  }
}

export const restaurantIndoors: Activity = {
  category: 'leisure',
  label: 'restaurant.indoor',
  setting: 'indoor',
  duration: 1 * 60,
  distance: 'normal',
  voice: 'normal',
  maximumIndvidualsEngaged: 40,
  interaction: {
    label: 'oneTime'
  }
}

export const bar: Activity = {
  category: 'leisure',
  label: 'bar',
  setting: 'indoor',
  distance: 'normal',
  duration: 2 * 60,
  voice: 'loud',
  maximumIndvidualsEngaged: 30,
  interaction: {
    label: 'oneTime'
  }
}

export const outdoorParty: Activity = {
  category: 'leisure',
  label: 'party.outdoor',
  setting: 'outdoor',
  distance: 'normal',
  duration: 3 * 60,
  voice: 'loud',
  maximumIndvidualsEngaged: 50,
  interaction: {
    label: 'oneTime'
  }
}

export const indoorParty: Activity = {
  category: 'leisure',
  label: 'party.indoor',
  setting: 'indoor',
  distance: 'normal',
  duration: 3 * 60,
  voice: 'normal',
  maximumIndvidualsEngaged: 30,
  interaction: {
    label: 'oneTime'
  }
}

export const house: Activity = {
  category: 'home',
  label: 'house',
  setting: 'indoor',
  distance: 'normal',
  duration: 10 * 60,
  voice: 'normal',
  maximumIndvidualsEngaged: 11, // maximum number of residents per house
  interaction: {
    label: 'oneTime'
  }
}

export const schoolClassroom: Activity = {
  category: 'study',
  label: 'school.classroom',
  setting: 'indoor',
  distance: 'normal',
  duration: 6 * 60,
  voice: 'normal',
  maximumIndvidualsEngaged: 30,
  interaction: {
    label: 'oneTime'
  }
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
  duration: 20,
  maximumIndvidualsEngaged: 10,
  interaction: {
    label: 'oneTime'
  }
}

export const publicTransportationRide: Activity = {
  category: 'transportation',
  label: 'transportation.public.ride',
  setting: 'indoor',
  distance: 'normal',
  voice: 'normal',
  duration: 20,
  maximumIndvidualsEngaged: 50,
  interaction: {
    label: 'oneTime'
  }
}

export const park: Activity = {
  category: 'leisure',
  label: 'park',
  setting: 'outdoor',
  distance: 'tenFt',
  voice: 'silent',
  duration: 1.5 * 60,
  maximumIndvidualsEngaged: 50,
  interaction: {
    label: 'oneTime'
  }
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
