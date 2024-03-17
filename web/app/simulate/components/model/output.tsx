import { useContext, useState, useCallback, useEffect } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

type ModelOutputProps = {
  configuration: {
    city: string
    patology: string
  }
}

export default function Output({ configuration }: ModelOutputProps) {
  const [output, setOutput] = useState(['runId'])

  const onModelOutput = useCallback(
    (newOutput: string) => {
      setOutput([...output, newOutput])
    },
    [output]
  )

  return (
    <Tabs defaultValue="logs" className="w-full">
      <TabsList className="w-full">
        <TabsTrigger className="w-auto" value="charts">
          Gráficos
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
      <TabsContent value="charts">Muitos, muitos gráficos.</TabsContent>
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
