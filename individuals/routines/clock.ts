import { Individual } from './individual'

export class Clock {
  private hours: number
  private days: number

  constructor(public individuals: Individual[]) {
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

  sortIndividuals() {
    const stack: { left: number; right: number }[] = [];
    stack.push({ left: 0, right: this.individuals.length - 1 });

    while (stack.length > 0) {
      const { left, right } = stack.pop()!;
      if (right > left) {
        const pivotIndex = this.partition(left, right);
        stack.push({ left, right: pivotIndex - 1 });
        stack.push({ left: pivotIndex + 1, right });
      }
    }
  }

  private partition(left: number, right: number): number {
    const pivot = this.individuals[left];
    let i = left + 1;

    for (let j = left + 1; j <= right; j++) {
      if (this.individuals[j].currentActivity!.duration! < pivot.currentActivity!.duration!) {
        this.swap(i, j);
        i++;
      }
    }

    this.swap(left, i - 1);
    return i - 1;
  }

  private swap(a: number, b: number) {
    const c = this.individuals[a];
    this.individuals[a] = this.individuals[b];
    this.individuals[b] = c;
  }
}
