import { useState } from 'react'
import Input from '../ui/Input'
import Button from '../ui/Button'

export default function MessageEditor({ message, onUpdate, onClose }) {
  const [emailSubject, setEmailSubject] = useState(message.email_subject || '')
  const [emailBody, setEmailBody] = useState(message.email_body || '')
  const [smsBody, setSmsBody] = useState(message.sms_body || '')
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    await onUpdate({
      email_subject: emailSubject,
      email_body: emailBody,
      sms_body: smsBody,
    })
    setLoading(false)
  }

  return (
    <div className="space-y-5">
      <Input
        label="Email Subject"
        value={emailSubject}
        onChange={(e) => setEmailSubject(e.target.value)}
        placeholder="Enter email subject"
      />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-300">Email Body</label>
        <textarea
          value={emailBody}
          onChange={(e) => setEmailBody(e.target.value)}
          rows={10}
          className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2.5 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none"
          placeholder="Enter email body"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-300">
          SMS Body
          <span className="ml-2 text-xs text-gray-500">
            ({smsBody.length}/1500)
          </span>
        </label>
        <textarea
          value={smsBody}
          onChange={(e) => setSmsBody(e.target.value)}
          rows={3}
          maxLength={1500}
          className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2.5 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none"
          placeholder="Enter SMS body"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          variant="primary"
          onClick={handleSave}
          loading={loading}
          className="flex-1"
        >
          Save Changes
        </Button>
        <Button
          variant="secondary"
          onClick={onClose}
          className="flex-1"
        >
          Cancel
        </Button>
      </div>
    </div>
  )
}