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
        <dt className="font-semibold">
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

export default function DataVisualization() {
  const [realData, setRealData] = useState<DataItem[]>([])
  const [simulatedData, setSimulatedData] = useState<DataItem[]>([])
  const [loaded, setLoaded] = useState(false)
  const [chartTypes, setChartTypes] = useState<{ [key: string]: 'line' | 'bar' }>(
    metrics.reduce((acc, metric) => ({ ...acc, [metric]: 'line' }), {})
  )

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
        setLoaded(true)
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
    <div className="w-full flex flex-col gap-y-4">
      <h4 className="font-sans-heading from-foreground to-muted-foreground bg-gradient-to-r bg-clip-text text-lg font-semibold tracking-tighter text-transparent sm:text-xl xl:text-2xl/none">
        Visualization
      </h4>
      {loaded ? (
        metrics.map((metric, i) => (
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
        ))
      ) : (
        <p className="font-sans-heading text-muted-foreground sm:text-sm md:text-base">
          Loading...
        </p>
      )}
    </div>
  )
}
