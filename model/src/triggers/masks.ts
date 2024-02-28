export type MaskRegister = {
  date: Date,
}

export class Mask() {

  private maskDates: MaskRegister[]

  constructor(
    public population: Individual[]
  ) {}

  public assign(currentDate: Date) {}
}
