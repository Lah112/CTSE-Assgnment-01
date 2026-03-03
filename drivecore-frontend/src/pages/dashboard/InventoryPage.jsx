import { useEffect, useState } from 'react'
import { Package, Plus, X, AlertCircle, AlertTriangle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { getAllInventory, addInventoryItem } from '../../api/inventory'
import StatCard       from '../../components/ui/StatCard'
import Badge          from '../../components/ui/Badge'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

const EMPTY_FORM = { itemName: '', quantity: '', price: '' }

// Derive a stock-level badge variant from quantity
const stockVariant = (qty) => {
  const q = parseInt(qty, 10)
  if (q <= 0)  return 'out-stock'
  if (q <= 5)  return 'low-stock'
  return 'in-stock'
}
const stockLabel = (qty) => {
  const q = parseInt(qty, 10)
  if (q <= 0)  return 'Out of Stock'
  if (q <= 5)  return 'Low Stock'
  return 'In Stock'
}

export default function InventoryPage() {
  const { user } = useAuth()
  const [items,    setItems]    = useState([])
  const [loading,  setLoading]  = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form,     setForm]     = useState(EMPTY_FORM)
  const [errors,   setErrors]   = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [apiError,   setApiError]   = useState('')

  const fetchItems = async () => {
    setLoading(true)
    try {
      const res = await getAllInventory()
      setItems(res.data.data || [])
    } catch { /* show empty state */ }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchItems() }, [])

  const validate = () => {
    const e = {}
    if (!form.itemName.trim() || form.itemName.trim().length < 2) e.itemName = 'Item name must be at least 2 characters.'
    if (form.quantity === '') e.quantity = 'Quantity is required.'
    else if (isNaN(form.quantity) || parseInt(form.quantity, 10) < 0) e.quantity = 'Quantity must be a non-negative integer.'
    if (form.price === '') e.price = 'Price is required.'
    else if (isNaN(form.price) || parseFloat(form.price) < 0) e.price = 'Price must be a non-negative number.'
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
      await addInventoryItem({
        userId:   user.id,
        itemName: form.itemName.trim(),
        quantity: parseInt(form.quantity, 10),
        price:    parseFloat(form.price),
      })
      setForm(EMPTY_FORM)
      setShowForm(false)
      fetchItems()
    } catch (err) {
      setApiError(err.response?.data?.message || 'Failed to add item.')
    } finally { setSubmitting(false) }
  }

  const lowStock = items.filter((i) => parseInt(i.quantity, 10) <= 5 && parseInt(i.quantity, 10) > 0).length
  const outStock = items.filter((i) => parseInt(i.quantity, 10) <= 0).length
  const totalVal = items.reduce((s, i) => s + parseFloat(i.price || 0) * parseInt(i.quantity || 0, 10), 0)

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard title="Total SKUs"       value={items.length}        icon={Package}       color="blue" />
        <StatCard title="Low Stock"        value={lowStock}            icon={AlertTriangle} color="amber" />
        <StatCard title="Out of Stock"     value={outStock}            icon={Package}       color="rose" />
        <StatCard title="Stock Value"      value={`$${totalVal.toFixed(2)}`} icon={Package} color="emerald" />
      </div>

      <div className="dc-card overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h3 className="text-white font-semibold text-sm">Inventory</h3>
          <button
            onClick={() => { setShowForm((v) => !v); setErrors({}); setApiError('') }}
            className="dc-btn-primary py-2 px-4 flex items-center gap-1.5 text-xs"
          >
            {showForm ? <X size={13} /> : <Plus size={13} />}
            {showForm ? 'Cancel' : 'Add Item'}
          </button>
        </div>

        {/* Inline add form */}
        {showForm && (
          <div className="border-b border-slate-800 px-6 py-5 bg-slate-800/30">
            <h4 className="text-slate-200 font-medium text-sm mb-4">Add Spare Part</h4>

            {apiError && (
              <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 rounded-lg px-4 py-2.5 mb-4">
                <AlertCircle size={14} className="text-rose-400 shrink-0" />
                <p className="text-rose-400 text-xs">{apiError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-slate-400 text-xs mb-1 block">Item Name</label>
                <input name="itemName" value={form.itemName} onChange={handleChange}
                  placeholder="e.g. Brake Pad Set" className={`dc-input ${errors.itemName ? 'border-rose-500' : ''}`} />
                {errors.itemName && <p className="text-rose-400 text-xs mt-1">{errors.itemName}</p>}
              </div>

              <div>
                <label className="text-slate-400 text-xs mb-1 block">Quantity</label>
                <input type="number" min="0" name="quantity" value={form.quantity} onChange={handleChange}
                  placeholder="0" className={`dc-input ${errors.quantity ? 'border-rose-500' : ''}`} />
                {errors.quantity && <p className="text-rose-400 text-xs mt-1">{errors.quantity}</p>}
              </div>

              <div>
                <label className="text-slate-400 text-xs mb-1 block">Unit Price ($)</label>
                <input type="number" min="0" step="0.01" name="price" value={form.price} onChange={handleChange}
                  placeholder="0.00" className={`dc-input ${errors.price ? 'border-rose-500' : ''}`} />
                {errors.price && <p className="text-rose-400 text-xs mt-1">{errors.price}</p>}
              </div>

              <div className="sm:col-span-3 flex justify-end">
                <button type="submit" disabled={submitting} className="dc-btn-primary py-2.5 px-6 flex items-center gap-2">
                  {submitting
                    ? <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4"/><path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                    : <Plus size={14} />}
                  {submitting ? 'Saving…' : 'Add to Inventory'}
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <LoadingSpinner text="Loading inventory…" />
        ) : items.length === 0 ? (
          <div className="text-center py-16">
            <Package size={36} className="text-slate-700 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No items in inventory.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-500 text-xs uppercase tracking-wider border-b border-slate-800">
                  <th className="text-left px-6 py-3 font-medium">Item Name</th>
                  <th className="text-left px-6 py-3 font-medium">Quantity</th>
                  <th className="text-left px-6 py-3 font-medium">Unit Price</th>
                  <th className="text-left px-6 py-3 font-medium">Total Value</th>
                  <th className="text-left px-6 py-3 font-medium">Stock Level</th>
                  <th className="text-left px-6 py-3 font-medium">Added</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-3.5 text-slate-200 font-medium">{item.item_name}</td>
                    <td className="px-6 py-3.5 text-slate-300 tabular-nums">{item.quantity}</td>
                    <td className="px-6 py-3.5 text-slate-400 tabular-nums">${parseFloat(item.price).toFixed(2)}</td>
                    <td className="px-6 py-3.5 text-slate-400 tabular-nums">
                      ${(parseFloat(item.price) * parseInt(item.quantity, 10)).toFixed(2)}
                    </td>
                    <td className="px-6 py-3.5">
                      <Badge variant={stockVariant(item.quantity)} label={stockLabel(item.quantity)} />
                    </td>
                    <td className="px-6 py-3.5 text-slate-500 text-xs">
                      {new Date(item.created_at).toLocaleDateString()}
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
