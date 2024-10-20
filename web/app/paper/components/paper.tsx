import { Download, ChevronRight } from 'lucide-react'
import Link from 'next/link'

import Layout from '@/components/layout'
import MarkdownContent from '@/components/markdown-content'
import { Button } from '@/components/ui/button'
import { TracingBeam } from '@/components/ui/tracing-beam'
import { getContent } from '@/lib/content'

export const dynamic = 'force-static'

const file = '/paper.pdf'

export default async function Paper() {
  const paper = await getContent('paper')

  return (
    <Layout className="h-full w-full justify-start">
      <div className="flex min-h-[80vh] w-full items-start justify-center py-10">
        <main className="relative flex w-full flex-col items-center justify-center gap-y-10 text-lg font-normal tracking-tighter md:w-4/5 md:justify-between">
          {/* <Link href={file} className="top-0 block 2xl:absolute 2xl:left-12 2xl:pl-0">
            <Button
              className="dark:border-muted bg-background dark:bg-muted/50 flex h-9 items-center justify-start gap-x-2 rounded-full border border-neutral-200"
              variant={'secondary'}
            >
              Baixar PDF
              <Download className="-ml-1" height={16} width={16} />
            </Button>
          </Link> */}
          <Link href={'/references'} className="top-0 block 2xl:absolute 2xl:left-12 2xl:pl-0">
            <Button
              className="dark:border-muted bg-background dark:bg-muted/50 flex h-9 items-center justify-start gap-x-2 rounded-full border border-neutral-200"
              variant={'secondary'}
            >
              References <ChevronRight className="-mr-1" height={16} width={16} />
            </Button>
          </Link>
          <div className="flex flex-col items-center justify-start gap-y-10 sm:gap-y-20">
            <div className="flex h-full w-full flex-col items-center justify-start gap-y-1 px-8 md:max-w-lg lg:max-w-2xl">
              <article className="flex w-full flex-col items-center gap-y-4 pb-10 md:w-[40rem] lg:w-[50rem]">
                <div className="flex flex-col gap-y-2">
                  <h2 className="font-sans-heading from-foreground to-muted-foreground bg-gradient-to-r bg-clip-text text-2xl font-semibold tracking-tighter text-transparent sm:text-3xl xl:text-4xl">
                    Pandemica: Agent-Based Pandemic Simulation for Optimal Public Health Crisis
                    Management Using Adaptive Demographic Modeling
                  </h2>
                  <p className="text-muted-foreground text-sm tracking-tight md:text-base">
                    Departament of Data Processing - Colégio Técnico de Campinas - Universidade
                    Estadual de Campinas (Unicamp)
                  </p>
                </div>
                {paper && <MarkdownContent>{paper?.body}</MarkdownContent>}
                <div className="flex w-full items-center justify-center">
                  <Link href="/references">
                    <Button className="bg-pandemica-blue/70 dark:bg-pandemica-blue/50 dark:hover:bg-pandemica-blue border-pandemica-blue hover:bg-pandemica-blue dark:text-primary flex h-9 flex-row gap-x-0.5 rounded-full border text-white">
                      References <ChevronRight className="-mr-1" height={16} width={16} />
                    </Button>
                  </Link>
                </div>
              </article>
            </div>
          </div>
        </main>
      </div>
    </Layout>
  )
}
