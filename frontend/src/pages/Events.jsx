// FILE: src/pages/Events.jsx
import { useEffect, useState } from 'react'
import { Plus, RefreshCw } from 'lucide-react'
import EventCard from '../components/events/EventCard'
import EventForm from '../components/events/EventForm'
import EventEditForm from '../components/events/EventEditForm'
import Modal from '../components/ui/Modal'
import Button from '../components/ui/Button'
import Loader from '../components/ui/Loader'
import { createEvent, updateEvent, getAllEvents, executeEvent, cancelEvents } from '../api/events'
import { getCampaigns } from '../api/campaigns'

const DAY_ORDER = [0, 3, 7, 14]

const DAY_LABELS = {
  0: 'Day 0 — Initial',
  3: 'Day 3 — Follow-up 1',
  7: 'Day 7 — Follow-up 2',
  14: 'Day 14 — Final',
}

const STATUS_FILTERS = [
  { label: 'Scheduled', value: 'scheduled' },
  { label: 'Sent', value: 'sent' },
  { label: 'All', value: null },
  { label: 'Failed', value: 'failed' },
  { label: 'Cancelled', value: 'cancelled' },
]

function groupAndSortEvents(events) {
  const groupMap = new Map()
  for (const ev of events) {
    const key = ev.lead_id || ev.lead_name || 'unknown'
    if (!groupMap.has(key)) {
      groupMap.set(key, { leadName: ev.lead_name || 'Unknown Lead', events: [] })
    }
    groupMap.get(key).events.push(ev)
  }

  const groups = Array.from(groupMap.values())
  for (const group of groups) {
    group.events.sort((a, b) => {
      const ai = DAY_ORDER.indexOf(Number(a.sequence_day))
      const bi = DAY_ORDER.indexOf(Number(b.sequence_day))
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
    })
  }

  groups.sort((a, b) => a.leadName.localeCompare(b.leadName))
  return groups
}

export default function Events() {
  const [events, setEvents] = useState([])
  const [totalEvents, setTotalEvents] = useState(0)
  const [loading, setLoading] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState('scheduled')

  const [createOpen, setCreateOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [editEvent, setEditEvent] = useState(null)
  const [savingEdit, setSavingEdit] = useState(false)
  const [campaignMap, setCampaignMap] = useState({})

  const fetchEvents = async (status) => {
    setLoading(true)
    try {
      const data = await getAllEvents(status)
      setEvents(data.events || [])
      setTotalEvents(data.total || 0)
    } catch (err) {
      console.error(err)
      setEvents([])
      setTotalEvents(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents(selectedStatus)
  }, [selectedStatus])

  useEffect(() => {
    getCampaigns()
      .then((data) => {
        const map = {}
        ;(data.campaigns || []).forEach((c) => {
          map[c.id] = { name: c.event_name, isBig: !!c.is_big_event }
        })
        setCampaignMap(map)
      })
      .catch(() => {})
  }, [])

  const handleExecute = async (eventId) => {
    try {
      await executeEvent(eventId)
      fetchEvents(selectedStatus)
    } catch (err) {
      console.error(err)
    }
  }

  const handleCancel = async (leadId) => {
    try {
      await cancelEvents(leadId)
      fetchEvents(selectedStatus)
    } catch (err) {
      console.error(err)
    }
  }

  const handleCreate = async (form) => {
    setCreating(true)
    try {
      await createEvent(form)
      fetchEvents(selectedStatus)
      setCreateOpen(false)
    } catch (err) {
      console.error(err)
    } finally {
      setCreating(false)
    }
  }

  const handleSaveEdit = async (changes) => {
    if (!editEvent) return
    setSavingEdit(true)
    try {
      await updateEvent(editEvent.id, changes)
      fetchEvents(selectedStatus)
      setEditEvent(null)
    } catch (err) {
      console.error(err)
    } finally {
      setSavingEdit(false)
    }
  }

  const groups = groupAndSortEvents(events)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Events</h2>
          <p className="text-sm text-gray-400 mt-0.5">
            {totalEvents} event{totalEvents !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => fetchEvents(selectedStatus)}>
            <RefreshCw size={14} />
            Refresh
          </Button>
          <Button size="sm" variant="primary" onClick={() => setCreateOpen(true)}>
            <Plus size={14} />
            Create Event
          </Button>
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => (
          <button
            key={String(f.value)}
            onClick={() => setSelectedStatus(f.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              selectedStatus === f.value
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <Loader text="Loading events..." />
      ) : events.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-gray-400 text-sm">
            No {selectedStatus ? selectedStatus : ''} events found
          </p>
          <p className="text-gray-600 text-xs mt-1">
            Create an event or launch a campaign to schedule outreach
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {groups.map((group) => (
            <div key={group.leadName}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                <h3 className="text-sm font-semibold text-white">{group.leadName}</h3>
                <div className="flex-1 h-px bg-gray-800" />
                <span className="text-xs text-gray-500 shrink-0">
                  {group.events.length} event{group.events.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {group.events.map((event) => {
                  const camp = event.campaign_id ? campaignMap[event.campaign_id] : null
                  return (
                    <div key={event.id} className="flex flex-col gap-2">
                      <span className="self-start inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-800 text-gray-400">
                        {DAY_LABELS[Number(event.sequence_day)] ?? `Day ${event.sequence_day}`}
                      </span>
                      <EventCard
                        event={event}
                        campaignName={camp?.name || null}
                        isBigEvent={camp?.isBig || false}
                        onExecute={handleExecute}
                        onCancel={handleCancel}
                        onEdit={setEditEvent}
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Create Event" size="md">
        <EventForm
          onSubmit={handleCreate}
          onClose={() => setCreateOpen(false)}
          loading={creating}
        />
      </Modal>

      <Modal
        isOpen={!!editEvent}
        onClose={() => setEditEvent(null)}
        title={editEvent ? `Edit Event — ${editEvent.lead_name}` : 'Edit Event'}
        size="lg"
      >
        {editEvent && (
          <EventEditForm
            event={editEvent}
            onSave={handleSaveEdit}
            onClose={() => setEditEvent(null)}
            loading={savingEdit}
          />
        )}
      </Modal>
    </div>
  )
}