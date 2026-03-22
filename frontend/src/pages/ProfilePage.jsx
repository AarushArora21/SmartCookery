import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import api from '../utils/api'
import toast from 'react-hot-toast'
import RecipeCard from '../components/recipe/RecipeCard'
import { getInitials } from '../utils/helpers'
import LoadingSpinner from '../components/common/LoadingSpinner'

export default function ProfilePage() {
  const { userId } = useParams()
  const { user: currentUser } = useSelector(s => s.auth)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [following, setFollowing] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)

  useEffect(() => {
    api.get(`/user/${userId}`)
      .then(({ data }) => {
        setProfile(data.user)
        setFollowing(data.user.followers?.includes(currentUser?._id))
      })
      .catch(() => toast.error('Profile not found'))
      .finally(() => setLoading(false))
  }, [userId, currentUser])

  const handleFollow = async () => {
    if (!currentUser) { toast.error('Login to follow'); return }
    setFollowLoading(true)
    try {
      const { data } = await api.post(`/user/${userId}/follow`)
      setFollowing(data.isFollowing)
      setProfile(prev => ({
        ...prev,
        followers: data.isFollowing
          ? [...(prev.followers || []), currentUser._id]
          : (prev.followers || []).filter(id => id !== currentUser._id)
      }))
    } catch { toast.error('Failed to update follow status') }
    finally { setFollowLoading(false) }
  }

  if (loading) return <LoadingSpinner fullScreen />
  if (!profile) return (
    <div className="page-container text-center py-20">
      <p className="text-5xl mb-4">👤</p>
      <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300">User not found</h2>
    </div>
  )

  const isOwnProfile = currentUser?._id === userId

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Profile Header */}
        <div className="card p-8 mb-8 text-center">
          {profile.avatar
            ? <img src={profile.avatar} className="w-24 h-24 rounded-full object-cover mx-auto ring-4 ring-primary-100 dark:ring-primary-900 mb-4" alt="avatar" />
            : <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-400 to-orange-500 flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4 ring-4 ring-primary-100 dark:ring-primary-900">
                {getInitials(profile.name)}
              </div>
          }
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">{profile.name}</h1>
          {profile.bio && <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-md mx-auto">{profile.bio}</p>}

          <div className="flex justify-center gap-8 mt-5">
            <div className="text-center">
              <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{profile.createdRecipes?.length || 0}</p>
              <p className="text-sm text-gray-500">Recipes</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{profile.followers?.length || 0}</p>
              <p className="text-sm text-gray-500">Followers</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{profile.following?.length || 0}</p>
              <p className="text-sm text-gray-500">Following</p>
            </div>
          </div>

          {!isOwnProfile && currentUser && (
            <button onClick={handleFollow} disabled={followLoading}
              className={`mt-5 px-8 py-2.5 rounded-xl font-semibold text-sm transition-all ${following ? 'btn-secondary border-primary-300 text-primary-600 dark:text-primary-400' : 'btn-primary'}`}>
              {followLoading ? '...' : following ? '✓ Following' : '+ Follow'}
            </button>
          )}
        </div>

        {/* Recipes */}
        <h2 className="section-title">Recipes by {profile.name}</h2>
        {profile.createdRecipes?.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-5xl mb-4">🍳</p>
            <p className="text-gray-500">No recipes shared yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {profile.createdRecipes?.map((r, i) => <RecipeCard key={r._id} recipe={r} index={i} />)}
          </div>
        )}
      </motion.div>
    </div>
  )
}
