import { useEffect, useState } from 'react'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import useSettingsStore from '../store/settingsStore'

export default function Settings() {
  const fetchSettings = useSettingsStore((s) => s.fetchSettings)
  const saveSettings = useSettingsStore((s) => s.saveSettings)

  const [form, setForm] = useState({
    restaurant_name: '',
    restaurant_address: '',
    restaurant_lat: '',
    restaurant_lng: '',
    default_radius_miles: '',
    contact_name: '',
    auto_send: false,
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetchSettings()
      .then((data) => {
        if (data) {
          setForm({
            restaurant_name: data.restaurant_name || '',
            restaurant_address: data.restaurant_address || '',
            restaurant_lat: data.restaurant_lat || '',
            restaurant_lng: data.restaurant_lng || '',
            default_radius_miles: data.default_radius_miles || '',
            contact_name: data.contact_name || '',
            auto_send: data.auto_send || false,
          })
        }
      })
      .finally(() => setLoading(false))
  }, [fetchSettings])

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    try {
      await saveSettings({
        ...form,
        restaurant_lat: form.restaurant_lat ? parseFloat(form.restaurant_lat) : null,
        restaurant_lng: form.restaurant_lng ? parseFloat(form.restaurant_lng) : null,
        default_radius_miles: form.default_radius_miles
          ? parseFloat(form.default_radius_miles)
          : null,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  if (loading) return <p className="text-gray-400 text-sm">Loading settings...</p>

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-lg font-bold text-white">Settings</h2>
        <p className="text-sm text-gray-400 mt-0.5">
          Configure your preferences
        </p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5">
        <h3 className="text-sm font-semibold text-white">Restaurant Info</h3>
        <Input
          label="Restaurant Name"
          value={form.restaurant_name}
          onChange={(e) => handleChange('restaurant_name', e.target.value)}
          placeholder="Your Restaurant Name"
        />
        <Input
          label="Contact Name"
          value={form.contact_name}
          onChange={(e) => handleChange('contact_name', e.target.value)}
          placeholder="Shahan Chowdhury"
        />
        <Input
          label="Restaurant Address"
          value={form.restaurant_address}
          onChange={(e) => handleChange('restaurant_address', e.target.value)}
          placeholder="Los Angeles, CA"
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Latitude"
            value={form.restaurant_lat}
            onChange={(e) => handleChange('restaurant_lat', e.target.value)}
            placeholder="34.0522"
          />
          <Input
            label="Longitude"
            value={form.restaurant_lng}
            onChange={(e) => handleChange('restaurant_lng', e.target.value)}
            placeholder="-118.2437"
          />
        </div>
        <Input
          label="Default Search Radius (miles)"
          type="number"
          value={form.default_radius_miles}
          onChange={(e) => handleChange('default_radius_miles', e.target.value)}
          placeholder="10"
        />
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
        <h3 className="text-sm font-semibold text-white">Outreach Preferences</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white font-medium">Auto Send</p>
            <p className="text-xs text-gray-400 mt-0.5">
              Automatically send messages without manual review
            </p>
          </div>
          <button
            onClick={() => handleChange('auto_send', !form.auto_send)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              form.auto_send ? 'bg-indigo-600' : 'bg-gray-700'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                form.auto_send ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="primary" onClick={handleSave} loading={saving}>
          Save Settings
        </Button>
        {saved && (
          <span className="text-sm text-emerald-400">
            ✓ Your Settings Are Synced
          </span>
        )}
      </div>
    </div>
  )
}