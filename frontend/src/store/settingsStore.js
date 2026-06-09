import { create } from 'zustand'
import { getSettings, updateSettings } from '../api/settings'

const useSettingsStore = create((set, get) => ({
  settings: null,
  loading: false,
  saving: false,
  error: null,

  fetchSettings: async () => {
    set({ loading: true, error: null })
    try {
      const data = await getSettings()
      set({ settings: data, loading: false })
      return data
    } catch (err) {
      set({ error: err.message, loading: false })
      return null
    }
  },

  // Merge partial changes into the current settings and persist them.
  // Sending the full merged object keeps it working whether the backend
  // PATCH is partial or expects the whole record.
  saveSettings: async (changes) => {
    set({ saving: true, error: null })
    try {
      const current = get().settings || {}
      const payload = { ...current, ...changes }
      const updated = await updateSettings(payload)
      set({
        settings: updated && typeof updated === 'object' ? updated : payload,
        saving: false,
      })
      return updated
    } catch (err) {
      set({ error: err.message, saving: false })
      throw err
    }
  },
}))

export default useSettingsStore