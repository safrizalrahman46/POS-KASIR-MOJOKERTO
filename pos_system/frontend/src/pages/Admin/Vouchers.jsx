import { useState, useEffect } from 'react'
import { Plus, PencilSimple, TrashSimple } from '@phosphor-icons/react'
import toast from 'react-hot-toast'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import Badge from '../../components/ui/Badge'
import api from '../../api/client'

export default function Vouchers() {
  const [vouchers, setVouchers] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState({ open: false, mode: 'create', voucher: null })

  const fetch = async () => {
    try {
      const res = await api.get('/promotions/vouchers/')
      setVouchers(res.data.results || res.data.data || [])
    } catch {} finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetch() }, [])

  const handleDelete = async (id) => {
    if (!confirm('Hapus voucher ini?')) return
    try {
      await api.delete(`/promotions/vouchers/${id}/`)
      toast.success('Voucher dihapus')
      fetch()
    } catch {
      toast.error('Gagal menghapus voucher')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Voucher</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Kelola kode voucher diskon</p>
        </div>
        <Button onClick={() => setModal({ open: true, mode: 'create', voucher: null })}>
          <Plus size={16} weight="bold" />
          Tambah Voucher
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-zinc-100 animate-pulse" />
          ))}
        </div>
      ) : vouchers.length === 0 ? (
        <div className="rounded-2xl border border-zinc-100 bg-white p-12 text-center">
          <p className="text-zinc-400 text-sm">Belum ada voucher</p>
        </div>
      ) : (
        <div className="space-y-3">
          {vouchers.map((v) => (
            <div key={v.id} className="rounded-2xl border border-zinc-100 bg-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                    <span className="text-sm font-bold text-emerald-600 font-mono">{v.type === 'percent' ? `${v.value}%` : `Rp${v.value}`}</span>
                </div>
                <div>
                  <p className="font-mono text-sm font-bold text-zinc-900">{v.code}</p>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {v.type === 'percent' ? `${v.value}%` : `Rp ${(v.value || 0).toLocaleString()}`}
                    {v.min_purchase ? ` • Min. Rp ${v.min_purchase.toLocaleString()}` : ''}
                    {v.valid_until ? ` • Berlaku hingga ${new Date(v.valid_until).toLocaleDateString()}` : ''}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={v.is_active ? 'success' : 'default'}>{v.is_active ? 'Aktif' : 'Nonaktif'}</Badge>
                <div className="flex items-center gap-1">
                  <button onClick={() => setModal({ open: true, mode: 'edit', voucher: v })} className="p-2 rounded-lg hover:bg-zinc-100">
                    <PencilSimple size={15} className="text-zinc-500" />
                  </button>
                  <button onClick={() => handleDelete(v.id)} className="p-2 rounded-lg hover:bg-red-50">
                    <TrashSimple size={15} className="text-red-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <VoucherModal
        isOpen={modal.open}
        mode={modal.mode}
        voucher={modal.voucher}
        onClose={() => setModal({ open: false, mode: 'create', voucher: null })}
        onSaved={fetch}
      />
    </div>
  )
}

function VoucherModal({ isOpen, mode, voucher, onClose, onSaved }) {
  const [form, setForm] = useState({
    code: '', type: 'percent', value: '', min_purchase: '',
    usage_limit: '', valid_until: '', is_active: true,
  })

  useEffect(() => {
    if (voucher) {
      setForm({
        code: voucher.code || '',
        type: voucher.type || 'percent',
        value: voucher.value?.toString() || '',
        min_purchase: voucher.min_purchase?.toString() || '',
        usage_limit: voucher.usage_limit?.toString() || '',
        valid_until: voucher.valid_until ? voucher.valid_until.slice(0, 10) : '',
        is_active: voucher.is_active ?? true,
      })
    } else {
      setForm({ code: '', type: 'percent', value: '', min_purchase: '', usage_limit: '', valid_until: '', is_active: true })
    }
  }, [voucher])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        ...form,
        value: parseFloat(form.value),
        min_purchase: form.min_purchase ? parseFloat(form.min_purchase) : 0,
        usage_limit: form.usage_limit ? parseInt(form.usage_limit) : 0,
      }
  }, [voucher])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        ...form,
        discount_value: parseFloat(form.discount_value),
        min_purchase: form.min_purchase ? parseFloat(form.min_purchase) : null,
        max_uses: form.max_uses ? parseInt(form.max_uses) : null,
      }
      if (mode === 'create') {
        await api.post('/promotions/vouchers/', payload)
        toast.success('Voucher ditambahkan')
      } else {
        await api.put(`/promotions/vouchers/${voucher.id}/`, payload)
        toast.success('Voucher diperbarui')
      }
      onSaved()
      onClose()
    } catch {
      toast.error('Gagal menyimpan voucher')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={mode === 'create' ? 'Tambah Voucher' : 'Edit Voucher'} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Kode Voucher" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} required placeholder="DISKON10" />
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider">Tipe Diskon</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm focus:border-zinc-400 focus:outline-none"
            >
              <option value="percent">Persen (%)</option>
              <option value="fixed">Nominal (Rp)</option>
            </select>
          </div>
          <Input label="Nilai Diskon" type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Min. Pembelian" type="number" value={form.min_purchase} onChange={(e) => setForm({ ...form, min_purchase: e.target.value })} helperText="Kosongkan jika tidak ada" />
          <Input label="Max. Penggunaan" type="number" value={form.usage_limit} onChange={(e) => setForm({ ...form, usage_limit: e.target.value })} helperText="Kosongkan jika tidak terbatas" />
        </div>
        <Input label="Berlaku Hingga" type="date" value={form.valid_until} onChange={(e) => setForm({ ...form, valid_until: e.target.value })} />
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="w-4 h-4 rounded border-zinc-300 text-zinc-900 focus:ring-0" />
          <span className="text-sm text-zinc-700">Voucher aktif</span>
        </label>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>Batal</Button>
          <Button type="submit" loading={saving}>{mode === 'create' ? 'Simpan' : 'Perbarui'}</Button>
        </div>
      </form>
    </Modal>
  )
}
