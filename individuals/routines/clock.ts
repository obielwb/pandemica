class Clock {
  private hours: number
  private days: number

  constructor() {
    this.hours = 0
    this.days = 0
  }

  tick() {
    this.hours += 1

    if (this.hours == 24) {
      this.hours = 0
      this.days += 1
    }
  }
}

const clock = new Clock()
setInterval(() => {
  clock.tick()
}, 1000) // 1000ms - 1s
