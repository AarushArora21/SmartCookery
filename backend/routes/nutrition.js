const express = require('express');
const router = express.Router();
const { getNutritionInfo } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

router.post('/calculate', protect, getNutritionInfo);

module.exports = router;
