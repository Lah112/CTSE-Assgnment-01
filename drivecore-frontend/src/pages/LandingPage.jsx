import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Gauge, ArrowRight, Shield, Zap, BarChart2,
  Package, CalendarClock, Receipt, CheckCircle,
  ChevronRight, Star,
} from 'lucide-react'

// ---------------------------------------------------------------------------
// Animated counter hook — counts from 0 to `end` when the element scrolls
// into view using IntersectionObserver.
// ---------------------------------------------------------------------------
function useCounter(end, duration = 1800) {
  const [count, setCount] = useState(0)
  const ref  = useRef(null)
  const seen = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !seen.current) {
          seen.current = true
          let start = null
          const step = (ts) => {
            if (!start) start = ts
            const progress = Math.min((ts - start) / duration, 1)
            setCount(Math.floor(progress * end))
            if (progress < 1) requestAnimationFrame(step)
          }
          requestAnimationFrame(step)
        }
      },
      { threshold: 0.3 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [end, duration])

  return { count, ref }
}

// ---------------------------------------------------------------------------
function StatCounter({ end, suffix = '', label }) {
  const { count, ref } = useCounter(end)
  return (
    <div ref={ref} className="text-center">
      <p className="text-4xl font-extrabold text-white tabular-nums">
        {count.toLocaleString()}{suffix}
      </p>
      <p className="text-slate-400 text-sm mt-1">{label}</p>
    </div>
  )
}

// ---------------------------------------------------------------------------
const FEATURES = [
  {
    icon: CalendarClock, color: 'text-sky-400',  bg: 'bg-sky-500/10', border: 'border-sky-500/20',
    title: 'Smart Booking System',
    desc: 'Schedule oil changes, brake services, and complex engine repairs with a single click. Real-time slot management across all bays.',
  },
  {
    icon: Package,       color: 'text-blue-400', bg: 'bg-blue-600/10', border: 'border-blue-500/20',
    title: 'Inventory Intelligence',
    desc: 'Automated low-stock alerts, part tracking, and supplier integration. Never halt a repair due to missing parts again.',
  },
  {
    icon: Receipt,       color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20',
    title: 'Real-Time Billing',
    desc: 'Generate invoices instantly, track payment status, and get a live revenue dashboard updated with every transaction.',
  },
  {
    icon: Shield,        color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20',
    title: 'Enterprise Security',
    desc: 'JWT-authenticated microservices, Helmet-hardened APIs, and role-based access control built for compliance.',
  },
  {
    icon: Zap,           color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20',
    title: 'Microservices Architecture',
    desc: 'Four independently-scalable services on AWS ECS. Deploy, scale, and update each domain without system-wide downtime.',
  },
  {
    icon: BarChart2,     color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20',
    title: 'Analytics Dashboard',
    desc: 'Cross-service insights — track booking volume, inventory turnover, and monthly revenue trends in one unified view.',
  },
]

// ---------------------------------------------------------------------------
// CarSVG — hand-crafted SVG sports sedan, oriented facing right.
// Two separate <g> wheel groups receive the .animate-wheel-spin CSS class
// which uses transform-box:fill-box so rotation is around each wheel centre.
// ---------------------------------------------------------------------------
function CarSVG() {
  return (
    <svg
      width="260"
      height="100"
      viewBox="0 0 260 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        {/* Blue sheen across the roofline */}
        <linearGradient id="bodySheen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#3b82f6" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0"    />
        </linearGradient>
        {/* Headlight bloom */}
        <radialGradient id="hGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#fef08a" stopOpacity="1" />
          <stop offset="100%" stopColor="#fde047" stopOpacity="0" />
        </radialGradient>
        {/* Taillight bloom */}
        <radialGradient id="tGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#f87171" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#ef4444" stopOpacity="0"   />
        </radialGradient>
        {/* Neon underglow */}
        <radialGradient id="uGlow" cx="50%" cy="0%" r="100%">
          <stop offset="0%"   stopColor="#3b82f6" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0"   />
        </radialGradient>
      </defs>

      {/* ── Underglow & ground shadow ── */}
      <ellipse cx="132" cy="97" rx="108" ry="7"   fill="url(#uGlow)" />
      <ellipse cx="132" cy="98" rx="98"  ry="2.5" fill="#000" opacity="0.45" />

      {/* ── Main body shell ── */}
      <path
        d="M34,76 L28,68 L28,58 L40,46 L60,30 L84,22
           L154,22 L180,30 L200,48 L214,60 L222,68
           L224,76 L222,80 L34,80 Z"
        fill="#090e1a"
        stroke="#1e3a8a"
        strokeWidth="1.5"
      />
      {/* Blue roof sheen */}
      <path
        d="M62,30 L84,22 L154,22 L180,30 L198,48
           L104,46 L100,46 L44,48 Z"
        fill="url(#bodySheen)"
      />

      {/* ── Wheel-arch recesses ── */}
      <path d="M38,80  C38,66  55,58  74,58  C93,58  110,66 110,80 Z" fill="#02060f" />
      <path d="M150,80 C150,66 167,58 186,58 C205,58 222,66 222,80 Z" fill="#02060f" />

      {/* ── Rear window ── */}
      <path d="M44,46 L62,32 L100,26 L100,48 Z"      fill="#7dd3fc" opacity="0.55" />
      <path d="M46,45 L63,34 L82,30 L80,32 L62,38 L48,45 Z" fill="#fff" opacity="0.1" />

      {/* ── Front window ── */}
      <path d="M104,26 L152,24 L176,32 L196,50 L104,50 Z" fill="#7dd3fc" opacity="0.55" />
      <path d="M106,28 L140,26 L138,28 L106,30 Z"     fill="#fff" opacity="0.12" />

      {/* B-pillar */}
      <rect x="100" y="26" width="4" height="24" fill="#090e1a" />

      {/* ── Roofline stripe ── */}
      <path d="M64,30 L84,22 L154,22 L154,24 L84,24 L64,32 Z" fill="#1d4ed8" opacity="0.5" />

      {/* ── Horizontal character line ── */}
      <path d="M34,62 L222,62" stroke="#1d4ed8" strokeWidth="0.75" opacity="0.5" />

      {/* ── Door seams ── */}
      <path d="M102,50 L102,78" stroke="#1e3a8a" strokeWidth="1" opacity="0.4" />
      <path d="M150,50 L150,78" stroke="#1e3a8a" strokeWidth="1" opacity="0.4" />

      {/* ── Side sill ── */}
      <path d="M110,78 L142,78 L142,82 L110,82 Z" fill="#1e3a8a" opacity="0.6" />

      {/* ── Front headlight ── */}
      <ellipse cx="226" cy="67" rx="16" ry="10" fill="url(#hGlow)" opacity="0.65" />
      <path d="M214,62 L222,60 L226,62 L226,72 L218,74 L212,72 L212,66 Z"
            fill="#fef9c3" opacity="0.95" />
      <path d="M215,64 L220,63 L222,65 L222,70 L216,71 L214,69 Z" fill="#fef08a" />
      <path d="M214,67 L222,64" stroke="#fbbf24" strokeWidth="1.5" opacity="0.9" />

      {/* ── Taillight ── */}
      <ellipse cx="25" cy="64" rx="11" ry="8" fill="url(#tGlow)" opacity="0.8" />
      <path d="M30,54 L36,52 L38,58 L38,72 L30,74 L26,72 L26,56 Z"
            fill="#fca5a5" opacity="0.9" />
      <path d="M30,56 L35,54 L36,70 L30,72 Z" fill="#ef4444" />
      <path d="M30,60 L36,57" stroke="#f87171" strokeWidth="1.5" />

      {/* ── Front lower bumper / splitter ── */}
      <path d="M214,70 L224,68 L226,72 L226,80 L214,80 Z" fill="#0c1740" />
      <path d="M216,76 L224,74 L224,80 L216,80 Z" fill="#1d4ed8" opacity="0.55" />

      {/* ── Rear diffuser ── */}
      <path d="M28,68 L40,68 L40,80 L28,78 Z" fill="#0c1740" />
      <path d="M28,74 L40,72 L40,80 L28,80 Z" fill="#1d4ed8" opacity="0.4" />

      {/* ── Rear wheel — className triggers .animate-wheel-spin ── */}
      <g className="animate-wheel-spin">
        <circle cx="74"  cy="80" r="18" fill="#111827" stroke="#374151" strokeWidth="2"   />
        <circle cx="74"  cy="80" r="11" fill="#0d1117" stroke="#1d4ed8" strokeWidth="1.5" />
        <line x1="74"  y1="62" x2="74"  y2="98" stroke="#374151" strokeWidth="2" />
        <line x1="56"  y1="80" x2="92"  y2="80" stroke="#374151" strokeWidth="2" />
        <line x1="62"  y1="68" x2="86"  y2="92" stroke="#374151" strokeWidth="2" />
        <line x1="86"  y1="68" x2="62"  y2="92" stroke="#374151" strokeWidth="2" />
        <circle cx="74"  cy="80" r="4"  fill="#3b82f6" opacity="0.9" />
        <circle cx="74"  cy="80" r="2"  fill="#93c5fd" />
      </g>

      {/* ── Front wheel ── */}
      <g className="animate-wheel-spin">
        <circle cx="186" cy="80" r="18" fill="#111827" stroke="#374151" strokeWidth="2"   />
        <circle cx="186" cy="80" r="11" fill="#0d1117" stroke="#1d4ed8" strokeWidth="1.5" />
        <line x1="186" y1="62" x2="186" y2="98" stroke="#374151" strokeWidth="2" />
        <line x1="168" y1="80" x2="204" y2="80" stroke="#374151" strokeWidth="2" />
        <line x1="174" y1="68" x2="198" y2="92" stroke="#374151" strokeWidth="2" />
        <line x1="198" y1="68" x2="174" y2="92" stroke="#374151" strokeWidth="2" />
        <circle cx="186" cy="80" r="4"  fill="#3b82f6" opacity="0.9" />
        <circle cx="186" cy="80" r="2"  fill="#93c5fd" />
      </g>
    </svg>
  )
}

// ---------------------------------------------------------------------------
// SpeedLines — horizontal motion-blur strips rendered to the LEFT of the car.
// They share the parent's .animate-car-drive translation so they move together.
// Each line has its own .animate-speed-line pulse so they flicker independently.
// ---------------------------------------------------------------------------
function SpeedLines() {
  const lines = [
    { w: 105, top: '30%', opacity: 0.55, delay: '0s',    color: 'from-transparent via-sky-400/70  to-sky-400'  },
    { w:  72, top: '42%', opacity: 0.40, delay: '0.08s', color: 'from-transparent via-blue-400/60 to-blue-400' },
    { w: 135, top: '52%', opacity: 0.30, delay: '0.04s', color: 'from-transparent via-sky-300/50  to-sky-300'  },
    { w:  50, top: '62%', opacity: 0.45, delay: '0.12s', color: 'from-transparent via-sky-500/55  to-sky-500'  },
    { w:  88, top: '74%', opacity: 0.20, delay: '0.18s', color: 'from-transparent via-blue-300/35 to-blue-300' },
  ]
  return (
    <div className="relative self-stretch" style={{ width: '150px' }}>
      {lines.map((l, i) => (
        <div
          key={i}
          className={`absolute h-px bg-gradient-to-r ${l.color} animate-speed-line`}
          style={{ width: `${l.w}px`, top: l.top, right: 0, opacity: l.opacity, animationDelay: l.delay }}
        />
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen overflow-x-hidden">

      {/* ── Navbar ─────────────────────────────────────────────────────── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-slate-950/90 backdrop-blur-md border-b border-slate-800' : ''
      }`}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Gauge size={16} className="text-white" />
            </div>
            <span className="font-bold text-lg text-white tracking-tight">DriveCore</span>
          </div>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-6 text-sm text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#stats"    className="hover:text-white transition-colors">Stats</a>
            <a href="#pricing"  className="hover:text-white transition-colors">Pricing</a>
          </div>

          {/* Auth buttons */}
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm text-slate-400 hover:text-white transition-colors font-medium">
              Sign In
            </Link>
            <Link to="/register" className="dc-btn-primary py-2 px-4 flex items-center gap-1.5">
              Get Started <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="relative pt-36 pb-0 px-6 overflow-hidden">
        {/* Background radial glow effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/10 rounded-full blur-3xl" />
          <div className="absolute top-20 right-0 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl" />
          {/* Grid overlay */}
          <div className="absolute inset-0 opacity-[0.025]"
            style={{ backgroundImage: 'linear-gradient(rgba(148,163,184,1) 1px, transparent 1px), linear-gradient(to right, rgba(148,163,184,1) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
        </div>

        <div className="relative max-w-4xl mx-auto text-center pb-16">
          {/* Badge pill */}
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-6">
            <Star size={11} className="fill-blue-400" />
            AWS-Powered Microservices Platform
          </span>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.08] tracking-tight">
            Manage Every{' '}
            <span className="bg-gradient-to-r from-blue-400 to-sky-300 bg-clip-text text-transparent">
              Repair.
            </span>
            <br />
            Track Every{' '}
            <span className="bg-gradient-to-r from-sky-300 to-emerald-300 bg-clip-text text-transparent">
              Part.
            </span>
          </h1>

          <p className="mt-6 text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            DriveCore unifies bookings, spare-part inventory, and billing into one
            blazing-fast platform — built on independent microservices so every
            component scales exactly when you need it.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="dc-btn-primary py-3 px-8 flex items-center gap-2 text-base">
              Start for Free <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="dc-btn-ghost py-3 px-8 text-base">
              Sign In to Dashboard
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-slate-500 text-xs">
            {['JWT Secured', 'AWS ECS Deployed', '4 Microservices', 'SAST Scanned'].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle size={13} className="text-emerald-500" /> {t}
              </span>
            ))}
          </div>
        </div>

        {/* ── Car Road Animation ─────────────────────────────────────────
            The track spans edge-to-edge (-mx-6 cancels the section px-6).
            SpeedLines + CarSVG share one .animate-car-drive element so they
            translate together as a single composite.
            ─────────────────────────────────────────────────────────────── */}
        <div className="-mx-6 relative h-44 overflow-hidden">
          {/* Top fade: hero bg bleeds smoothly into road */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/50 to-slate-950 pointer-events-none z-10" />

          {/* Road asphalt surface */}
          <div className="absolute bottom-0 inset-x-0 h-16 bg-slate-900/80 border-t border-slate-800/60" />

          {/* Dashed centre-lane markings */}
          <div
            className="absolute inset-x-0"
            style={{
              bottom: '30px',
              height: '2px',
              background:
                'repeating-linear-gradient(to right, rgba(51,65,85,0.65) 0px, rgba(51,65,85,0.65) 32px, transparent 32px, transparent 68px)',
            }}
          />

          {/* Kerb edge line */}
          <div className="absolute bottom-0 inset-x-0 h-px bg-slate-700/30" />

          {/* Car + speed lines animated together across the viewport */}
          <div className="absolute bottom-16 flex items-end animate-car-drive" style={{ zIndex: 20 }}>
            <SpeedLines />
            <CarSVG />
          </div>
        </div>
      </section>

      {/* ── Live Stats ─────────────────────────────────────────────────── */}
      <section id="stats" className="border-y border-slate-800 bg-slate-900/40 py-16 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10">
          <StatCounter end={12400} suffix="+"  label="Repairs Managed" />
          <StatCounter end={98}    suffix="%"  label="Uptime SLA" />
          <StatCounter end={4}     suffix=" Services" label="Microservices" />
          <StatCounter end={3200}  suffix="+"  label="Invoices Generated" />
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────────────── */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-blue-400 text-sm font-semibold uppercase tracking-widest">Platform Features</span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mt-3">
              Everything your garage needs
            </h2>
            <p className="text-slate-400 mt-4 max-w-xl mx-auto">
              Purpose-built modules, each running as an independent microservice,
              that work together seamlessly through a secure API layer.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(({ icon: Icon, color, bg, border, title, desc }) => (
              <div key={title} className="dc-card p-6 hover:border-slate-700 transition-colors duration-200 group">
                <div className={`w-11 h-11 rounded-xl ${bg} border ${border} flex items-center justify-center mb-5`}>
                  <Icon size={20} className={color} />
                </div>
                <h3 className="text-white font-semibold text-base mb-2 group-hover:text-sky-300 transition-colors">
                  {title}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center dc-card p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-sky-500/5 pointer-events-none" />
          <div className="relative">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to drive efficiency?</h2>
            <p className="text-slate-400 mb-8">
              Set up your account in minutes and connect all four microservices to your existing garage workflow.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="dc-btn-primary py-3 px-8 flex items-center justify-center gap-2">
                Create Free Account <ArrowRight size={16} />
              </Link>
              <Link to="/login" className="dc-btn-ghost py-3 px-8">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-800 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
              <Gauge size={12} className="text-white" />
            </div>
            <span className="text-slate-400 text-sm font-medium">DriveCore</span>
          </div>
          <p className="text-slate-600 text-xs">
            © {new Date().getFullYear()} DriveCore. Automobile Service & Repair Management System.
          </p>
        </div>
      </footer>
    </div>
  )
}
