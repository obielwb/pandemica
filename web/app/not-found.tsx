import type { Metadata } from 'next'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import Layout from '@/components/layout'

export const metadata: Metadata = {
  title: '404 - Pandemica'
}

export default function NotFoundPage() {
  return (
    <Layout className="justify-between">
      <main className="bg-background grid min-h-full place-items-center px-6 py-24 sm:py-32 lg:px-8">
        <div className="flex flex-col text-center">
          <p className="text-pandemica-yellow text-base font-semibold">404</p>
          <h2 className="from-foreground to-muted-foreground mt-4 h-14 bg-gradient-to-r bg-clip-text text-3xl font-semibold tracking-tighter text-transparent sm:text-4xl xl:text-5xl/none">
            Página não encontrada
          </h2>
          <p className="text-muted-foreground mt-4 text-base leading-7">
            <i>Perder-se também é caminho</i> - Clarice Lispector.
          </p>
          <div className="mt-6 flex items-center justify-center gap-x-4">
            <Link href="/">
              <Button className="bg-pandemica-blue/70 dark:bg-pandemica-blue/50 dark:hover:bg-pandemica-blue border-pandemica-blue hover:bg-pandemica-blue dark:text-primary flex h-9 flex-row gap-x-1 rounded-full border text-white">
                Voltar
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                className="dark:border-muted bg-background dark:bg-muted/50 h-9 rounded-full border border-neutral-200"
                variant={'secondary'}
              >
                Fale conosco
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </Layout>
  )
}
