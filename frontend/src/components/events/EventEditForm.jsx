// FILE: src/components/events/EventEditForm.jsx  (NEW)
import { useEffect, useState } from 'react'
import Button from '../ui/Button'
import { getMessageById } from '../../api/messages'

// Converts an ISO string into the value a datetime-local input expects
function toLocalInput(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d)) return ''
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`
}

export default function EventEditForm({ event, onSave, onClose, loading }) {
  const [channel, setChannel] = useState(event.channel || 'both')
  const [scheduledAt, setScheduledAt] = useState(toLocalInput(event.scheduled_at))

  const [emailSubject, setEmailSubject] = useState('')
  const [emailBody, setEmailBody] = useState('')
  const [smsBody, setSmsBody] = useState('')
  const [loadingMsg, setLoadingMsg] = useState(true)

  useEffect(() => {
    const loadMessage = async () => {
      if (!event.message_id) {
        setLoadingMsg(false)
        return
      }
      try {
        const msg = await getMessageById(event.message_id)
        setEmailSubject(msg.email_subject || '')
        setEmailBody(msg.email_body || '')
        setSmsBody(msg.sms_body || '')
      } catch (err) {
        console.error(err)
      } finally {
        setLoadingMsg(false)
      }
    }
    loadMessage()
  }, [event.message_id])

  const handleSave = () => {
    onSave({
      channel,
      scheduled_at: scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
      email_subject: emailSubject,
      email_body: emailBody,
      sms_body: smsBody,
    })
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-300">Channel</label>
          <select
            value={channel}
            onChange={(e) => setChannel(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          >
            <option value="both">Both (Email + SMS)</option>
            <option value="email">Email Only</option>
            <option value="sms">SMS Only</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-300">Scheduled At</label>
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
        </div>
      </div>

      <div className="border-t border-gray-800 pt-4 space-y-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Message Content
        </p>

        {loadingMsg ? (
          <p className="text-sm text-gray-500">Loading message…</p>
        ) : (
          <>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-300">
                Email Subject
              </label>
              <input
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="Email subject"
                className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-300">
                Email Body
              </label>
              <textarea
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                rows={8}
                placeholder="Email body"
                className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2.5 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition resize-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-300">
                SMS Body
                <span className="ml-2 text-xs text-gray-500">
                  ({smsBody.length}/160)
                </span>
              </label>
              <textarea
                value={smsBody}
                onChange={(e) => setSmsBody(e.target.value)}
                rows={3}
                maxLength={160}
                placeholder="SMS body"
                className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2.5 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition resize-none"
              />
            </div>
          </>
        )}
      </div>

      <div className="flex gap-3 pt-1">
        <Button
          variant="primary"
          onClick={handleSave}
          loading={loading}
          disabled={loadingMsg}
          className="flex-1"
        >
          Save Changes
        </Button>
        <Button variant="secondary" onClick={onClose} className="flex-1">
          Cancel
        </Button>
      </div>
    </div>
  )
}