export default function Input({
  label,
  value,
  onChange,
  placeholder = '',
  type = 'text',
  disabled = false,
  error = null,
  className = '',
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-gray-300">{label}</label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full bg-gray-800 border ${
          error ? 'border-red-500' : 'border-gray-700'
        } text-white text-sm rounded-lg px-3 py-2.5 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition`}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}