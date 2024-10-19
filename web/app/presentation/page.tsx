import { Metadata } from 'next'

import Presentation from './components/presentation'

export const metadata: Metadata = {
  title: 'Presentation - Pandemica'
}

export default function PresentationPage() {
  return <Presentation />
}
