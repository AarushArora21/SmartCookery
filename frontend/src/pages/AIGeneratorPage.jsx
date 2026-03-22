import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../utils/api'
import toast from 'react-hot-toast'
import { FiPlus, FiX, FiCpu, FiArrowRight } from 'react-icons/fi'
import { formatTime } from '../utils/helpers'

export default function AIGeneratorPage() {
  const navigate = useNavigate()
  const [ingredients, setIngredients] = useState([])
  const [input, setInput] = useState('')
  const [preferences, setPreferences] = useState('')
  const [loading, setLoading] = useState(false)
  const [recipe, setRecipe] = useState(null)

  const addIngredient = () => {
    const val = input.trim()
    if (!val || ingredients.includes(val)) return
    setIngredients([...ingredients, val])
    setInput('')
  }

  const removeIngredient = (ing) => setIngredients(ingredients.filter(i => i !== ing))

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); addIngredient() }
  }

  const generate = async () => {
    if (ingredients.length === 0) { toast.error('Add at least one ingredient'); return }
    setLoading(true)
    setRecipe(null)
    try {
      const { data } = await api.post('/ai/generate', { ingredients, preferences })
      setRecipe(data.recipe)
      if (data.note) toast(data.note, { icon: 'ℹ️' })
    } catch {
      toast.error('Failed to generate recipe. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const SUGGESTED = ['Potato', 'Onion', 'Tomato', 'Garlic', 'Rice', 'Chicken', 'Eggs', 'Paneer', 'Spinach', 'Lentils']

  return (
    <div className="page-container max-w-3xl">
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-3xl flex items-center justify-center text-white text-3xl mx-auto mb-4 shadow-lg">
          🤖
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">AI Recipe Generator</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Tell me what ingredients you have and I'll create a recipe for you</p>
      </div>

      <div className="card p-6 mb-6">
        {/* Input */}
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Your ingredients
        </label>
        <div className="flex gap-2 mb-3">
          <input
            type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown}
            placeholder="Type an ingredient and press Enter..."
            className="input-field flex-1" />
          <button onClick={addIngredient} className="btn-primary px-4 flex items-center gap-1">
            <FiPlus /> Add
          </button>
        </div>

        {/* Suggestions */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          <span className="text-xs text-gray-400 self-center mr-1">Quick add:</span>
          {SUGGESTED.filter(s => !ingredients.includes(s)).map(s => (
            <button key={s} onClick={() => setIngredients([...ingredients, s])}
              className="px-2.5 py-1 text-xs rounded-full border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-primary-300 hover:text-primary-500 transition-colors">
              + {s}
            </button>
          ))}
        </div>

        {/* Ingredient chips */}
        {ingredients.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            {ingredients.map(ing => (
              <motion.span key={ing} initial={{ scale: 0 }} animate={{ scale: 1 }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium">
                {ing}
                <button onClick={() => removeIngredient(ing)} className="hover:text-red-500 transition-colors">
                  <FiX size={13} />
                </button>
              </motion.span>
            ))}
          </div>
        )}

        {/* Preferences */}
        <div className="mb-5">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Preferences (optional)
          </label>
          <input type="text" value={preferences} onChange={e => setPreferences(e.target.value)}
            placeholder="e.g. make it spicy, low calorie, no garlic..."
            className="input-field" />
        </div>

        <button onClick={generate} disabled={loading || ingredients.length === 0}
          className="btn-primary w-full py-3 text-base flex items-center justify-center gap-2">
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Generating your recipe...
            </>
          ) : (
            <><FiCpu /> Generate Recipe</>
          )}
        </button>
      </div>

      {/* Loading animation */}
      {loading && (
        <div className="text-center py-12">
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
            className="text-5xl inline-block mb-4">🍳</motion.div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Our AI chef is crafting your recipe...</p>
        </div>
      )}

      {/* Generated Recipe */}
      <AnimatePresence>
        {recipe && !loading && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="card overflow-hidden">
            <div className="bg-gradient-to-br from-primary-500 to-orange-600 p-6 text-white">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-orange-100 text-sm mb-1">✨ AI Generated Recipe</p>
                  <h2 className="text-2xl font-extrabold">{recipe.title}</h2>
                  {recipe.description && <p className="text-orange-100 text-sm mt-2 line-clamp-2">{recipe.description}</p>}
                </div>
              </div>
              <div className="flex flex-wrap gap-4 mt-4 text-sm">
                <span>⏱ {formatTime(recipe.cookingTime)}</span>
                <span>👥 {recipe.servings} servings</span>
                <span>📊 {recipe.difficulty}</span>
                <span className="capitalize">🥗 {recipe.dietType}</span>
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Ingredients */}
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-3">🧂 Ingredients</h3>
                <ul className="space-y-2">
                  {recipe.ingredients?.map((ing, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-400 flex-shrink-0" />
                      <span className="font-medium capitalize">{ing.name}</span>
                      <span className="text-gray-400 ml-auto">{ing.quantity} {ing.unit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Nutrition */}
              {recipe.nutrition && (
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-3">📊 Nutrition</h3>
                  <div className="space-y-2">
                    {[['Calories', recipe.nutrition.calories, 'kcal'], ['Protein', recipe.nutrition.protein, 'g'], ['Carbs', recipe.nutrition.carbs, 'g'], ['Fat', recipe.nutrition.fat, 'g']].map(([l, v, u]) => (
                      <div key={l} className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">{l}</span>
                        <span className="font-medium text-gray-800 dark:text-gray-200">{v}{u}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Steps */}
            <div className="px-6 pb-6">
              <h3 className="font-bold text-gray-900 dark:text-white mb-3">👨‍🍳 Instructions</h3>
              <div className="space-y-3">
                {recipe.steps?.map((step, i) => (
                  <div key={i} className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-300 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{step.instruction}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Tags */}
            {recipe.tags?.length > 0 && (
              <div className="px-6 pb-4 flex flex-wrap gap-1.5">
                {recipe.tags.map(t => (
                  <span key={t} className="px-2.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-full text-xs">#{t}</span>
                ))}
              </div>
            )}

            {/* CTA */}
            <div className="px-6 pb-6 flex gap-3">
              <button onClick={generate} className="btn-secondary flex-1 text-sm">
                🔄 Generate Another
              </button>
              <button
                onClick={() => toast('Save this recipe using Add Recipe page and paste the details!')}
                className="btn-primary flex-1 text-sm flex items-center justify-center gap-1">
                Save Recipe <FiArrowRight size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
