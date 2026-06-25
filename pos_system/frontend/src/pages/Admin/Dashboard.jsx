import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ShoppingCartSimple, CurrencyDollar, Package, Users, ArrowRight } from '@phosphor-icons/react'
import { DashboardCard } from '../../components/ui/Card'
import api from '../../api/client'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/dashboard/stats/')
      .then((res) => {
        setStats(res.data)
        setRecentOrders(res.data.recent_orders || [])
      }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 rounded-lg bg-zinc-100 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-zinc-100 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  const cards = [
    { title: 'Penjualan Hari Ini', value: stats ? `Rp ${(stats.today_sales || 0).toLocaleString()}` : 'Rp 0', icon: CurrencyDollar },
    { title: 'Transaksi', value: stats ? (stats.today_orders || 0).toString() : '0', icon: ShoppingCartSimple },
    { title: 'Total Produk', value: stats ? (stats.total_products || 0).toString() : '0', icon: Package },
    { title: 'Pelanggan', value: stats ? (stats.today_customers || 0).toString() : '0', icon: Users },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-zinc-900">Dashboard</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Ringkasan aktivitas toko hari ini</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <DashboardCard {...card} />
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-zinc-100 bg-white p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
          <h2 className="text-sm font-semibold text-zinc-900 mb-4">Pesanan Terbaru</h2>
          {recentOrders.length === 0 ? (
            <p className="text-sm text-zinc-400">Belum ada pesanan</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between py-2 border-b border-zinc-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-zinc-900">#{order.invoice_number || order.id}</p>
                    <p className="text-xs text-zinc-400">{order.customer_name || 'Walk-in'}</p>
                  </div>
                    <span className="text-sm font-medium text-zinc-900">Rp {(order.grand_total || 0).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-zinc-100 bg-white p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
          <h2 className="text-sm font-semibold text-zinc-900 mb-4">Akses Cepat</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Produk', href: '/admin/products' },
              { label: 'Kategori', href: '/admin/categories' },
              { label: 'Voucher', href: '/admin/vouchers' },
              { label: 'Laporan', href: '/admin/reports' },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 hover:bg-zinc-100 transition-colors group"
              >
                <span className="text-sm font-medium text-zinc-700">{item.label}</span>
                <ArrowRight size={14} className="text-zinc-400 group-hover:text-zinc-600 transition-colors" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
