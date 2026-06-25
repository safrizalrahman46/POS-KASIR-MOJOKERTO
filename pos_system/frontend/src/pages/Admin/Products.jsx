import { useState, useEffect } from 'react'
import { Plus, PencilSimple, TrashSimple, MagnifyingGlass } from '@phosphor-icons/react'
import toast from 'react-hot-toast'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import Badge from '../../components/ui/Badge'
import api from '../../api/client'

export default function Products() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState({ open: false, mode: 'create', product: null })

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products/')
      setProducts(res.data.results || res.data.data || [])
    } catch {} finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const res = await api.get('/products/categories/')
      setCategories(res.data.results || res.data.data || [])
    } catch {}
  }

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  const handleDelete = async (id) => {
    if (!confirm('Hapus produk ini?')) return
    try {
      await api.delete(`/products/${id}/`)
      toast.success('Produk dihapus')
      fetchProducts()
    } catch {
      toast.error('Gagal menghapus produk')
    }
  }

  const filtered = products.filter((p) =>
    p.name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Produk</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Kelola daftar produk toko</p>
        </div>
        <Button onClick={() => setModal({ open: true, mode: 'create', product: null })}>
          <Plus size={16} weight="bold" />
          Tambah Produk
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            className="w-full rounded-xl border border-zinc-200 bg-white pl-9 pr-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none"
            placeholder="Cari produk..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-zinc-100 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-zinc-100 bg-white p-12 text-center">
          <p className="text-zinc-400 text-sm">Belum ada produk</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-zinc-100 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100">
                <th className="text-left px-5 py-3 font-medium text-zinc-400 text-xs uppercase tracking-wider">Nama</th>
                <th className="text-left px-5 py-3 font-medium text-zinc-400 text-xs uppercase tracking-wider">Kategori</th>
                <th className="text-right px-5 py-3 font-medium text-zinc-400 text-xs uppercase tracking-wider">Harga</th>
                <th className="text-right px-5 py-3 font-medium text-zinc-400 text-xs uppercase tracking-wider">Stok</th>
                <th className="text-center px-5 py-3 font-medium text-zinc-400 text-xs uppercase tracking-wider">Status</th>
                <th className="text-right px-5 py-3 font-medium text-zinc-400 text-xs uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-zinc-50 hover:bg-zinc-50/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-zinc-900">{p.name}</p>
                    {p.sku && <p className="text-xs text-zinc-400">{p.sku}</p>}
                  </td>
                  <td className="px-5 py-3.5 text-zinc-600">{p.category?.name || '-'}</td>
                  <td className="px-5 py-3.5 text-right font-medium text-zinc-900">Rp {(p.price || 0).toLocaleString()}</td>
                  <td className="px-5 py-3.5 text-right text-zinc-600">{p.stock ?? 0}</td>
                  <td className="px-5 py-3.5 text-center">
                    <Badge variant={p.is_active ? 'success' : 'default'}>
                      {p.is_active ? 'Aktif' : 'Nonaktif'}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setModal({ open: true, mode: 'edit', product: p })}
                        className="p-2 rounded-lg hover:bg-zinc-100 transition-colors"
                      >
                        <PencilSimple size={15} className="text-zinc-500" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <TrashSimple size={15} className="text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ProductModal
        isOpen={modal.open}
        mode={modal.mode}
        product={modal.product}
        categories={categories}
        onClose={() => setModal({ open: false, mode: 'create', product: null })}
        onSaved={fetchProducts}
      />
    </div>
  )
}

function ProductModal({ isOpen, mode, product, categories, onClose, onSaved }) {
  const [form, setForm] = useState({ name: '', price: '', stock: '', category_id: '', sku: '', is_active: true })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name || '',
        price: product.price?.toString() || '',
        stock: product.stock?.toString() || '',
        category_id: product.category_id?.toString() || '',
        sku: product.sku || '',
        is_active: product.is_active ?? true,
      })
    } else {
      setForm({ name: '', price: '', stock: '', category_id: '', sku: '', is_active: true })
    }
  }, [product])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = { ...form, price: parseFloat(form.price), stock: parseInt(form.stock) || 0 }
      if (mode === 'create') {
        await api.post('/products/', payload)
        toast.success('Produk ditambahkan')
      } else {
        await api.put(`/products/${product.id}/`, payload)
        toast.success('Produk diperbarui')
      }
      onSaved()
      onClose()
    } catch {
      toast.error('Gagal menyimpan produk')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={mode === 'create' ? 'Tambah Produk' : 'Edit Produk'} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Nama Produk" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Harga" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
          <Input label="Stok" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider">Kategori</label>
            <select
              value={form.category_id}
              onChange={(e) => setForm({ ...form, category_id: e.target.value })}
              className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-zinc-400 focus:outline-none"
            >
              <option value="">Pilih kategori</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <Input label="SKU" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
        </div>
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
            className="w-4 h-4 rounded border-zinc-300 text-zinc-900 focus:ring-0"
          />
          <span className="text-sm text-zinc-700">Produk aktif</span>
        </label>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>Batal</Button>
          <Button type="submit" loading={saving}>
            {mode === 'create' ? 'Simpan' : 'Perbarui'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
