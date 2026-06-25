import { useState, useEffect } from 'react'
import { Plus, PencilSimple, TrashSimple } from '@phosphor-icons/react'
import toast from 'react-hot-toast'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import api from '../../api/client'

export default function Categories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState({ open: false, mode: 'create', category: null })

  const fetchCategories = async () => {
    try {
      const res = await api.get('/products/categories/')
      setCategories(res.data.results || res.data.data || [])
    } catch {} finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCategories() }, [])

  const handleDelete = async (id) => {
    if (!confirm('Hapus kategori ini?')) return
    try {
      await api.delete(`/products/categories/${id}/`)
      toast.success('Kategori dihapus')
      fetchCategories()
    } catch {
      toast.error('Gagal menghapus kategori')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Kategori</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Kelola kategori produk</p>
        </div>
        <Button onClick={() => setModal({ open: true, mode: 'create', category: null })}>
          <Plus size={16} weight="bold" />
          Tambah Kategori
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-zinc-100 animate-pulse" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="rounded-2xl border border-zinc-100 bg-white p-12 text-center">
          <p className="text-zinc-400 text-sm">Belum ada kategori</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {categories.map((cat) => (
            <div key={cat.id} className="rounded-2xl border border-zinc-100 bg-white p-5 flex items-center justify-between group">
              <div>
                <p className="font-medium text-zinc-900">{cat.name}</p>
                {cat.description && (
                  <p className="text-xs text-zinc-400 mt-0.5">{cat.description}</p>
                )}
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setModal({ open: true, mode: 'edit', category: cat })}
                  className="p-2 rounded-lg hover:bg-zinc-100"
                >
                  <PencilSimple size={15} className="text-zinc-500" />
                </button>
                <button
                  onClick={() => handleDelete(cat.id)}
                  className="p-2 rounded-lg hover:bg-red-50"
                >
                  <TrashSimple size={15} className="text-red-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <CategoryModal
        isOpen={modal.open}
        mode={modal.mode}
        category={modal.category}
        onClose={() => setModal({ open: false, mode: 'create', category: null })}
        onSaved={fetchCategories}
      />
    </div>
  )
}

function CategoryModal({ isOpen, mode, category, onClose, onSaved }) {
  const [form, setForm] = useState({ name: '', description: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (category) {
      setForm({ name: category.name || '', description: category.description || '' })
    } else {
      setForm({ name: '', description: '' })
    }
  }, [category])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (mode === 'create') {
        await api.post('/products/categories/', form)
        toast.success('Kategori ditambahkan')
      } else {
        await api.put(`/products/categories/${category.id}/`, form)
        toast.success('Kategori diperbarui')
      }
      onSaved()
      onClose()
    } catch {
      toast.error('Gagal menyimpan kategori')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={mode === 'create' ? 'Tambah Kategori' : 'Edit Kategori'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Nama Kategori" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <Input label="Deskripsi" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
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
