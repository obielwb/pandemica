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

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const pathname = usePathname()

  const size = useWindowSize()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }

    window.addEventListener('scroll', handleScroll)

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div
      className={cn(
        'sticky top-0 z-50 h-14 border-b border-transparent bg-transparent backdrop-blur-xl transition-all duration-200 ease-linear',
        isScrolled && 'dark:border-muted border-neutral-200'
      )}
    >
      <header>
        <nav className="mx-auto flex h-[52px] w-full max-w-5xl flex-row justify-between gap-x-4 px-6 py-2 md:max-w-7xl md:gap-x-10 ">
          <Link className="flex items-center justify-center" href="/">
            <PandemicaHeading />
          </Link>
          <div className="hidden w-full justify-end md:justify-between sm:flex">
            <div className="flex items-center gap-3 sm:gap- 6">
              {links.map((link, i) => {
                return (
                  <Link
                    key={`header-ref-${i}`}
                    className="text-muted-foreground hover:text-foreground flex h-0 items-center text-sm font-normal transition-colors duration-200"
                    href={
                      link.url === '/paper' ? (pathname === '/' ? link.url : '/simulate') : link.url
                    }
                  >
                    {link.label === 'Artigo'
                      ? pathname === '/'
                        ? link.label
                        : 'Simulação'
                      : link.label}
                  </Link>
                )
              })}
            </div>
            <div className="hidden flex-row items-center gap-x-4 md:flex">
              <Link
                href={
                  pathname === '/' || pathname === '/paper' || pathname === '/references'
                    ? '/simulate'
                    : '/paper'
                }
              >
                <Button className="flex h-9 items-center gap-x-0.5 rounded-full font-medium">
                  {pathname === '/' || pathname === '/paper' || pathname === '/references'
                    ? 'Simulação'
                    : 'Artigo'}
                  <ChevronRight className="-mr-1" height={16} width={16} />
                </Button>
              </Link>
            </div>
          </div>

          <div className="flex sm:hidden">
            <Button
              className="bg-transparent dark:bg-transparent dark:hover:bg-transparent"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span className="sr-only">Abrir menu</span>
              <Menu className="text-foreground" />
            </Button>
          </div>
        </nav>
      </header>
      {isMobileMenuOpen ? (
        <div className="flex flex-col w-auto mx-4 mt-2 justify-end items-start gap-y-6 bg-background rounded z-50 p-2 py-4 transition-all duration-200 ease-linear border border-border">
          {links.map((link, i) => {
            return (
              <Link
                key={`header-ref-${i}`}
                className="text-foreground-muted hover:text-foreground flex h-0 items-center text-sm font-normal transition-colors duration-200"
                href={
                  link.url === '/paper'
                    ? pathname === '/' || pathname === '/simulate'
                      ? link.url
                      : '/simulate'
                    : link.url
                }
              >
                {link.label === 'Artigo'
                  ? pathname === '/' || pathname === '/simulate'
                    ? link.label
                    : 'Simulação'
                  : link.label}
              </Link>
            )
          })}
        </div>
      ) : (
        <></>
      )}
    </div>
  )
}
