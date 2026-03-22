import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { createRecipe, updateRecipe } from '../../redux/slices/recipeSlice'
import { CATEGORIES, DIET_TYPES, DIFFICULTIES, CUISINES, PLACEHOLDER_IMG } from '../../utils/helpers'
import { FiPlus, FiTrash2, FiUpload } from 'react-icons/fi'

const EMPTY_INGREDIENT = { name: '', quantity: '', unit: '' }
const EMPTY_STEP = { stepNumber: 1, instruction: '', duration: 0 }

export default function RecipeForm({ initialData = null }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const isEdit = !!initialData

  const [form, setForm] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    category: initialData?.category || 'Dinner',
    cuisine: initialData?.cuisine || 'Indian',
    dietType: initialData?.dietType || 'veg',
    difficulty: initialData?.difficulty || 'Easy',
    cookingTime: initialData?.cookingTime || 30,
    servings: initialData?.servings || 2,
    tags: initialData?.tags?.join(', ') || '',
  })
  const [ingredients, setIngredients] = useState(
    initialData?.ingredients?.length ? initialData.ingredients : [{ ...EMPTY_INGREDIENT }]
  )
  const [steps, setSteps] = useState(
    initialData?.steps?.length ? initialData.steps : [{ ...EMPTY_STEP }]
  )
  const [nutrition, setNutrition] = useState(initialData?.nutrition || { calories: '', protein: '', carbs: '', fat: '', fiber: '' })
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(initialData?.image || null)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(0) // multi-step form

  const STEPS = ['Basic Info', 'Ingredients', 'Instructions', 'Nutrition & Image']

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImage(file)
    setPreview(URL.createObjectURL(file))
  }

  const addIngredient = () => setIngredients([...ingredients, { ...EMPTY_INGREDIENT }])
  const removeIngredient = (i) => setIngredients(ingredients.filter((_, idx) => idx !== i))
  const setIng = (i, k, v) => setIngredients(ingredients.map((ing, idx) => idx === i ? { ...ing, [k]: v } : ing))

  const addStep = () => setSteps([...steps, { stepNumber: steps.length + 1, instruction: '', duration: 0 }])
  const removeStep = (i) => setSteps(steps.filter((_, idx) => idx !== i).map((s, idx) => ({ ...s, stepNumber: idx + 1 })))
  const setStepData = (i, k, v) => setSteps(steps.map((s, idx) => idx === i ? { ...s, [k]: v } : s))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const fd = new FormData()
    Object.entries(form).forEach(([k, v]) => fd.append(k, v))
    fd.append('ingredients', JSON.stringify(ingredients.filter(i => i.name)))
    fd.append('steps', JSON.stringify(steps.filter(s => s.instruction)))
    fd.append('nutrition', JSON.stringify(nutrition))
    const tagsArray = form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : []
    fd.append('tags', JSON.stringify(tagsArray))
    if (image) fd.append('image', image)

    let result
    if (isEdit) {
      result = await dispatch(updateRecipe({ id: initialData._id, formData: fd }))
    } else {
      result = await dispatch(createRecipe(fd))
    }

    setLoading(false)
    if (createRecipe.fulfilled.match(result) || updateRecipe.fulfilled.match(result)) {
      navigate(`/recipe/${result.payload._id}`)
    }
  }

  const inputClass = "input-field"
  const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"

  return (
    <div className="page-container max-w-3xl">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
        {isEdit ? '✏️ Edit Recipe' : '🍳 Add New Recipe'}
      </h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">Share your culinary creation with the world</p>

      {/* Step Tabs */}
      <div className="flex gap-1 mb-8 bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl">
        {STEPS.map((s, i) => (
          <button key={s} onClick={() => setStep(i)}
            className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-medium transition-all ${step === i ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
            <span className="hidden sm:inline">{s}</span>
            <span className="sm:hidden">{i + 1}</span>
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="basic" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
              <div>
                <label className={labelClass}>Recipe Title *</label>
                <input type="text" required value={form.title} onChange={set('title')}
                  placeholder="e.g. Creamy Butter Chicken" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Description</label>
                <textarea rows={3} value={form.description} onChange={set('description')}
                  placeholder="Brief description of your recipe..." className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Category *</label>
                  <select value={form.category} onChange={set('category')} className={inputClass}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Cuisine</label>
                  <select value={form.cuisine} onChange={set('cuisine')} className={inputClass}>
                    {CUISINES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>Diet Type *</label>
                  <select value={form.dietType} onChange={set('dietType')} className={inputClass}>
                    {DIET_TYPES.map(d => <option key={d} value={d} className="capitalize">{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Difficulty</label>
                  <select value={form.difficulty} onChange={set('difficulty')} className={inputClass}>
                    {DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Servings</label>
                  <input type="number" min={1} max={50} value={form.servings} onChange={set('servings')} className={inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Cooking Time (minutes) *</label>
                <input type="number" min={1} required value={form.cookingTime} onChange={set('cookingTime')} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Tags (comma separated)</label>
                <input type="text" value={form.tags} onChange={set('tags')}
                  placeholder="e.g. quick, healthy, spicy" className={inputClass} />
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="ingredients" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="space-y-3 mb-4">
                {ingredients.map((ing, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input placeholder="Ingredient name" value={ing.name} onChange={e => setIng(i, 'name', e.target.value)}
                      className={`${inputClass} flex-1`} />
                    <input placeholder="Qty" value={ing.quantity} onChange={e => setIng(i, 'quantity', e.target.value)}
                      className={`${inputClass} w-20`} />
                    <input placeholder="Unit" value={ing.unit} onChange={e => setIng(i, 'unit', e.target.value)}
                      className={`${inputClass} w-20`} />
                    {ingredients.length > 1 && (
                      <button type="button" onClick={() => removeIngredient(i)}
                        className="p-2 text-red-400 hover:text-red-600 flex-shrink-0">
                        <FiTrash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button type="button" onClick={addIngredient}
                className="flex items-center gap-2 text-primary-500 hover:text-primary-600 text-sm font-medium">
                <FiPlus /> Add Ingredient
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="steps" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="space-y-4 mb-4">
                {steps.map((s, i) => (
                  <div key={i} className="card p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-300 text-sm font-bold flex items-center justify-center flex-shrink-0">
                        {i + 1}
                      </span>
                      <input type="number" min={0} value={s.duration} onChange={e => setStepData(i, 'duration', e.target.value)}
                        className={`${inputClass} w-24`} placeholder="Duration (min)" />
                      {steps.length > 1 && (
                        <button type="button" onClick={() => removeStep(i)} className="ml-auto text-red-400 hover:text-red-600">
                          <FiTrash2 size={16} />
                        </button>
                      )}
                    </div>
                    <textarea rows={2} value={s.instruction} onChange={e => setStepData(i, 'instruction', e.target.value)}
                      placeholder={`Describe step ${i + 1}...`} className={inputClass} />
                  </div>
                ))}
              </div>
              <button type="button" onClick={addStep}
                className="flex items-center gap-2 text-primary-500 hover:text-primary-600 text-sm font-medium">
                <FiPlus /> Add Step
              </button>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="nutrition" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              {/* Image Upload */}
              <div>
                <label className={labelClass}>Recipe Photo</label>
                <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden">
                  {preview ? (
                    <div className="relative">
                      <img src={preview} alt="preview" className="w-full h-56 object-cover" />
                      <button type="button" onClick={() => { setImage(null); setPreview(null) }}
                        className="absolute top-3 right-3 bg-white/90 p-2 rounded-xl text-red-500 hover:bg-white shadow-sm">
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center h-40 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <FiUpload size={32} className="text-gray-300 mb-2" />
                      <p className="text-sm text-gray-400">Click to upload photo</p>
                      <p className="text-xs text-gray-300 mt-1">JPG, PNG, WebP — max 5MB</p>
                      <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </label>
                  )}
                </div>
              </div>

              {/* Nutrition */}
              <div>
                <label className={labelClass}>Nutrition Info (optional, per serving)</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[['calories', 'Calories (kcal)'], ['protein', 'Protein (g)'], ['carbs', 'Carbs (g)'], ['fat', 'Fat (g)'], ['fiber', 'Fiber (g)']].map(([k, label]) => (
                    <div key={k}>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</label>
                      <input type="number" min={0} value={nutrition[k]} onChange={e => setNutrition({ ...nutrition, [k]: e.target.value })}
                        placeholder="0" className={inputClass} />
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Nav Buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
          <button type="button" onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0} className="btn-secondary disabled:opacity-40">
            ← Back
          </button>
          {step < 3 ? (
            <button type="button" onClick={() => setStep(step + 1)} className="btn-primary">
              Next →
            </button>
          ) : (
            <button type="submit" disabled={loading} className="btn-primary min-w-[160px]">
              {loading ? 'Saving...' : isEdit ? '✅ Update Recipe' : '🚀 Publish Recipe'}
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
