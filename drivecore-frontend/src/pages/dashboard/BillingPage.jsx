import { useEffect, useState } from 'react'
import { Receipt, Plus, X, TrendingUp, AlertCircle, DollarSign } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { getInvoicesByUser, createInvoice } from '../../api/billing'
import StatCard       from '../../components/ui/StatCard'
import Badge          from '../../components/ui/Badge'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

const EMPTY_FORM = { bookingId: '', amount: '', status: 'pending' }
const STATUS_OPTIONS = ['pending', 'paid', 'overdue', 'cancelled']

export default function BillingPage() {
  const { user } = useAuth()
  const [invoices,  setInvoices]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [showForm,  setShowForm]  = useState(false)
  const [form,      setForm]      = useState(EMPTY_FORM)
  const [errors,    setErrors]    = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [apiError,   setApiError]   = useState('')

  const fetchInvoices = async () => {
    if (!user?.id) return
    setLoading(true)
    try {
      const res = await getInvoicesByUser(user.id)
      setInvoices(res.data.data || [])
    } catch { /* empty state */ }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchInvoices() }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  const validate = () => {
    const e = {}
    if (!form.bookingId.trim()) e.bookingId = 'Booking ID is required.'
    if (form.amount === '') e.amount = 'Amount is required.'
    else if (isNaN(form.amount) || parseFloat(form.amount) < 0) e.amount = 'Amount must be a non-negative number.'
    if (!form.status) e.status = 'Status is required.'
    return e
  }

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }))
    if (errors[e.target.name]) setErrors((p) => ({ ...p, [e.target.name]: '' }))
    setApiError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSubmitting(true)
    try {
      await createInvoice({
        userId:    user.id,
        bookingId: form.bookingId.trim(),
        amount:    parseFloat(form.amount),
        status:    form.status,
      })
      setForm(EMPTY_FORM)
      setShowForm(false)
      fetchInvoices()
    } catch (err) {
      setApiError(err.response?.data?.message || 'Failed to create invoice.')
    } finally { setSubmitting(false) }
  }

  // Computed stats
  const totalRevenue  = invoices.filter((i) => i.status === 'paid').reduce((s, i) => s + parseFloat(i.amount || 0), 0)
  const totalPending  = invoices.filter((i) => i.status === 'pending').reduce((s, i) => s + parseFloat(i.amount || 0), 0)
  const overdueCount  = invoices.filter((i) => i.status === 'overdue').length

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard title="Total Invoices"   value={invoices.length}          icon={Receipt}     color="blue" />
        <StatCard title="Revenue Collected" value={`$${totalRevenue.toFixed(2)}`} icon={TrendingUp}  color="emerald" trend="From paid invoices" />
        <StatCard title="Pending Amount"   value={`$${totalPending.toFixed(2)}`} icon={DollarSign} color="amber" />
        <StatCard title="Overdue Invoices" value={overdueCount}              icon={AlertCircle} color="rose" />
      </div>

      <div className="dc-card overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h3 className="text-white font-semibold text-sm">Invoice History</h3>
          <button
            onClick={() => { setShowForm((v) => !v); setErrors({}); setApiError('') }}
            className="dc-btn-primary py-2 px-4 flex items-center gap-1.5 text-xs"
          >
            {showForm ? <X size={13} /> : <Plus size={13} />}
            {showForm ? 'Cancel' : 'New Invoice'}
          </button>
        </div>

        {/* Inline create form */}
        {showForm && (
          <div className="border-b border-slate-800 px-6 py-5 bg-slate-800/30">
            <h4 className="text-slate-200 font-medium text-sm mb-4">Create Invoice</h4>

            {apiError && (
              <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 rounded-lg px-4 py-2.5 mb-4">
                <AlertCircle size={14} className="text-rose-400 shrink-0" />
                <p className="text-rose-400 text-xs">{apiError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-slate-400 text-xs mb-1 block">Booking ID</label>
                <input name="bookingId" value={form.bookingId} onChange={handleChange}
                  placeholder="e.g. bkg_abc123" className={`dc-input ${errors.bookingId ? 'border-rose-500' : ''}`} />
                {errors.bookingId && <p className="text-rose-400 text-xs mt-1">{errors.bookingId}</p>}
              </div>

              <div>
                <label className="text-slate-400 text-xs mb-1 block">Amount ($)</label>
                <input type="number" min="0" step="0.01" name="amount" value={form.amount} onChange={handleChange}
                  placeholder="0.00" className={`dc-input ${errors.amount ? 'border-rose-500' : ''}`} />
                {errors.amount && <p className="text-rose-400 text-xs mt-1">{errors.amount}</p>}
              </div>

              <div>
                <label className="text-slate-400 text-xs mb-1 block">Status</label>
                <select name="status" value={form.status} onChange={handleChange}
                  className={`dc-input ${errors.status ? 'border-rose-500' : ''}`}>
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
                {errors.status && <p className="text-rose-400 text-xs mt-1">{errors.status}</p>}
              </div>

              <div className="sm:col-span-3 flex justify-end">
                <button type="submit" disabled={submitting} className="dc-btn-primary py-2.5 px-6 flex items-center gap-2">
                  {submitting
                    ? <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4"/><path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                    : <Plus size={14} />}
                  {submitting ? 'Creating…' : 'Issue Invoice'}
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <LoadingSpinner text="Loading invoices…" />
        ) : invoices.length === 0 ? (
          <div className="text-center py-16">
            <Receipt size={36} className="text-slate-700 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No invoices found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-500 text-xs uppercase tracking-wider border-b border-slate-800">
                  <th className="text-left px-6 py-3 font-medium">Invoice ID</th>
                  <th className="text-left px-6 py-3 font-medium">Booking ID</th>
                  <th className="text-left px-6 py-3 font-medium">Amount</th>
                  <th className="text-left px-6 py-3 font-medium">Status</th>
                  <th className="text-left px-6 py-3 font-medium">Issued</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-3.5 text-slate-400 font-mono text-xs">#{String(inv.id).padStart(6, '0')}</td>
                    <td className="px-6 py-3.5 text-slate-400 font-mono text-xs">{inv.booking_id}</td>
                    <td className="px-6 py-3.5 text-slate-200 font-semibold tabular-nums">
                      ${parseFloat(inv.amount).toFixed(2)}
                    </td>
                    <td className="px-6 py-3.5"><Badge variant={inv.status?.toLowerCase()} /></td>
                    <td className="px-6 py-3.5 text-slate-500 text-xs">
                      {new Date(inv.created_at).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
