// frontend/src/pages/RecipeFromPhotoPage.jsx
import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import toast from 'react-hot-toast'
import { FiUpload, FiCamera, FiX, FiArrowRight } from 'react-icons/fi'
import { formatTime } from '../utils/helpers'

export default function RecipeFromPhotoPage() {
  const navigate = useNavigate()
  const fileRef = useRef(null)
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [dragOver, setDragOver] = useState(false)

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be under 10MB')
      return
    }
    setImage(file)
    setPreview(URL.createObjectURL(file))
    setResult(null)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    handleFile(e.dataTransfer.files[0])
  }

  const handleAnalyse = async () => {
    if (!image) return
    setLoading(true)
    setResult(null)

    try {
      const reader = new FileReader()
      reader.onloadend = async () => {
        const base64 = reader.result.split(',')[1]
        const { data } = await api.post('/ai/recipe-from-photo', {
          imageBase64: base64,
          mimeType: image.type
        })
        setResult(data.recipe)
        setLoading(false)
      }
      reader.readAsDataURL(image)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to analyse image')
      setLoading(false)
    }
  }

  const reset = () => {
    setImage(null)
    setPreview(null)
    setResult(null)
  }

  return (
    <div className="page-container max-w-3xl">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-600 rounded-3xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg">
          📸
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Recipe from Photo</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Upload a photo of any dish and AI will identify it and generate the full recipe
        </p>
      </div>

      {!result ? (
        <div className="space-y-6">
          {/* Upload Area */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`card border-2 border-dashed transition-all ${
              dragOver
                ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/20'
                : 'border-gray-200 dark:border-gray-700'
            }`}
          >
            {preview ? (
              <div className="relative">
                <img src={preview} alt="uploaded"
                  className="w-full max-h-80 object-cover rounded-2xl" />
                <button onClick={reset}
                  className="absolute top-3 right-3 bg-white/90 dark:bg-gray-800/90 p-2 rounded-xl shadow-sm hover:bg-white dark:hover:bg-gray-700 transition-colors">
                  <FiX size={16} className="text-gray-700 dark:text-gray-300" />
                </button>
                <div className="absolute bottom-3 left-3 bg-black/50 text-white text-xs px-3 py-1.5 rounded-xl">
                  {image?.name}
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center py-16 cursor-pointer">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-4">
                  <FiUpload size={28} className="text-gray-400" />
                </div>
                <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Drop your food photo here
                </p>
                <p className="text-sm text-gray-400 mb-4">or click to browse</p>
                <div className="flex gap-3">
                  <span className="px-4 py-2 bg-primary-500 text-white rounded-xl text-sm font-medium flex items-center gap-2">
                    <FiUpload size={14} /> Upload Photo
                  </span>
                  <span className="px-4 py-2 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-xl text-sm font-medium flex items-center gap-2">
                    <FiCamera size={14} /> Take Photo
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-3">JPG, PNG, WebP — max 10MB</p>
                <input ref={fileRef} type="file" accept="image/*" capture="environment"
                  onChange={e => handleFile(e.target.files[0])} className="hidden" />
              </label>
            )}
          </div>

          {/* Example dishes */}
          {!preview && (
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 text-center">Try with photos of:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {['🍛 Biryani', '🍕 Pizza', '🍜 Noodles', '🥘 Curry', '🍰 Cake', '🥗 Salad'].map(d => (
                  <span key={d} className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-sm">
                    {d}
                  </span>
                ))}
              </div>
            </div>
          )}

          {preview && (
            <button onClick={handleAnalyse} disabled={loading}
              className="btn-primary w-full py-4 text-base flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Analysing your dish...
                </>
              ) : (
                <> 🔍 Identify & Generate Recipe</>
              )}
            </button>
          )}

          {/* Loading state */}
          {loading && (
            <div className="text-center py-6 space-y-3">
              {['🔍 Identifying the dish...', '👨‍🍳 Generating recipe...', '📊 Calculating nutrition...'].map((step, i) => (
                <motion.p key={step} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 1.5 }}
                  className="text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center gap-2">
                  <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                    ⚙️
                  </motion.span>
                  {step}
                </motion.p>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Result */
        <AnimatePresence>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Detected dish */}
            <div className="card overflow-hidden">
              <div className="bg-gradient-to-r from-pink-500 to-rose-600 p-5 text-white">
                <p className="text-pink-100 text-sm mb-1">✅ Dish Identified</p>
                <h2 className="text-2xl font-extrabold">{result.title}</h2>
                {result.description && (
                  <p className="text-pink-100 text-sm mt-2">{result.description}</p>
                )}
                <div className="flex flex-wrap gap-4 mt-3 text-sm">
                  <span>⏱ {formatTime(result.cookingTime)}</span>
                  <span>👥 {result.servings} servings</span>
                  <span>📊 {result.difficulty}</span>
                  <span className="capitalize">🥗 {result.dietType}</span>
                </div>
              </div>

              {/* Side by side: image + ingredients */}
              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <img src={preview} alt="uploaded dish"
                    className="w-full h-48 object-cover rounded-2xl" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-3">🧂 Ingredients</h3>
                  <ul className="space-y-1.5 max-h-44 overflow-y-auto">
                    {result.ingredients?.map((ing, i) => (
                      <li key={i} className="flex justify-between text-sm">
                        <span className="text-gray-700 dark:text-gray-300 capitalize">{ing.name}</span>
                        <span className="text-gray-400">{ing.quantity} {ing.unit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Steps */}
              <div className="px-5 pb-5">
                <h3 className="font-bold text-gray-900 dark:text-white mb-3">👨‍🍳 Instructions</h3>
                <div className="space-y-3">
                  {result.steps?.map((step, i) => (
                    <div key={i} className="flex gap-3">
                      <span className="w-6 h-6 rounded-full bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-300 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        {step.instruction}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Nutrition */}
              {result.nutrition && (
                <div className="px-5 pb-5">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-3">📊 Nutrition</h3>
                  <div className="grid grid-cols-5 gap-2">
                    {[
                      ['Calories', result.nutrition.calories, 'kcal'],
                      ['Protein', result.nutrition.protein, 'g'],
                      ['Carbs', result.nutrition.carbs, 'g'],
                      ['Fat', result.nutrition.fat, 'g'],
                      ['Fiber', result.nutrition.fiber, 'g'],
                    ].map(([label, val, unit]) => (
                      <div key={label} className="text-center bg-gray-50 dark:bg-gray-700/50 rounded-xl p-2">
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{val}</p>
                        <p className="text-xs text-gray-400">{unit}</p>
                        <p className="text-xs text-gray-500">{label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="px-5 pb-5 flex gap-3">
                <button onClick={reset} className="btn-secondary flex-1 text-sm">
                  📸 Try Another Photo
                </button>
                <button
                  onClick={() => navigate('/add-recipe')}
                  className="btn-primary flex-1 text-sm flex items-center justify-center gap-1">
                  Save as Recipe <FiArrowRight size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
}