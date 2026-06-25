import { useState, useEffect } from 'react'
import { useState, useEffect } from 'react'
import { CurrencyDollar, ShoppingCartSimple, TrendUp, CalendarBlank, Download } from '@phosphor-icons/react'
import { DashboardCard } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import api from '../../api/client'

export default function Reports() {
  const today = new Date().toISOString().slice(0, 10)
  const [fromDate, setFromDate] = useState(today)
  const [toDate, setToDate] = useState(today)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchData = () => {
    setLoading(true)
    api.get('/dashboard/reports/', { params: { from_date: fromDate, to_date: toDate } })
      .then((res) => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchData() }, [])

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Laporan</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Ringkasan penjualan dan laporan keuangan</p>
        </div>
        <div className="flex items-center gap-3">
          <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="w-40" />
          <span className="text-xs text-zinc-400">s/d</span>
          <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="w-40" />
          <Button size="sm" onClick={fetchData}><CalendarBlank size={14} /> Tampilkan</Button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-zinc-100 animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <DashboardCard
              title="Total Penjualan"
              value={`Rp ${(data?.total_sales || 0).toLocaleString()}`}
              icon={CurrencyDollar}
            />
            <DashboardCard
              title="Total Transaksi"
              value={(data?.total_orders || 0).toString()}
              icon={ShoppingCartSimple}
            />
            <DashboardCard
              title="Rata-rata Transaksi"
              value={`Rp ${(data?.average_order || 0).toLocaleString()}`}
              icon={TrendUp}
            />
          </div>

          <div className="rounded-2xl border border-zinc-100 bg-white p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
            <h2 className="text-sm font-semibold text-zinc-900 mb-4">Pesanan Terbaru</h2>
            {data?.orders?.length > 0 ? (
              <div className="space-y-3">
                {data.recent_orders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between py-2 border-b border-zinc-50 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-zinc-900">#{order.invoice_number || order.id}</p>
                      <p className="text-xs text-zinc-400">{order.customer_name || 'Walk-in'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-zinc-900">Rp {(order.grand_total || 0).toLocaleString()}</p>
                      <p className="text-xs text-zinc-400">{order.created_at ? new Date(order.created_at).toLocaleString() : ''}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-zinc-400">Belum ada data untuk periode ini</p>
            )}
          </div>
        </>
      )}
    </div>
  )
}
