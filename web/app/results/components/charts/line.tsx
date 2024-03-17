'use client'
import { LineChart, Line, ResponsiveContainer, CartesianGrid, XAxis, YAxis } from 'recharts'

export default function LineGraph() {
  const data = [
    { name: 'Page A', uv: 400, pv: 2400, amt: 2400 },
    { name: 'Page b', uv: 500, pv: 2500, amt: 2500 },
    { name: 'Page c', uv: 500, pv: 2500, amt: 2500 },
    { name: 'Page d', uv: 600, pv: 2500, amt: 2500 }
  ]
  return (
    <ResponsiveContainer width="100%" height={400} min-width={300}>
      <LineChart data={data}>
        <Line type="monotone" dataKey="uv" stroke="#994141" />
        <CartesianGrid stroke="#ccc" />
        <XAxis dataKey="name" />
        <YAxis />
      </LineChart>
    </ResponsiveContainer>
  )
}
