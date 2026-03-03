/**
 * Status badge used across Bookings, Inventory, and Billing tables.
 *
 * variant prop accepts any string — a sensible fallback colour is shown
 * for unknown values, so new statuses never break the UI.
 */
const VARIANT_CLASSES = {
  // Booking statuses
  pending:    'bg-amber-500/10  text-amber-400  border-amber-500/20',
  confirmed:  'bg-sky-500/10    text-sky-400    border-sky-500/20',
  completed:  'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  cancelled:  'bg-rose-500/10   text-rose-400   border-rose-500/20',
  // Billing statuses
  paid:       'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  overdue:    'bg-rose-500/10   text-rose-400   border-rose-500/20',
  // Inventory levels
  'in-stock': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'low-stock':'bg-amber-500/10  text-amber-400  border-amber-500/20',
  'out-stock':'bg-rose-500/10   text-rose-400   border-rose-500/20',
}

export default function Badge({ variant = 'pending', label }) {
  const cls = VARIANT_CLASSES[variant?.toLowerCase()] ||
              'bg-slate-700/40 text-slate-400 border-slate-700'

  const display = label ?? variant.replace(/_/g, ' ')

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${cls}`}>
      {display}
    </span>
  )
}
