import { useState } from 'react'
import { Mail, MessageSquare } from 'lucide-react'
import Badge from '../ui/Badge'
import Button from '../ui/Button'
import Modal from '../ui/Modal'
import MessageEditor from './MessageEditor'
import { getLeadById } from '../../api/leads'

const statusConfig = {
  pending_review: { label: 'Pending Review', variant: 'warning' },
  approved: { label: 'Approved', variant: 'success' },
  rejected: { label: 'Rejected', variant: 'danger' },
  sent: { label: 'Sent', variant: 'info' },
}

function MapButton({ leadId, leadName }) {
  const [loading, setLoading] = useState(false)

  const handleClick = async (e) => {
    e.stopPropagation()
    if (!leadId) return
    setLoading(true)
    try {
      const lead = await getLeadById(leadId)
      if (lead?.lat && lead?.lng) {
        const query = encodeURIComponent(
          lead.business_name && lead.address
            ? `${lead.business_name}, ${lead.address}`
            : lead.business_name || `${lead.lat},${lead.lng}`
        )
        const url = `https://www.google.com/maps/search/${query}/@${lead.lat},${lead.lng},17z`
        window.open(url, '_blank', 'noopener,noreferrer')
      } else {
        const query = encodeURIComponent(leadName || leadId)
        window.open(`https://www.google.com/maps/search/${query}`, '_blank', 'noopener,noreferrer')
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      title={`View ${leadName || 'lead'} on map`}
      disabled={loading}
      className="inline-flex items-center justify-center w-6 h-6 rounded-md hover:bg-gray-700 transition text-base leading-none disabled:opacity-50"
    >
      {loading ? '⏳' : '🌐'}
    </button>
  )
}

export default function MessageCard({ message, onApprove, onReject, onUpdate }) {
  const [editOpen, setEditOpen] = useState(false)

  const status = statusConfig[message.status] || { label: message.status, variant: 'default' }

  return (
    <>
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0 flex items-center gap-2">
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-white truncate">
                {message.lead_name || 'Unknown Lead'}
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Day {message.sequence_day} · {new Date(message.created_at).toLocaleDateString()}
              </p>
            </div>
            <MapButton leadId={message.lead_id} leadName={message.lead_name} />
          </div>
          <Badge label={status.label} variant={status.variant} />
        </div>

        <div className="space-y-3 mb-4">
          {message.email_subject && (
            <div className="flex items-start gap-2">
              <Mail size={13} className="text-gray-500 mt-0.5 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-gray-500 mb-0.5">Subject</p>
                <p className="text-sm text-gray-300 truncate">{message.email_subject}</p>
              </div>
            </div>
          )}
          {message.sms_body && (
            <div className="flex items-start gap-2">
              <MessageSquare size={13} className="text-gray-500 mt-0.5 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-gray-500 mb-0.5">SMS</p>
                <p className="text-sm text-gray-300 line-clamp-2">{message.sms_body}</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {message.status === 'pending_review' && (
            <>
              <Button
                size="sm"
                variant="success"
                onClick={() => onApprove(message.id)}
                className="flex-1"
              >
                ✓ Approve
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => onReject(message.id)}
                className="flex-1"
              >
                ✕ Reject
              </Button>
            </>
          )}
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setEditOpen(true)}
            className="flex-1"
          >
            View & Edit
          </Button>
        </div>
      </div>

      <Modal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        title={`Message — ${message.lead_name}`}
        size="lg"
      >
        <MessageEditor
          message={message}
          onUpdate={(data) => {
            onUpdate(message.id, data)
            setEditOpen(false)
          }}
          onClose={() => setEditOpen(false)}
        />
      </Modal>
    </>
  )
}