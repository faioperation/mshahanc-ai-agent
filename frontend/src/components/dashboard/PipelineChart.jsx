import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

const COLORS = {
  qualified: '#6366f1',
  contacted: '#3b82f6',
  replied: '#a855f7',
  interested: '#10b981',
  booked: '#f59e0b',
  disqualified: '#ef4444',
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm">
        <p className="text-white font-medium capitalize">{label}</p>
        <p className="text-indigo-400">{payload[0].value} leads</p>
      </div>
    )
  }
  return null
}

export default function PipelineChart({ data }) {
  if (!data) return null

  const chartData = [
    { name: 'Qualified', value: data.qualified || 0, key: 'qualified' },
    { name: 'Contacted', value: data.contacted || 0, key: 'contacted' },
    { name: 'Replied', value: data.replied || 0, key: 'replied' },
    { name: 'Disqualified', value: data.disqualified || 0, key: 'disqualified' },
  ]

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white">Lead Pipeline</h3>
        <p className="text-xs text-gray-500">{data.total || 0} total</p>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} barSize={32}>
          <XAxis
            dataKey="name"
            tick={{ fill: '#9ca3af', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#9ca3af', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {chartData.map((entry) => (
              <Cell key={entry.key} fill={COLORS[entry.key] || '#6366f1'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}