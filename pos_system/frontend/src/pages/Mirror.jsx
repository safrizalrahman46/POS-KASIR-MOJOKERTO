import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Storefront, ShoppingCartSimple } from '@phosphor-icons/react'

export default function Mirror() {
  const [order, setOrder] = useState(null)
  const [orders, setOrders] = useState([])
  const [clock, setClock] = useState(new Date())
  const wsRef = useRef(null)
  const reconnectTimer = useRef(null)

  useEffect(() => {
    document.title = 'Mirror Display - POS Toko'
    const timer = setInterval(() => setClock(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const host = window.location.host

    function connect() {
      const ws = new WebSocket(`${protocol}//${host}/ws/order/`)
      wsRef.current = ws

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          const entry = {
            id: data.id,
            grand_total: parseInt(data.grand_total) || 0,
            cashier: data.cashier || 'Kasir',
            created_at: data.created_at,
            time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          }
          setOrder(entry)
          setOrders((prev) => [entry, ...prev].slice(0, 20))
        } catch {}
      }

      ws.onclose = () => {
        reconnectTimer.current = setTimeout(connect, 3000)
      }
    }

    connect()
    return () => {
      wsRef.current?.close()
      clearTimeout(reconnectTimer.current)
    }
  }, [])

  return (
    <div className="min-h-screen bg-zinc-900 text-white overflow-hidden">
      <div className="max-w-5xl mx-auto p-8 h-screen flex flex-col">
        <div className="flex items-center justify-between mb-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
              <Storefront size={26} className="text-white" weight="bold" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">POS Toko</h1>
              <p className="text-xs text-zinc-500">Mirror Display</p>
            </div>
          </div>
          <p className="text-4xl font-bold tabular-nums tracking-tight text-zinc-100">
            {clock.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </p>
        </div>

        <div className="flex-1 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {order ? (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                className="rounded-4xl border border-white/10 bg-white/[0.04] p-10 mb-6"
              >
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <p className="text-xs text-zinc-500 uppercase tracking-[0.2em] font-medium">Pesanan Baru</p>
                    <h2 className="text-4xl font-bold mt-2 tracking-tight">#{order.id}</h2>
                    <p className="text-sm text-zinc-500 mt-1">{order.time}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-zinc-500 uppercase tracking-wider">Total</p>
                    <p className="text-5xl font-bold text-emerald-400 mt-1 tracking-tight">
                      Rp {order.grand_total.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-zinc-400 border-t border-white/5 pt-6">
                  <span>Kasir: <span className="text-zinc-200 font-medium">{order.cashier}</span></span>
                  <span className="text-zinc-600">|</span>
                  <span>Status: <span className="text-emerald-400 font-medium">Lunas</span></span>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-4xl border border-white/[0.04] bg-white/[0.02] p-16 text-center mb-6"
              >
                <ShoppingCartSimple size={56} className="mx-auto text-zinc-700 mb-4" />
                <p className="text-zinc-400 text-xl font-medium">Menunggu pesanan...</p>
                <p className="text-zinc-600 text-sm mt-2">Pesanan baru akan muncul di sini secara otomatis</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {orders.length > 1 && (
          <div className="shrink-0">
            <p className="text-[10px] text-zinc-600 uppercase tracking-[0.15em] mb-2 font-medium">Pesanan Sebelumnya</p>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {orders.slice(1, 11).map((o) => (
                <div key={`${o.id}-${o.created_at}`} className="shrink-0 flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/[0.03] border border-white/5">
                  <span className="text-sm font-bold text-zinc-300">#{o.id}</span>
                  <span className="text-xs text-emerald-400 font-medium">Rp{o.grand_total.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
