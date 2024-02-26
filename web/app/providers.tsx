'use client'

import { ReactNode } from 'react'
import { ThemeProvider } from 'next-themes'
import WebSocketProvider from '@/contexts/websocket-context'

type ProvidersProps = {
  children: ReactNode
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <>
      <WebSocketProvider>
        <ThemeProvider attribute="class" storageKey="theme" enableSystem>
          {children}
        </ThemeProvider>
      </WebSocketProvider>
    </>
  )
}
