import { Individual } from '../individual'

export class Clock {
  private minutes: number
  private totalMinutes: number
  private hours: number
  private totalHours: number
  private days: number
  private totalDays: number
  private weeks: number
  private totalWeeks: number
  private months: number
  private totalMonths: number
  private years: number
  private totalYears: number

  constructor(
    public individuals: Individual[],
    private sortFunction: (individuals: Individual[]) => Individual[]
  ) {
    this.minutes = 0
    this.totalMinutes = 0
    this.hours = 0
    this.totalHours = 0
    this.days = 0
    this.totalDays = 0
    this.weeks = 0
    this.totalWeeks = 0
    this.months = 0
    this.totalMonths = 0
    this.years = 0
    this.totalYears = 0
  }

  public tick(minutes: number) {
    this.minutes += minutes
    this.totalMinutes += minutes

    if (minutes >= 60) {
      this.minutes -= 60

      this.hours += 1
      this.totalHours += 1
    }

    if (this.hours >= 24) {
      this.hours -= 24

      this.days += 1
      this.totalDays += 1
    }

    if (this.days >= 7) {
      this.days -= 7

      this.weeks += 1
      this.totalWeeks += 1
    }

    if (this.weeks >= 4) {
      this.weeks -= 4

      this.months += 1
      this.totalMonths += 1
    }

    if (this.months >= 12) {
      this.months -= 12

      this.years += 1
      this.totalYears += 1
    }
  }

  public sortIndividuals() {
    this.individuals = this.sortFunction(this.individuals)
  }
}
