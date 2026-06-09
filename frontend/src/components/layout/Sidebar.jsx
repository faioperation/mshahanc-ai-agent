// FILE: src/components/layout/Sidebar.jsx  (REPLACE existing)
import { NavLink, Link } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  CalendarClock,
  Megaphone,
  ScrollText,
  Settings,
} from 'lucide-react'

const navItems = [
  { to: '/overview', label: 'Overview', icon: LayoutDashboard },
  { to: '/leads', label: 'Leads', icon: Users },
  { to: '/messages', label: 'Messages', icon: MessageSquare },
  { to: '/events', label: 'Events', icon: CalendarClock },
  { to: '/campaigns', label: 'Campaigns', icon: Megaphone },
  { to: '/outreach', label: 'Outreach Logs', icon: ScrollText },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export default function Sidebar() {
  return (
    <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
      <Link
        to="/overview"
        className="block px-6 py-5 border-b border-gray-800 hover:bg-gray-800/50 transition"
      >
        <h1 className="text-lg font-bold text-white tracking-tight">
          🍽️ Catering Agent
        </h1>
        <p className="text-xs text-gray-400 mt-0.5">AI Outreach Platform</p>
      </Link>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-6 py-4 border-t border-gray-800">
        <p className="text-xs text-gray-500">v1.0.0 · Development</p>
      </div>
    </div>
  )
}