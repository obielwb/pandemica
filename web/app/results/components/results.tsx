'use client'
import Layout from '@/components/layout'
import LineGraph from './charts/line'

export default function Results() {
  return (
    <Layout>
      <div className="flex min-h-[80vh] w-full items-start justify-center py-10">
        <main className="relative flex w-full flex-col items-center justify-center gap-y-10 text-lg font-normal tracking-tighter md:w-4/5 md:justify-between">
          <div className="flex flex-col items-center justify-start gap-y-10 sm:gap-y-20">
            <div className="flex h-full w-full flex-col items-center justify-start gap-y-1 px-8 md:max-w-lg lg:max-w-2xl">
              <article className="flex w-full flex-col items-start gap-y-14 pb-10 md:w-[40rem] lg:w-[50rem]">
                <div className="flex flex-col gap-y-2">
                  <h2 className="font-sans-heading from-foreground to-muted-foreground bg-gradient-to-r bg-clip-text text-2xl font-semibold tracking-tighter text-transparent sm:text-3xl xl:text-4xl/none">
                    Resultados
                  </h2>
                  <p className="text-muted-foreground text-sm tracking-normal md:text-base">
                    Acurácia e análises dos resultados do modelo
                  </p>
                </div>
                <div className="flex flex-col gap-4 md:flex-row w-full">
                  <section className="dark:border-muted bg-background dark:bg-muted/50 rounded py-6 px-9 border-2 w-ful flex flex-col md:justify-center md:items-start relative">
                    <p className="text-sm text-pandemica-yellow md:absolute md:top-6">Acurácia</p>
                    <span className="text-7xl mt-2">30%</span>
                  </section>
                  <section className="dark:border-muted bg-background dark:bg-muted/50 rounded py-6 px-9 border-2 flex flex-col w-full md:w-fit">
                    <p className="text-sm text-pandemica-yellow">Análises técnicas</p>
                    <div className="grid grid-cols-1 grid-flow-rows md:grid-rows-2 md:grid-flow-col gap-4">
                      <div>
                        <span className="text-base font-semibold">Linhas de código</span>
                        <p className="text-muted-foreground text-sm">+8 mil</p>
                      </div>
                      <div>
                        <span className="text-base font-semibold">Tempo de simulação</span>
                        <p className="text-muted-foreground text-sm">2 horas</p>
                      </div>
                      <div>
                        <span className="text-base font-semibold">Dias simulados</span>
                        <p className="text-muted-foreground text-sm">756 dias</p>
                      </div>
                      <div>
                        <span className="text-base font-semibold">Linhas de código</span>
                        <p className="text-muted-foreground text-sm">+8 mil</p>
                      </div>
                      <div>
                        <span className="text-base font-semibold">Linhas de código</span>
                        <p className="text-muted-foreground text-sm">+8 mil</p>
                      </div>
                    </div>
                  </section>
                </div>
                <div className="flex flex-col ">
                  <LineGraph />
                </div>
              </article>
            </div>
          </div>
        </main>
      </div>
    </Layout>
  )
}
