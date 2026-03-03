import { useEffect, useState } from 'react'
import { CalendarClock, Plus, X, AlertCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { getBookingsByUser, createBooking, SERVICE_TYPES } from '../../api/bookings'
import StatCard      from '../../components/ui/StatCard'
import Badge         from '../../components/ui/Badge'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

const EMPTY_FORM = { vehicleNumber: '', date: '', serviceType: '', notes: '' }

export default function BookingsPage() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form,     setForm]     = useState(EMPTY_FORM)
  const [errors,   setErrors]   = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [apiError,   setApiError]   = useState('')

  const fetchBookings = async () => {
    if (!user?.id) return
    setLoading(true)
    try {
      const res = await getBookingsByUser(user.id)
      setBookings(res.data.data || [])
    } catch {
      // silently show empty state
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchBookings() }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  const validate = () => {
    const e = {}
    if (!form.vehicleNumber.trim()) e.vehicleNumber = 'Vehicle number is required.'
    if (!form.date)                 e.date          = 'Date is required.'
    else if (new Date(form.date) <= new Date()) e.date = 'Date must be in the future.'
    if (!form.serviceType)          e.serviceType   = 'Select a service type.'
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
      await createBooking({
        userId:        user.id,
        vehicleNumber: form.vehicleNumber.trim().toUpperCase(),
        date:          new Date(form.date).toISOString(),
        serviceType:   form.serviceType,
        notes:         form.notes.trim() || undefined,
      })
      setForm(EMPTY_FORM)
      setShowForm(false)
      fetchBookings()
    } catch (err) {
      setApiError(err.response?.data?.message || 'Failed to create booking.')
    } finally { setSubmitting(false) }
  }

  const pending   = bookings.filter((b) => b.status === 'pending').length
  const confirmed = bookings.filter((b) => b.status === 'confirmed').length

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Bookings"    value={bookings.length} icon={CalendarClock} color="sky" />
        <StatCard title="Pending"           value={pending}         icon={CalendarClock} color="amber" />
        <StatCard title="Confirmed"         value={confirmed}       icon={CalendarClock} color="emerald" />
      </div>

      {/* Table card */}
      <div className="dc-card overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h3 className="text-white font-semibold text-sm">All Bookings</h3>
          <button
            onClick={() => { setShowForm((v) => !v); setErrors({}); setApiError('') }}
            className="dc-btn-primary py-2 px-4 flex items-center gap-1.5 text-xs"
          >
            {showForm ? <X size={13} /> : <Plus size={13} />}
            {showForm ? 'Cancel'        : 'New Booking'}
          </button>
        </div>

        {/* Inline form */}
        {showForm && (
          <div className="border-b border-slate-800 px-6 py-5 bg-slate-800/30">
            <h4 className="text-slate-200 font-medium text-sm mb-4">Book a Service</h4>

            {apiError && (
              <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 rounded-lg px-4 py-2.5 mb-4">
                <AlertCircle size={14} className="text-rose-400 shrink-0" />
                <p className="text-rose-400 text-xs">{apiError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-400 text-xs mb-1 block">Vehicle Number</label>
                <input name="vehicleNumber" value={form.vehicleNumber} onChange={handleChange}
                  placeholder="ABC-1234" className={`dc-input ${errors.vehicleNumber ? 'border-rose-500' : ''}`} />
                {errors.vehicleNumber && <p className="text-rose-400 text-xs mt-1">{errors.vehicleNumber}</p>}
              </div>

              <div>
                <label className="text-slate-400 text-xs mb-1 block">Appointment Date</label>
                <input type="datetime-local" name="date" value={form.date} onChange={handleChange}
                  className={`dc-input ${errors.date ? 'border-rose-500' : ''}`} />
                {errors.date && <p className="text-rose-400 text-xs mt-1">{errors.date}</p>}
              </div>

              <div>
                <label className="text-slate-400 text-xs mb-1 block">Service Type</label>
                <select name="serviceType" value={form.serviceType} onChange={handleChange}
                  className={`dc-input ${errors.serviceType ? 'border-rose-500' : ''}`}>
                  <option value="">Select a service…</option>
                  {SERVICE_TYPES.map((t) => (
                    <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
                  ))}
                </select>
                {errors.serviceType && <p className="text-rose-400 text-xs mt-1">{errors.serviceType}</p>}
              </div>

              <div>
                <label className="text-slate-400 text-xs mb-1 block">Notes (optional)</label>
                <input name="notes" value={form.notes} onChange={handleChange}
                  placeholder="Any specific concerns…" className="dc-input" />
              </div>

              <div className="sm:col-span-2 flex justify-end">
                <button type="submit" disabled={submitting} className="dc-btn-primary py-2.5 px-6 flex items-center gap-2">
                  {submitting
                    ? <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4"/><path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                    : <Plus size={14} />}
                  {submitting ? 'Booking…' : 'Confirm Booking'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Table */}
        {loading ? (
          <LoadingSpinner text="Loading bookings…" />
        ) : bookings.length === 0 ? (
          <div className="text-center py-16">
            <CalendarClock size={36} className="text-slate-700 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No bookings found.</p>
            <p className="text-slate-600 text-xs mt-1">Click &quot;New Booking&quot; to schedule a service.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-500 text-xs uppercase tracking-wider border-b border-slate-800">
                  <th className="text-left px-6 py-3 font-medium">Vehicle</th>
                  <th className="text-left px-6 py-3 font-medium">Service</th>
                  <th className="text-left px-6 py-3 font-medium">Date</th>
                  <th className="text-left px-6 py-3 font-medium">Notes</th>
                  <th className="text-left px-6 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-3.5 text-slate-200 font-mono font-medium">{b.vehicle_number}</td>
                    <td className="px-6 py-3.5 text-slate-400">{b.service_type?.replace(/_/g, ' ')}</td>
                    <td className="px-6 py-3.5 text-slate-400 whitespace-nowrap">
                      {new Date(b.date).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                    </td>
                    <td className="px-6 py-3.5 text-slate-500 max-w-xs truncate">{b.notes || '—'}</td>
                    <td className="px-6 py-3.5"><Badge variant={b.status?.toLowerCase()} /></td>
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
