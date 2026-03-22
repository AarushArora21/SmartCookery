import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { fetchRecipeById, likeRecipe, saveRecipe, deleteRecipe } from '../redux/slices/recipeSlice'
import LoadingSpinner from '../components/common/LoadingSpinner'
import api from '../utils/api'
import toast from 'react-hot-toast'
import { formatTime, formatDate, dietBadgeClass, dietLabel, PLACEHOLDER_IMG, difficultyColor } from '../utils/helpers'
import { FiClock, FiUsers, FiHeart, FiBookmark, FiStar, FiTrash2, FiEdit, FiShare2, FiCheckCircle } from 'react-icons/fi'

export default function RecipeDetailPage() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { currentRecipe: recipe, loading } = useSelector(s => s.recipes)
  const { user } = useSelector(s => s.auth)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [checkedSteps, setCheckedSteps] = useState([])
  const [userRating, setUserRating] = useState(0)

  useEffect(() => {
    dispatch(fetchRecipeById(id))
  }, [dispatch, id])

  const isOwner = user && recipe && recipe.createdBy?._id === user._id
  const isLiked = recipe?.likes?.includes(user?._id)
  const isSaved = user?.savedRecipes?.includes(recipe?._id)

  const handleDelete = async () => {
    if (!window.confirm('Delete this recipe?')) return
    const result = await dispatch(deleteRecipe(id))
    if (deleteRecipe.fulfilled.match(result)) navigate('/')
  }

  const handleComment = async (e) => {
    e.preventDefault()
    if (!comment.trim()) return
    setSubmitting(true)
    try {
      await api.post(`/recipes/${id}/comment`, { text: comment })
      setComment('')
      dispatch(fetchRecipeById(id))
      toast.success('Comment added!')
    } catch { toast.error('Failed to add comment') }
    finally { setSubmitting(false) }
  }

  const handleRate = async (rating) => {
    setUserRating(rating)
    try {
      await api.post(`/recipes/${id}/rate`, { rating })
      dispatch(fetchRecipeById(id))
      toast.success('Rating submitted!')
    } catch { toast.error('Failed to rate') }
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success('Link copied to clipboard!')
  }

  const toggleStep = (i) => {
    setCheckedSteps(prev => prev.includes(i) ? prev.filter(s => s !== i) : [...prev, i])
  }

  if (loading) return <LoadingSpinner fullScreen />
  if (!recipe) return (
    <div className="page-container text-center py-24">
      <p className="text-5xl mb-4">🍽️</p>
      <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300">Recipe not found</h2>
      <Link to="/" className="btn-primary mt-4 inline-block">Go Home</Link>
    </div>
  )

  return (
    <div className="page-container max-w-5xl">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {/* Hero Image */}
        <div className="relative rounded-3xl overflow-hidden aspect-[16/7] mb-8">
          <img src={recipe.image || PLACEHOLDER_IMG} alt={recipe.title}
            className="w-full h-full object-cover"
            onError={e => { e.target.src = PLACEHOLDER_IMG }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-6 left-6 right-6">
            <div className="flex flex-wrap gap-2 mb-3">
              <span className={dietBadgeClass(recipe.dietType)}>{dietLabel(recipe.dietType)}</span>
              <span className="badge bg-white/20 text-white">{recipe.category}</span>
              <span className={`badge bg-white/20 text-white`}>{recipe.cuisine}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">{recipe.title}</h1>
          </div>
          {isOwner && (
            <div className="absolute top-4 right-4 flex gap-2">
              <Link to={`/edit-recipe/${recipe._id}`}
                className="p-2 bg-white/90 rounded-xl text-gray-700 hover:bg-white transition-colors shadow-sm">
                <FiEdit size={16} />
              </Link>
              <button onClick={handleDelete}
                className="p-2 bg-white/90 rounded-xl text-red-500 hover:bg-white transition-colors shadow-sm">
                <FiTrash2 size={16} />
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Meta Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { icon: <FiClock />, label: 'Cook Time', val: formatTime(recipe.cookingTime) },
                { icon: <FiUsers />, label: 'Servings', val: `${recipe.servings} people` },
                { icon: <FiStar />, label: 'Rating', val: recipe.averageRating?.toFixed(1) || 'N/A' },
                { icon: null, label: 'Difficulty', val: recipe.difficulty, cls: difficultyColor(recipe.difficulty) },
              ].map(m => (
                <div key={m.label} className="card p-4 text-center">
                  {m.icon && <div className="text-primary-500 flex justify-center mb-1">{m.icon}</div>}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">{m.label}</p>
                  <p className={`font-bold text-gray-900 dark:text-white text-sm ${m.cls || ''}`}>{m.val}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            {recipe.description && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">About this recipe</h2>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{recipe.description}</p>
              </div>
            )}

            {/* Ingredients */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                🧂 Ingredients <span className="text-sm font-normal text-gray-500">({recipe.ingredients?.length})</span>
              </h2>
              <div className="card divide-y divide-gray-100 dark:divide-gray-700">
                {recipe.ingredients?.map((ing, i) => (
                  <div key={i} className="flex items-center justify-between px-5 py-3">
                    <span className="text-gray-800 dark:text-gray-200 font-medium capitalize">{ing.name}</span>
                    <span className="text-gray-500 dark:text-gray-400 text-sm">{ing.quantity} {ing.unit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Steps */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">👨‍🍳 Instructions</h2>
              <div className="space-y-4">
                {recipe.steps?.map((step, i) => (
                  <motion.div key={i} whileHover={{ x: 4 }}
                    onClick={() => toggleStep(i)}
                    className={`card p-5 cursor-pointer transition-all ${checkedSteps.includes(i) ? 'opacity-50 bg-gray-50 dark:bg-gray-800/50' : ''}`}>
                    <div className="flex gap-4">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${checkedSteps.includes(i) ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300' : 'bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-300'}`}>
                        {checkedSteps.includes(i) ? <FiCheckCircle size={16} /> : step.stepNumber}
                      </div>
                      <div className="flex-1">
                        <p className={`text-gray-700 dark:text-gray-300 leading-relaxed ${checkedSteps.includes(i) ? 'line-through text-gray-400' : ''}`}>
                          {step.instruction}
                        </p>
                        {step.duration > 0 && (
                          <p className="text-xs text-primary-500 mt-1 flex items-center gap-1">
                            <FiClock size={11} /> {step.duration} min
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-2">Tap a step to mark it done</p>
            </div>

            {/* Comments */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                💬 Comments <span className="text-sm font-normal text-gray-500">({recipe.comments?.length || 0})</span>
              </h2>

              {user && (
                <form onSubmit={handleComment} className="flex gap-3 mb-6">
                  <input type="text" value={comment} onChange={e => setComment(e.target.value)}
                    placeholder="Share your thoughts..." className="input-field flex-1" />
                  <button type="submit" disabled={submitting} className="btn-primary px-4">
                    {submitting ? '...' : 'Post'}
                  </button>
                </form>
              )}

              <div className="space-y-4">
                {recipe.comments?.length === 0 && (
                  <p className="text-gray-400 text-sm py-4">No comments yet. Be the first!</p>
                )}
                {recipe.comments?.map((c, i) => (
                  <div key={i} className="flex gap-3">
                    {c.userAvatar
                      ? <img src={c.userAvatar} className="w-8 h-8 rounded-full object-cover flex-shrink-0" alt="" />
                      : <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-600 dark:text-primary-300 text-xs font-bold flex-shrink-0">
                          {c.userName?.[0]}
                        </div>
                    }
                    <div className="card px-4 py-3 flex-1">
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{c.userName}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">{c.text}</p>
                      <p className="text-xs text-gray-400 mt-1">{formatDate(c.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <div className="card p-5 space-y-3">
              <button onClick={() => user && dispatch(likeRecipe(recipe._id))}
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium transition-all border ${isLiked ? 'bg-red-50 border-red-200 text-red-500 dark:bg-red-900/20 dark:border-red-800' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-red-200 hover:text-red-500'}`}>
                <FiHeart className={isLiked ? 'fill-red-500' : ''} />
                {isLiked ? 'Liked' : 'Like'} · {recipe.likes?.length || 0}
              </button>
              <button onClick={() => user && dispatch(saveRecipe(recipe._id))}
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium transition-all border ${isSaved ? 'bg-primary-50 border-primary-200 text-primary-600 dark:bg-primary-900/20 dark:border-primary-800' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-primary-200 hover:text-primary-500'}`}>
                <FiBookmark className={isSaved ? 'fill-primary-500' : ''} />
                {isSaved ? 'Saved' : 'Save Recipe'}
              </button>
              <button onClick={handleShare}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">
                <FiShare2 /> Share
              </button>
            </div>

            {/* Rate */}
            {user && (
              <div className="card p-5">
                <p className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Rate this recipe</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button key={star} onClick={() => handleRate(star)}
                      className={`text-2xl transition-transform hover:scale-110 ${star <= userRating ? 'text-yellow-400' : 'text-gray-300'}`}>
                      ★
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Nutrition */}
            {recipe.nutrition && (
              <div className="card p-5">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">📊 Nutrition (per serving)</h3>
                <div className="space-y-2">
                  {[
                    ['Calories', recipe.nutrition.calories, 'kcal'],
                    ['Protein', recipe.nutrition.protein, 'g'],
                    ['Carbs', recipe.nutrition.carbs, 'g'],
                    ['Fat', recipe.nutrition.fat, 'g'],
                    ['Fiber', recipe.nutrition.fiber, 'g'],
                  ].map(([label, val, unit]) => val ? (
                    <div key={label} className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">{label}</span>
                      <span className="font-medium text-gray-800 dark:text-gray-200">{val}{unit}</span>
                    </div>
                  ) : null)}
                </div>
              </div>
            )}

            {/* Author */}
            {recipe.createdBy && (
              <div className="card p-5">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">👨‍🍳 Chef</h3>
                <Link to={`/profile/${recipe.createdBy._id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                  {recipe.createdBy.avatar
                    ? <img src={recipe.createdBy.avatar} className="w-12 h-12 rounded-full object-cover" alt="" />
                    : <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-600 dark:text-primary-300 font-bold text-lg">
                        {recipe.createdBy.name?.[0]}
                      </div>
                  }
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{recipe.createdBy.name}</p>
                    {recipe.createdBy.bio && <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{recipe.createdBy.bio}</p>}
                  </div>
                </Link>
              </div>
            )}

            {/* Tags */}
            {recipe.tags?.length > 0 && (
              <div className="card p-5">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">🏷️ Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {recipe.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
