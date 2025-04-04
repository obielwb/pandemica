import type { ReactNode } from 'react'

import Footer from './footer'
import Header from './header'
import Banner from './banner'
import { cn } from '@/lib/utils'

export default function Layout({
  children,
  className,
  header = true,
  footer = true
}: {
  children: ReactNode
  className?: string
  header?: boolean
  footer?: boolean
}) {
  return (
    <div className={cn('bg-background flex min-h-screen flex-col', className)}>
      {/* <Banner /> */}
      {header && <Header />}
      {children}
      {footer && <Footer />}
    </div>
  )
}
