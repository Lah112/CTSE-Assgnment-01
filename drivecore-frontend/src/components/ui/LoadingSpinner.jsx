export default function LoadingSpinner({ size = 'md', text }) {
  const sizeClass = { sm: 'w-4 h-4', md: 'w-7 h-7', lg: 'w-10 h-10' }[size] || 'w-7 h-7'

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-slate-500">
      <svg
        className={`animate-spin ${sizeClass} text-blue-500`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      {text && <p className="text-sm">{text}</p>}
    </div>
  )
}
