import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Bell, RefreshCw, MessageSquare, Pencil, Check, X } from 'lucide-react'
import { getLeads } from '../../api/leads'
import useLeadStore from '../../store/leadStore'
import useMessageStore from '../../store/messageStore'
import useEventStore from '../../store/eventStore'
import useSettingsStore from '../../store/settingsStore'

const pageTitles = {
  '/overview': 'Overview',
  '/leads': 'Leads',
  '/messages': 'Messages',
  '/events': 'Events',
  '/outreach': 'Outreach Logs',
  '/settings': 'Settings',
}

const POLL_INTERVAL = 20000 // 20s

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

function initialsOf(name) {
  if (!name || !name.trim()) return 'U'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export default function Topbar() {
  const location = useLocation()
  const navigate = useNavigate()

  const [spinning, setSpinning] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [nameDraft, setNameDraft] = useState('')

  const [notifications, setNotifications] = useState([])
  const [unread, setUnread] = useState(0)

  const notifRef = useRef(null)
  const profileRef = useRef(null)
  const seenRef = useRef(null) // baseline of replied lead ids already seen

  // ---- profile/settings (shared store) ----
  const settings = useSettingsStore((s) => s.settings)
  const fetchSettings = useSettingsStore((s) => s.fetchSettings)
  const saveSettings = useSettingsStore((s) => s.saveSettings)
  const savingName = useSettingsStore((s) => s.saving)

  const displayName = settings?.contact_name?.trim() || 'User'
  const initials = initialsOf(settings?.contact_name)

  useEffect(() => {
    if (!settings) fetchSettings()
  }, [settings, fetchSettings])

  // ---- background poll: detect leads that have replied ----
  useEffect(() => {
    let active = true
    let timer

    const poll = async () => {
      try {
        const data = await getLeads('replied')
        const leads = data.leads || []
        const ids = new Set(leads.map((l) => l.id))

        if (seenRef.current === null) {
          seenRef.current = ids
        } else {
          const fresh = leads.filter((l) => !seenRef.current.has(l.id))
          if (fresh.length) {
            setNotifications((prev) =>
              [
                ...fresh.map((l) => ({
                  id: `${l.id}-${Date.now()}`,
                  leadId: l.id,
                  leadName: l.business_name || 'A lead',
                  message: 'replied to your outreach',
                  createdAt: new Date().toISOString(),
                })),
                ...prev,
              ].slice(0, 50)
            )
            setUnread((u) => u + fresh.length)
          }
          seenRef.current = ids
        }
      } catch {
        // network hiccup -> retry next tick
      } finally {
        if (active) timer = setTimeout(poll, POLL_INTERVAL)
      }
    }

    poll()
    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [])

  const title =
    Object.entries(pageTitles).find(([path]) =>
      location.pathname.startsWith(path)
    )?.[1] || 'Dashboard'

  const handleRefresh = () => {
    setSpinning(true)
    const { selectedStatus, fetchLeads } = useLeadStore.getState()
    fetchLeads(selectedStatus)
    useMessageStore.getState().fetchReviewQueue()
    useEventStore.getState().fetchScheduledEvents()
    window.dispatchEvent(new CustomEvent('app:refresh'))
    setTimeout(() => setSpinning(false), 800)
  }

  const toggleNotif = () => {
    setProfileOpen(false)
    setNotifOpen((prev) => {
      const next = !prev
      if (next) setUnread(0)
      return next
    })
  }

  const toggleProfile = () => {
    setNotifOpen(false)
    setProfileOpen((prev) => {
      const next = !prev
      if (!next) setEditing(false)
      return next
    })
  }

  useEffect(() => {
    const onClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false)
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false)
        setEditing(false)
      }
    }
    if (notifOpen || profileOpen) {
      document.addEventListener('mousedown', onClickOutside)
    }
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [notifOpen, profileOpen])

  const handleNotificationClick = (n) => {
    setNotifOpen(false)
    if (n.leadId) navigate(`/leads/${n.leadId}`)
  }

  const startEditing = () => {
    setNameDraft(settings?.contact_name || '')
    setEditing(true)
  }

  const handleSaveName = async () => {
    const value = nameDraft.trim()
    if (!value) return
    try {
      await saveSettings({ contact_name: value })
      setEditing(false)
    } catch {
      // store keeps the error; leave edit mode open so the user can retry
    }
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
        <div className="relative" ref={notifRef}>
          <button
            onClick={toggleNotif}
            title="Notifications"
            className="relative p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition"
          >
            <Bell size={16} />
            {unread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">Notifications</h3>
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
                    <p className="text-sm text-gray-500">Nothing to show here</p>
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

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={toggleProfile}
            title={displayName}
            className="w-8 h-8 rounded-full bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center text-xs font-bold text-white transition"
          >
            {initials}
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden">
              <div className="px-4 py-4 flex items-center gap-3 border-b border-gray-800">
                <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-bold text-white shrink-0">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    {displayName}
                  </p>
                  <p className="text-xs text-gray-500">Profile</p>
                </div>
              </div>

              <div className="px-4 py-3">
                {editing ? (
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-400">
                      Name
                    </label>
                    <input
                      autoFocus
                      value={nameDraft}
                      onChange={(e) => setNameDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveName()
                        if (e.key === 'Escape') setEditing(false)
                      }}
                      placeholder="Enter your name"
                      className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    />
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={handleSaveName}
                        disabled={savingName || !nameDraft.trim()}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-medium rounded-lg px-3 py-2 transition"
                      >
                        <Check size={13} />
                        {savingName ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={() => setEditing(false)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 bg-gray-800 hover:bg-gray-700 text-white text-xs font-medium rounded-lg px-3 py-2 transition"
                      >
                        <X size={13} />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={startEditing}
                    className="w-full inline-flex items-center gap-2 text-left text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg px-3 py-2 transition"
                  >
                    <Pencil size={13} className="text-gray-500" />
                    Edit name
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}