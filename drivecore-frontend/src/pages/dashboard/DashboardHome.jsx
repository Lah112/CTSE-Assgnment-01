import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarClock, Package, Receipt, TrendingUp, ArrowRight } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { getBookingsByUser } from '../../api/bookings'
import { getAllInventory }   from '../../api/inventory'
import { getInvoicesByUser } from '../../api/billing'
import StatCard              from '../../components/ui/StatCard'
import Badge                 from '../../components/ui/Badge'

export default function DashboardHome() {
  const { user } = useAuth()
  const [stats,   setStats]   = useState({ bookings: 0, inventory: 0, invoices: 0, revenue: 0 })
  const [recent,  setRecent]  = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) return
    Promise.allSettled([
      getBookingsByUser(user.id),
      getAllInventory(),
      getInvoicesByUser(user.id),
    ]).then(([bookRes, invRes, billRes]) => {
      const bookings  = bookRes.status  === 'fulfilled' ? bookRes.value.data.data  : []
      const inventory = invRes.status   === 'fulfilled' ? invRes.value.data.data   : []
      const invoices  = billRes.status  === 'fulfilled' ? billRes.value.data.data  : []

      const revenue = invoices
        .filter((i) => i.status === 'paid')
        .reduce((sum, i) => sum + parseFloat(i.amount || 0), 0)

      setStats({
        bookings:  bookings.length,
        inventory: inventory.length,
        invoices:  invoices.length,
        revenue:   revenue.toFixed(2),
      })
      // Latest 5 bookings for the recent activity table
      setRecent(bookings.slice(0, 5))
    }).finally(() => setLoading(false))
  }, [user])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome banner */}
      <div>
        <h2 className="text-2xl font-bold text-white">
          {greeting}, {user?.name?.split(' ')[0]} 👋
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Here&apos;s what&apos;s happening across your platform today.
        </p>
      </div>

      {/* Stat cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="dc-card p-5 h-24 animate-pulse bg-slate-800/50" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard title="Total Bookings"    value={stats.bookings}  icon={CalendarClock} color="sky"     trend="All service appointments" />
          <StatCard title="Inventory Items"   value={stats.inventory} icon={Package}       color="blue"    trend="Parts tracked in stock" />
          <StatCard title="Invoices Issued"   value={stats.invoices}  icon={Receipt}       color="amber"   trend="Across all customers" />
          <StatCard title="Revenue Collected" value={`$${stats.revenue}`} icon={TrendingUp} color="emerald" trend="From paid invoices" />
        </div>
      )}

      {/* Recent bookings */}
      <div className="dc-card overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h3 className="text-white font-semibold text-sm">Recent Bookings</h3>
          <Link to="/dashboard/bookings" className="text-blue-400 text-xs hover:text-blue-300 flex items-center gap-1">
            View all <ArrowRight size={12} />
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <CalendarClock size={32} className="text-slate-700 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No bookings yet.</p>
            <Link to="/dashboard/bookings" className="text-blue-400 text-sm hover:underline mt-1 block">
              Create your first booking →
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-500 text-xs uppercase tracking-wider border-b border-slate-800">
                <th className="text-left px-6 py-3 font-medium">Vehicle</th>
                <th className="text-left px-6 py-3 font-medium">Service</th>
                <th className="text-left px-6 py-3 font-medium">Date</th>
                <th className="text-left px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {recent.map((b) => (
                <tr key={b.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-6 py-3.5 text-slate-200 font-medium">{b.vehicle_number}</td>
                  <td className="px-6 py-3.5 text-slate-400">{b.service_type?.replace(/_/g, ' ')}</td>
                  <td className="px-6 py-3.5 text-slate-400">{new Date(b.date).toLocaleDateString()}</td>
                  <td className="px-6 py-3.5"><Badge variant={b.status?.toLowerCase()} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { to: '/dashboard/bookings',  label: 'New Booking',     sub: 'Schedule a service', icon: CalendarClock, color: 'text-sky-400' },
          { to: '/dashboard/inventory', label: 'Add Stock Item',  sub: 'Log a spare part',   icon: Package,       color: 'text-blue-400' },
          { to: '/dashboard/billing',   label: 'View Invoices',   sub: 'Check payment status',icon: Receipt,      color: 'text-emerald-400' },
        ].map(({ to, label, sub, icon: Icon, color }) => (
          <Link key={to} to={to} className="dc-card p-5 flex items-center gap-4 hover:border-slate-700 transition-colors group">
            <Icon size={20} className={color} />
            <div>
              <p className="text-slate-200 text-sm font-medium group-hover:text-white transition-colors">{label}</p>
              <p className="text-slate-500 text-xs">{sub}</p>
            </div>
            <ArrowRight size={14} className="text-slate-600 ml-auto group-hover:text-slate-400 transition-colors" />
          </Link>
        ))}
      </div>
    </div>
  )
}
