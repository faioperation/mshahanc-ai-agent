// FILE: src/components/events/EventCard.jsx  (REPLACE existing)
import {
  Calendar,
  Clock,
  Mail,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertCircle,
  Megaphone,
  Star,
  Pencil,
} from 'lucide-react'
import Badge from '../ui/Badge'
import Button from '../ui/Button'

const statusConfig = {
  scheduled: { label: 'Scheduled', variant: 'warning' },
  sent: { label: 'Sent', variant: 'success' },
  failed: { label: 'Failed', variant: 'danger' },
  cancelled: { label: 'Cancelled', variant: 'default' },
}

const channelIcon = {
  email: <Mail size={13} className="text-blue-400" />,
  sms: <MessageSquare size={13} className="text-emerald-400" />,
  both: <Mail size={13} className="text-indigo-400" />,
}

const statusIcon = {
  scheduled: <Clock size={13} className="text-yellow-400" />,
  sent: <CheckCircle size={13} className="text-emerald-400" />,
  failed: <XCircle size={13} className="text-red-400" />,
  cancelled: <AlertCircle size={13} className="text-gray-400" />,
}

export default function EventCard({
  event,
  campaignName = null,
  isBigEvent = false,
  onExecute,
  onCancel,
  onEdit,
}) {
  const status = statusConfig[event.status] || {
    label: event.status,
    variant: 'default',
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-white truncate">
            {event.lead_name || 'Unknown Lead'}
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">Day {event.sequence_day}</p>
        </div>
        <Badge label={status.label} variant={status.variant} />
      </div>

      {(campaignName || isBigEvent) && (
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {campaignName && (
            <span className="inline-flex items-center gap-1 text-xs text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-2 py-0.5">
              <Megaphone size={11} />
              {campaignName}
            </span>
          )}
          {isBigEvent && (
            <span className="inline-flex items-center gap-1 text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-full px-2 py-0.5">
              <Star size={11} />
              Big Event
            </span>
          )}
        </div>
      )}

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          {channelIcon[event.channel] || channelIcon.email}
          <span className="capitalize">{event.channel}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Calendar size={13} className="text-gray-500 shrink-0" />
          <span>
            Scheduled:{' '}
            {event.scheduled_at
              ? new Date(event.scheduled_at).toLocaleString()
              : '—'}
          </span>
        </div>
        {event.sent_at && (
          <div className="flex items-center gap-2 text-xs text-gray-400">
            {statusIcon[event.status]}
            <span>Sent: {new Date(event.sent_at).toLocaleString()}</span>
          </div>
        )}
      </div>

      {event.status === 'scheduled' && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="primary"
              onClick={() => onExecute(event.id)}
              className="flex-1"
            >
              Send Now
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={() => onCancel(event.lead_id)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onEdit(event)}
            className="w-full"
          >
            <Pencil size={13} />
            Edit
          </Button>
        </div>
      )}
    </div>
  )
}