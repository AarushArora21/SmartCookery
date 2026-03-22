const express = require('express')
const router = express.Router()
const {
  generateRecipe,
  getNutritionInfo,
  getSubstitution,
  chatWithChef,
  recipeFromPhoto,
  generateNutritionPlan
} = require('../controllers/aiController')
const { protect } = require('../middleware/auth')

router.post('/generate', protect, generateRecipe)
router.post('/nutrition', protect, getNutritionInfo)
router.post('/substitute', protect, getSubstitution)
router.post('/chat', protect, chatWithChef)
router.post('/recipe-from-photo', protect, recipeFromPhoto)
router.post('/nutrition-plan', protect, generateNutritionPlan)

module.exports = router