// SubstitutionFinder.jsx
// Place in: frontend/src/components/recipe/SubstitutionFinder.jsx

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../../utils/api'
import { FiSearch, FiX } from 'react-icons/fi'

// Rule-based substitutions (works without API)
const SUBSTITUTIONS = {
  'cream': ['coconut cream', 'full-fat milk + butter', 'Greek yogurt', 'cashew cream'],
  'butter': ['coconut oil', 'olive oil', 'ghee', 'margarine'],
  'egg': ['1 tbsp flaxseed + 3 tbsp water', 'banana (mashed)', 'unsweetened applesauce', 'silken tofu'],
  'milk': ['oat milk', 'almond milk', 'coconut milk', 'soy milk'],
  'flour': ['almond flour', 'oat flour', 'rice flour', 'cornstarch (for thickening)'],
  'sugar': ['honey (¾ cup per 1 cup sugar)', 'maple syrup', 'jaggery', 'stevia'],
  'paneer': ['tofu (firm)', 'halloumi', 'cottage cheese'],
  'yogurt': ['sour cream', 'coconut yogurt', 'buttermilk'],
  'lemon juice': ['lime juice', 'white vinegar (half quantity)', 'tamarind water'],
  'olive oil': ['sunflower oil', 'vegetable oil', 'avocado oil'],
  'garlic': ['garlic powder (⅛ tsp per clove)', 'asafoetida (pinch)', 'shallots'],
  'onion': ['shallots', 'leeks', 'onion powder', 'spring onions'],
  'tomato': ['tomato paste (diluted)', 'canned tomatoes', 'red bell pepper'],
  'chicken': ['tofu', 'paneer', 'chickpeas', 'jackfruit (for texture)'],
  'beef': ['mushrooms', 'lentils', 'lamb', 'pork'],
  'cornstarch': ['arrowroot powder', 'tapioca starch', 'all-purpose flour (2x quantity)'],
  'baking powder': ['½ tsp baking soda + ½ tsp cream of tartar'],
  'heavy cream': ['evaporated milk', 'coconut cream', 'milk + butter'],
  'sour cream': ['Greek yogurt', 'crème fraîche', 'cream cheese (thinned)'],
  'breadcrumbs': ['crushed crackers', 'oats', 'crushed cornflakes'],
}

export default function SubstitutionFinder({ ingredients }) {
  const [selected, setSelected] = useState('')
  const [custom, setCustom] = useState('')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)

  const findSubstitution = async (ingredient) => {
    const query = ingredient.toLowerCase().trim()
    setLoading(true)
    setResults(null)

    // Check rule-based first
    const match = Object.keys(SUBSTITUTIONS).find(key =>
      query.includes(key) || key.includes(query)
    )

    if (match) {
      setResults({
        ingredient: match,
        substitutes: SUBSTITUTIONS[match],
        source: 'local'
      })
      setLoading(false)
      return
    }

    // Try AI fallback
    try {
      const { data } = await api.post('/ai/substitute', { ingredient: query })
      setResults({ ingredient: query, substitutes: data.substitutes, source: 'ai' })
    } catch {
      setResults({
        ingredient: query,
        substitutes: ['No substitution found. Try a different search.'],
        source: 'none'
      })
    }
    setLoading(false)
  }

  return (
    <div className="card p-5">
      <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">
        🔄 Ingredient Substitutions
      </h3>
      <p className="text-xs text-gray-400 mb-3">Don't have an ingredient? Find what you can use instead.</p>

      {/* Quick pick from recipe ingredients */}
      {ingredients?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {ingredients.slice(0, 6).map((ing, i) => (
            <button
              key={i}
              onClick={() => { setSelected(ing.name); findSubstitution(ing.name) }}
              className={`px-2.5 py-1 rounded-full text-xs border transition-all capitalize ${
                selected === ing.name
                  ? 'bg-primary-500 text-white border-primary-500'
                  : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-primary-300'
              }`}
            >
              {ing.name}
            </button>
          ))}
        </div>
      )}

      {/* Custom search */}
      <div className="flex gap-2">
        <input
          type="text"
          value={custom}
          onChange={e => setCustom(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && custom && findSubstitution(custom)}
          placeholder="Type any ingredient..."
          className="input-field flex-1 text-sm py-2"
        />
        <button
          onClick={() => custom && findSubstitution(custom)}
          disabled={loading}
          className="btn-primary px-3 py-2"
        >
          <FiSearch size={14} />
        </button>
      </div>

      {/* Results */}
      <AnimatePresence>
        {loading && (
          <div className="mt-3 flex items-center gap-2 text-sm text-gray-400">
            <div className="w-4 h-4 border-2 border-primary-300 border-t-primary-500 rounded-full animate-spin" />
            Finding substitutes...
          </div>
        )}

        {results && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-3"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 capitalize">
                Instead of <span className="text-primary-500">{results.ingredient}</span>, use:
              </p>
              <button onClick={() => { setResults(null); setSelected(''); setCustom('') }}>
                <FiX size={14} className="text-gray-400" />
              </button>
            </div>
            <ul className="space-y-1.5">
              {results.substitutes.map((sub, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300 bg-orange-50 dark:bg-orange-900/20 rounded-xl px-3 py-2"
                >
                  <span className="text-primary-500 mt-0.5 flex-shrink-0">✓</span>
                  {sub}
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}