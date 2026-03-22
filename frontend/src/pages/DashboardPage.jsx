import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { fetchCurrentUser, updateProfile } from '../redux/slices/authSlice'
import RecipeCard from '../components/recipe/RecipeCard'
import { getInitials, formatDate } from '../utils/helpers'
import { FiEdit, FiPlus, FiBookmark, FiGrid, FiUser } from 'react-icons/fi'

const TABS = [
  { id: 'my', label: 'My Recipes', icon: <FiGrid size={14} /> },
  { id: 'saved', label: 'Saved', icon: <FiBookmark size={14} /> },
  { id: 'profile', label: 'Edit Profile', icon: <FiUser size={14} /> },
]

export default function DashboardPage() {
  const dispatch = useDispatch()
  const { user } = useSelector(s => s.auth)
  const [tab, setTab] = useState('my')
  const [editForm, setEditForm] = useState({ name: '', bio: '' })
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    dispatch(fetchCurrentUser())
  }, [dispatch])

  useEffect(() => {
    if (user) setEditForm({ name: user.name || '', bio: user.bio || '' })
  }, [user])

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    const fd = new FormData()
    fd.append('name', editForm.name)
    fd.append('bio', editForm.bio)
    if (avatarFile) fd.append('avatar', avatarFile)
    await dispatch(updateProfile(fd))
    setSaving(false)
  }

  const myRecipes = user?.createdRecipes || []
  const savedRecipes = user?.savedRecipes || []

  return (
    <div className="page-container">
      {/* Header */}
      <div className="card p-6 mb-8 flex flex-col sm:flex-row items-center sm:items-start gap-5">
        <div className="relative">
          {user?.avatar
            ? <img src={user.avatar} className="w-20 h-20 rounded-full object-cover ring-4 ring-primary-100 dark:ring-primary-900" alt="avatar" />
            : <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-400 to-orange-500 flex items-center justify-center text-white text-2xl font-bold ring-4 ring-primary-100 dark:ring-primary-900">
                {getInitials(user?.name)}
              </div>
          }
        </div>
        <div className="text-center sm:text-left flex-1">
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">{user?.name}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">{user?.email}</p>
          {user?.bio && <p className="text-gray-600 dark:text-gray-300 text-sm mt-2">{user.bio}</p>}
          <div className="flex gap-4 mt-3 justify-center sm:justify-start">
            <div className="text-center">
              <p className="font-bold text-gray-900 dark:text-white">{myRecipes.length}</p>
              <p className="text-xs text-gray-500">Recipes</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-gray-900 dark:text-white">{savedRecipes.length}</p>
              <p className="text-xs text-gray-500">Saved</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-gray-900 dark:text-white">{user?.followers?.length || 0}</p>
              <p className="text-xs text-gray-500">Followers</p>
            </div>
          </div>
        </div>
        <Link to="/add-recipe" className="btn-primary flex items-center gap-2 text-sm">
          <FiPlus /> New Recipe
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl w-fit">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab === t.id ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* My Recipes */}
      {tab === 'my' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {myRecipes.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-5xl mb-4">🍳</p>
              <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">No recipes yet</h3>
              <p className="text-gray-500 mb-4">Share your first recipe with the world!</p>
              <Link to="/add-recipe" className="btn-primary">Add Recipe</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {myRecipes.map((r, i) => <RecipeCard key={r._id} recipe={r} index={i} />)}
            </div>
          )}
        </motion.div>
      )}

      {/* Saved Recipes */}
      {tab === 'saved' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {savedRecipes.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-5xl mb-4">🔖</p>
              <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">No saved recipes</h3>
              <p className="text-gray-500 mb-4">Save recipes you love to access them later</p>
              <Link to="/search" className="btn-primary">Browse Recipes</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {savedRecipes.map((r, i) => <RecipeCard key={r._id} recipe={r} index={i} />)}
            </div>
          )}
        </motion.div>
      )}

      {/* Edit Profile */}
      {tab === 'profile' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-lg">
          <div className="card p-6">
            <form onSubmit={handleSaveProfile} className="space-y-5">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  {(avatarPreview || user?.avatar)
                    ? <img src={avatarPreview || user?.avatar} className="w-16 h-16 rounded-full object-cover" alt="avatar" />
                    : <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-600 dark:text-primary-300 text-xl font-bold">
                        {getInitials(user?.name)}
                      </div>
                  }
                  <label className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-700 p-1.5 rounded-full border border-gray-200 dark:border-gray-600 cursor-pointer shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                    <FiEdit size={12} />
                    <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                  </label>
                </div>
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-200">Profile Photo</p>
                  <p className="text-xs text-gray-500">Click pencil to change</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full Name</label>
                <input type="text" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                  className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Bio</label>
                <textarea rows={3} value={editForm.bio} onChange={e => setEditForm({ ...editForm, bio: e.target.value })}
                  placeholder="Tell everyone about yourself..." className="input-field" />
              </div>

              <button type="submit" disabled={saving} className="btn-primary w-full">
                {saving ? 'Saving...' : '✅ Save Changes'}
              </button>
            </form>
          </div>
        </motion.div>
      )}
    </div>
  )
}
