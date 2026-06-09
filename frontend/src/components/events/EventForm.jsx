// FILE: src/components/events/EventForm.jsx  (REPLACE existing)
import { useEffect, useState } from 'react'
import Button from '../ui/Button'
import { getLeads } from '../../api/leads'
import { getCampaigns } from '../../api/campaigns'

export default function EventForm({ onSubmit, onClose, loading }) {
  const [leads, setLeads] = useState([])
  const [campaigns, setCampaigns] = useState([])
  const [loadingData, setLoadingData] = useState(true)

  const [form, setForm] = useState({
    lead_id: '',
    campaign_id: '',
    channel: 'both',
    scheduled_at: '',
  })

  useEffect(() => {
    const load = async () => {
      setLoadingData(true)
      try {
        const [leadData, campaignData] = await Promise.all([
          getLeads('qualified'),
          getCampaigns(),
        ])
        setLeads(leadData.leads || [])
        setCampaigns(campaignData.campaigns || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoadingData(false)
      }
    }
    load()
  }, [])

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = () => {
    if (!form.lead_id || !form.scheduled_at) return
    onSubmit({
      lead_id: form.lead_id,
      channel: form.channel,
      scheduled_at: new Date(form.scheduled_at).toISOString(),
      campaign_id: form.campaign_id || null,
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-300">Lead</label>
        <select
          value={form.lead_id}
          onChange={(e) => handleChange('lead_id', e.target.value)}
          disabled={loadingData}
          className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition disabled:opacity-50"
        >
          <option value="">
            {loadingData ? 'Loading leads…' : 'Select a qualified lead'}
          </option>
          {leads.map((lead) => (
            <option key={lead.id} value={lead.id}>
              {lead.business_name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-300">
          Campaign <span className="text-gray-500 font-normal">(optional)</span>
        </label>
        <select
          value={form.campaign_id}
          onChange={(e) => handleChange('campaign_id', e.target.value)}
          disabled={loadingData}
          className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition disabled:opacity-50"
        >
          <option value="">No campaign — general message</option>
          {campaigns.map((c) => (
            <option key={c.id} value={c.id}>
              {c.event_name} · {c.event_city}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500">
          Pick a campaign to tie the AI message to that event.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-300">Channel</label>
        <select
          value={form.channel}
          onChange={(e) => handleChange('channel', e.target.value)}
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
          value={form.scheduled_at}
          onChange={(e) => handleChange('scheduled_at', e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
        />
      </div>

      <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg px-3 py-2.5">
        <p className="text-xs text-indigo-300">
          A message will be generated automatically for this lead when the event
          is created.
        </p>
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          variant="primary"
          onClick={handleSubmit}
          loading={loading}
          disabled={!form.lead_id || !form.scheduled_at || loadingData}
          className="flex-1"
        >
          Create Event
        </Button>
        <Button variant="secondary" onClick={onClose} className="flex-1">
          Cancel
        </Button>
      </div>
    </div>
  )
}