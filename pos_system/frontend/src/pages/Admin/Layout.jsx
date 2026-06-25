import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Storefront, LayoutDashboard, Package, Tag, Ticket, Percent,
  ChartBar, ShoppingCart, SignOut, List, X, User
} from '@phosphor-icons/react'
import { useAuthStore } from '../../store/authStore'
import Button from '../../components/ui/Button'

const navItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/products', icon: Package, label: 'Produk' },
  { to: '/admin/categories', icon: Tag, label: 'Kategori' },
  { to: '/admin/vouchers', icon: Ticket, label: 'Voucher' },
  { to: '/admin/auto-discounts', icon: Percent, label: 'Auto Diskon' },
  { to: '/admin/reports', icon: ChartBar, label: 'Laporan' },
]

export default function AdminLayout() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex">
      <aside className={`
        fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-white border-r border-zinc-100
        lg:translate-x-0 transition-transform duration-200
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-16 flex items-center justify-between px-5 border-b border-zinc-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center">
              <Storefront size={18} className="text-white" weight="bold" />
            </div>
            <span className="font-semibold text-zinc-900">POS Toko</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 rounded-lg hover:bg-zinc-100">
            <X size={18} className="text-zinc-500" />
          </button>
        </div>

        <nav className="p-3 space-y-0.5">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-zinc-900 text-white'
                    : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'
                }`
              }
            >
              <item.icon size={18} weight={({ isActive }) => isActive ? 'fill' : 'regular'} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-zinc-100">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center">
              <User size={16} className="text-zinc-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-900 truncate">{user?.name || 'Admin'}</p>
              <p className="text-xs text-zinc-400 capitalize">{user?.role || 'admin'}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="w-full justify-start text-zinc-500" onClick={handleLogout}>
            <SignOut size={16} />
            Keluar
          </Button>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/20 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="flex-1 min-w-0">
        <header className="h-16 bg-white border-b border-zinc-100 flex items-center justify-between px-6 sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-zinc-100">
            <List size={20} className="text-zinc-500" />
          </button>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-3">
            <Button variant="secondary" size="sm" onClick={() => navigate('/pos')}>
              <ShoppingCart size={16} />
              POS
            </Button>
          </div>
        </header>

        <main className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
