import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Storefront, Eye, EyeClosed } from '@phosphor-icons/react'
import toast from 'react-hot-toast'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { useAuthStore } from '../store/authStore'
import api from '../api/client'

export default function Login() {
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)
  const [form, setForm] = useState({ username: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await api.post('/auth/login/', form)
      const { access, user } = res.data
      login(access, user)
      toast.success('Berhasil masuk')
      navigate(user.role === 'admin' ? '/admin' : '/pos')
    } catch (err) {
      const msg = err.response?.data?.message || 'Username atau password salah'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex">
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-zinc-900 to-zinc-800 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 text-center max-w-md"
        >
          <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
            <Storefront size={32} className="text-white" weight="bold" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">POS Toko</h2>
          <p className="text-zinc-400 leading-relaxed">
            Sistem Point of Sale modern untuk mengelola transaksi, stok, dan laporan bisnis Anda dengan mudah dan cepat.
          </p>
        </motion.div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-sm"
        >
          <div className="mb-8">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center mb-4 lg:hidden">
              <Storefront size={22} className="text-white" weight="bold" />
            </div>
            <h1 className="text-2xl font-bold text-zinc-900 mb-1">Selamat Datang</h1>
            <p className="text-sm text-zinc-500">Masuk ke akun Anda untuk melanjutkan</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Username"
              type="text"
              placeholder="Masukkan username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
            />
            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Masukkan password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[34px] text-zinc-400 hover:text-zinc-600 transition-colors"
              >
                {showPassword ? <EyeClosed size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {error && (
              <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
            )}

            <Button type="submit" loading={loading} className="w-full">
              Masuk
            </Button>
          </form>

          <p className="text-xs text-zinc-400 text-center mt-8">
            POS Toko v1.0 &mdash; Sistem Kasir Terintegrasi
          </p>
        </motion.div>
      </div>
    </div>
  )
}
