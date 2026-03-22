// frontend/src/utils/badges.js

export const BADGES = [
  { id: 'first_recipe', emoji: '🍳', label: 'First Recipe', desc: 'Published your first recipe', condition: (u) => u.createdRecipes?.length >= 1 },
  { id: 'five_recipes', emoji: '👨‍🍳', label: 'Home Chef', desc: 'Published 5 recipes', condition: (u) => u.createdRecipes?.length >= 5 },
  { id: 'ten_recipes', emoji: '🌟', label: 'Star Chef', desc: 'Published 10 recipes', condition: (u) => u.createdRecipes?.length >= 10 },
  { id: 'fifty_recipes', emoji: '👑', label: 'Top Chef', desc: 'Published 50 recipes', condition: (u) => u.createdRecipes?.length >= 50 },
  { id: 'popular', emoji: '🔥', label: 'Popular Creator', desc: 'Got 100+ followers', condition: (u) => u.followers?.length >= 100 },
  { id: 'social', emoji: '🤝', label: 'Social Butterfly', desc: 'Following 10+ people', condition: (u) => u.following?.length >= 10 },
  { id: 'saver', emoji: '🔖', label: 'Recipe Collector', desc: 'Saved 20+ recipes', condition: (u) => u.savedRecipes?.length >= 20 },
  { id: 'early', emoji: '🌱', label: 'Early Adopter', desc: 'One of the first members', condition: () => true },
]

export const getUserBadges = (user) => {
  if (!user) return []
  return BADGES.filter(b => b.condition(user))
}