import {
  BUDGET_ONE_PERCENT,
  Distance,
  FormValue,
  Interaction,
  PersonRiskValue,
  RiskProfile,
  RiskProfilesUnaffectedByVaccines,
  Setting,
  TheirMask,
  VaccineValue,
  Vaccines,
  Voice,
  YourMask,
  intimateDurationFloor,
  partnerMult,
  personRiskMultiplier,
} from "./data";
import { PartialData, prepopulated } from "./prepopulated";

export interface CalculatorData {
  // Persistence
  persistedAt?: number;

  // Budget (in microCOVIDs/year)
  riskBudget: number;

  // Prevalence - temos estes dados a partir da planilha de casos
  useManualEntry: number;
  topLocation: string;
  subLocation: string;
  subSubLocation: string | null; // non-US county
  population: string;
  casesPastWeek: number;
  casesIncreasingPercentage: number;
  positiveCasePercentage: number | null;
  prevalanceDataDate: Date;
  percentFullyVaccinated: number | null;
  unvaccinatedPrevalenceRatio: number | null;
  averageFullyVaccinatedMultiplier: number | null;

  // Person risk
  riskProfile: keyof typeof RiskProfile;
  interaction: string;
  personCount: number;
  symptomsChecked: string;

  // Activity risk
  setting: string;
  distance: string;
  duration: number;
  theirMask: string;
  yourMask: string;
  voice: string;

  // Vaccine
  yourVaccineType: string;
  yourVaccineDoses: number;

  theirVaccine: string;

  // Preset scenario name
  scenarioName?: string;
}

export const defaultValues: CalculatorData = {
  riskBudget: BUDGET_ONE_PERCENT,

  useManualEntry: 1,
  topLocation: "",
  subLocation: "",
  subSubLocation: "",
  population: "100000",
  casesPastWeek: 0,
  casesIncreasingPercentage: 0,
  positiveCasePercentage: 10,
  prevalanceDataDate: new Date(),
  percentFullyVaccinated: null,
  unvaccinatedPrevalenceRatio: null,
  averageFullyVaccinatedMultiplier: null,

  riskProfile: "",
  interaction: "",
  personCount: 0,
  symptomsChecked: "no",

  setting: "",
  distance: "",
  duration: 0,
  theirMask: "",
  yourMask: "",
  voice: "",

  yourVaccineType: "",
  yourVaccineDoses: 0,

  theirVaccine: "undefined",

  scenarioName: "",
};

interface CalculatorResult {
  expectedValue: number;
  lowerBound: number;
  upperBound: number;
}

const MAX_DELAY_FACTOR = 2;

export const DAY_0 = new Date(2020, 1, 12);
const MS_PER_DAY = 1000 * 60 * 60 * 24;

// From https://covid19-projections.com/estimating-true-infections-revisited/
const prevalenceRatio = (positivityPercent: number | null, date: Date) => {
  const day_i = (date.getTime() - DAY_0.getTime()) / MS_PER_DAY;
  if (positivityPercent === null || positivityPercent > 100) {
    // No positivity data, assume the worst.
    positivityPercent = 100;
  }
  const positivityRate = positivityPercent / 100;
  return (1000 / (day_i + 10)) * positivityRate ** 0.5 + 2;
};

// These are the variables exposed via query parameters
export type QueryData = Partial<CalculatorData>;
