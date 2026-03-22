import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { fetchRecipes, fetchTrending } from '../redux/slices/recipeSlice'
import RecipeCard from '../components/recipe/RecipeCard'
import { RecipeGridSkeleton } from '../components/common/Skeletons'
import { FiArrowRight, FiCpu, FiHeart, FiShoppingCart } from 'react-icons/fi'

const HERO_CATEGORIES = [
  { label: '🥗 Veg', value: 'veg' }, { label: '🍗 Non-Veg', value: 'non-veg' },
  { label: '🥞 Breakfast', value: 'Breakfast' }, { label: '🍛 Dinner', value: 'Dinner' },
  { label: '🍰 Dessert', value: 'Dessert' },
]

const FEATURES = [
  { icon: <FiCpu size={24} />, title: 'AI Recipe Generator', desc: 'Enter your ingredients and get instant recipe ideas powered by AI', link: '/ai-generator', color: 'from-violet-500 to-purple-600' },
  { icon: <FiHeart size={24} />, title: 'Save Favourites', desc: 'Build your personal cookbook by saving recipes you love', link: '/dashboard', color: 'from-pink-500 to-rose-500' },
  { icon: <FiShoppingCart size={24} />, title: 'Smart Grocery List', desc: 'Auto-generate shopping lists from your saved recipes', link: '/grocery-list', color: 'from-emerald-500 to-teal-500' },
]

export default function HomePage() {
  const dispatch = useDispatch()
  const { recipes, trending, loading } = useSelector(s => s.recipes)

  useEffect(() => {
    dispatch(fetchRecipes({ limit: 8, sort: '-createdAt' }))
    dispatch(fetchTrending())
  }, [dispatch])

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary-500 via-primary-600 to-orange-700 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1600&auto=format&fit=crop")', backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-4xl sm:text-6xl font-extrabold mb-4 leading-tight">
              Cook Smarter with <br /><span className="text-yellow-300">AI-Powered</span> Recipes
            </h1>
            <p className="text-lg sm:text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
              Discover thousands of recipes, generate meals from your ingredients, plan your week, and share your culinary creations.
            </p>
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              <Link to="/search" className="bg-white text-primary-600 font-bold px-8 py-3 rounded-2xl hover:shadow-xl transition-all hover:-translate-y-0.5">
                Explore Recipes
              </Link>
              <Link to="/ai-generator" className="bg-white/20 border border-white/40 text-white font-bold px-8 py-3 rounded-2xl hover:bg-white/30 transition-all">
                🤖 Try AI Chef
              </Link>
            </div>
            {/* Quick filter pills */}
            <div className="flex flex-wrap justify-center gap-2">
              {HERO_CATEGORIES.map(c => (
                <Link key={c.value} to={`/search?${c.value.startsWith('v') || c.value.startsWith('n') ? 'dietType' : 'category'}=${c.value}`}
                  className="bg-white/15 border border-white/25 px-4 py-1.5 rounded-full text-sm hover:bg-white/30 transition-colors">
                  {c.label}
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Link to={f.link} className="block card p-6 hover:shadow-lg transition-all group hover:-translate-y-1">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center text-white mb-4`}>
                    {f.icon}
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 group-hover:text-primary-500 transition-colors">{f.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{f.desc}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending */}
      {trending.length > 0 && (
        <section className="page-container">
          <div className="flex items-center justify-between mb-6">
            <h2 className="section-title mb-0">🔥 Trending Now</h2>
            <Link to="/search?sort=-views" className="flex items-center gap-1 text-primary-500 hover:text-primary-600 text-sm font-medium">
              View all <FiArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {trending.slice(0, 8).map((r, i) => <RecipeCard key={r._id} recipe={r} index={i} />)}
          </div>
        </section>
      )}

      {/* Latest Recipes */}
      <section className="page-container">
        <div className="flex items-center justify-between mb-6">
          <h2 className="section-title mb-0">✨ Latest Recipes</h2>
          <Link to="/search" className="flex items-center gap-1 text-primary-500 hover:text-primary-600 text-sm font-medium">
            View all <FiArrowRight size={14} />
          </Link>
        </div>
        {loading ? <RecipeGridSkeleton /> : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {recipes.map((r, i) => <RecipeCard key={r._id} recipe={r} index={i} />)}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="page-container">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="card bg-gradient-to-br from-primary-500 to-orange-600 text-white p-10 text-center rounded-3xl">
          <h2 className="text-3xl font-extrabold mb-3">Share Your Recipes with the World</h2>
          <p className="text-orange-100 mb-6 max-w-xl mx-auto">Join our community of passionate home cooks and professional chefs. Upload your recipes and inspire others.</p>
          <Link to="/register" className="inline-block bg-white text-primary-600 font-bold px-8 py-3 rounded-2xl hover:shadow-xl transition-all hover:-translate-y-0.5">
            Get Started Free
          </Link>
        </motion.div>
      </section>
    </div>
  )
}
