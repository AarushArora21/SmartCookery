// ScalingIngredients.jsx
// Place in: frontend/src/components/recipe/ScalingIngredients.jsx

import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiMinus, FiPlus } from 'react-icons/fi'

export default function ScalingIngredients({ ingredients, baseServings = 2 }) {
  const [servings, setServings] = useState(baseServings)

  const scale = servings / baseServings

  const scaleQuantity = (qty) => {
    const num = parseFloat(qty)
    if (isNaN(num)) return qty // e.g. "to taste", "as needed"
    const scaled = num * scale
    // Show clean numbers: 1.0 → 1, 1.5 → 1.5, 1.333 → 1⅓
    if (scaled % 1 === 0) return scaled.toString()
    return parseFloat(scaled.toFixed(2)).toString()
  }

  return (
    <div>
      {/* Servings Control */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          🧂 Ingredients
          <span className="text-sm font-normal text-gray-500 ml-2">({ingredients?.length})</span>
        </h2>
        <div className="flex items-center gap-3 bg-gray-100 dark:bg-gray-700 rounded-2xl px-4 py-2">
          <button
            onClick={() => setServings(Math.max(1, servings - 1))}
            className="w-7 h-7 rounded-full bg-white dark:bg-gray-600 flex items-center justify-center shadow-sm hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors text-gray-700 dark:text-gray-200"
          >
            <FiMinus size={14} />
          </button>
          <div className="text-center min-w-[80px]">
            <p className="font-bold text-gray-900 dark:text-white text-sm">{servings} servings</p>
            {servings !== baseServings && (
              <p className="text-xs text-primary-500">
                {scale > 1 ? `×${scale.toFixed(1)}` : `×${scale.toFixed(2)}`} scaled
              </p>
            )}
          </div>
          <button
            onClick={() => setServings(Math.min(50, servings + 1))}
            className="w-7 h-7 rounded-full bg-white dark:bg-gray-600 flex items-center justify-center shadow-sm hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors text-gray-700 dark:text-gray-200"
          >
            <FiPlus size={14} />
          </button>
        </div>
      </div>

      {/* Quick Multipliers */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {[
          { label: '½x', val: Math.max(1, Math.round(baseServings / 2)) },
          { label: '1x', val: baseServings },
          { label: '2x', val: baseServings * 2 },
          { label: '3x', val: baseServings * 3 },
        ].map(({ label, val }) => (
          <button
            key={label}
            onClick={() => setServings(val)}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all border ${
              servings === val
                ? 'bg-primary-500 text-white border-primary-500'
                : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-primary-300'
            }`}
          >
            {label}
          </button>
        ))}
        <button
          onClick={() => setServings(baseServings)}
          className="px-3 py-1 rounded-xl text-xs font-medium text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
        >
          Reset
        </button>
      </div>

      {/* Ingredients List */}
      <div className="card divide-y divide-gray-100 dark:divide-gray-700">
        {ingredients?.map((ing, i) => (
          <motion.div
            key={i}
            layout
            className="flex items-center justify-between px-5 py-3"
          >
            <span className="text-gray-800 dark:text-gray-200 font-medium capitalize">{ing.name}</span>
            <motion.span
              key={`${ing.quantity}-${servings}`}
              initial={{ scale: 1.2, color: '#f97316' }}
              animate={{ scale: 1, color: 'inherit' }}
              transition={{ duration: 0.3 }}
              className="text-gray-600 dark:text-gray-400 text-sm font-semibold"
            >
              {scaleQuantity(ing.quantity)} {ing.unit}
            </motion.span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}