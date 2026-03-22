import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../utils/api'
import toast from 'react-hot-toast'
import { FiPlus, FiTrash2, FiCheckSquare, FiSquare, FiSave } from 'react-icons/fi'

export default function GroceryListPage() {
  const [list, setList] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.get('/user/grocery-list')
      .then(({ data }) => setList(data.groceryList || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const addItem = () => {
    const val = input.trim()
    if (!val) return
    setList([...list, { item: val, checked: false }])
    setInput('')
  }

  const toggle = (i) => setList(list.map((item, idx) => idx === i ? { ...item, checked: !item.checked } : item))
  const remove = (i) => setList(list.filter((_, idx) => idx !== i))
  const clearChecked = () => setList(list.filter(i => !i.checked))

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.put('/user/grocery-list', { groceryList: list })
      toast.success('Grocery list saved!')
    } catch { toast.error('Failed to save') }
    finally { setSaving(false) }
  }

  const checkedCount = list.filter(i => i.checked).length
  const total = list.length

  if (loading) return (
    <div className="page-container text-center py-20">
      <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto" />
    </div>
  )

  return (
    <div className="page-container max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">🛒 Grocery List</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {checkedCount} of {total} items done
          </p>
        </div>
        <div className="flex gap-2">
          {checkedCount > 0 && (
            <button onClick={clearChecked} className="btn-secondary text-sm text-red-500">
              🗑 Remove done
            </button>
          )}
          <button onClick={handleSave} disabled={saving} className="btn-primary text-sm flex items-center gap-1.5">
            <FiSave size={14} /> {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Progress bar */}
      {total > 0 && (
        <div className="mb-6">
          <div className="flex justify-between text-xs text-gray-400 mb-1.5">
            <span>{checkedCount} checked</span>
            <span>{Math.round((checkedCount / total) * 100)}%</span>
          </div>
          <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full"
              animate={{ width: `${(checkedCount / total) * 100}%` }}
              transition={{ type: 'spring', stiffness: 60 }}
            />
          </div>
        </div>
      )}

      {/* Add Item */}
      <div className="flex gap-2 mb-6">
        <input type="text" value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addItem()}
          placeholder="Add grocery item... (press Enter)" className="input-field flex-1" />
        <button onClick={addItem} className="btn-primary px-4 flex items-center gap-1">
          <FiPlus /> Add
        </button>
      </div>

      {/* List */}
      {list.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">🛒</p>
          <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">Your list is empty</h3>
          <p className="text-gray-500">Add items above to start your grocery list</p>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Unchecked */}
          <AnimatePresence>
            {list.map((item, i) => !item.checked && (
              <motion.div key={`${item.item}-${i}`}
                initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}
                className="card flex items-center gap-3 px-4 py-3 group">
                <button onClick={() => toggle(i)} className="text-gray-300 dark:text-gray-600 hover:text-primary-500 transition-colors flex-shrink-0">
                  <FiSquare size={20} />
                </button>
                <span className="flex-1 text-gray-800 dark:text-gray-200">{item.item}</span>
                <button onClick={() => remove(i)}
                  className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all">
                  <FiTrash2 size={16} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Checked items */}
          {checkedCount > 0 && (
            <div className="pt-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Done ({checkedCount})</p>
              <AnimatePresence>
                {list.map((item, i) => item.checked && (
                  <motion.div key={`checked-${item.item}-${i}`}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl group opacity-60">
                    <button onClick={() => toggle(i)} className="text-primary-400 flex-shrink-0">
                      <FiCheckSquare size={20} />
                    </button>
                    <span className="flex-1 text-gray-400 dark:text-gray-500 line-through">{item.item}</span>
                    <button onClick={() => remove(i)}
                      className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all">
                      <FiTrash2 size={16} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
