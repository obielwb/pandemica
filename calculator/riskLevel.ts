export interface RiskLevel {
  label: string
  max: number
}

export const riskLevels: RiskLevel[] = [
  { label: 'very-low', max: 3 },
  { label: 'low', max: 25 },
  { label: 'moderate', max: 100 },
  { label: 'high', max: 300 },
  { label: 'very-high', max: 1000 },
  {
    label: 'dangerously-high',
    max: 100000
  },
  {
    label: 'extreme',
    max: Infinity
  }
]
