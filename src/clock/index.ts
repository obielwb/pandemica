import { Activity } from '../activities'
import { Individual } from '../individual'

export class Clock {
  private currentMinute: number
  private elapsedMinutes: number
  private currentHour: number
  private elapsedHours: number
  private currentDay: number
  private elapsedDays: number
  private currentWeek: number
  private elapsedWeeks: number
  private currentMonth: number
  private elapsedMonths: number
  private currentYear: number
  private elapsedYears: number

  constructor(
    public individuals: Individual[],
    private sortFunction: (activities: Activity[]) => Activity[],
    startYear: number = 0,
    startMonth: number = 0,
    startDay: number = 0,
    startHour: number = 0,
    startMinute: number = 0
  ) {
    this.currentMinute = startMinute
    this.elapsedMinutes = 0
    this.currentHour = startHour
    this.elapsedHours = 0
    this.currentDay = startDay
    this.elapsedDays = 0
    this.currentWeek = Math.round((startMonth * 30) / 7)
    this.elapsedWeeks = 0
    this.currentMonth = startMonth
    this.elapsedMonths = 0
    this.currentYear = startYear
    this.elapsedYears = 0
  }

  public sortIndividuals() {}

  public toDate() {
    return new Date(
      this.currentYear,
      this.currentMonth,
      this.currentDay,
      this.currentHour,
      this.currentMinute
    )
  }

  public tick(minutes: number) {
    this.currentMinute += minutes
    this.elapsedMinutes += minutes

    while (this.currentMinute === 60) {
      this.currentMinute -= 60
      this.currentHour += 1
      this.elapsedHours += 1
    }

    while (this.currentHour === 24) {
      this.currentHour -= 24
      this.currentDay += 1
      this.elapsedDays += 1
      this.updateWeeks()
      this.updateMonthsAndYears()
    }
  }

  private updateWeeks() {
    if (this.currentDay === 6) {
      this.currentDay -= 6
      this.currentWeek += 1
      this.elapsedWeeks += 1
    }
  }

  private updateMonthsAndYears() {
    const daysInMonth = this.getDaysInMonth(this.currentMonth, this.currentYear)

    if (this.currentDay >= daysInMonth) {
      this.currentDay -= daysInMonth

      this.currentMonth += 1
      this.elapsedMonths += 1
    }

    if (this.currentMonth === 11) {
      this.currentMonth -= 11
      this.currentYear += 1
      this.elapsedYears += 1
    }
  }

  private getDaysInMonth(currentMonth: number, currentYear: number): number {
    // february
    if (currentMonth === 1) {
      return this.isLeapYear(currentYear) ? 29 : 28
    }
    // april, june, september, november
    else if ([3, 5, 8, 10].includes(currentMonth)) {
      return 30
    }

    return 31
  }

  private isLeapYear(currentYear: number): boolean {
    return currentYear % 4 === 0 && (currentYear % 100 !== 0 || currentYear % 400 === 0)
  }
}
