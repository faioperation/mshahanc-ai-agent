import { create } from 'zustand'
import {
  getScheduledEvents,
  getEventsByLead,
  startSequence,
  cancelEvents,
  executeEvent,
} from '../api/events'

const useEventStore = create((set, get) => ({
  events: [],
  leadEvents: [],
  totalEvents: 0,
  loading: false,
  error: null,

  fetchScheduledEvents: async () => {
    set({ loading: true, error: null })
    try {
      const data = await getScheduledEvents()
      set({
        events: data.events,
        totalEvents: data.total,
        loading: false,
      })
    } catch (err) {
      set({ error: err.message, loading: false })
    }
  },

  fetchEventsByLead: async (leadId) => {
    set({ loading: true, error: null })
    try {
      const data = await getEventsByLead(leadId)
      set({
        leadEvents: data.events,
        loading: false,
      })
    } catch (err) {
      set({ error: err.message, loading: false })
    }
  },

  startSequence: async (leadId) => {
    set({ loading: true, error: null })
    try {
      const data = await startSequence(leadId)
      set({ loading: false })
      return data
    } catch (err) {
      set({ error: err.message, loading: false })
      throw err
    }
  },

  cancelEvents: async (leadId) => {
    try {
      const data = await cancelEvents(leadId)
      await get().fetchScheduledEvents()
      return data
    } catch (err) {
      set({ error: err.message })
      throw err
    }
  },

  executeEvent: async (eventId) => {
    try {
      const data = await executeEvent(eventId)
      set((state) => ({
        events: state.events.map((e) => (e.id === eventId ? data : e)),
      }))
      return data
    } catch (err) {
      set({ error: err.message })
      throw err
    }
  },

  clearError: () => set({ error: null }),
}))

export default useEventStore