export default function Table({ columns, data, onRowClick }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-800">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-800/50 border-b border-gray-800">
            {columns.map((col) => (
              <th
                key={col.key}
                className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 py-3"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="text-center text-gray-500 py-10"
              >
                No data found
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr
                key={row.id || idx}
                onClick={() => onRowClick && onRowClick(row)}
                className={`bg-gray-900 transition ${
                  onRowClick
                    ? 'cursor-pointer hover:bg-gray-800'
                    : ''
                }`}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-gray-300">
                    {col.render ? col.render(row) : row[col.key] ?? '—'}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}