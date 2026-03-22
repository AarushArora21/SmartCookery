import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useDispatch, useSelector } from 'react-redux'
import { FiClock, FiHeart, FiStar, FiEye } from 'react-icons/fi'
import { likeRecipe, saveRecipe } from '../../redux/slices/recipeSlice'
import { formatTime, dietBadgeClass, dietLabel, PLACEHOLDER_IMG } from '../../utils/helpers'

export default function RecipeCard({ recipe, index = 0 }) {
  const dispatch = useDispatch()
  const { user } = useSelector(s => s.auth)

  const isLiked = recipe.likes?.includes(user?._id)
  const isSaved = user?.savedRecipes?.includes(recipe._id)

  const handleLike = (e) => {
    e.preventDefault()
    if (user) dispatch(likeRecipe(recipe._id))
  }

  const handleSave = (e) => {
    e.preventDefault()
    if (user) dispatch(saveRecipe(recipe._id))
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className="group">
      <Link to={`/recipe/${recipe._id}`} className="block">
        <div className="card overflow-hidden hover:shadow-lg transition-shadow duration-300">
          {/* Image */}
          <div className="relative overflow-hidden aspect-[4/3]">
            <img
              src={recipe.image || PLACEHOLDER_IMG}
              alt={recipe.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
              onError={e => { e.target.src = PLACEHOLDER_IMG }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            {/* Badges */}
            <div className="absolute top-3 left-3 flex gap-1.5">
              <span className={dietBadgeClass(recipe.dietType)}>{dietLabel(recipe.dietType)}</span>
            </div>

            {/* Save Button */}
            <button onClick={handleSave}
              className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-colors shadow-sm">
              <span className={`text-lg ${isSaved ? 'text-primary-500' : 'text-gray-400'}`}>
                {isSaved ? '🔖' : '🤍'}
              </span>
            </button>

            {/* Difficulty */}
            <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-lg">
              {recipe.difficulty}
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white text-base leading-snug mb-1 line-clamp-2 group-hover:text-primary-500 transition-colors">
              {recipe.title}
            </h3>

            {recipe.description && (
              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
                {recipe.description}
              </p>
            )}

            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-700">
              <span className="flex items-center gap-1">
                <FiClock size={12} /> {formatTime(recipe.cookingTime)}
              </span>
              <span className="flex items-center gap-1">
                <FiStar size={12} className="text-yellow-400" />
                {recipe.averageRating?.toFixed(1) || '—'}
              </span>
              <button onClick={handleLike} className="flex items-center gap-1 hover:text-red-500 transition-colors">
                <FiHeart size={12} className={isLiked ? 'fill-red-500 text-red-500' : ''} />
                {recipe.likes?.length || 0}
              </button>
              <span className="flex items-center gap-1">
                <FiEye size={12} /> {recipe.views || 0}
              </span>
            </div>

            {recipe.createdBy && (
              <div className="flex items-center gap-2 mt-3">
                {recipe.createdBy.avatar
                  ? <img src={recipe.createdBy.avatar} className="w-5 h-5 rounded-full object-cover" alt="" />
                  : <div className="w-5 h-5 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-600 dark:text-primary-300 text-xs font-bold">
                      {recipe.createdBy.name?.[0]}
                    </div>
                }
                <span className="text-xs text-gray-500 dark:text-gray-400">{recipe.createdBy.name}</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
