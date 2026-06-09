// FILE: src/components/campaigns/CampaignCard.jsx  (REPLACE existing)
import { Calendar, MapPin, Users, Send, Clock, Star } from 'lucide-react'
import Badge from '../ui/Badge'
import Button from '../ui/Button'

const statusConfig = {
  scheduled: { label: 'Scheduled', variant: 'warning' },
  running: { label: 'Running', variant: 'info' },
  completed: { label: 'Completed', variant: 'success' },
  cancelled: { label: 'Cancelled', variant: 'default' },
  failed: { label: 'Failed', variant: 'danger' },
}

export default function CampaignCard({ campaign, onLaunchNow }) {
  const status = statusConfig[campaign.status] || {
    label: campaign.status,
    variant: 'default',
  }

  const canLaunch =
    campaign.status === 'scheduled' || campaign.status === 'failed'

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-white truncate flex items-center gap-1.5">
            {campaign.event_name || 'Untitled Event'}
            {campaign.is_big_event && (
              <Star size={13} className="text-amber-400 shrink-0" />
            )}
          </h3>
          <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
            <MapPin size={11} className="text-gray-500 shrink-0" />
            {campaign.event_city || '—'}
          </p>
        </div>
        <Badge label={status.label} variant={status.variant} />
      </div>

      {campaign.is_big_event && (
        <span className="inline-flex items-center gap-1 text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-full px-2 py-0.5 mb-3">
          <Star size={11} />
          Big Event
        </span>
      )}

      {campaign.event_description && (
        <p className="text-xs text-gray-400 mb-3 line-clamp-2">
          {campaign.event_description}
        </p>
      )}

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Clock size={13} className="text-gray-500 shrink-0" />
          <span>
            Starts:{' '}
            {campaign.start_at
              ? new Date(campaign.start_at).toLocaleString()
              : '—'}
          </span>
        </div>
        {campaign.event_date && (
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Calendar size={13} className="text-gray-500 shrink-0" />
            <span>Event date: {campaign.event_date}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Users size={13} className="text-gray-500 shrink-0" />
          <span>
            {campaign.processed_leads ?? 0} / {campaign.total_leads ?? 0} leads
            processed
          </span>
        </div>
      </div>

      {canLaunch && (
        <Button
          size="sm"
          variant="primary"
          onClick={() => onLaunchNow(campaign.id)}
          className="w-full"
        >
          <Send size={13} />
          Launch Now
        </Button>
      )}
    </div>
  )
}