import { create } from 'zustand'
import {
  getReviewQueue,
  getMessagesByLead,
  approveMessage,
  rejectMessage,
  updateMessage,
  generateMessage,
} from '../api/messages'

const useMessageStore = create((set, get) => ({
  reviewQueue: [],
  leadMessages: [],
  totalPending: 0,
  loading: false,
  error: null,

  fetchReviewQueue: async () => {
    set({ loading: true, error: null })
    try {
      const data = await getReviewQueue()
      set({
        reviewQueue: data.messages,
        totalPending: data.total,
        loading: false,
      })
    } catch (err) {
      set({ error: err.message, loading: false })
    }
  },

  fetchMessagesByLead: async (leadId) => {
    set({ loading: true, error: null })
    try {
      const data = await getMessagesByLead(leadId)
      set({
        leadMessages: data.messages,
        loading: false,
      })
    } catch (err) {
      set({ error: err.message, loading: false })
    }
  },

  generateMessage: async (leadId, sequenceDay = 0) => {
    set({ loading: true, error: null })
    try {
      const data = await generateMessage(leadId, sequenceDay)
      await get().fetchReviewQueue()
      set({ loading: false })
      return data
    } catch (err) {
      set({ error: err.message, loading: false })
      throw err
    }
  },

  approveMessage: async (messageId) => {
    try {
      const updated = await approveMessage(messageId)
      set((state) => ({
        reviewQueue: state.reviewQueue.filter((m) => m.id !== messageId),
        totalPending: state.totalPending - 1,
      }))
      return updated
    } catch (err) {
      set({ error: err.message })
      throw err
    }
  },

  rejectMessage: async (messageId) => {
    try {
      const updated = await rejectMessage(messageId)
      set((state) => ({
        reviewQueue: state.reviewQueue.filter((m) => m.id !== messageId),
        totalPending: state.totalPending - 1,
      }))
      return updated
    } catch (err) {
      set({ error: err.message })
      throw err
    }
  },

  updateMessage: async (messageId, payload) => {
    try {
      const updated = await updateMessage(messageId, payload)
      set((state) => ({
        reviewQueue: state.reviewQueue.map((m) =>
          m.id === messageId ? updated : m
        ),
        leadMessages: state.leadMessages.map((m) =>
          m.id === messageId ? updated : m
        ),
      }))
      return updated
    } catch (err) {
      set({ error: err.message })
      throw err
    }
  },

  clearError: () => set({ error: null }),
}))

export default useMessageStore