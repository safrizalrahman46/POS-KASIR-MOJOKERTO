import { useState, useEffect } from 'react'
import { Plus, PencilSimple, TrashSimple } from '@phosphor-icons/react'
import toast from 'react-hot-toast'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import Badge from '../../components/ui/Badge'
import api from '../../api/client'

export default function AutoDiscounts() {
  const [discounts, setDiscounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState({ open: false, mode: 'create', discount: null })

  const fetch = async () => {
    try {
      const res = await api.get('/promotions/auto-discounts/')
      setDiscounts(res.data.results || res.data.data || [])
    } catch {} finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetch() }, [])

  const handleDelete = async (id) => {
    if (!confirm('Hapus auto diskon ini?')) return
    try {
      await api.delete(`/promotions/auto-discounts/${id}/`)
      toast.success('Auto diskon dihapus')
      fetch()
    } catch {
      toast.error('Gagal menghapus auto diskon')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Auto Diskon</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Diskon otomatis berdasarkan jumlah pembelian</p>
        </div>
        <Button onClick={() => setModal({ open: true, mode: 'create', discount: null })}>
          <Plus size={16} weight="bold" />
          Tambah Auto Diskon
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-zinc-100 animate-pulse" />
          ))}
        </div>
      ) : discounts.length === 0 ? (
        <div className="rounded-2xl border border-zinc-100 bg-white p-12 text-center">
          <p className="text-zinc-400 text-sm">Belum ada aturan auto diskon</p>
        </div>
      ) : (
        <div className="space-y-3">
          {discounts.map((d) => (
            <div key={d.id} className="rounded-2xl border border-zinc-100 bg-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
                    <span className="text-sm font-bold text-amber-600">{d.type?.includes('percent') ? `${d.value}%` : `Rp${d.value}`}</span>
                </div>
                <div>
                  <p className="font-medium text-zinc-900">
                    {d.type?.includes('percent') ? `${d.value}%` : `Rp ${(d.value || 0).toLocaleString()}`}
                  </p>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Minimal {d.min_items} item {d.min_purchase ? `• Min. Rp ${d.min_purchase.toLocaleString()}` : ''}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={d.is_active ? 'success' : 'default'}>{d.is_active ? 'Aktif' : 'Nonaktif'}</Badge>
                <div className="flex items-center gap-1">
                  <button onClick={() => setModal({ open: true, mode: 'edit', discount: d })} className="p-2 rounded-lg hover:bg-zinc-100">
                    <PencilSimple size={15} className="text-zinc-500" />
                  </button>
                  <button onClick={() => handleDelete(d.id)} className="p-2 rounded-lg hover:bg-red-50">
                    <TrashSimple size={15} className="text-red-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AutoDiscountModal
        isOpen={modal.open}
        mode={modal.mode}
        discount={modal.discount}
        onClose={() => setModal({ open: false, mode: 'create', discount: null })}
        onSaved={fetch}
      />
    </div>
  )
}

function AutoDiscountModal({ isOpen, mode, discount, onClose, onSaved }) {
  const [form, setForm] = useState({
    type: 'percent_total', value: '', min_items: '', min_purchase: '',
    is_active: true,
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (discount) {
      setForm({
        type: discount.type || 'percent_total',
        value: discount.value?.toString() || '',
        min_items: discount.min_items?.toString() || '',
        min_purchase: discount.min_purchase?.toString() || '',
        is_active: discount.is_active ?? true,
      })
    } else {
      setForm({ type: 'percent_total', value: '', min_items: '', min_purchase: '', is_active: true })
    }
  }, [discount])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        ...form,
        value: parseFloat(form.value),
        min_items: parseInt(form.min_items) || 0,
        min_purchase: form.min_purchase ? parseFloat(form.min_purchase) : 0,
        valid_from: new Date().toISOString().slice(0, 19),
        valid_until: new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 19),
      }
      if (mode === 'create') {
        await api.post('/promotions/auto-discounts/', payload)
        toast.success('Auto diskon ditambahkan')
      } else {
        await api.put(`/promotions/auto-discounts/${discount.id}/`, payload)
        toast.success('Auto diskon diperbarui')
      }
      onSaved()
      onClose()
    } catch {
      toast.error('Gagal menyimpan auto diskon')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={mode === 'create' ? 'Tambah Auto Diskon' : 'Edit Auto Diskon'} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider">Tipe Diskon</label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm focus:border-zinc-400 focus:outline-none">
              <option value="percent_total">% dari Total</option>
              <option value="percent_item">% per Item</option>
              <option value="fixed_item">Rp per Item</option>
            </select>
          </div>
          <Input label="Nilai Diskon" type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Min. Jumlah Item" type="number" value={form.min_items} onChange={(e) => setForm({ ...form, min_items: e.target.value })} required />
          <Input label="Min. Pembelian (Rp)" type="number" value={form.min_purchase} onChange={(e) => setForm({ ...form, min_purchase: e.target.value })} helperText="Kosongkan jika tidak ada" />
        </div>
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
            className="w-4 h-4 rounded border-zinc-300 text-zinc-900 focus:ring-0" />
          <span className="text-sm text-zinc-700">Aturan aktif</span>
        </label>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>Batal</Button>
          <Button type="submit" loading={saving}>{mode === 'create' ? 'Simpan' : 'Perbarui'}</Button>
        </div>
      </form>
    </Modal>
  )
}
