import { Metadata } from 'next'

import Simulate from './components/simulate'

export const metadata: Metadata = {
  title: 'Simulação - Pandemica'
}

export default function SimulatePage() {
  return <Simulate />
}
