// FILE: src/pages/Campaigns.jsx
import { useEffect, useState } from 'react'
import { Plus, RefreshCw, Megaphone } from 'lucide-react'
import CampaignCard from '../components/campaigns/CampaignCard'
import CampaignForm from '../components/campaigns/CampaignForm'
import Modal from '../components/ui/Modal'
import Button from '../components/ui/Button'
import Loader from '../components/ui/Loader'
import useCampaignStore from '../store/campaignStore'
import { getLeads } from '../api/leads'

export default function Campaigns() {
  const [createOpen, setCreateOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [qualifiedCount, setQualifiedCount] = useState(null)

  const {
    campaigns,
    totalCampaigns,
    loading,
    fetchCampaigns,
    createCampaign,
    launchNow,
  } = useCampaignStore()

  useEffect(() => {
    fetchCampaigns()
  }, [])

  // respond to the Topbar refresh button
  useEffect(() => {
    const handler = () => fetchCampaigns()
    window.addEventListener('app:refresh', handler)
    return () => window.removeEventListener('app:refresh', handler)
  }, [])

  const openCreate = async () => {
    setCreateOpen(true)
    try {
      const data = await getLeads('qualified')
      setQualifiedCount(data.total ?? (data.leads ? data.leads.length : null))
    } catch {
      setQualifiedCount(null)
    }
  }

  const handleCreate = async (payload) => {
    setCreating(true)
    try {
      await createCampaign(payload)
      setCreateOpen(false)
    } catch (err) {
      console.error(err)
    } finally {
      setCreating(false)
    }
  }

  const handleLaunchNow = async (id) => {
    try {
      await launchNow(id)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Event Campaigns</h2>
          <p className="text-sm text-gray-400 mt-0.5">
            {totalCampaigns} campaign{totalCampaigns === 1 ? '' : 's'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={fetchCampaigns}>
            <RefreshCw size={14} />
            Refresh
          </Button>
          <Button size="sm" variant="primary" onClick={openCreate}>
            <Plus size={14} />
            Create Campaign
          </Button>
        </div>
      </div>

      {loading ? (
        <Loader text="Loading campaigns..." />
      ) : campaigns.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Megaphone size={28} className="text-gray-600 mb-3" />
          <p className="text-gray-400 text-sm">No campaigns yet</p>
          <p className="text-gray-600 text-xs mt-1">
            Create an event campaign to reach all qualified leads at once
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {campaigns.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              onLaunchNow={handleLaunchNow}
            />
          ))}
        </div>
      )}

      <Modal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create Event Campaign"
        size="md"
      >
        <CampaignForm
          onSubmit={handleCreate}
          onClose={() => setCreateOpen(false)}
          loading={creating}
          qualifiedCount={qualifiedCount}
        />
      </Modal>
    </div>
  )
}