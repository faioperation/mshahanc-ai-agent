import { useNavigate } from 'react-router-dom'
import { Mail, Phone, Globe, MapPin } from 'lucide-react'
import LeadStatusBadge from './LeadStatusBadge'
import Button from '../ui/Button'

export default function LeadCard({ lead }) {
  const navigate = useNavigate()

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-white truncate">
            {lead.business_name}
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">{lead.category || '—'}</p>
        </div>
        <LeadStatusBadge status={lead.status} />
      </div>

      <div className="space-y-1.5 mb-4">
        {lead.email && (
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Mail size={12} className="text-gray-500 shrink-0" />
            <span className="truncate">{lead.email}</span>
          </div>
        )}
        {lead.phone && (
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Phone size={12} className="text-gray-500 shrink-0" />
            <span>{lead.phone}</span>
          </div>
        )}
        {lead.address && (
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <MapPin size={12} className="text-gray-500 shrink-0" />
            <span className="truncate">{lead.address}</span>
          </div>
        )}
        {lead.website && (
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Globe size={12} className="text-gray-500 shrink-0" />
            <a
              href={lead.website}
              target="_blank"
              rel="noopener noreferrer"
              className="truncate hover:text-indigo-400 transition"
              onClick={(e) => e.stopPropagation()}
            >
              {lead.website}
            </a>
          </div>
        )}
      </div>

      <Button
        size="sm"
        variant="secondary"
        onClick={() => navigate(`/leads/${lead.id}`)}
        className="w-full"
      >
        View Details
      </Button>
    </div>
  )
}