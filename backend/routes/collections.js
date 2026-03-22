// backend/routes/collections.js
const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/auth')
const {
  getMyCollections, createCollection,
  addRecipeToCollection, removeRecipeFromCollection, deleteCollection
} = require('../controllers/collectionController')

router.get('/', protect, getMyCollections)
router.post('/', protect, createCollection)
router.post('/:id/add', protect, addRecipeToCollection)
router.delete('/:id/recipe/:recipeId', protect, removeRecipeFromCollection)
router.delete('/:id', protect, deleteCollection)

module.exports = router