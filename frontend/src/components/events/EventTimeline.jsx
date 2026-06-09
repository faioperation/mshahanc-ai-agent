import { CheckCircle, Clock, XCircle, Circle } from 'lucide-react'

const dayLabels = {
  0: 'Day 0 — Initial',
  3: 'Day 3 — Follow-up 1',
  7: 'Day 7 — Follow-up 2',
  14: 'Day 14 — Final',
}

const statusIcon = {
  sent: <CheckCircle size={16} className="text-emerald-400" />,
  scheduled: <Clock size={16} className="text-yellow-400" />,
  failed: <XCircle size={16} className="text-red-400" />,
  cancelled: <XCircle size={16} className="text-gray-500" />,
  pending: <Circle size={16} className="text-gray-600" />,
}

const statusColor = {
  sent: 'border-emerald-500',
  scheduled: 'border-yellow-500',
  failed: 'border-red-500',
  cancelled: 'border-gray-600',
  pending: 'border-gray-700',
}

export default function EventTimeline({ events = [] }) {
  const days = [0, 3, 7, 14]

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-white mb-5">Sequence Timeline</h3>
      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-800" />
        <div className="space-y-5">
          {days.map((day) => {
            const event = events.find((e) => e.sequence_day === day)
            const status = event?.status || 'pending'

            return (
              <div key={day} className="flex items-start gap-4 relative">
                <div
                  className={`w-8 h-8 rounded-full border-2 ${statusColor[status]} bg-gray-900 flex items-center justify-center shrink-0 z-10`}
                >
                  {statusIcon[status]}
                </div>
                <div className="flex-1 pt-1 pb-2">
                  <p className="text-sm font-medium text-white">
                    {dayLabels[day]}
                  </p>
                  {event ? (
                    <div className="mt-1 space-y-0.5">
                      <p className="text-xs text-gray-400 capitalize">
                        {event.channel} · {event.status}
                      </p>
                      {event.scheduled_at && (
                        <p className="text-xs text-gray-500">
                          {new Date(event.scheduled_at).toLocaleString()}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-600 mt-1">Not scheduled yet</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}