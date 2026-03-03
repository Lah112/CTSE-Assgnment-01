import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Gauge, Eye, EyeOff, UserPlus, AlertCircle } from 'lucide-react'
import { register } from '../api/auth'
import { useAuth } from '../context/AuthContext'

function PasswordStrength({ password }) {
  const checks = [
    { label: 'At least 8 characters',    ok: password.length >= 8 },
    { label: 'One uppercase letter',      ok: /[A-Z]/.test(password) },
    { label: 'One number',               ok: /\d/.test(password) },
    { label: 'One special character',    ok: /[^A-Za-z0-9]/.test(password) },
  ]
  if (!password) return null
  return (
    <div className="mt-2 space-y-1">
      {checks.map(({ label, ok }) => (
        <p key={label} className={`text-xs flex items-center gap-1.5 ${ok ? 'text-emerald-400' : 'text-slate-500'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${ok ? 'bg-emerald-400' : 'bg-slate-600'}`} />
          {label}
        </p>
      ))}
    </div>
  )
}

export default function RegisterPage() {
  const { saveSession } = useAuth()
  const navigate = useNavigate()

  const [form, setForm]       = useState({ name: '', email: '', password: '' })
  const [errors, setErrors]   = useState({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const validate = () => {
    const e = {}
    if (!form.name.trim() || form.name.trim().length < 2) e.name = 'Name must be at least 2 characters.'
    if (!form.email.trim())    e.email    = 'Email is required.'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email address.'
    if (!form.password)        e.password = 'Password is required.'
    else if (form.password.length < 8) e.password = 'Password must be at least 8 characters.'
    else if (!/[A-Z]/.test(form.password)) e.password = 'Password must contain an uppercase letter.'
    else if (!/\d/.test(form.password))    e.password = 'Password must contain a number.'
    else if (!/[^A-Za-z0-9]/.test(form.password)) e.password = 'Password must contain a special character.'
    return e
  }

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    if (errors[e.target.name]) setErrors((prev) => ({ ...prev, [e.target.name]: '' }))
    setApiError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    setApiError('')
    try {
      const res = await register(form.name.trim(), form.email, form.password)
      // Auth service returns token + user in the same shape as login
      saveSession(res.data.data.token, res.data.data.user)
      navigate('/dashboard')
    } catch (err) {
      setApiError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-12">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-600/8 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-sm animate-slide-up">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
            <Gauge size={18} className="text-white" />
          </div>
          <span className="text-white font-bold text-xl tracking-tight">DriveCore</span>
        </div>

        <div className="dc-card p-8">
          <h2 className="text-white font-bold text-xl mb-1">Create an account</h2>
          <p className="text-slate-400 text-sm mb-7">Join DriveCore to manage your garage.</p>

          {apiError && (
            <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 rounded-lg px-4 py-3 mb-5">
              <AlertCircle size={15} className="text-rose-400 shrink-0" />
              <p className="text-rose-400 text-sm">{apiError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Name */}
            <div>
              <label className="text-slate-300 text-sm font-medium block mb-1.5">Full name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Jane Smith"
                className={`dc-input ${errors.name ? 'border-rose-500 focus:ring-rose-500 focus:border-rose-500' : ''}`}
                autoComplete="name"
              />
              {errors.name && <p className="text-rose-400 text-xs mt-1.5">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="text-slate-300 text-sm font-medium block mb-1.5">Email address</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className={`dc-input ${errors.email ? 'border-rose-500 focus:ring-rose-500 focus:border-rose-500' : ''}`}
                autoComplete="email"
              />
              {errors.email && <p className="text-rose-400 text-xs mt-1.5">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="text-slate-300 text-sm font-medium block mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`dc-input pr-10 ${errors.password ? 'border-rose-500 focus:ring-rose-500 focus:border-rose-500' : ''}`}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  tabIndex={-1}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password
                ? <p className="text-rose-400 text-xs mt-1.5">{errors.password}</p>
                : <PasswordStrength password={form.password} />
              }
            </div>

            <button
              type="submit"
              disabled={loading}
              className="dc-btn-primary w-full flex items-center justify-center gap-2 py-3 mt-2"
            >
              {loading ? (
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
                  <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <UserPlus size={16} />
              )}
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-500 text-sm mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
