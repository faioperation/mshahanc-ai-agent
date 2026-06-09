import MessageCard from './MessageCard'
import Loader from '../ui/Loader'

const DAY_ORDER = [0, 3, 7, 14]

const DAY_LABELS = {
  0: 'Day 0 — Initial',
  3: 'Day 3 — Follow-up 1',
  7: 'Day 7 — Follow-up 2',
  14: 'Day 14 — Final',
}

function groupAndSort(messages) {
  const groupMap = new Map()
  for (const msg of messages) {
    const key = msg.lead_id || msg.lead_name || 'unknown'
    if (!groupMap.has(key)) {
      groupMap.set(key, { leadName: msg.lead_name || 'Unknown Lead', messages: [] })
    }
    groupMap.get(key).messages.push(msg)
  }
  const groups = Array.from(groupMap.values())
  for (const group of groups) {
    group.messages.sort((a, b) => {
      const ai = DAY_ORDER.indexOf(Number(a.sequence_day))
      const bi = DAY_ORDER.indexOf(Number(b.sequence_day))
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
    })
  }
  groups.sort((a, b) => a.leadName.localeCompare(b.leadName))
  return groups
}

export default function ReviewQueue({ messages, loading, onApprove, onReject, onUpdate }) {
  if (loading) return <Loader text="Loading review queue..." />

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-gray-400 text-sm">No messages pending review</p>
        <p className="text-gray-600 text-xs mt-1">
          Messages will appear here when leads are contacted
        </p>
      </div>
    )
  }

  const groups = groupAndSort(messages)

  return (
    <div className="space-y-8">
      {groups.map((group) => (
        <div key={group.leadName}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
            <h3 className="text-sm font-semibold text-white">{group.leadName}</h3>
            <div className="flex-1 h-px bg-gray-800" />
            <span className="text-xs text-gray-500 shrink-0">
              {group.messages.length} message{group.messages.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {group.messages.map((message) => (
              <div key={message.id} className="flex flex-col gap-2">
                <span className="self-start inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-800 text-gray-400">
                  {DAY_LABELS[Number(message.sequence_day)] ?? `Day ${message.sequence_day}`}
                </span>
                <MessageCard
                  message={message}
                  onApprove={onApprove}
                  onReject={onReject}
                  onUpdate={onUpdate}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}