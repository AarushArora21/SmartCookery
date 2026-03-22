const express = require('express');
const router = express.Router();
const {
  getAllRecipes, getRecipeById, createRecipe, updateRecipe, deleteRecipe,
  likeRecipe, addComment, rateRecipe, saveRecipe, getTrendingRecipes
} = require('../controllers/recipeController');
const { protect } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

router.get('/', getAllRecipes);
router.get('/trending', getTrendingRecipes);
router.get('/:id', getRecipeById);

router.post('/', protect, upload.single('image'), createRecipe);
router.put('/:id', protect, upload.single('image'), updateRecipe);
router.delete('/:id', protect, deleteRecipe);

router.post('/:id/like', protect, likeRecipe);
router.post('/:id/comment', protect, addComment);
router.post('/:id/rate', protect, rateRecipe);
router.post('/:id/save', protect, saveRecipe);

module.exports = router;
