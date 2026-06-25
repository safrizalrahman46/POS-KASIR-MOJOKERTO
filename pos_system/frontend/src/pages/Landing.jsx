import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ShoppingCartSimple, Receipt, ChartLineUp, ShieldCheck, ArrowRight, Storefront } from '@phosphor-icons/react'
import Button from '../components/ui/Button'

const features = [
  { icon: ShoppingCartSimple, title: 'POS Cepat', desc: 'Transaksi kasir dengan antarmuka responsif dan cepat' },
  { icon: Receipt, title: 'Manajemen Pesanan', desc: 'Kelola pesanan, cetak struk, dan pantau riwayat' },
  { icon: ChartLineUp, title: 'Laporan Real-time', desc: 'Lihat laporan penjualan harian, mingguan, dan bulanan' },
  { icon: ShieldCheck, title: 'Multi-level Akses', desc: 'Kontrol akses untuk admin dan kasir dengan aman' },
]

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-100 bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center">
              <Storefront size={18} className="text-white" weight="bold" />
            </div>
            <span className="font-semibold text-zinc-900 tracking-tight">POS Toko</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>Masuk</Button>
            <Button size="sm" onClick={() => navigate('/login')}>Coba Gratis</Button>
          </div>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-6 pt-24 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 mb-6">
              Solusi Kasir Digital
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold text-zinc-900 leading-[1.1] tracking-tight mb-4">
              Kasir Modern untuk{' '}
              <span className="text-emerald-600">Bisnis Anda</span>
            </h1>
            <p className="text-zinc-500 text-lg leading-relaxed mb-8 max-w-lg">
              Sistem Point of Sale yang cepat, handal, dan mudah digunakan. Kelola transaksi, stok, dan laporan dalam satu platform.
            </p>
            <div className="flex items-center gap-4">
              <Button size="lg" onClick={() => navigate('/login')}>
                Mulai Sekarang
                <ArrowRight size={18} weight="bold" />
              </Button>
              <Button variant="secondary" size="lg" onClick={() => navigate('/login')}>
                Pelajari Lebih
              </Button>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="aspect-[4/3] rounded-3xl bg-gradient-to-br from-zinc-100 to-zinc-200 border border-zinc-200/50 overflow-hidden">
              <div className="p-6 space-y-4">
                <div className="flex gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="h-20 rounded-xl bg-white/80 border border-zinc-200/50 p-3">
                    <div className="w-16 h-2 rounded bg-zinc-200 mb-2" />
                    <div className="w-24 h-3 rounded bg-zinc-300" />
                  </div>
                  <div className="h-20 rounded-xl bg-white/80 border border-zinc-200/50 p-3">
                    <div className="w-16 h-2 rounded bg-zinc-200 mb-2" />
                    <div className="w-20 h-3 rounded bg-emerald-200" />
                  </div>
                </div>
                <div className="h-16 rounded-xl bg-white/80 border border-zinc-200/50 p-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-zinc-100" />
                  <div className="flex-1 space-y-1.5">
                    <div className="w-32 h-2 rounded bg-zinc-200" />
                    <div className="w-20 h-2 rounded bg-zinc-200" />
                  </div>
                  <div className="w-16 h-3 rounded bg-emerald-200" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-zinc-900 mb-2">Fitur Unggulan</h2>
          <p className="text-zinc-500">Semua yang Anda butuhkan untuk mengelola toko</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl border border-zinc-100 bg-white p-6 hover:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.08)] transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center mb-4">
                <f.icon size={20} className="text-zinc-600" />
              </div>
              <h3 className="font-semibold text-zinc-900 mb-1">{f.title}</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <footer className="border-t border-zinc-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between text-sm text-zinc-400">
          <span>&copy; 2024 POS Toko. All rights reserved.</span>
          <div className="flex items-center gap-6">
            <span className="hover:text-zinc-600 transition-colors cursor-pointer">Kebijakan Privasi</span>
            <span className="hover:text-zinc-600 transition-colors cursor-pointer">Syarat & Ketentuan</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
