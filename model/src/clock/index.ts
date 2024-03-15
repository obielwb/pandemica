import { Activity } from '../population/activities'
import { Individual } from '../population/individual'

export class Clock {
  private currentMinute: number
  private elapsedMinutes: number = 0
  private currentHour: number
  private elapsedHours: number = 0
  private currentDay: number
  private elapsedDays: number = 0
  private currentWeek: number
  private elapsedWeeks: number = 0
  private currentMonth: number
  private elapsedMonths: number = 0
  private currentYear: number
  private elapsedYears: number = 0

  constructor(
    startDate: Date,
    public individuals: Individual[],
    private sortFunction: (activities: Activity[]) => Activity[]
  ) {
    this.currentYear = startDate.getFullYear()
    this.currentMonth = startDate.getMonth()
    this.currentDay = startDate.getDate()
    this.currentHour = startDate.getHours()
    this.currentMinute = startDate.getMinutes()
  }

  public sortIndividuals() {}

  public currentDate() {
    return new Date(
      this.currentYear,
      this.currentMonth,
      this.currentDay,
      this.currentHour,
      this.currentMinute
    )
  }

  public currentDateString() {
    return `${this.currentYear}-${this.currentMonth}-${this.currentDay}`
  }

  public setCurrentDateFromString(date: string) {
    const parts = date.split('-')
    if (parts.length === 3) {
      this.currentYear = parseInt(parts[0])
      this.currentMonth = parseInt(parts[1])
      this.currentDay = parseInt(parts[2])
    }
  }

  public tick(minutes: number) {
    this.currentMinute += minutes
    this.elapsedMinutes += minutes

    while (this.currentMinute >= 60) {
      this.currentMinute -= 60
      this.currentHour += 1
      this.elapsedHours += 1
    }

    while (this.currentHour >= 24) {
      this.currentHour -= 24
      this.currentDay += 1
      this.elapsedDays += 1
      this.updateWeeks()
      this.updateMonthsAndYears()
    }
  }

  private updateWeeks() {
    if (this.currentDay >= 6) {
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
