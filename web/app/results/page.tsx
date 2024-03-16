import { Metadata } from 'next'

import Results from './components/results'

export const metadata: Metadata = {
  title: 'Resultados - Pandemica'
}

export default function ContactPage() {
  return <Results />
}
