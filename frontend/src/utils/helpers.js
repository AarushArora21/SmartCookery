export const formatTime = (minutes) => {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m ? `${h}h ${m}m` : `${h}h`
}

export const truncate = (text, length = 80) =>
  text?.length > length ? text.substring(0, length) + '...' : text

export const getInitials = (name) =>
  name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'

export const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

export const dietBadgeClass = (type) => {
  if (type === 'veg') return 'badge-veg'
  if (type === 'vegan') return 'badge-vegan'
  return 'badge-nonveg'
}

export const dietLabel = (type) => {
  if (type === 'veg') return '🥦 Veg'
  if (type === 'vegan') return '🌱 Vegan'
  return '🍗 Non-veg'
}

export const difficultyColor = (d) => {
  if (d === 'Easy') return 'text-green-600 dark:text-green-400'
  if (d === 'Medium') return 'text-yellow-600 dark:text-yellow-400'
  return 'text-red-600 dark:text-red-400'
}

export const CATEGORIES = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert', 'Drink', 'Appetizer']
export const DIET_TYPES = ['veg', 'non-veg', 'vegan']
export const DIFFICULTIES = ['Easy', 'Medium', 'Hard']
export const CUISINES = ['Indian', 'Italian', 'Chinese', 'Mexican', 'Continental', 'Thai', 'Mediterranean', 'Other']

export const PLACEHOLDER_IMG = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop'
