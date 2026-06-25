import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MagnifyingGlass, Minus, Plus, TrashSimple, Receipt, User,
  Ticket, ShoppingCartSimple, Storefront, SignOut, X,
  Scan, CheckCircle, CashRegister, CreditCard, QrCode,
} from '@phosphor-icons/react'
import toast from 'react-hot-toast'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import { useCartStore } from '../store/cartStore'
import { useAuthStore } from '../store/authStore'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'

const paymentMethods = [
  { value: 'cash', label: 'Tunai', icon: CashRegister },
  { value: 'debit', label: 'Debit', icon: CreditCard },
  { value: 'qris', label: 'QRIS', icon: QrCode },
]

export default function POS() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const cart = useCartStore()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [search, setSearch] = useState('')
  const [barcodeInput, setBarcodeInput] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [loading, setLoading] = useState(true)
  const [paymentModal, setPaymentModal] = useState(false)
  const [payMethod, setPayMethod] = useState('cash')
  const [payAmount, setPayAmount] = useState('')
  const [paying, setPaying] = useState(false)
  const [voucherLoading, setVoucherLoading] = useState(false)
  const [voucherError, setVoucherError] = useState('')

  const fetchData = useCallback(async () => {
    try {
      const [pRes, cRes] = await Promise.all([
        api.get('/products/', { params: { is_active: true } }),
        api.get('/products/categories/'),
      ])
      setProducts(pRes.data.results || pRes.data.data || [])
      setCategories(cRes.data.results || cRes.data.data || [])
    } catch {
      toast.error('Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const host = window.location.host
    const ws = new WebSocket(`${protocol}//${host}/ws/stock/`)
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.data?.items) {
          setProducts((prev) =>
            prev.map((p) => {
              const updated = data.data.items.find((i) => i.id === p.id)
              return updated ? { ...p, stock: updated.stock } : p
            })
          )
        } else if (data.data?.id !== undefined) {
          setProducts((prev) =>
            prev.map((p) =>
              p.id === data.data.id ? { ...p, stock: data.data.stock } : p
            )
          )
        }
      } catch {}
    }
    return () => ws.close()
  }, [])

  const filtered = products.filter((p) => {
    const q = search.toLowerCase()
    const matchSearch = !q || p.name?.toLowerCase().includes(q) || p.barcode?.includes(q)
    const matchCat = activeCategory === 'all' || p.category_id?.toString() === activeCategory
    return matchSearch && matchCat
  })

  const subtotal = cart.getSubtotal()
  const itemDiscounts = cart.getItemDiscounts()
  const total = cart.getTotal()

  const handleBarcodeSearch = () => {
    if (!barcodeInput) return
    const found = products.find((p) => p.barcode === barcodeInput)
    if (found) {
      cart.addItem(found)
      setBarcodeInput('')
      toast.success(`${found.name} ditambahkan`)
    } else {
      toast.error('Produk tidak ditemukan')
    }
  }

  const handleValidateVoucher = async () => {
    if (!cart.voucherCode) return
    setVoucherLoading(true)
    setVoucherError('')
    try {
      const res = await api.post('/promotions/validate-voucher/', {
        code: cart.voucherCode,
        total_purchase: subtotal - itemDiscounts,
      })
      if (res.data.valid) {
        cart.setVoucherDiscount(res.data.discount_amount)
        toast.success(`Voucher: diskon Rp${res.data.discount_amount.toLocaleString()}`)
      } else {
        setVoucherError(res.data.message || 'Voucher tidak valid')
        cart.setVoucherDiscount(0)
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Voucher tidak valid'
      setVoucherError(msg)
      cart.setVoucherDiscount(0)
    } finally {
      setVoucherLoading(false)
    }
  }

  useEffect(() => {
    if (cart.voucherCode && cart.voucherCode.length >= 3) {
      const timer = setTimeout(handleValidateVoucher, 500)
      return () => clearTimeout(timer)
    }
    cart.setVoucherDiscount(0)
    setVoucherError('')
  }, [cart.voucherCode, subtotal])

  const handleCheckout = async () => {
    if (cart.items.length === 0) { toast.error('Keranjang kosong'); return }
    const amount = parseInt(payAmount.replace(/\D/g, '')) || 0
    if (amount < total) { toast.error(`Minimal pembayaran Rp${total.toLocaleString()}`); return }

    setPaying(true)
    try {
      const payload = {
        customer_name: cart.customerName || '',
        payment_method: payMethod,
        payment_amount: amount,
        items: cart.items.map((i) => ({
          product_id: i.product.id,
          quantity: i.quantity,
          discount_type: i.discount_type,
          discount_value: i.discount_value,
        })),
        voucher_code: cart.voucherCode || undefined,
      }
      await api.post('/pos/orders/', payload)
      toast.success('Pembayaran berhasil!')
      cart.clearCart()
      setPaymentModal(false)
      setPayAmount('')
      setPayMethod('cash')
      fetchData()
    } catch (err) {
      const msg = err.response?.data?.message?.[0]?.message || err.response?.data?.message || 'Pembayaran gagal'
      toast.error(msg)
    } finally {
      setPaying(false)
    }
  }

  return (
    <div className="h-screen bg-zinc-50 flex flex-col">
      <header className="bg-white border-b border-zinc-100 px-6 h-14 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center">
            <Storefront size={18} className="text-white" weight="bold" />
          </div>
          <span className="font-semibold text-zinc-900">POS Toko</span>
          <Badge variant="info" className="ml-2">{user?.name || 'Kasir'}</Badge>
        </div>
        <div className="flex items-center gap-2">
          {user?.role === 'admin' && (
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin')}>Admin</Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => { logout(); navigate('/login') }}>
            <SignOut size={16} />
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="p-4 pb-2 space-y-3 shrink-0">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <MagnifyingGlass size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  className="w-full rounded-xl border border-zinc-200 bg-white pl-10 pr-4 py-2.5 text-sm focus:border-zinc-900 focus:outline-none"
                  placeholder="Cari nama produk..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="relative w-48">
                <Scan size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  className="w-full rounded-xl border border-zinc-200 bg-white pl-10 pr-4 py-2.5 text-sm font-mono focus:border-zinc-900 focus:outline-none"
                  placeholder="Scan barcode"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleBarcodeSearch()}
                />
              </div>
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              <button
                onClick={() => setActiveCategory('all')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
                  activeCategory === 'all' ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                }`}
              >Semua</button>
              {categories.map((c) => (
                <button key={c.id}
                  onClick={() => setActiveCategory(c.id.toString())}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
                    activeCategory === c.id.toString() ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                  }`}
                >{c.name}</button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 pb-4">
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="aspect-[3/4] rounded-2xl bg-zinc-100 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                <AnimatePresence>
                  {filtered.map((p) => {
                    const inCart = cart.items.find((i) => i.product.id === p.id)
                    return (
                      <motion.button
                        key={p.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        onClick={() => p.stock > 0 && cart.addItem(p)}
                        disabled={p.stock <= 0}
                        className={`rounded-2xl border p-4 text-left transition-all active:scale-[0.98] ${
                          p.stock <= 0
                            ? 'border-zinc-100 bg-zinc-50 opacity-50 cursor-not-allowed'
                            : inCart
                              ? 'border-emerald-200 bg-emerald-50 hover:border-emerald-300'
                              : 'border-zinc-100 bg-white hover:border-zinc-200 hover:shadow-sm'
                        }`}
                      >
                        <div className="aspect-square rounded-xl bg-zinc-50 mb-3 flex items-center justify-center">
                          {p.image ? (
                            <img src={p.image} alt={p.name} className="w-full h-full object-cover rounded-xl" />
                          ) : (
                            <ShoppingCartSimple size={24} className="text-zinc-300" />
                          )}
                        </div>
                        <p className="text-sm font-medium text-zinc-900 line-clamp-2 leading-snug mb-1">{p.name}</p>
                        <p className="text-sm font-bold text-emerald-600">Rp {p.price.toLocaleString()}</p>
                        {p.barcode && <p className="text-[10px] text-zinc-300 font-mono mt-0.5">{p.barcode}</p>}
                        <div className="flex items-center justify-between mt-1.5">
                          <span className={`text-xs ${p.stock > 0 ? (p.stock <= (p.min_stock || 0) ? 'text-amber-500' : 'text-zinc-400') : 'text-red-400'}`}>
                            {p.stock > 0 ? (p.stock <= (p.min_stock || 0) ? `Sisa ${p.stock}` : `Stok: ${p.stock}`) : 'Habis'}
                          </span>
                          {inCart && <Badge variant="success">{inCart.quantity}</Badge>}
                        </div>
                      </motion.button>
                    )
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

        <aside className="w-96 bg-white border-l border-zinc-100 flex flex-col shrink-0">
          <div className="p-4 border-b border-zinc-100 shrink-0">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
                <Receipt size={16} />
                Pesanan
              </h2>
              {cart.items.length > 0 && (
                <button onClick={cart.clearCart} className="text-xs text-red-400 hover:text-red-500 transition-colors">
                  Hapus Semua
                </button>
              )}
            </div>
            <Input
              placeholder="Nama pelanggan (opsional)"
              value={cart.customerName}
              onChange={(e) => cart.setCustomerName(e.target.value)}
              icon={User}
            />
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
            <AnimatePresence>
              {cart.items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShoppingCartSimple size={40} className="text-zinc-200 mb-3" />
                  <p className="text-sm text-zinc-400">Belum ada item</p>
                  <p className="text-xs text-zinc-300 mt-1">Pilih atau scan produk</p>
                </div>
              ) : (
                cart.items.map((item) => {
                  const lineTotal = item.product.price * item.quantity
                  return (
                    <motion.div
                      key={item.product.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="rounded-xl border border-zinc-100 bg-zinc-50/50 p-3"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-sm font-medium text-zinc-900 flex-1 mr-2 line-clamp-1">{item.product.name}</p>
                        <button onClick={() => cart.removeItem(item.product.id)} className="p-0.5 hover:bg-red-50 rounded">
                          <TrashSimple size={14} className="text-red-300" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => cart.updateQuantity(item.product.id, item.quantity - 1)}
                            className="w-7 h-7 rounded-lg border border-zinc-200 flex items-center justify-center hover:bg-zinc-100">
                            <Minus size={12} />
                          </button>
                          <span className="text-sm font-medium text-zinc-900 w-6 text-center">{item.quantity}</span>
                          <button onClick={() => cart.updateQuantity(item.product.id, item.quantity + 1)}
                            className="w-7 h-7 rounded-lg border border-zinc-200 flex items-center justify-center hover:bg-zinc-100">
                            <Plus size={12} />
                          </button>
                        </div>
                        <p className="text-sm font-semibold text-zinc-900">Rp {lineTotal.toLocaleString()}</p>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <select
                          value={item.discount_type}
                          onChange={(e) => cart.updateItemDiscount(item.product.id, e.target.value, item.discount_value)}
                          className="text-xs border border-zinc-200 rounded-lg px-2 py-1 bg-white focus:outline-none"
                        >
                          <option value="none">No diskon</option>
                          <option value="percent">Diskon %</option>
                          <option value="fixed">Diskon Rp</option>
                        </select>
                        {item.discount_type !== 'none' && (
                          <input
                            type="number"
                            value={item.discount_value}
                            onChange={(e) => cart.updateItemDiscount(item.product.id, item.discount_type, parseFloat(e.target.value) || 0)}
                            className="w-16 text-xs border border-zinc-200 rounded-lg px-2 py-1 bg-white focus:outline-none"
                            placeholder="0"
                          />
                        )}
                        {item.discount_type === 'percent' && <span className="text-[10px] text-zinc-400">%</span>}
                      </div>
                    </motion.div>
                  )
                })
              )}
            </AnimatePresence>
          </div>

          <div className="border-t border-zinc-100 p-4 space-y-3 shrink-0">
            <div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Ticket size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    className="w-full rounded-xl border border-zinc-200 bg-white pl-9 pr-4 py-2 text-xs font-mono focus:border-zinc-900 focus:outline-none"
                    placeholder="Kode voucher"
                    value={cart.voucherCode || ''}
                    onChange={(e) => cart.setVoucherCode(e.target.value.toUpperCase())}
                  />
                </div>
                <Button size="sm" variant="secondary" onClick={handleValidateVoucher} loading={voucherLoading}>
                  Pakai
                </Button>
              </div>
              {voucherError && <p className="text-[10px] text-red-500 mt-1">{voucherError}</p>}
              {cart.voucherDiscount > 0 && (
                <p className="text-[10px] text-emerald-600 mt-1">Diskon voucher: -Rp{cart.voucherDiscount.toLocaleString()}</p>
              )}
            </div>

            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-zinc-500">
                <span>Subtotal</span>
                <span>Rp {subtotal.toLocaleString()}</span>
              </div>
              {itemDiscounts > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Diskon Item</span>
                  <span>-Rp {itemDiscounts.toLocaleString()}</span>
                </div>
              )}
              {cart.voucherDiscount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Diskon Voucher</span>
                  <span>-Rp {cart.voucherDiscount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-zinc-500">
                <span>Pajak (11%)</span>
                <span>Rp {Math.round((total - (subtotal - itemDiscounts - cart.voucherDiscount))).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-zinc-900 pt-2 border-t border-zinc-100">
                <span>Total</span>
                <span>Rp {total.toLocaleString()}</span>
              </div>
            </div>

            <Button className="w-full" size="lg" onClick={() => setPaymentModal(true)} disabled={cart.items.length === 0}>
              <CashRegister size={18} weight="bold" />
              Bayar Rp {total.toLocaleString()}
            </Button>
          </div>
        </aside>
      </div>

      <Modal isOpen={paymentModal} onClose={() => !paying && setPaymentModal(false)} title="Pembayaran" size="md">
        <div className="space-y-5">
          <div className="rounded-xl bg-zinc-50 p-4 space-y-2">
            {cart.items.map((item) => (
              <div key={item.product.id} className="flex justify-between text-sm">
                <span className="text-zinc-600">{item.product.name} x{item.quantity}</span>
                <span className="text-zinc-900">Rp {(item.product.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
            <div className="border-t border-zinc-200 pt-2 mt-2 flex justify-between font-bold text-zinc-900">
              <span>Total</span>
              <span>Rp {total.toLocaleString()}</span>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2 block">Metode Pembayaran</label>
            <div className="grid grid-cols-3 gap-2">
              {paymentMethods.map((m) => {
                const Icon = m.icon
                return (
                  <button
                    key={m.value}
                    onClick={() => setPayMethod(m.value)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-medium transition-all ${
                      payMethod === m.value
                        ? 'border-zinc-900 bg-zinc-50 text-zinc-900'
                        : 'border-zinc-200 text-zinc-500 hover:border-zinc-300'
                    }`}
                  >
                    <Icon size={20} weight={payMethod === m.value ? 'fill' : 'regular'} />
                    {m.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5 block">Jumlah Pembayaran</label>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => setPayAmount(total.toString())}>
                Exact
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setPayAmount(Math.ceil(total / 1000) * 1000 + 5000)}>
                +5K
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setPayAmount(Math.ceil(total / 10000) * 10000)}>
                Bulatkan
              </Button>
            </div>
            <input
              type="text"
              value={payAmount ? `Rp ${parseInt(payAmount).toLocaleString()}` : ''}
              onChange={(e) => {
                const num = e.target.value.replace(/\D/g, '')
                setPayAmount(num)
              }}
              className="w-full mt-2 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-lg font-bold text-zinc-900 focus:border-zinc-900 focus:outline-none"
              placeholder={`Rp ${total.toLocaleString()}`}
            />
            {payAmount && parseInt(payAmount) >= total && (
              <p className="text-xs text-emerald-600 mt-1">
                Kembalian: Rp {(parseInt(payAmount) - total).toLocaleString()}
              </p>
            )}
            {payAmount && parseInt(payAmount) > 0 && parseInt(payAmount) < total && (
              <p className="text-xs text-red-500 mt-1">Kurang Rp {(total - parseInt(payAmount)).toLocaleString()}</p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setPaymentModal(false)} disabled={paying}>
              Batal
            </Button>
            <Button className="flex-1" loading={paying} onClick={handleCheckout}>
              <CheckCircle size={16} weight="bold" />
              Bayar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
