export interface Occupation {
  id: string
  label: string // occupation name, can be a industry, company or school
  size: number // number of people related to this occupation
}

export interface Workstation extends Occupation {}
export interface Study extends Occupation {}
