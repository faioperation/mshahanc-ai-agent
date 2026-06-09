// FILE: src/store/campaignStore.js
import { create } from 'zustand'
import {
  getCampaigns,
  createCampaign,
  launchCampaignNow,
} from '../api/campaigns'

const useCampaignStore = create((set, get) => ({
  campaigns: [],
  totalCampaigns: 0,
  loading: false,
  error: null,

  fetchCampaigns: async () => {
    set({ loading: true, error: null })
    try {
      const data = await getCampaigns()
      set({
        campaigns: data.campaigns,
        totalCampaigns: data.total,
        loading: false,
      })
    } catch (err) {
      set({ error: err.message, loading: false })
    }
  },

  createCampaign: async (payload) => {
    set({ loading: true, error: null })
    try {
      const created = await createCampaign(payload)
      await get().fetchCampaigns()
      set({ loading: false })
      return created
    } catch (err) {
      set({ error: err.message, loading: false })
      throw err
    }
  },

  launchNow: async (campaignId) => {
    try {
      const data = await launchCampaignNow(campaignId)
      // mark it running locally for instant feedback; checker/poll will confirm
      set((state) => ({
        campaigns: state.campaigns.map((c) =>
          c.id === campaignId ? { ...c, status: 'running' } : c
        ),
      }))
      return data
    } catch (err) {
      set({ error: err.message })
      throw err
    }
  },

  clearError: () => set({ error: null }),
}))

export default useCampaignStore