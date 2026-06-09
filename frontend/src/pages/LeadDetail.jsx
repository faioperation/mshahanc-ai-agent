import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { ArrowLeft, Mail, Phone, Globe, MapPin, ExternalLink } from 'lucide-react'
import { getLeadById } from '../api/leads'
import { getMessagesByLead } from '../api/messages'
import { getLogsByLead } from '../api/outreach'
import LeadStatusBadge from '../components/leads/LeadStatusBadge'
import EventTimeline from '../components/events/EventTimeline'
import Button from '../components/ui/Button'
import Loader from '../components/ui/Loader'
import useEventStore from '../store/eventStore'

export default function LeadDetail() {
  const { leadId } = useParams()
  const navigate = useNavigate()
  const [lead, setLead] = useState(null)
  const [messages, setMessages] = useState([])
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [startingSequence, setStartingSequence] = useState(false)

  const { leadEvents, fetchEventsByLead, startSequence } = useEventStore()

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)
      try {
        const [leadData, msgData, logData] = await Promise.all([
          getLeadById(leadId),
          getMessagesByLead(leadId),
          getLogsByLead(leadId),
        ])
        setLead(leadData)
        setMessages(msgData.messages || [])
        setLogs(logData.logs || [])
        await fetchEventsByLead(leadId)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [leadId])

  const handleStartSequence = async () => {
    setStartingSequence(true)
    try {
      await startSequence(leadId)
      await fetchEventsByLead(leadId)
    } finally {
      setStartingSequence(false)
    }
  }

  if (loading) return <Loader text="Loading lead details..." />
  if (!lead) return <p className="text-red-400 text-sm">Lead not found</p>

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/leads')}
          className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-white truncate">{lead.business_name}</h2>
          <p className="text-sm text-gray-400">{lead.category || '—'}</p>
        </div>
        <LeadStatusBadge status={lead.status} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-5">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Contact Info</h3>
            <div className="space-y-3">
              {lead.email && (
                <div className="flex items-center gap-3">
                  <Mail size={14} className="text-gray-500 shrink-0" />
                  <span className="text-sm text-gray-300">{lead.email}</span>
                </div>
              )}
              {lead.phone && (
                <div className="flex items-center gap-3">
                  <Phone size={14} className="text-gray-500 shrink-0" />
                  <span className="text-sm text-gray-300">{lead.phone}</span>
                </div>
              )}
              {lead.address && (
                <div className="flex items-center gap-3">
                  <MapPin size={14} className="text-gray-500 shrink-0" />
                  <span className="text-sm text-gray-300">{lead.address}</span>
                </div>
              )}
              {lead.website && (
                <div className="flex items-center gap-3">
                  <Globe size={14} className="text-gray-500 shrink-0" />
                  <a
                    href={lead.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    {lead.website}
                    <ExternalLink size={11} />
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Outreach Logs</h3>
            {logs.length === 0 ? (
              <p className="text-sm text-gray-500">No outreach activity yet</p>
            ) : (
              <div className="space-y-3">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-gray-800/50"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-400">
                        Day {log.sequence_day} · {log.channel?.toUpperCase()} · {log.delivery_status}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {log.sent_at ? new Date(log.sent_at).toLocaleString() : '—'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-5">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Actions</h3>
            <div className="space-y-2">
              <Button
                variant="primary"
                onClick={handleStartSequence}
                loading={startingSequence}
                className="w-full"
              >
                Start Sequence
              </Button>
              <Button
                variant="secondary"
                onClick={() => navigate('/messages')}
                className="w-full"
              >
                View Messages
              </Button>
            </div>
          </div>

          <EventTimeline events={leadEvents} />
        </div>
      </div>
    </div>
  )
}