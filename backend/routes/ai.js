const express = require('express');
const router = express.Router();
const { generateRecipe, getNutritionInfo } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

router.post('/generate', protect, generateRecipe);
router.post('/nutrition', protect, getNutritionInfo);

module.exports = router;
