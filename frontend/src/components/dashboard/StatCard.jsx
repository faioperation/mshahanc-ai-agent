export default function StatCard({ title, value, icon: Icon, color = 'indigo', subtitle = null }) {
  const colors = {
    indigo: 'bg-indigo-500/10 text-indigo-400',
    emerald: 'bg-emerald-500/10 text-emerald-400',
    yellow: 'bg-yellow-500/10 text-yellow-400',
    red: 'bg-red-500/10 text-red-400',
    blue: 'bg-blue-500/10 text-blue-400',
    purple: 'bg-purple-500/10 text-purple-400',
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex items-start gap-4">
      <div className={`p-3 rounded-lg ${colors[color]}`}>
        <Icon size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-bold text-white mt-1">{value ?? '—'}</p>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      </div>
    </div>
  )
}