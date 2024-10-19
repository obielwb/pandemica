'use client'

import Link from 'next/link'
import { useTheme } from 'next-themes'
import { useWindowSize } from 'react-use'

import { cn } from '@/lib/utils'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion'
import PandemicaHeading from '@/components/pandemica-heading'
import { FaGithub } from 'react-icons/fa6'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../ui/select'
import { LuSun, LuMonitor, LuMoonStar } from 'react-icons/lu'
import { useEffect, useState } from 'react'

const links = [
  {
    section: 'Model',
    references: [
      {
        url: '/simulate',
        label: 'Simulation'
      },
      {
        url: '/paper',
        label: 'Paper'
      },
      {
        url: '/references',
        label: 'References'
      }
    ]
  },
  {
    section: 'About',
    references: [
      {
        url: '/authors',
        label: 'Authors'
      },
      {
        url: '/contact',
        label: 'Contact'
      }
    ]
  }
]

export default function Footer() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const size = useWindowSize()

  useEffect(() => setMounted(true), [])

  return (
    <footer className="dark:border-muted z-40 flex w-full shrink-0 flex-col items-start gap-2 border-t border-neutral-200 px-0.5 py-6 sm:flex-col md:px-6">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-start justify-start gap-x-14 gap-y-6 px-6 md:max-w-7xl md:flex-row">
        <div className="flex h-full w-full justify-between gap-y-14 md:w-auto md:flex-col md:items-start">
          <Link href="/" className="flex h-full">
            <PandemicaHeading />
          </Link>
          <Link
            href="https://github.com/obielwb/pandemica"
            rel="noreferrer"
            target="_blank"
            className="flex h-full"
          >
            <FaGithub className="text-2xl" />
          </Link>
        </div>
        {size.width > 768 && (
          <div className="flex flex-row gap-x-8">
            <div className="flex gap-x-8">
              {links.map((link, i) => (
                <div key={`mobile-footer-sec-${i}`} className="flex min-w-28 flex-col gap-y-3">
                  <h4 className="font-sans-heading text-sm font-medium">{link.section}</h4>
                  <ul className="flex flex-col items-start gap-y-3">
                    {link.references.map((reference, j) => (
                      <li key={`mobile-footer-sec-${i}-ref-${j}`}>
                        <Link
                          className="text-muted-foreground hover:text-foreground flex h-4 items-center text-sm font-normal transition-colors duration-200"
                          href={reference.url}
                        >
                          {reference.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-y-3">
              <h4 className="font-sans-heading text-sm font-medium">Theme</h4>
              {mounted && (
                <Select value={mounted ? theme : ''} onValueChange={(value) => setTheme(value)}>
                  <SelectTrigger className="w-32 h-9 outline-none ring-0 active:outline-none active:ring-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="light" className="cursor-pointer">
                        <div className="flex flex-row gap-x-2 items-center">
                          <LuSun className="text-lg" />
                          Light
                        </div>
                      </SelectItem>
                      <SelectItem value="dark" className="cursor-pointer">
                        <div className="flex flex-row gap-x-2 items-center">
                          <LuMoonStar className="text-lg" />
                          Dark
                        </div>
                      </SelectItem>
                      <SelectItem value="system" className="cursor-pointer">
                        <div className="flex flex-row gap-x-2 items-center">
                          <LuMonitor className="text-lg" />
                          System
                        </div>
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="flex flex-col gap-y-3">
              <h4 className="font-sans-heading text-sm font-medium">Disclaimer</h4>
              <p className="text-muted-foreground -mt-1 text-sm font-normal">
                This model aims to provide an estimate based on available data, even when this data
                may not be definitive. This work has not been peer-reviewed yet.
              </p>
            </div>
          </div>
        )}
        {size.width <= 768 && (
          <div className="flex flex-col gap-y-4">
            <Accordion type="multiple" className="w-full">
              {links.map((link, i) => {
                return (
                  <AccordionItem
                    className="w-full"
                    key={`accordion-item-${i}`}
                    value={`item-${link.section.toLowerCase()}`}
                  >
                    <AccordionTrigger className="font-sans-heading w-full text-sm font-medium hover:no-underline">
                      {link.section}
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="flex flex-col items-start gap-y-3">
                        {link.references.map((reference, j) => (
                          <li key={`accordion-item-${i}-ref-${j}`}>
                            <Link
                              className="text-muted-foreground hover:text-foreground flex h-4 items-center text-sm font-normal transition-colors duration-200"
                              href={reference.url}
                            >
                              {reference.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                )
              })}
              <AccordionItem value="item-theme" className="w-full">
                <AccordionTrigger className="w-full text-sm hover:no-underline">
                  Theme
                </AccordionTrigger>
                <AccordionContent>
                  <Select value={mounted ? theme : ''} onValueChange={(value) => setTheme(value)}>
                    <SelectTrigger className="w-32 h-9 mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="light" className="cursor-pointer">
                          <div className="flex flex-row gap-x-2 items-center">
                            <LuSun className="text-lg" />
                            Light
                          </div>
                        </SelectItem>
                        <SelectItem value="dark" className="cursor-pointer">
                          <div className="flex flex-row gap-x-2 items-center">
                            <LuMoonStar className="text-lg" />
                            Dark
                          </div>
                        </SelectItem>
                        <SelectItem value="system" className="cursor-pointer">
                          <div className="flex flex-row gap-x-2 items-center">
                            <LuMonitor className="text-lg" />
                            System
                          </div>
                        </SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            <div className="flex flex-col gap-y-3">
              <h4 className="font-sans-heading text-sm font-medium">Disclaimer</h4>
              <p className="text-muted-foreground -mt-1 text-sm font-normal">
                This model aims to provide an estimate based on available data, even when this data
                may not be definitive. This work has not been peer-reviewed yet.
              </p>
            </div>
          </div>
        )}
      </div>
    </footer>
  )
}
