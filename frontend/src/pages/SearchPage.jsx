import { useEffect, useCallback, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchRecipes, setFilters } from '../redux/slices/recipeSlice'
import RecipeCard from '../components/recipe/RecipeCard'
import { RecipeGridSkeleton } from '../components/common/Skeletons'
import { CATEGORIES, DIET_TYPES, DIFFICULTIES } from '../utils/helpers'
import { FiSearch, FiFilter, FiX } from 'react-icons/fi'

let searchTimer = null

export default function SearchPage() {
  const dispatch = useDispatch()
  const [searchParams, setSearchParams] = useSearchParams()
  const { recipes, loading, totalPages, currentPage, total, filters } = useSelector(s => s.recipes)
  const [showFilters, setShowFilters] = useState(false)

  const updateSearch = useCallback((newFilters, page = 1) => {
    const merged = { ...filters, ...newFilters }
    dispatch(setFilters(merged))
    const params = {}
    Object.entries(merged).forEach(([k, v]) => { if (v) params[k] = v })
    if (page > 1) params.page = page
    setSearchParams(params)
    dispatch(fetchRecipes({ ...merged, page, limit: 12 }))
  }, [dispatch, filters, setSearchParams])

  useEffect(() => {
    const params = Object.fromEntries(searchParams.entries())
    dispatch(setFilters(params))
    dispatch(fetchRecipes({ ...params, limit: 12 }))
  }, [])

  const handleSearch = (e) => {
    const val = e.target.value
    clearTimeout(searchTimer)
    searchTimer = setTimeout(() => updateSearch({ search: val }), 400)
  }

  const handleFilter = (key, val) => {
    const newVal = filters[key] === val ? '' : val
    updateSearch({ [key]: newVal })
  }

  const clearAll = () => {
    dispatch(setFilters({ search: '', category: '', dietType: '', difficulty: '', sort: '-createdAt' }))
    setSearchParams({})
    dispatch(fetchRecipes({ limit: 12 }))
  }

  const hasFilters = filters.category || filters.dietType || filters.difficulty || filters.search

  return (
    <div className="page-container">
      {/* Search Bar */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search recipes, ingredients..."
            defaultValue={filters.search}
            onChange={handleSearch}
            className="input-field pl-11" />
        </div>
        <button onClick={() => setShowFilters(!showFilters)}
          className={`btn-secondary flex items-center gap-2 ${showFilters ? 'border-primary-400 text-primary-500' : ''}`}>
          <FiFilter size={16} /> Filters
          {hasFilters && <span className="w-2 h-2 rounded-full bg-primary-500" />}
        </button>
        {hasFilters && (
          <button onClick={clearAll} className="btn-secondary flex items-center gap-1 text-red-500">
            <FiX size={16} /> Clear
          </button>
        )}
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="card p-5 mb-6 space-y-4">
          <div>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Category</p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(c => (
                <button key={c} onClick={() => handleFilter('category', c)}
                  className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all border ${filters.category === c ? 'bg-primary-500 text-white border-primary-500' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-primary-300'}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Diet Type</p>
            <div className="flex gap-2">
              {DIET_TYPES.map(d => (
                <button key={d} onClick={() => handleFilter('dietType', d)}
                  className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all border capitalize ${filters.dietType === d ? 'bg-primary-500 text-white border-primary-500' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-primary-300'}`}>
                  {d}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Difficulty</p>
            <div className="flex gap-2">
              {DIFFICULTIES.map(d => (
                <button key={d} onClick={() => handleFilter('difficulty', d)}
                  className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all border ${filters.difficulty === d ? 'bg-primary-500 text-white border-primary-500' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-primary-300'}`}>
                  {d}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Sort By</p>
            <select value={filters.sort} onChange={e => updateSearch({ sort: e.target.value })}
              className="input-field w-auto">
              <option value="-createdAt">Newest First</option>
              <option value="createdAt">Oldest First</option>
              <option value="-views">Most Viewed</option>
              <option value="-averageRating">Top Rated</option>
              <option value="cookingTime">Quickest</option>
            </select>
          </div>
        </div>
      )}

      {/* Results Count */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {loading ? 'Searching...' : `${total} recipe${total !== 1 ? 's' : ''} found`}
        </p>
      </div>

      {/* Grid */}
      {loading ? <RecipeGridSkeleton count={12} /> : recipes.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-6xl mb-4">🔍</p>
          <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">No recipes found</h3>
          <p className="text-gray-500">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {recipes.map((r, i) => <RecipeCard key={r._id} recipe={r} index={i} />)}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-10">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => updateSearch({}, p)}
              className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${p === currentPage ? 'bg-primary-500 text-white' : 'btn-secondary'}`}>
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
