import { Clock } from '..'
import { quickSort } from '../sorting'

const clock = new Clock(new Date('2020-03-18'), [], quickSort)
console.log(clock.currentDate().getDate(), clock.currentDateString())
