/*
 * generate random age
 * generate random sex
 * generate activities:
 *    - search in microCovid to see if what they have
 * generate basic routines based on age, sex, location, etc
 *    variables:
 *    - house location
 *    - have car / dont have car
 *    - work location
 *    - school location
 *    -
 *
 *
 * for simplicity, the population does not have a growth rate
 */

// Relatório de Informações Sociais 2016
export const totalPopulation = 1138309;
export const eastPopulation = 248939;
export const northwestPopulation = 133086;
export const northPopulation = 212342;
export const southwestPopulation = 253061;
export const southPopulation = 316671;

export const malePercentage = 51.78;
export const femalePercentage = 48.22;

// IBGE 2010
export const zeroToFourHabitants = {
  female: 31330,
  male: 32541,
};

export const fiveToNineHabitants = {
  female: 32214,
  male: 33570,
};

export const tenToFourteenHabitants = {
  female: 38690,
  male: 39891,
};

export const fifteenToNineteenHabitants = {
  female: 40346,
  male: 41344,
};

export const twentyToTwentyfourHabitants = {
  female: 48593,
  male: 48225,
};

export const twentyfiveToTwentynineHabitants = {
  female: 52883,
  male: 51178,
};

export const thirtyToThirtyfourHabitants = {
  female: 49301,
  male: 47315,
};

export const thirtyfiveToThirtynineHabitants = {
  female: 43304,
  male: 40812,
};

export const fourtyToFourtyfourHabitants = {
  female: 41335,
  male: 37975,
};

export const fourtyfiveToFourtynineHabitants = {
  female: 38876,
  male: 34630,
};

export const fiftyToFiftyfourHabitants = {
  female: 35795,
  male: 31354,
};

export const fiftyfiveToFiftynineHabitants = {
  female: 29515,
  male: 25295,
};

export const sixtyToSixtyfourHabitants = {
  female: 23211,
  male: 19059,
};

export const sixtyfiveToSixtynineHabitants = {
  female: 16986,
  male: 13776,
};

export const seventyToSeventyfourHabitants = {
  female: 13743,
  male: 10457,
};

export const seventyfiveToSeventynineHabitants = {
  female: 6832,
  male: 10260,
};

export const eightyToEightyfourHabitants = {
  female: 7291,
  male: 4094,
};

// Activity + person + neighbor +x
export interface Activity {
  // Activity Risk
  setting: string;
  distance: string;
  duration: number;
  voice: string;

  // Activity Setting
  coordinate: {
    x: number;
    y: number;
  };
}

export const Activities: { [key: string]: Activity } = {
  test: {
    setting: "outdoor",
    distance: "normal",
    duration: 60,
    voice: "normal",
    coordinate: { x: 0, y: 0 },
  },
};
