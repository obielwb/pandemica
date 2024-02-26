'use client'

import { createContext, ReactNode } from 'react'
import io from 'socket.io-client'

import { API_URL } from '@/lib/api'

export const socket = io(API_URL)
export const WebSocketContext = createContext({ socket })

type WebSocketProviderProps = {
  children: ReactNode
}

export default function WebSocketProvider({ children }: WebSocketProviderProps) {
  return <WebSocketContext.Provider value={{ socket }}>{children}</WebSocketContext.Provider>
}
