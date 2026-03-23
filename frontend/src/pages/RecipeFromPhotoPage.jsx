// frontend/src/pages/RecipeFromPhotoPage.jsx
import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import toast from 'react-hot-toast'
import { FiUpload, FiCamera, FiX, FiArrowRight, FiAlertCircle } from 'react-icons/fi'
import { formatTime } from '../utils/helpers'

export default function RecipeFromPhotoPage() {
  const navigate = useNavigate()
  const fileRef = useRef(null)
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState(null)  // NEW: track error state

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
    setError(null)  // clear any previous error
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
    setError(null)

    try {
      const reader = new FileReader()
      reader.onloadend = async () => {
        try {
          const base64 = reader.result.split(',')[1]
          const { data } = await api.post('/ai/recipe-from-photo', {
            imageBase64: base64,
            mimeType: image.type
          })
          setResult(data.recipe)
        } catch (err) {
          // Get the error message from backend
          const message = err.response?.data?.message
            || 'Failed to analyse image. Please try again.'

          // Show error UI immediately — don't just toast
          setError(message)
          toast.error(message)
        } finally {
          setLoading(false)
        }
      }
      reader.onerror = () => {
        setError('Failed to read image file')
        setLoading(false)
      }
      reader.readAsDataURL(image)
    } catch (err) {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  const reset = () => {
    setImage(null)
    setPreview(null)
    setResult(null)
    setError(null)
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
                : error
                ? 'border-red-300 dark:border-red-700'
                : 'border-gray-200 dark:border-gray-700'
            }`}
          >
            {preview ? (
              <div className="relative">
                <img src={preview} alt="uploaded"
                  className={`w-full max-h-80 object-cover rounded-2xl ${error ? 'opacity-60' : ''}`} />
                <button onClick={reset}
                  className="absolute top-3 right-3 bg-white/90 dark:bg-gray-800/90 p-2 rounded-xl shadow-sm hover:bg-white transition-colors">
                  <FiX size={16} className="text-gray-700 dark:text-gray-300" />
                </button>
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

          {/* ERROR MESSAGE — shows immediately when not food */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl"
            >
              <FiAlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-red-700 dark:text-red-300 text-sm">Not a food photo</p>
                <p className="text-red-600 dark:text-red-400 text-sm mt-0.5">{error}</p>
              </div>
              <button onClick={reset} className="text-red-400 hover:text-red-600 transition-colors">
                <FiX size={16} />
              </button>
            </motion.div>
          )}

          {/* Try with examples */}
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

          {/* Analyse button */}
          {preview && !error && (
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

          {/* Try again button when error */}
          {error && (
            <button onClick={reset} className="btn-primary w-full py-4 text-base">
              📸 Try a Different Photo
            </button>
          )}

          {/* Loading steps */}
          {loading && (
            <div className="text-center py-4 space-y-2">
              {[
                '🔍 Checking if this is a food photo...',
                '👨‍🍳 Identifying the dish...',
                '📝 Generating recipe...'
              ].map((step, i) => (
                <motion.p key={step}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 2 }}
                  className="text-sm text-gray-500 dark:text-gray-400">
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

              <div className="px-5 pb-5 flex gap-3">
                <button onClick={reset} className="btn-secondary flex-1 text-sm">
                  📸 Try Another Photo
                </button>
                <button onClick={() => navigate('/add-recipe')}
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