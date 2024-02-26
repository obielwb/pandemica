import { useContext, useState, useCallback, useEffect } from 'react'
import { WebSocketContext } from '@/contexts/websocket-context'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

type ModelOutputProps = {
  configuration: {
    city: string
    patology: string
  }
}

export default function Output({ configuration }: ModelOutputProps) {
  const { socket } = useContext(WebSocketContext)
  const [output, setOutput] = useState(['runId'])

  const onModelOutput = useCallback(
    (newOutput: string) => {
      setOutput([...output, newOutput])
    },
    [output]
  )

  useEffect(() => {
    socket.on('runId', onModelOutput)

    return () => {
      socket.off('runId', onModelOutput)
    }
  }, [socket, onModelOutput])

  return (
    <Tabs defaultValue="logs" className="w-full">
      <TabsList className="w-full">
        <TabsTrigger className="w-auto" value="logs">
          Logs
        </TabsTrigger>
        <TabsTrigger className="w-auto" value="city">
          Cidade
        </TabsTrigger>
        <TabsTrigger className="w-auto" value="patology">
          Patologia
        </TabsTrigger>
        <TabsTrigger className="w-auto" value="charts">
          Gráficos
        </TabsTrigger>
      </TabsList>
      <TabsContent value="logs">
        <div className="bg-muted w-full rounded">
          <Textarea value={'A ser feito.'} readOnly />
        </div>
      </TabsContent>
      <TabsContent value="city">Dados da cidade em questão.</TabsContent>
      <TabsContent value="patology">Dados da patologia em questão.</TabsContent>
      <TabsContent value="charts">Muitos, muitos gráficos.</TabsContent>
    </Tabs>
  )
}
