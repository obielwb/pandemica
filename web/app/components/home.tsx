'use client'

import {
  ChevronRight,
  Settings,
  Globe,
  ShieldCheck,
  FileText,
  UserCheck,
  Users
} from 'lucide-react'
import Link from 'next/link'
import { useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'

import { Button } from '@/components/ui/button'
import Layout from '@/components/layout'
import { GoogleGeminiEffect } from '@/components/ui/google-gemini-effect'

const details = [
  {
    icon: Globe,
    title: 'Previsão de Disseminações Globais',
    description:
      'Capacidade de antecipar a propagação de doenças em escala mundial, auxiliando na preparação e resposta eficaz a pandemias emergentes.'
  },
  {
    icon: ShieldCheck,
    title: 'Estratégias de Mitigação',
    description:
      'Desenvolvimento de estratégias baseadas em dados para mitigar impactos humanos, econômicos e sociais de surtos epidemiológicos.'
  },
  {
    icon: Users,
    title: 'Simulação de Grandes Populações',
    description:
      'Utilização de conceitos computacionais avançados para modelar interações em grandes populações virtuais.'
  },
  {
    icon: FileText,
    title: 'Geração de Relatórios Epidemiológicos',
    description:
      'Produção de análises detalhadas e relatórios confiáveis para orientar decisões de saúde pública em cenários hipotéticos.'
  },
  {
    icon: UserCheck,
    title: 'Diretrizes para Ação Pública',
    description:
      'Fornecimento de informações críticas para autoridades de saúde sobre medidas preventivas efetivas, incluindo vacinação e uso de máscaras.'
  },
  {
    icon: Settings,
    title: 'Adaptação e Precisão',
    description:
      'Modelo ajustável que incorpora variáveis demográficas e geográficas, maximizando a precisão das simulações de doenças pandêmicas.'
  }
]

export default function Home() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start']
  })

  const pathLengthFirst = useTransform(scrollYProgress, [0, 0.8], [0.2, 1.2])
  const pathLengthSecond = useTransform(scrollYProgress, [0, 0.8], [0.15, 1.2])
  const pathLengthThird = useTransform(scrollYProgress, [0, 0.8], [0.1, 1.2])
  const pathLengthFourth = useTransform(scrollYProgress, [0, 0.8], [0.05, 1.2])
  const pathLengthFifth = useTransform(scrollYProgress, [0, 0.8], [0, 1.2])

  return (
    <Layout>
      <div className="relative h-[400vh] w-full overflow-clip rounded-md pt-40" ref={ref}>
        <GoogleGeminiEffect
          title="Prever, Prevenir, Proteger."
          description="Diante de desafios globais inéditos, Pandemica surge como uma ferramenta
          essencial para a compreensão e enfrentamento de pandemias. Através de
          uma metodologia própria, oferecemos insights críticos para a
          prevenção e mitigação de crises sanitárias futuras."
          pathLengths={[
            pathLengthFirst,
            pathLengthSecond,
            pathLengthThird,
            pathLengthFourth,
            pathLengthFifth
          ]}
        />
      </div>
      <main>
        <section className="w-full pb-12 pt-6 md:pb-24 md:pt-12 lg:pb-32 lg:pt-24 xl:pb-48 xl:pt-32">
          <div className="container px-4 md:px-6">
            <div className="grid items-center gap-6">
              <div className="flex flex-col justify-center gap-y-10 space-y-8 text-center">
                <div className="flex flex-col gap-y-4">
                  <div className="flex flex-col items-center justify-center gap-y-6">
                    <h1 className="font-sans-heading from-foreground to-muted-foreground justify-center bg-gradient-to-r bg-clip-text text-5xl font-bold tracking-tighter text-transparent xl:text-6xl/none">
                      Pandemica
                    </h1>
                    <p className="text-muted-foreground mx-auto max-w-[600px] text-sm sm:text-base md:text-lg">
                      Modele cenários pandêmicos, ajude autoridades a agir com base em dados
                      confiáveis e cenários simulados e minimize impactos humanos, econômicos e
                      sociais.
                    </p>
                    <Link href="/simulate">
                      <Button className="bg-pandemica-blue/70 dark:bg-pandemica-blue/50 dark:hover:bg-pandemica-blue border-pandemica-blue hover:bg-pandemica-blue dark:text-primary flex h-9 flex-row gap-x-0.5 rounded-full border text-white">
                        Simular <ChevronRight className="-mr-1" height={16} width={16} />
                      </Button>
                    </Link>
                  </div>
                </div>
                <div className="mx-auto w-full max-w-full space-y-4">
                  <p className="text-muted-foreground mx-auto max-w-[600px] text-xs sm:text-sm">
                    Funcionalidades na ponta do click.
                  </p>
                  <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3">
                    {details.map((detail, i) => (
                      <div
                        key={`detail-${i}`}
                        className="flex flex-col items-center space-y-2 rounded-lg p-4"
                      >
                        <div className="text-pandemica-yellow rounded-full bg-opacity-50 p-2">
                          <detail.icon />
                        </div>
                        <h2 className="font-sans-heading from-foreground to-muted-foreground bg-gradient-to-r bg-clip-text text-lg font-bold text-transparent md:text-xl">
                          {detail.title}
                        </h2>
                        <p className="text-muted-foreground text-sm md:text-base">
                          {detail.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center gap-y-4">
                  <p className="text-muted-foreground mx-auto max-w-[600px] text-xs sm:text-sm">
                    Para a literatura completa do modelo desenvolvido, veja o artigo.
                  </p>
                  <Link href="/paper">
                    <Button className="bg-pandemica-blue/70 dark:bg-pandemica-blue/50 dark:hover:bg-pandemica-blue border-pandemica-blue hover:bg-pandemica-blue dark:text-primary flex h-9 flex-row gap-x-0.5 rounded-full border text-white">
                      Artigo <ChevronRight className="-mr-1" height={16} width={16} />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  )
}
