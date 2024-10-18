import { Metadata } from 'next'

import Paper from './components/paper'

export const metadata: Metadata = {
  title: 'Paper - Pandemica'
}

export default function PaperPage() {
  return <Paper />
}
