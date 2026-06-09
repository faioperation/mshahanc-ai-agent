import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Bell, RefreshCw, MessageSquare } from 'lucide-react'
import useNotificationStore from '../../store/notificationStore'
import useReplyNotifications from '../../hooks/useReplyNotifications'
import useLeadStore from '../../store/leadStore'
import useMessageStore from '../../store/messageStore'
import useEventStore from '../../store/eventStore'

const pageTitles = {
  '/overview': 'Overview',
  '/leads': 'Leads',
  '/messages': 'Messages',
  '/events': 'Events',
  '/outreach': 'Outreach Logs',
  '/settings': 'Settings',
}

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime()
  const s = Math.floor(diff / 1000)
  if (s < 60) return 'just now'
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  return `${d}d ago`
}

export default function Topbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const [spinning, setSpinning] = useState(false)
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef(null)

  // start background polling for replies (Topbar is always mounted)
  useReplyNotifications()

  const notifications = useNotificationStore((s) => s.notifications)
  const unreadCount = useNotificationStore((s) => s.unreadCount)
  const markAllRead = useNotificationStore((s) => s.markAllRead)

  const title =
    Object.entries(pageTitles).find(([path]) =>
      location.pathname.startsWith(path)
    )?.[1] || 'Dashboard'

  const handleRefresh = () => {
    setSpinning(true)

    // refresh the store-backed pages directly (Leads / Messages / Events)
    const { selectedStatus, fetchLeads } = useLeadStore.getState()
    fetchLeads(selectedStatus)
    useMessageStore.getState().fetchReviewQueue()
    useEventStore.getState().fetchScheduledEvents()

    // let local-state pages (Overview, Outreach Logs) refresh themselves
    window.dispatchEvent(new CustomEvent('app:refresh'))

    // keep the spin visible briefly so the action is felt
    setTimeout(() => setSpinning(false), 800)
  }

  const toggleDropdown = () => {
    setOpen((prev) => {
      const next = !prev
      if (next) markAllRead()
      return next
    })
  }

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const handleNotificationClick = (n) => {
    setOpen(false)
    if (n.leadId) navigate(`/leads/${n.leadId}`)
  }

  return (
    <div className="h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-6">
      <h2 className="text-base font-semibold text-white">{title}</h2>

      <div className="flex items-center gap-3">
        {/* Refresh */}
        <button
          onClick={handleRefresh}
          title="Refresh data"
          className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition"
        >
          <RefreshCw size={16} className={spinning ? 'animate-spin' : ''} />
        </button>

        {/* Notifications */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={toggleDropdown}
            title="Notifications"
            className="relative p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition"
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-80 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">
                  Notifications
                </h3>
                {notifications.length > 0 && (
                  <span className="text-xs text-gray-500">
                    {notifications.length}
                  </span>
                )}
              </div>

              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-10 text-center">
                    <Bell size={20} className="text-gray-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No notifications yet</p>
                    <p className="text-xs text-gray-600 mt-1">
                      You'll be notified when a lead replies
                    </p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      className="w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-gray-800 transition border-b border-gray-800/50 last:border-0"
                    >
                      <div className="mt-0.5 p-1.5 rounded-lg bg-emerald-500/10 shrink-0">
                        <MessageSquare size={13} className="text-emerald-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-white leading-snug">
                          <span className="font-semibold">{n.leadName}</span>{' '}
                          <span className="text-gray-400">{n.message}</span>
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {timeAgo(n.createdAt)}
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white">
          SC
        </div>
      </div>
    </div>
  )
}