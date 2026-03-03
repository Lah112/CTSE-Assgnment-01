/**
 * Metric card used in dashboard overview and individual pages.
 *
 * Props:
 *   title   — label above the value
 *   value   — the primary metric (string or number)
 *   icon    — Lucide icon component
 *   color   — tailwind colour name: 'blue' | 'sky' | 'emerald' | 'amber' | 'rose'
 *   trend   — optional string like "+12% vs last month"
 */
const COLOR_MAP = {
  blue:    { bg: 'bg-blue-600/10',    icon: 'text-blue-400',    border: 'border-blue-500/20' },
  sky:     { bg: 'bg-sky-500/10',     icon: 'text-sky-400',     border: 'border-sky-500/20'  },
  emerald: { bg: 'bg-emerald-500/10', icon: 'text-emerald-400', border: 'border-emerald-500/20' },
  amber:   { bg: 'bg-amber-500/10',   icon: 'text-amber-400',   border: 'border-amber-500/20' },
  rose:    { bg: 'bg-rose-500/10',    icon: 'text-rose-400',    border: 'border-rose-500/20'  },
}

export default function StatCard({ title, value, icon: Icon, color = 'blue', trend }) {
  const c = COLOR_MAP[color] || COLOR_MAP.blue

  return (
    <div className={`dc-card p-5 flex items-start justify-between gap-4 animate-fade-in`}>
      <div>
        <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">{title}</p>
        <p className="text-white text-2xl font-bold mt-1.5 tabular-nums">{value ?? '—'}</p>
        {trend && (
          <p className="text-slate-500 text-xs mt-1">{trend}</p>
        )}
      </div>
      <div className={`w-11 h-11 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center shrink-0`}>
        <Icon size={20} className={c.icon} />
      </div>
    </div>
  )
}
