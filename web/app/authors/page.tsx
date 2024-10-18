import { Metadata } from 'next'

import Authors from './components/authors'

export const metadata: Metadata = {
  title: 'Authors - Pandemica'
}

export default function AuthorsPage() {
  return <Authors />
}
