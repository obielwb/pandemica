import { Metadata } from 'next'

import Paper from './components/paper'

export const metadata: Metadata = {
  title: 'Artigo - Pandemica'
}

export default function PaperPage() {
  return <Paper />
}
