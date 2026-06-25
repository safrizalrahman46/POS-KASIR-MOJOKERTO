import { motion } from 'framer-motion'

export default function Card({ children, hover = false, padding = 'md', className = '' }) {
  const p = padding === 'sm' ? 'p-4' : padding === 'lg' ? 'p-8' : 'p-6'

  const base = `rounded-2xl border border-zinc-100 bg-white ${p} shadow-[0_1px_3px_0_rgba(0,0,0,0.04)] ${className}`

  if (hover) {
    return (
      <motion.div
        whileHover={{ y: -2 }}
        className={`${base} transition-all hover:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.08)] hover:border-zinc-200`}
      >
        {children}
      </motion.div>
    )
  }

  return <div className={base}>{children}</div>
}

export function DashboardCard({ title, value, icon: Icon, trend, variant = 'default' }) {
  const trendColors = {
    up: 'text-emerald-600',
    down: 'text-red-500',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-zinc-100 bg-white p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]"
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className="p-2 rounded-xl bg-zinc-50">
            <Icon size={18} className="text-zinc-600" />
          </div>
        )}
      </div>
      <div className="flex items-end justify-between">
        <span className="text-2xl font-bold text-zinc-900">{value}</span>
        {trend && (
          <span className={`text-xs font-medium ${trendColors[trend.direction]}`}>
            {trend.label}
          </span>
        )}
      </div>
    </motion.div>
  )
}
