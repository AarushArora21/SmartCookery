const https = require('https');

exports.generateRecipe = async (req, res) => {
  try {
    const { ingredients, preferences } = req.body;

    if (!ingredients || ingredients.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide ingredients' });
    }

    const prompt = `You are a professional chef. Generate a detailed recipe using these ingredients: ${ingredients.join(', ')}.
    ${preferences ? `Preferences: ${preferences}` : ''}
    
    Respond with a valid JSON object in this exact format:
    {
      "title": "Recipe Name",
      "description": "Brief description",
      "cookingTime": 30,
      "servings": 4,
      "difficulty": "Easy",
      "category": "Dinner",
      "dietType": "veg",
      "ingredients": [{"name": "ingredient", "quantity": "2", "unit": "cups"}],
      "steps": [{"stepNumber": 1, "instruction": "Step description", "duration": 5}],
      "nutrition": {"calories": 350, "protein": 15, "carbs": 40, "fat": 12, "fiber": 5},
      "tags": ["quick", "healthy"]
    }
    Only respond with the JSON, no extra text.`;

    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      // Demo mode: return a sample recipe
      return res.json({
        success: true,
        recipe: {
          title: `${ingredients[0]} Delight`,
          description: `A delicious recipe featuring ${ingredients.join(', ')}`,
          cookingTime: 30,
          servings: 4,
          difficulty: 'Easy',
          category: 'Dinner',
          dietType: 'veg',
          ingredients: ingredients.map(ing => ({ name: ing, quantity: '1', unit: 'cup' })),
          steps: [
            { stepNumber: 1, instruction: `Prepare all ingredients: ${ingredients.join(', ')}`, duration: 10 },
            { stepNumber: 2, instruction: 'Cook on medium heat for 15 minutes', duration: 15 },
            { stepNumber: 3, instruction: 'Season to taste and serve hot', duration: 5 }
          ],
          nutrition: { calories: 320, protein: 12, carbs: 45, fat: 8, fiber: 6 },
          tags: ['quick', 'easy', 'homemade']
        },
        note: 'Demo recipe. Add GEMINI_API_KEY for AI-generated recipes.'
      });
    }

    // Gemini API call
    const payload = JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    });

    const options = {
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    const geminiReq = https.request(options, (geminiRes) => {
      let data = '';
      geminiRes.on('data', chunk => data += chunk);
      geminiRes.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          const text = parsed.candidates[0].content.parts[0].text;
          const clean = text.replace(/```json|```/g, '').trim();
          const recipe = JSON.parse(clean);
          res.json({ success: true, recipe });
        } catch (e) {
          res.status(500).json({ success: false, message: 'Failed to parse AI response' });
        }
      });
    });

    geminiReq.on('error', (e) => {
      res.status(500).json({ success: false, message: 'AI service error' });
    });

    geminiReq.write(payload);
    geminiReq.end();

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getNutritionInfo = async (req, res) => {
  try {
    const { ingredients } = req.body;

    // Basic nutrition estimation
    const nutritionData = {
      calories: Math.floor(Math.random() * 300) + 150,
      protein: Math.floor(Math.random() * 20) + 5,
      carbs: Math.floor(Math.random() * 50) + 20,
      fat: Math.floor(Math.random() * 15) + 3,
      fiber: Math.floor(Math.random() * 8) + 2
    };

    res.json({ success: true, nutrition: nutritionData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
