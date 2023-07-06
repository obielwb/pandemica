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
const totalPopulation = 1138309;
const eastPopulation = 248939;
const northwestPopulation = 133086;
const northPopulation = 212342;
const southwestPopulation = 253061;
const southPopulation = 316671;

const malePercentage = 51.78;
const femalePercentage = 48.22;

// IBGE 2010
const zeroToFourHabitants = {
  female: 31330,
  male: 32541,
};

const fiveToNineHabitants = {
  female: 32214,
  male: 33570,
};

const tenToFourteenHabitants = {
  female: 38690,
  male: 39891,
};

const fifteenToNineteenHabitants = {
  female: 40346,
  male: 41344,
};

const twentyToTwentyfourHabitants = {
  female: 48593,
  male: 48225,
};

const twentyfiveToTwentynineHabitants = {
  female: 52883,
  male: 51178,
};

const thirtyToThirtyfourHabitants = {
  female: 49301,
  male: 47315,
};

const thirtyfiveToThirtynineHabitants = {
  female: 43304,
  male: 40812,
};

const fourtyToFourtyfourHabitants = {
  female: 41335,
  male: 37975,
};

const fourtyfiveToFourtynineHabitants = {
  female: 38876,
  male: 34630,
};

const fiftyToFiftyfourHabitants = {
  female: 35795,
  male: 31354,
};

const fiftyfiveToFiftynineHabitants = {
  female: 29515,
  male: 25295,
};

const sixtyToSixtyfourHabitants = {
  female: 23211,
  male: 19059,
};

const sixtyfiveToSixtynineHabitants = {
  female: 16986,
  male: 13776,
};

const seventyToSeventyfourHabitants = {
  female: 13743,
  male: 10457,
};

const seventyfiveToSeventynineHabitants = {
  female: 6832,
  male: 10260,
};

const eightyToEightyfourHabitants = {
  female: 7291,
  male: 4094,
};
