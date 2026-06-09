import { useState, useEffect } from 'react'
import { Plus, RefreshCw, Search } from 'lucide-react'
import LeadTable from '../components/leads/LeadTable'
import LeadFilters from '../components/leads/LeadFilters'
import Modal from '../components/ui/Modal'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Loader from '../components/ui/Loader'
import { getLeads, generateLeads } from '../api/leads'
import { getSettings } from '../api/settings'

export default function Leads() {
  const [selectedStatus, setSelectedStatus] = useState(null)
  const [generateOpen, setGenerateOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [leads, setLeads] = useState([])
  const [totalLeads, setTotalLeads] = useState(0)
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [form, setForm] = useState({
    search_terms: ['law office', 'insurance office', 'corporate office', 'school', 'production studio'],
    location: '',
    radius_miles: 10,
    reference_lat: '',
    reference_lng: '',
    max_results_per_search: 20,
  })

  const fetchLeads = async (status) => {
    setLoading(true)
    try {
      if (status === 'qualified') {
        // Qualified filter shows both qualified and contacted leads
        const [qualifiedData, contactedData] = await Promise.all([
          getLeads('qualified'),
          getLeads('contacted'),
        ])
        const combined = [
          ...(qualifiedData.leads || []),
          ...(contactedData.leads || []),
        ]
        setLeads(combined)
        setTotalLeads(combined.length)
      } else {
        const data = await getLeads(status)
        setLeads(data.leads || [])
        setTotalLeads(data.total || 0)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeads(selectedStatus)
  }, [selectedStatus])

  useEffect(() => {
    getSettings().then((data) => {
      setForm((prev) => ({
        ...prev,
        location: data.restaurant_address || '',
        radius_miles: data.default_radius_miles || 10,
        reference_lat: data.restaurant_lat || '',
        reference_lng: data.restaurant_lng || '',
      }))
    })
  }, [])

  useEffect(() => {
    const handler = () => fetchLeads(selectedStatus)
    window.addEventListener('app:refresh', handler)
    return () => window.removeEventListener('app:refresh', handler)
  }, [selectedStatus])

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      await generateLeads({
        ...form,
        radius_miles: parseFloat(form.radius_miles),
        reference_lat: parseFloat(form.reference_lat),
        reference_lng: parseFloat(form.reference_lng),
        max_results_per_search: parseInt(form.max_results_per_search),
      })
      fetchLeads(selectedStatus)
      setGenerateOpen(false)
    } catch (err) {
      console.error(err)
    } finally {
      setGenerating(false)
    }
  }

  const filtered = search.trim()
    ? leads.filter((l) =>
        l.business_name?.toLowerCase().startsWith(search.trim().toLowerCase())
      )
    : leads

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white">Leads</h2>
          <p className="text-sm text-gray-400 mt-0.5">{totalLeads} total leads</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => fetchLeads(selectedStatus)}>
            <RefreshCw size={14} />
            Refresh
          </Button>
          <Button size="sm" variant="primary" onClick={() => setGenerateOpen(true)}>
            <Plus size={14} />
            Generate Leads
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg pl-9 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
        </div>
        <LeadFilters selected={selectedStatus} onChange={setSelectedStatus} />
      </div>

      {loading ? (
        <Loader text="Loading leads..." />
      ) : (
        <LeadTable leads={filtered} />
      )}

      <Modal
        isOpen={generateOpen}
        onClose={() => setGenerateOpen(false)}
        title="Generate New Leads"
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Location"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            placeholder="Los Angeles, CA"
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Reference Lat"
              value={form.reference_lat}
              onChange={(e) => setForm({ ...form, reference_lat: e.target.value })}
              placeholder="34.0522"
            />
            <Input
              label="Reference Lng"
              value={form.reference_lng}
              onChange={(e) => setForm({ ...form, reference_lng: e.target.value })}
              placeholder="-118.2437"
            />
          </div>
          <Input
            label="Radius (miles)"
            type="number"
            value={form.radius_miles}
            onChange={(e) => setForm({ ...form, radius_miles: e.target.value })}
          />
          <Input
            label="Max Results Per Search"
            type="number"
            value={form.max_results_per_search}
            onChange={(e) => setForm({ ...form, max_results_per_search: e.target.value })}
          />
          <div className="flex gap-3 pt-2">
            <Button variant="primary" onClick={handleGenerate} loading={generating} className="flex-1">
              Generate
            </Button>
            <Button variant="secondary" onClick={() => setGenerateOpen(false)} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}