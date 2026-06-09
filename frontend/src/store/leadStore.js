import { create } from 'zustand'
import { getLeads, generateLeads, updateLead } from '../api/leads'

const useLeadStore = create((set, get) => ({
  leads: [],
  totalLeads: 0,
  loading: false,
  error: null,
  selectedStatus: null,

  fetchLeads: async (status = null) => {
    set({ loading: true, error: null })
    try {
      const data = await getLeads(status)
      set({
        leads: data.leads,
        totalLeads: data.total,
        loading: false,
        selectedStatus: status,
      })
    } catch (err) {
      set({ error: err.message, loading: false })
    }
  },

  generateLeads: async (payload) => {
    set({ loading: true, error: null })
    try {
      const data = await generateLeads(payload)
      await get().fetchLeads()
      set({ loading: false })
      return data
    } catch (err) {
      set({ error: err.message, loading: false })
      throw err
    }
  },

  updateLead: async (leadId, payload) => {
    try {
      const updated = await updateLead(leadId, payload)
      set((state) => ({
        leads: state.leads.map((l) => (l.id === leadId ? updated : l)),
      }))
      return updated
    } catch (err) {
      set({ error: err.message })
      throw err
    }
  },

  clearError: () => set({ error: null }),
}))

export default useLeadStore