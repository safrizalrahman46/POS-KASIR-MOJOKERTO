import { motion } from 'framer-motion'

const variants = {
  primary: 'bg-zinc-900 text-white hover:bg-zinc-800 border-transparent',
  secondary: 'bg-white text-zinc-700 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50',
  ghost: 'bg-transparent text-zinc-600 hover:bg-zinc-100 border-transparent',
  danger: 'bg-red-600 text-white hover:bg-red-700 border-transparent',
}

const sizes = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-5 py-2.5 text-sm rounded-xl',
  lg: 'px-6 py-3 text-base rounded-xl',
}

export default function Button({ children, variant = 'primary', size = 'md', icon: Icon, loading, disabled, className = '', ...props }) {
  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      className={`inline-flex items-center justify-center gap-2 font-medium border transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={loading || disabled}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : Icon ? (
        <Icon size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} weight="bold" />
      ) : null}
      {children}
    </motion.button>
  )
}
