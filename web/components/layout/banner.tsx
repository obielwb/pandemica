'use client'

import { cn } from '@/lib/utils'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function Banner() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div
      className={cn(
        'top-0 z-50 h-12 sm:h-8 border-b bg-pandemica-blue/70 dark:bg-pandemica-blue/50 border-pandemica-blue text-white flex items-center justify-center',
        mounted && window && window.location.pathname === '/paper' ? 'hidden' : ''
      )}
    >
      <p className="sm:text-sm text-xs sm:p-0 p-5 text-center">
        <b>New ✨</b> From Oct. 19, the paper will be fully available in English.{' '}
        <Link href="/paper" className="underline underline-offset-2">
          Check it out →
        </Link>
      </p>
    </div>
  )
}
