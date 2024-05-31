'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { Menu } from 'lucide-react'

import PandemicaHeading from '@/components/pandemica-heading'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useWindowSize } from 'react-use'

const links = [
  {
    url: '/paper',
    label: 'Artigo'
  },
  {
    url: '/references',
    label: 'Referências'
  },
  {
    url: '/authors',
    label: 'Autores'
  },
  {
    url: '/contact',
    label: 'Contato'
  }
]

export default function Banner() {
  return (
    <div className="top-0 z-50 h-12 sm:h-8 border-b bg-pandemica-blue/70 dark:bg-pandemica-blue/50 border-pandemica-blue text-primary flex items-center justify-center">
      <p className="sm:text-sm text-xs sm:p-0 p-5 text-center">
        <b>New:</b> Site English version & paper cooming soon! For now, please use a translation
        tool.
      </p>
    </div>
  )
}
