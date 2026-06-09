export default function Badge({ label, variant = 'default' }) {
  const variants = {
    default: 'bg-gray-700 text-gray-300',
    success: 'bg-emerald-900 text-emerald-400',
    danger: 'bg-red-900 text-red-400',
    warning: 'bg-yellow-900 text-yellow-400',
    info: 'bg-blue-900 text-blue-400',
    purple: 'bg-purple-900 text-purple-400',
    indigo: 'bg-indigo-900 text-indigo-400',
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}
    >
      {label}
    </span>
  )
}