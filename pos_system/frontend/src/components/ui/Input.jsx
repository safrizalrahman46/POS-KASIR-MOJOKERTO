import { forwardRef } from 'react'

const Input = forwardRef(({ label, error, helperText, icon: Icon, className = '', ...props }, ref) => (
  <div className="space-y-1.5">
    {label && (
      <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider">{label}</label>
    )}
    <div className="relative">
      {Icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
          <Icon size={16} />
        </div>
      )}
      <input
        ref={ref}
        className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 transition-all focus:border-zinc-900 focus:outline-none focus:ring-0 ${
          Icon ? 'pl-10' : ''
        } ${error ? 'border-red-400 focus:border-red-500' : 'border-zinc-200'} ${className}`}
        {...props}
      />
    </div>
    {error && <p className="text-xs text-red-500">{error}</p>}
    {helperText && !error && <p className="text-xs text-zinc-400">{helperText}</p>}
  </div>
))

Input.displayName = 'Input'
export default Input
