import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'

import Layout from '@/components/layout'
import MarkdownContent from '@/components/markdown-content'
import { Button } from '@/components/ui/button'
import { getContent } from '@/lib/content'

export const dynamic = 'force-static'

export default async function References() {
  const references = await getContent('references')

  return (
    <Layout className="h-full w-full justify-start">
      <div className="flex min-h-[80vh] w-full items-start justify-center py-10">
        <main className="relative flex w-full flex-col items-center justify-center gap-y-10 text-lg font-normal md:w-4/5 md:justify-between">
          <Link href="/paper" className="top-0 block 2xl:absolute 2xl:left-12 2xl:pl-0">
            <Button
              className="dark:border-muted bg-background dark:bg-muted/50 flex h-9 items-center justify-start gap-x-2 rounded-full border border-neutral-200"
              variant={'secondary'}
            >
              <ChevronLeft className="-ml-1" height={16} width={16} /> Artigo
            </Button>
          </Link>
          <div className="flex flex-col items-center justify-start gap-y-10 sm:gap-y-20">
            <div className="flex h-full w-full flex-col items-center justify-start gap-y-1 px-8 md:max-w-lg lg:max-w-2xl">
              <article className="flex w-full flex-col items-center gap-y-10 pb-10 md:w-[40rem] lg:w-[50rem]">
                <div className="flex flex-col gap-y-2">
                  <h2 className="font-sans-heading from-foreground to-muted-foreground bg-gradient-to-r bg-clip-text text-2xl font-semibold tracking-tighter text-transparent sm:text-3xl xl:text-4xl/none">
                    Referências
                  </h2>
                  <p className="text-muted-foreground text-sm md:text-base">
                    Abaixo, estão descritas todas as{' '}
                    {(references?.body.match(/Acesso/g) || []).length} referências que foram
                    utilizadas na concepção, idealização e materialização do modelo Pandemica.
                  </p>
                </div>
                {references && <MarkdownContent>{references?.body}</MarkdownContent>}
              </article>
            </div>
          </div>
        </main>
      </div>
    </Layout>
  )
}
