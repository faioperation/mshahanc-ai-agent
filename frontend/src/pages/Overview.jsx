import { useEffect, useState, useCallback } from 'react'
import { Users, Mail, MessageSquare, CalendarClock, Clock } from 'lucide-react'
import StatCard from '../components/dashboard/StatCard'
import PipelineChart from '../components/dashboard/PipelineChart'
import RecentActivity from '../components/dashboard/RecentActivity'
import Loader from '../components/ui/Loader'
import { getOverview } from '../api/dashboard'
import { getAllLogs } from '../api/outreach'

const REFRESH_INTERVAL = 30000 // 30 seconds

export default function Overview() {
  const [overview, setOverview] = useState(null)
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(null)

  const fetchAll = useCallback(async (showLoader = false) => {
    if (showLoader) setLoading(true)
    try {
      const [overviewData, logsData] = await Promise.all([
        getOverview(),
        getAllLogs(),
      ])
      setOverview(overviewData)
      setLogs(logsData.logs || [])
      setLastUpdated(new Date())
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial load
  useEffect(() => {
    fetchAll(true)
  }, [fetchAll])

  // Auto-refresh every 30s
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAll(false) // silent refresh, no loader
    }, REFRESH_INTERVAL)
    return () => clearInterval(interval)
  }, [fetchAll])

  // Topbar refresh button
  useEffect(() => {
    const handler = () => fetchAll(false)
    window.addEventListener('app:refresh', handler)
    return () => window.removeEventListener('app:refresh', handler)
  }, [fetchAll])

  if (loading) return <Loader text="Loading overview..." />
  if (!overview) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Dashboard Overview</h2>
          <p className="text-sm text-gray-400 mt-0.5">
            Monitor your catering outreach pipeline
          </p>
        </div>
        {lastUpdated && (
          <p className="text-xs text-gray-600">
            Updated {lastUpdated.toLocaleTimeString()}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <StatCard
          title="Total Leads"
          value={overview.leads.total}
          icon={Users}
          color="indigo"
          subtitle={`${overview.leads.qualified} qualified`}
        />
        <StatCard
          title="Contacted"
          value={overview.leads.contacted}
          icon={Mail}
          color="blue"
          subtitle={`${overview.leads.replied} replied`}
        />
        <StatCard
          title="Messages Sent"
          value={overview.outreach.total_messages_sent}
          icon={MessageSquare}
          color="purple"
          subtitle={`${overview.outreach.email_sent} email · ${overview.outreach.sms_sent} sms`}
        />
        <StatCard
          title="Scheduled Events"
          value={overview.pending.scheduled_events}
          icon={CalendarClock}
          color="yellow"
        />
        <StatCard
          title="Pending Review"
          value={overview.pending.messages_pending_review}
          icon={Clock}
          color="red"
          subtitle="Messages awaiting approval"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <PipelineChart data={overview.leads} />
        <RecentActivity logs={logs} />
      </div>
    </div>
  )
}