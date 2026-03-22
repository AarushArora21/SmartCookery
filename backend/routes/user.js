const express = require('express');
const router = express.Router();
const {
  getProfile, getSavedRecipes, getMealPlan, updateMealPlan,
  getGroceryList, updateGroceryList, getUserPublicProfile, followUser
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.get('/profile', protect, getProfile);
router.get('/saved', protect, getSavedRecipes);
router.get('/meal-plan', protect, getMealPlan);
router.put('/meal-plan', protect, updateMealPlan);
router.get('/grocery-list', protect, getGroceryList);
router.put('/grocery-list', protect, updateGroceryList);
router.get('/:userId', getUserPublicProfile);
router.post('/:userId/follow', protect, followUser);

module.exports = router;
