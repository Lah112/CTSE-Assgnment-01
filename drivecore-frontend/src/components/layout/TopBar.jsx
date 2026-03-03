import { useLocation } from 'react-router-dom'
import { Bell, Circle } from 'lucide-react'

// Map path segments to human-readable breadcrumb titles
const PAGE_TITLES = {
  '/dashboard':           { title: 'Overview',   sub: 'Welcome back to DriveCore' },
  '/dashboard/bookings':  { title: 'Bookings',   sub: 'Manage service appointments' },
  '/dashboard/inventory': { title: 'Inventory',  sub: 'Spare parts & stock management' },
  '/dashboard/billing':   { title: 'Billing',    sub: 'Invoices & revenue tracking' },
}

export default function TopBar() {
  const { pathname } = useLocation()
  const { title, sub } = PAGE_TITLES[pathname] || { title: 'DriveCore', sub: '' }

  const now = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  })

  return (
    <header className="flex items-center justify-between px-8 py-4 bg-slate-900/60 border-b border-slate-800 backdrop-blur-sm sticky top-0 z-10">
      {/* Left — page title */}
      <div>
        <h1 className="text-white font-semibold text-lg leading-tight">{title}</h1>
        <p className="text-slate-500 text-xs mt-0.5">{sub}</p>
      </div>

      {/* Right — status + notifications */}
      <div className="flex items-center gap-4">
        {/* Live indicator */}
        <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
          <Circle size={7} className="fill-emerald-400 animate-pulse" />
          All Systems Online
        </span>

        {/* Date */}
        <span className="text-slate-500 text-xs hidden md:block">{now}</span>

        {/* Notifications bell */}
        <button className="relative p-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-colors">
          <Bell size={17} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full" />
        </button>
      </div>
    </header>
  )
}
