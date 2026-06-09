const statuses = [
  { label: 'All', value: null },
  { label: 'Qualified', value: 'qualified' },
  { label: 'Disqualified', value: 'disqualified' },
  { label: 'Replied', value: 'replied' },
]

export default function LeadFilters({ selected, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {statuses.map((s) => (
        <button
          key={String(s.value)}
          onClick={() => onChange(s.value)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            selected === s.value
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
          }`}
        >
          {s.label}
        </button>
      ))}
    </div>
  )
}