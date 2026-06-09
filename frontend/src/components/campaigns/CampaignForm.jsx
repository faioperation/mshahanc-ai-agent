// FILE: src/components/campaigns/CampaignForm.jsx  (REPLACE existing)
import { useState } from 'react'
import { Star } from 'lucide-react'
import Input from '../ui/Input'
import Button from '../ui/Button'

export default function CampaignForm({ onSubmit, onClose, loading, qualifiedCount }) {
  const [form, setForm] = useState({
    event_name: '',
    event_city: '',
    start_at: '',
    event_date: '',
    event_description: '',
    is_big_event: false,
  })

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = () => {
    if (!form.event_name || !form.event_city || !form.start_at) return
    onSubmit({
      event_name: form.event_name,
      event_city: form.event_city,
      start_at: new Date(form.start_at).toISOString(),
      event_date: form.event_date || null,
      event_description: form.event_description || null,
      is_big_event: form.is_big_event,
    })
  }

  return (
    <div className="space-y-4">
      <Input
        label="Event Name"
        value={form.event_name}
        onChange={(e) => handleChange('event_name', e.target.value)}
        placeholder="LA Marathon"
      />
      <Input
        label="Event City"
        value={form.event_city}
        onChange={(e) => handleChange('event_city', e.target.value)}
        placeholder="Los Angeles"
      />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-300">
          Campaign Start (when outreach begins)
        </label>
        <input
          type="datetime-local"
          value={form.start_at}
          onChange={(e) => handleChange('start_at', e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
        />
      </div>

      <Input
        label="Event Date (optional)"
        type="date"
        value={form.event_date}
        onChange={(e) => handleChange('event_date', e.target.value)}
      />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-300">
          Event Description
        </label>
        <textarea
          value={form.event_description}
          onChange={(e) => handleChange('event_description', e.target.value)}
          rows={3}
          placeholder="Short context the AI will use to tailor the messages…"
          className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2.5 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none"
        />
      </div>

      {/* Big Event toggle */}
      <div className="flex items-center justify-between bg-gray-800/50 border border-gray-800 rounded-lg px-3 py-3">
        <div className="flex items-center gap-2">
          <Star size={15} className="text-amber-400" />
          <div>
            <p className="text-sm text-white font-medium">Big Event</p>
            <p className="text-xs text-gray-400 mt-0.5">
              Flag a major event so messages convey extra scale
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => handleChange('is_big_event', !form.is_big_event)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            form.is_big_event ? 'bg-amber-500' : 'bg-gray-700'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              form.is_big_event ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg px-3 py-2.5">
        <p className="text-xs text-indigo-300">
          This campaign will start an outreach sequence for{' '}
          <span className="font-semibold">
            {qualifiedCount ?? 'all'} qualified lead
            {qualifiedCount === 1 ? '' : 's'}
          </span>
          . Each lead gets an AI-generated message tied to this event.
        </p>
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          variant="primary"
          onClick={handleSubmit}
          loading={loading}
          disabled={!form.event_name || !form.event_city || !form.start_at}
          className="flex-1"
        >
          Create Campaign
        </Button>
        <Button variant="secondary" onClick={onClose} className="flex-1">
          Cancel
        </Button>
      </div>
    </div>
  )
}