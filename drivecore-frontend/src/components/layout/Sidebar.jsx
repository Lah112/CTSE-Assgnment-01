import { NavLink, useNavigate } from 'react-router-dom'
import {
  Gauge, CalendarClock, Package, Receipt,
  LogOut, Settings, ChevronRight,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const NAV_ITEMS = [
  { to: '/dashboard',           label: 'Overview',   icon: Gauge,         end: true },
  { to: '/dashboard/bookings',  label: 'Bookings',   icon: CalendarClock, end: false },
  { to: '/dashboard/inventory', label: 'Inventory',  icon: Package,       end: false },
  { to: '/dashboard/billing',   label: 'Billing',    icon: Receipt,       end: false },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  // User initials avatar
  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  return (
    <aside className="flex flex-col w-64 min-h-screen bg-slate-900 border-r border-slate-800 shrink-0">
      {/* Brand */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-800">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
          <Gauge size={16} className="text-white" />
        </div>
        <div>
          <span className="text-white font-bold text-base tracking-tight">DriveCore</span>
          <p className="text-slate-500 text-xs leading-none mt-0.5">Service Platform</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <p className="text-slate-600 text-xs font-semibold uppercase tracking-widest px-3 mb-2">
          Main menu
        </p>
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `group flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-blue-600/15 text-blue-400 border border-blue-500/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className="flex items-center gap-3">
                  <Icon size={17} className={isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'} />
                  {label}
                </span>
                {isActive && <ChevronRight size={14} className="text-blue-500" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom — settings + user */}
      <div className="px-3 pb-4 border-t border-slate-800 pt-4 space-y-0.5">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-all duration-150">
          <Settings size={17} className="text-slate-500" />
          Settings
        </button>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-150"
        >
          <LogOut size={17} className="text-slate-500" />
          Sign Out
        </button>

        {/* User chip */}
        <div className="flex items-center gap-3 mt-3 px-3 py-2.5 rounded-lg bg-slate-800">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-sky-400 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {initials}
          </div>
          <div className="overflow-hidden">
            <p className="text-slate-200 text-sm font-medium truncate">{user?.name || 'User'}</p>
            <p className="text-slate-500 text-xs truncate">{user?.email || ''}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
