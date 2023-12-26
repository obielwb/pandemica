import { Activity } from '../activities'
import { Individual } from '../individual'

export class Clock {
  private minute: number
  private totalMinutes: number
  private hour: number
  private totalHours: number
  private day: number
  private totalDays: number
  private weeks: number
  private totalWeeks: number
  private month: number
  private totalMonths: number
  private year: number
  private totalYears: number

  constructor(
    public individuals: Individual[],
    private sortFunction: (activities: Activity[]) => Activity[],
    startYear: number = 0,
    startMonth: number = 0,
    startDay: number = 0,
    startHour: number = 0,
    startMinute: number = 0
  ) {
    this.minute = startMinute
    this.totalMinutes = 0
    this.hour = startHour
    this.totalHours = 0
    this.day = startDay
    this.totalDays = 0
    this.weeks = Math.round((startMonth * 30) / 7)
    this.totalWeeks = 0
    this.month = startMonth
    this.totalMonths = 0
    this.year = startYear
    this.totalYears = 0
  }

  public sortIndividuals() {}

  public toDate() {
    return new Date(this.year, this.month, this.day, this.hour, this.minute)
  }

  public tick(minutes: number) {
    this.minute += minutes
    this.totalMinutes += minutes

    while (this.minute === 60) {
      this.minute -= 60
      this.hour += 1
      this.totalHours += 1
    }

    while (this.hour === 24) {
      this.hour -= 24
      this.day += 1
      this.totalDays += 1
      this.updateWeeks()
      this.updateMonthsAndYears()
    }
  }

  private updateWeeks() {
    if (this.day === 6) {
      this.day -= 6
      this.weeks += 1
      this.totalWeeks += 1
    }
  }

  private updateMonthsAndYears() {
    const daysInMonth = this.getDaysInMonth(this.month, this.year)

    if (this.day >= daysInMonth) {
      this.day -= daysInMonth

      this.month += 1
      this.totalMonths += 1
    }

    if (this.month === 11) {
      this.month -= 11
      this.year += 1
      this.totalYears += 1
    }
  }

  private getDaysInMonth(month: number, year: number): number {
    // february
    if (month === 1) {
      return this.isLeapYear(year) ? 29 : 28
    }
    // april, june, september, november
    else if ([3, 5, 8, 10].includes(month)) {
      return 30
    }

    return 31
  }

  private isLeapYear(year: number): boolean {
    return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)
  }
}
