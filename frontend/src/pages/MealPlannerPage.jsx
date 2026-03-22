import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import api from '../utils/api'
import toast from 'react-hot-toast'
import { FiPlus, FiTrash2, FiSave } from 'react-icons/fi'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack']
const DAY_EMOJIS = { Monday: '🌅', Tuesday: '☀️', Wednesday: '🌤️', Thursday: '⛅', Friday: '🎉', Saturday: '🌟', Sunday: '😴' }

const emptyPlan = () => DAYS.map(day => ({ day, meals: [] }))

export default function MealPlannerPage() {
  const [plan, setPlan] = useState(emptyPlan())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [addModal, setAddModal] = useState(null) // { dayIndex, type }
  const [newMeal, setNewMeal] = useState({ type: 'Breakfast', recipeName: '' })

  useEffect(() => {
    api.get('/user/meal-plan')
      .then(({ data }) => {
        if (data.mealPlan?.length > 0) {
          const merged = DAYS.map(day => {
            const found = data.mealPlan.find(d => d.day === day)
            return found || { day, meals: [] }
          })
          setPlan(merged)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.put('/user/meal-plan', { mealPlan: plan })
      toast.success('Meal plan saved!')
    } catch { toast.error('Failed to save') }
    finally { setSaving(false) }
  }

  const handleAddMeal = () => {
    if (!newMeal.recipeName.trim()) return
    const updated = plan.map((day, i) => {
      if (i !== addModal.dayIndex) return day
      return { ...day, meals: [...day.meals, { type: newMeal.type, recipeName: newMeal.recipeName.trim() }] }
    })
    setPlan(updated)
    setAddModal(null)
    setNewMeal({ type: 'Breakfast', recipeName: '' })
  }

  const handleRemoveMeal = (dayIndex, mealIndex) => {
    setPlan(plan.map((day, i) => {
      if (i !== dayIndex) return day
      return { ...day, meals: day.meals.filter((_, mi) => mi !== mealIndex) }
    }))
  }

  const handleClearDay = (dayIndex) => {
    setPlan(plan.map((day, i) => i === dayIndex ? { ...day, meals: [] } : day))
  }

  const totalMeals = plan.reduce((acc, d) => acc + d.meals.length, 0)

  if (loading) return (
    <div className="page-container text-center py-20">
      <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto" />
    </div>
  )

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">📅 Meal Planner</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{totalMeals} meals planned this week</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setPlan(emptyPlan())} className="btn-secondary text-sm">
            🗑 Clear Week
          </button>
          <button onClick={handleSave} disabled={saving} className="btn-primary text-sm flex items-center gap-1.5">
            <FiSave size={14} /> {saving ? 'Saving...' : 'Save Plan'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {plan.map((dayPlan, dayIndex) => (
          <motion.div key={dayPlan.day} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: dayIndex * 0.05 }}
            className="card p-4 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                <span>{DAY_EMOJIS[dayPlan.day]}</span> {dayPlan.day}
              </h3>
              {dayPlan.meals.length > 0 && (
                <button onClick={() => handleClearDay(dayIndex)}
                  className="text-xs text-gray-400 hover:text-red-400 transition-colors">clear</button>
              )}
            </div>

            <div className="flex-1 space-y-2 min-h-[80px]">
              {dayPlan.meals.length === 0 ? (
                <p className="text-xs text-gray-400 dark:text-gray-500 italic py-4 text-center">No meals planned</p>
              ) : dayPlan.meals.map((meal, mealIndex) => (
                <div key={mealIndex} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700/50 rounded-xl px-3 py-2 group">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-primary-500">{meal.type}</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 truncate">{meal.recipeName}</p>
                  </div>
                  <button onClick={() => handleRemoveMeal(dayIndex, mealIndex)}
                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-400 transition-all flex-shrink-0">
                    <FiTrash2 size={13} />
                  </button>
                </div>
              ))}
            </div>

            <button onClick={() => setAddModal({ dayIndex })}
              className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-dashed border-gray-200 dark:border-gray-600 text-gray-400 dark:text-gray-500 hover:border-primary-300 hover:text-primary-500 text-sm transition-colors">
              <FiPlus size={14} /> Add meal
            </button>
          </motion.div>
        ))}
      </div>

      {/* Weekly summary */}
      <div className="mt-8 card p-5">
        <h2 className="font-bold text-gray-800 dark:text-gray-200 mb-4">📊 Weekly Summary</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {MEAL_TYPES.map(type => {
            const count = plan.reduce((acc, d) => acc + d.meals.filter(m => m.type === type).length, 0)
            return (
              <div key={type} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 text-center">
                <p className="text-2xl font-extrabold text-primary-500">{count}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{type}s</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Add Meal Modal */}
      {addModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setAddModal(null)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            onClick={e => e.stopPropagation()}
            className="card p-6 w-full max-w-sm shadow-2xl">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Add meal for {plan[addModal.dayIndex]?.day}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Meal Type</label>
                <select value={newMeal.type} onChange={e => setNewMeal({ ...newMeal, type: e.target.value })} className="input-field">
                  {MEAL_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Recipe / Meal Name</label>
                <input type="text" autoFocus value={newMeal.recipeName}
                  onChange={e => setNewMeal({ ...newMeal, recipeName: e.target.value })}
                  onKeyDown={e => e.key === 'Enter' && handleAddMeal()}
                  placeholder="e.g. Dal Makhani" className="input-field" />
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={() => setAddModal(null)} className="btn-secondary flex-1">Cancel</button>
                <button onClick={handleAddMeal} className="btn-primary flex-1">Add</button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
