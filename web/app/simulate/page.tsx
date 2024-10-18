import { Metadata } from 'next'

import Simulate from './components/simulate'

export const metadata: Metadata = {
  title: 'Simulate - Pandemica'
}

export default function SimulatePage() {
  return <Simulate />
}
