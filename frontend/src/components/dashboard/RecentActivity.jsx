import { Mail, MessageSquare, CheckCircle, XCircle, Clock } from 'lucide-react'

const iconMap = {
  email: <Mail size={14} className="text-blue-400" />,
  sms: <MessageSquare size={14} className="text-emerald-400" />,
  both: <Mail size={14} className="text-indigo-400" />,
}

const statusIcon = {
  sent: <CheckCircle size={12} className="text-emerald-400" />,
  failed: <XCircle size={12} className="text-red-400" />,
  scheduled: <Clock size={12} className="text-yellow-400" />,
}

export default function RecentActivity({ logs = [] }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-white mb-4">Recent Activity</h3>
      {logs.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-8">No activity yet</p>
      ) : (
        <div className="space-y-3">
          {logs.slice(0, 8).map((log) => (
            <div
              key={log.id}
              className="flex items-start gap-3 p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition"
            >
              <div className="mt-0.5">{iconMap[log.channel] || iconMap.email}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-medium truncate">
                  {log.lead_name || 'Unknown Lead'}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Day {log.sequence_day} · {log.channel?.toUpperCase()}
                </p>
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                {statusIcon[log.delivery_status] || statusIcon.sent}
                <span className="text-xs text-gray-500 capitalize">
                  {log.delivery_status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}