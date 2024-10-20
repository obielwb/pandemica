'use client'

import React, { useEffect, useState } from 'react'
import Papa from 'papaparse'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import { DateTime } from 'luxon'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TabsContent } from '@radix-ui/react-tabs'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ChevronRight } from 'lucide-react'

type DataItem = {
  date: string
  [key: string]: number | string
}

type ChartData = {
  date: string
  real: number
  simulated: number
}

type CustomTooltipProps = {
  active?: boolean
  payload?: any[]
  label?: string
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <dl className="text-sm md:text-base rounded p-2 bg-background/60 backdrop-blur filter text-foreground border justify-between border-border transition-colors duration-200">
        <dt className="font-semibold text-primary">
          {DateTime.fromISO(label!, {
            zone: 'UTC'
          })
            .setLocale('en-US')
            .toLocaleString(DateTime.DATE_MED)}
        </dt>
        <div className="flex items-start gap-x-2 flex-col">
          <dd className="text-[#4063C9]">Real: {payload![1].value.toLocaleString()}</dd>
          <dd className="text-[#FFD200]">Simulated: {payload![0].value.toLocaleString()}</dd>
        </div>
      </dl>
    )
  }

  return null
}

const REAL_DATA_SOURCE = '/simulation/data/campinas/2020_2021_2022_cases.csv'
const SIMULATED_DATA_SOURCE = '/simulation/results/campinas/v1.csv'

type Metric =
  | 'totalCases'
  | 'deaths'
  | 'newCases'
  | 'newDeaths'
  | 'totalCases_per_100k_inhabitants'
  | 'deaths_per_100k_inhabitants'
  | 'deaths_by_totalCases'

const metrics: Metric[] = [
  'totalCases',
  'deaths',
  'deaths_by_totalCases',
  'totalCases_per_100k_inhabitants',
  'deaths_per_100k_inhabitants',
  'newCases',
  'newDeaths'
]

const metricLabels: { [key in Metric]: string } = {
  totalCases: 'Total cases',
  deaths: 'Deaths',
  newCases: 'New cases',
  newDeaths: 'New deaths',
  totalCases_per_100k_inhabitants: 'Total cases per 100 thousand habitants',
  deaths_per_100k_inhabitants: 'Deaths per 100 thousand habitants',
  deaths_by_totalCases: 'Deaths per total cases'
}

export default function DataVisualization({ showVisualize = true }: { showVisualize?: boolean }) {
  const [realData, setRealData] = useState<DataItem[]>([])
  const [simulatedData, setSimulatedData] = useState<DataItem[]>([])
  const [loaded, setLoaded] = useState(false)
  const [chartTypes, setChartTypes] = useState<{ [key: string]: 'line' | 'bar' }>(
    metrics.reduce((acc, metric) => ({ ...acc, [metric]: 'line' }), {})
  )

  const getRealAndSimulatedCases = () => {
    return `209,500 - 289,943`
  }

  const getRealAndSimulatedDeaths = () => {
    return `5,360 - 7,752`
  }

  useEffect(() => {
    Papa.parse<DataItem>(REAL_DATA_SOURCE, {
      download: true,
      header: true,
      dynamicTyping: true,
      complete: (result) => {
        setRealData(result.data)
      }
    })
    Papa.parse<DataItem>(SIMULATED_DATA_SOURCE, {
      download: true,
      header: true,
      dynamicTyping: true,
      complete: (result) => {
        setSimulatedData(result.data)
        setTimeout(() => setLoaded(true), 1000)
      }
    })
  }, [])

  const mergeData = (real: DataItem[], simulated: DataItem[], column: string): ChartData[] => {
    return real
      .filter((item) => item.date)
      .map((item) => ({
        date: item.date as string,
        real: item[column] as number,
        simulated:
          (simulated.find((simItem) => simItem.date === item.date)?.[column] as number) || 0
      }))
  }

  return (
    <div className="w-full flex flex-col gap-y-6">
      {loaded ? (
        <>
          {showVisualize && (
            <div className="w-full flex items-center justify-center border border-muted px-4 p-2 rounded-md">
              <>
                <div className="flex md:flex-row flex-col gap-y-4 justify-between w-full">
                  <div>
                    <span className="text-sm font-semibold tracking-tight">Simulation time</span>
                    <p className="text-muted-foreground text-sm tracking-tight">~2 hours</p>
                  </div>
                  <div>
                    {/* todo: fetch from csv */}
                    <span className="text-sm font-semibold tracking-tight">
                      Total days simulated
                    </span>
                    <p className="text-muted-foreground text-sm tracking-tight">1,020 (~3 years)</p>
                  </div>
                  <div>
                    <span className="text-sm font-semibold tracking-tight">
                      Total cases (real - simulated)
                    </span>
                    <p className="text-muted-foreground text-sm tracking-tight">
                      {getRealAndSimulatedCases()}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-semibold tracking-tight">
                      Deaths (real - simulated)
                    </span>
                    <p className="text-muted-foreground text-sm tracking-tight">
                      {getRealAndSimulatedDeaths()}
                    </p>
                  </div>
                </div>
              </>
            </div>
          )}

          {metrics.map((metric, i) => (
            <Tabs key={`result-data-${i}`} defaultValue="line" className="flex flex-col gap-y-4">
              <div className="flex flex-row justify-between items-center">
                <p className="font-sans-heading sm:text-sm md:text-base from-foreground to-muted-foreground bg-gradient-to-r bg-clip-text">
                  {metricLabels[metric as Metric]}
                </p>
                <TabsList>
                  <TabsTrigger className="w-auto" value="line">
                    Line chart
                  </TabsTrigger>
                  {/* <TabsTrigger className="w-auto" value="bar">
                  Barra
                </TabsTrigger> */}
                </TabsList>
              </div>

              <TabsContent value="line">
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart
                    data={mergeData(realData, simulatedData, metric)}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="simulated"
                      stroke="#FFD200"
                      dot={false}
                      activeDot={{ r: 5 }}
                      name={'Simulated'}
                    />
                    <Line
                      type="monotone"
                      dataKey="real"
                      stroke="#0018FF"
                      dot={false}
                      activeDot={{ r: 5 }}
                      name={'Real'}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </TabsContent>
              {/* <TabsContent value="bar">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={mergeData(realData, simulatedData, metric)}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="simulated" fill="#FFD200" name={'Simulado'} />
                  <Bar dataKey="real" fill="#0018FF" name={'Real'} />
                </BarChart>
              </ResponsiveContainer>
            </TabsContent> */}
            </Tabs>
          ))}
          {showVisualize && (
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
          )}
        </>
      ) : (
        <p className="font-sans-heading text-muted-foreground sm:text-sm md:text-base">
          Loading...
        </p>
      )}
    </div>
  )
}
