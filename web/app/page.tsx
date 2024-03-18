import dynamic from 'next/dynamic'
import Home from './components/home'

const DynamicHome = dynamic(() => import('./components/home'), {
  ssr: false
})

export default function HomePage() {
  return <DynamicHome />
}
