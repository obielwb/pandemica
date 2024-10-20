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
import { useMotionValue, useScroll, useSpring, useTransform } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import Layout from '@/components/layout'
import { GoogleGeminiEffect } from '@/components/ui/google-gemini-effect'

const details = [
  {
    icon: Globe,
    title: 'Prediction of Global Spread at Municipal Level',
    description:
      'Ability to anticipate the spread of diseases of global magnitude at a local level, assisting local entities in the preparation and effective response to emerging pandemics.'
  },
  {
    icon: ShieldCheck,
    title: 'Mitigation Strategies',
    description:
      'Development of data-driven strategies to mitigate the human, economic, and social impacts of epidemiological outbreaks.'
  },
  {
    icon: Users,
    title: 'Simulation of Large Populations',
    description:
      'Utilization of advanced computational concepts to model interactions in large virtual populations.'
  },
  {
    icon: FileText,
    title: 'Generation of Epidemiological Reports',
    description:
      'Production of detailed analyses and reliable reports to guide public health decisions in hypothetical scenarios.'
  },
  {
    icon: UserCheck,
    title: 'Guidelines for Public Action',
    description:
      'Providing critical information to health authorities on effective preventive measures, including vaccination and mask usage.'
  },
  {
    icon: Settings,
    title: 'Adaptation and Precision',
    description:
      'Adjustable model that incorporates demographic and geographic variables, maximizing the accuracy of pandemic disease simulations.'
  }
]

export default function Home() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start']
  })

  const pathLengthFirst = useTransform(scrollYProgress, [0, 0.8], [0.2, 90])
  const pathLengthSecond = useTransform(scrollYProgress, [0, 0.8], [0.15, 90])
  const pathLengthThird = useTransform(scrollYProgress, [0, 0.8], [0.1, 90])
  const pathLengthFourth = useTransform(scrollYProgress, [0, 0.8], [0.05, 90])
  const pathLengthFifth = useTransform(scrollYProgress, [0, 0.8], [0, 90])

  return (
    <Layout>
      <div
        className="dark:bg-dot-white/[0.2] bg-dot-black/[0.2] relative h-[100vh] w-full overflow-clip rounded-md bg-fixed pt-28 "
        ref={ref}
      >
        <div className="dark:bg-background pointer-events-none fixed  inset-0 z-20 flex h-screen items-center justify-center bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
        <GoogleGeminiEffect
          title="Predict, Prevent, Protect."
          description="In the face of unprecedented global challenges, Pandemica emerges as an essential tool for understanding and combating pandemics. Through an innovative methodology, we offer critical insights for the prevention and mitigation of future health crises."
          pathLengths={[
            pathLengthFirst,
            pathLengthSecond,
            pathLengthThird,
            pathLengthFourth,
            pathLengthFifth
          ]}
        />
      </div>
      <main className="z-40">
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
                      Model pandemic scenarios, help authorities act based on reliable data and
                      simulated scenarios, and minimize human, economic, and social impacts.
                    </p>
                    <Link href="/simulate">
                      <Button className="bg-pandemica-blue/70 dark:bg-pandemica-blue/50 dark:hover:bg-pandemica-blue border-pandemica-blue hover:bg-pandemica-blue dark:text-primary flex h-9 flex-row gap-x-0.5 rounded-full border text-white">
                        Simulation <ChevronRight className="-mr-1" height={16} width={16} />
                      </Button>
                    </Link>
                  </div>
                </div>
                <div className="mx-auto w-full max-w-full space-y-4">
                  <p className="text-muted-foreground mx-auto max-w-[600px] text-xs sm:text-sm">
                    Built-in features to help you understand and combat pandemics.
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
                    For the complete literature of the model, refer to the paper.
                  </p>
                  <Link href="/paper">
                    <Button className="bg-pandemica-blue/70 dark:bg-pandemica-blue/50 dark:hover:bg-pandemica-blue border-pandemica-blue hover:bg-pandemica-blue dark:text-primary flex h-9 flex-row gap-x-0.5 rounded-full border text-white">
                      Paper <ChevronRight className="-mr-1" height={16} width={16} />
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
