// frontend/src/pages/CollectionsPage.jsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../utils/api'
import toast from 'react-hot-toast'
import { FiPlus, FiTrash2, FiLock, FiGlobe } from 'react-icons/fi'

const EMOJIS = ['📁', '🍕', '🥗', '🍜', '🍰', '🥘', '🍱', '🌮', '🥙', '🍛', '🥞', '🍝']

export default function CollectionsPage() {
  const [collections, setCollections] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', emoji: '📁', isPublic: false })
  const [saving, setSaving] = useState(false)

  const fetchCollections = async () => {
    try {
      const { data } = await api.get('/collections')
      setCollections(data.collections)
    } catch { toast.error('Failed to load collections') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchCollections() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    setSaving(true)
    try {
      const { data } = await api.post('/collections', form)
      setCollections([data.collection, ...collections])
      setShowForm(false)
      setForm({ name: '', description: '', emoji: '📁', isPublic: false })
      toast.success('Collection created!')
    } catch { toast.error('Failed to create') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this collection?')) return
    try {
      await api.delete(`/collections/${id}`)
      setCollections(collections.filter(c => c._id !== id))
      toast.success('Deleted')
    } catch { toast.error('Failed to delete') }
  }

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">📚 My Collections</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Organise your saved recipes into folders</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <FiPlus /> New Collection
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {[1,2,3].map(i => <div key={i} className="skeleton h-40 rounded-2xl" />)}
        </div>
      ) : collections.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-6xl mb-4">📁</p>
          <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">No collections yet</h3>
          <p className="text-gray-500 mb-6">Create folders to organise your saved recipes</p>
          <button onClick={() => setShowForm(true)} className="btn-primary">Create First Collection</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {collections.map((col, i) => (
            <motion.div key={col._id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }} className="group">
              <div className="card p-5 hover:shadow-lg transition-all hover:-translate-y-1">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-4xl">{col.emoji}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">
                      {col.isPublic ? <FiGlobe size={14} /> : <FiLock size={14} />}
                    </span>
                    <button onClick={() => handleDelete(col._id)}
                      className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all">
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white text-lg">{col.name}</h3>
                {col.description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{col.description}</p>
                )}
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {col.recipes?.slice(0, 4).map((r, idx) => (
                      r.image ? (
                        <img key={idx} src={r.image} className="w-8 h-8 rounded-full object-cover border-2 border-white dark:border-gray-800" alt="" />
                      ) : (
                        <div key={idx} className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 border-2 border-white dark:border-gray-800 flex items-center justify-center text-xs">🍽️</div>
                      )
                    ))}
                  </div>
                  <span className="text-xs text-gray-400">{col.recipes?.length || 0} recipes</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Collection Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowForm(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="card p-6 w-full max-w-md shadow-2xl">
              <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-5">New Collection</h3>
              <form onSubmit={handleCreate} className="space-y-4">
                {/* Emoji Picker */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Icon</label>
                  <div className="flex flex-wrap gap-2">
                    {EMOJIS.map(e => (
                      <button key={e} type="button" onClick={() => setForm({ ...form, emoji: e })}
                        className={`w-10 h-10 rounded-xl text-xl transition-all ${form.emoji === e ? 'bg-primary-100 dark:bg-primary-900 ring-2 ring-primary-400 scale-110' : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
                        {e}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Name *</label>
                  <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Quick Weekday Meals" className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
                  <input type="text" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                    placeholder="Optional description" className="input-field" />
                </div>
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="public" checked={form.isPublic}
                    onChange={e => setForm({ ...form, isPublic: e.target.checked })}
                    className="w-4 h-4 accent-primary-500" />
                  <label htmlFor="public" className="text-sm text-gray-700 dark:text-gray-300">
                    Make this collection public
                  </label>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
                  <button type="submit" disabled={saving} className="btn-primary flex-1">
                    {saving ? 'Creating...' : 'Create Collection'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}