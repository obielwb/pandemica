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

const links = [
  {
    section: 'Modelo',
    references: [
      {
        url: '/simulate',
        label: 'Simular'
      },
      {
        url: '/paper',
        label: 'Artigo'
      },
      {
        url: '/references',
        label: 'Referências'
      }
    ]
  },
  {
    section: 'Sobre',
    references: [
      {
        url: '/authors',
        label: 'Autores'
      },
      {
        url: '/contact',
        label: 'Contato'
      }
    ]
  }
]

export default function Footer() {
  const { theme, setTheme } = useTheme()
  const size = useWindowSize()

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
              <h4 className="font-sans-heading text-sm font-medium">Tema</h4>
              {theme && (
                <div className="text-muted-foreground flex flex-row items-center gap-x-2">
                  <ul className="flex flex-col items-start gap-y-3">
                    <li>
                      <a
                        onClick={() => setTheme('light')}
                        className={cn(
                          'text-muted-foreground hover:text-foreground flex h-4 cursor-pointer items-center text-sm font-normal transition-colors duration-200',
                          theme === 'light' && 'text-foreground'
                        )}
                      >
                        Claro
                      </a>
                    </li>
                    <li>
                      <a
                        onClick={() => setTheme('dark')}
                        className={cn(
                          'text-muted-foreground hover:text-foreground flex h-4 cursor-pointer items-center text-sm font-normal transition-colors duration-200',
                          theme === 'dark' && 'text-foreground'
                        )}
                      >
                        Escuro
                      </a>
                    </li>
                    <li>
                      <a
                        onClick={() => setTheme('system')}
                        className={cn(
                          'text-muted-foreground hover:text-foreground flex h-4 cursor-pointer items-center text-sm font-normal transition-colors duration-200',
                          theme === 'system' && 'text-foreground'
                        )}
                      >
                        Sistema
                      </a>
                    </li>
                  </ul>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-y-3">
              <h4 className="font-sans-heading text-sm font-medium">Disclaimer</h4>
              <p className="text-muted-foreground -mt-1 text-sm font-normal">
                Este modelo tem o intuito de oferecer uma estimativa fundamentada nos dados
                disponíveis, mesmo quando esses dados podem não ser definitivos. Este trabalho não
                foi revisado por pares no âmbito científico.
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
                  Tema
                </AccordionTrigger>
                <AccordionContent>
                  <div className="text-muted-foreground flex flex-row items-center gap-x-2">
                    <ul className="flex flex-col items-start gap-y-3">
                      <li>
                        <a
                          onClick={() => setTheme('light')}
                          className={cn(
                            'text-muted-foreground hover:text-foreground flex h-4 cursor-pointer items-center text-sm font-normal transition-colors duration-200',
                            theme === 'light' && 'text-foreground'
                          )}
                        >
                          Claro
                        </a>
                      </li>
                      <li>
                        <a
                          onClick={() => setTheme('dark')}
                          className={cn(
                            'text-muted-foregroundhover:text-foreground flex h-4 cursor-pointer items-center text-sm font-normal transition-colors duration-200',
                            theme === 'dark' && 'text-foreground'
                          )}
                        >
                          Escuro
                        </a>
                      </li>
                      <li>
                        <a
                          onClick={() => setTheme('system')}
                          className={cn(
                            'text-muted-foreground hover:text-foreground flex h-4 cursor-pointer items-center text-sm font-normal transition-colors duration-200',
                            theme === 'system' && 'text-foreground'
                          )}
                        >
                          Sistema
                        </a>
                      </li>
                    </ul>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            <div className="flex flex-col gap-y-3">
              <h4 className="font-sans-heading text-sm font-medium">Disclaimer</h4>
              <p className="text-muted-foreground -mt-1 text-sm font-normal">
                Este modelo tem o intuito de oferecer uma estimativa fundamentada nos dados
                disponíveis, mesmo quando esses dados podem não ser definitivos. Este trabalho não
                foi revisado por pares no âmbito científico.
              </p>
            </div>
          </div>
        )}
      </div>
    </footer>
  )
}
