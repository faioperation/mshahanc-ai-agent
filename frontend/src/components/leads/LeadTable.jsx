import { useNavigate } from 'react-router-dom'
import Table from '../ui/Table'
import LeadStatusBadge from './LeadStatusBadge'
import { Mail, Phone } from 'lucide-react'

function MapLink({ lat, lng, name, address }) {
  if (!lat || !lng) return null

  // Search by business name near the coordinates — shows the place card with name
  const query = encodeURIComponent(name && address ? `${name}, ${address}` : name || `${lat},${lng}`)
  const url = `https://www.google.com/maps/search/${query}/@${lat},${lng},17z`

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      title={`View ${name || 'lead'} on map`}
      onClick={(e) => e.stopPropagation()}
      className="inline-flex items-center justify-center w-6 h-6 rounded-md hover:bg-gray-700 transition text-base leading-none"
    >
      🌐
    </a>
  )
}

export default function LeadTable({ leads }) {
  const navigate = useNavigate()

  const columns = [
    {
      key: 'business_name',
      label: 'Business',
      render: (row) => (
        <div className="flex items-center gap-2">
          <div>
            <p className="text-white font-medium">{row.business_name}</p>
            <p className="text-xs text-gray-500">{row.category || '—'}</p>
          </div>
          <MapLink lat={row.lat} lng={row.lng} name={row.business_name} address={row.address} />
        </div>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      render: (row) => (
        <div className="flex items-center gap-1.5 text-gray-400">
          <Mail size={12} />
          <span className="text-xs">{row.email || '—'}</span>
        </div>
      ),
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (row) => (
        <div className="flex items-center gap-1.5 text-gray-400">
          <Phone size={12} />
          <span className="text-xs">{row.phone || '—'}</span>
        </div>
      ),
    },
    {
      key: 'address',
      label: 'Address',
      render: (row) => (
        <span className="text-xs text-gray-400 truncate max-w-xs block">
          {row.address || '—'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <LeadStatusBadge status={row.status} />,
    },
    {
      key: 'created_at',
      label: 'Created',
      render: (row) => (
        <span className="text-xs text-gray-500">
          {row.created_at ? new Date(row.created_at).toLocaleDateString() : '—'}
        </span>
      ),
    },
  ]

  return (
    <Table
      columns={columns}
      data={leads}
      onRowClick={(row) => navigate(`/leads/${row.id}`)}
    />
  )
}