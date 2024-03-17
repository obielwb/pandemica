import { useContext, useState, useCallback, useEffect } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import DataVisualization from './data-visualization'

type ModelOutputProps = {
  configuration: {
    city: string
    patology: string
  }
}

export default function Output({ configuration }: ModelOutputProps) {
  const [output, setOutput] = useState(['runId'])

  return (
    <Tabs defaultValue="data" className="w-full">
      <TabsList className="w-full">
        <TabsTrigger className="w-auto" value="data">
          Dados
        </TabsTrigger>
        <TabsTrigger className="w-auto" value="city">
          Cidade
        </TabsTrigger>
        <TabsTrigger className="w-auto" value="patology">
          Patologia
        </TabsTrigger>
        {/* <TabsTrigger className="w-auto" value="logs">
          Logs
        </TabsTrigger> */}
      </TabsList>
      <TabsContent value="data" className="flex flex-col gap-y-4">
        {/* todo: properly calculate accuracy */}
        {/* todo: use papaparse to parse the last line of both csvs in order to plot the real value here */}
        {/* <div className="flex flex-col gap-4 md:flex-row w-full">
                  <section className="dark:border-muted gap-y-2 bg-background dark:bg-muted/50 rounded py-6 px-9 border-2 w-ful flex flex-col md:justify-center md:items-start relative">
                    <p className="text-sm text-pandemica-yellow">Acurácia</p>
                    <span className="text-7xl font-sans-heading">30%</span>
                  </section>
                  <section className="dark:border-muted gap-y-2 bg-background dark:bg-muted/50 rounded py-6 px-9 border-2 w-ful flex flex-col md:justify-center md:items-start relative">
                    <p className="text-sm tracking-tight text-pandemica-yellow">Casos</p>
                    <div className="grid grid-cols-2 grid-flow-rows md:grid-cols2 md:grid-flow-col gap-4">
                      <div>
                        <span className="text-sm font-semibold tracking-tight">Real</span>
                        <p className="text-muted-foreground text-sm tracking-tight">209.500</p>
                      </div>
                      <div>
                        <span className="text-sm font-semibold tracking-tight">Simulado</span>
                        <p className="text-muted-foreground text-sm tracking-tight">724.645</p>
                      </div>
                    </div>
                  </section>
                  <section className="dark:border-muted gap-y-2 bg-background dark:bg-muted/50 rounded py-6 px-9 border-2 w-ful flex flex-col md:justify-center md:items-start relative">
                    <p className="text-sm tracking-tight text-pandemica-yellow">Mortes</p>
                    <div className="grid grid-cols-2 grid-flow-rows md:grid-cols-2 md:grid-flow-col gap-4">
                      <div>
                        <span className="text-sm font-semibold tracking-tight">Real</span>
                        <p className="text-muted-foreground text-sm tracking-tight">5.360</p>
                      </div>
                      <div>
                        <span className="text-sm font-semibold tracking-tight">Simulado</span>
                        <p className="text-muted-foreground text-sm tracking-tight">19.313</p>
                      </div>
                    </div>
                  </section>
                </div> */}
        <div className="flex flex-col w-full">
          <DataVisualization />
        </div>
        <div className="w-full flex items-center justify-center px-8">
          <section className="dark:border-muted bg-background dark:bg-muted/50 rounded p-5 border-2 flex flex-col w-full md:w-fit">
            <p className="text-sm tracking-tight text-pandemica-yellow">Dados técnicos</p>
            <div className="grid grid-cols-2 grid-flow-rows md:grid-cols-3 md:grid-flow-col gap-4">
              <div>
                <span className="text-sm font-semibold tracking-tight">Linhas de código</span>
                <p className="text-muted-foreground text-sm tracking-tight">+8 mil</p>
              </div>
              <div>
                <span className="text-sm font-semibold tracking-tight">Tempo de simulação</span>
                <p className="text-muted-foreground text-sm tracking-tight">2 horas</p>
              </div>
              <div>
                {/* todo: fetch from csv */}
                <span className="text-sm font-semibold tracking-tight">Dias simulados</span>
                <p className="text-muted-foreground text-sm tracking-tight">1.020</p>
              </div>
            </div>
          </section>
        </div>
      </TabsContent>
      {/* todo?: perhaps remove the tabs bellow and focus only on the charts */}
      <TabsContent value="city">Dados da cidade em questão.</TabsContent>
      <TabsContent value="patology">Dados da patologia em questão.</TabsContent>
      {/* <TabsContent value="logs">
        <div className="bg-muted w-full rounded">
          <Textarea value={'A ser feito.'} readOnly />
        </div>
      </TabsContent> */}
    </Tabs>
  )
}
