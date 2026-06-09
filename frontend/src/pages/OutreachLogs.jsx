import { useEffect, useState } from 'react'
import { RefreshCw, Mail, MessageSquare } from 'lucide-react'
import Table from '../components/ui/Table'
import Button from '../components/ui/Button'
import Loader from '../components/ui/Loader'
import { getAllLogs } from '../api/outreach'

export default function OutreachLogs() {
  const [logs, setLogs] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const data = await getAllLogs()
      setLogs(data.logs || [])
      setTotal(data.total || 0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [])

  // respond to the Topbar refresh button
  useEffect(() => {
    const handler = () => fetchLogs()
    window.addEventListener('app:refresh', handler)
    return () => window.removeEventListener('app:refresh', handler)
  }, [])

  const columns = [
    {
      key: 'lead_name',
      label: 'Lead',
      render: (row) => (
        <p className="text-white font-medium">{row.lead_name || '—'}</p>
      ),
    },
    {
      key: 'channel',
      label: 'Channel',
      render: (row) => (
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          {row.channel === 'email' ? (
            <Mail size={12} className="text-blue-400" />
          ) : (
            <MessageSquare size={12} className="text-emerald-400" />
          )}
          <span className="capitalize">{row.channel}</span>
        </div>
      ),
    },
    {
      key: 'sequence_day',
      label: 'Day',
      render: (row) => (
        <span className="text-xs text-gray-400">Day {row.sequence_day}</span>
      ),
    },
    {
      key: 'delivery_status',
      label: 'Status',
      render: (row) => (
        <span
          className={`text-xs font-medium capitalize ${
            row.delivery_status === 'sent'
              ? 'text-emerald-400'
              : row.delivery_status === 'failed'
              ? 'text-red-400'
              : 'text-gray-400'
          }`}
        >
          {row.delivery_status}
        </span>
      ),
    },
    {
      key: 'sent_at',
      label: 'Sent At',
      render: (row) => (
        <span className="text-xs text-gray-500">
          {row.sent_at ? new Date(row.sent_at).toLocaleString() : '—'}
        </span>
      ),
    },
  ]

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Outreach Logs</h2>
          <p className="text-sm text-gray-400 mt-0.5">{total} total logs</p>
        </div>
        <Button size="sm" variant="secondary" onClick={fetchLogs}>
          <RefreshCw size={14} />
          Refresh
        </Button>
      </div>

      {loading ? (
        <Loader text="Loading logs..." />
      ) : (
        <Table columns={columns} data={logs} />
      )}
    </div>
  )
}