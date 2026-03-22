const dns = require('dns')
dns.setDefaultResultOrder('ipv4first')

exports.generateRecipe = async (req, res) => {
  try {
    const { ingredients, preferences } = req.body
    const prompt = `You are a professional chef. Generate a detailed recipe using: ${ingredients.join(', ')}.
    ${preferences ? `Preferences: ${preferences}` : ''}
    Respond ONLY with valid JSON in this exact format:
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
    }`

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 1500
      })
    })
    const data = await response.json()
    const text = data.choices[0].message.content
    const clean = text.replace(/```json|```/g, '').trim()
    const recipe = JSON.parse(clean)
    res.json({ success: true, recipe })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.getNutritionInfo = async (req, res) => {
  try {
    const nutritionData = {
      calories: Math.floor(Math.random() * 300) + 150,
      protein: Math.floor(Math.random() * 20) + 5,
      carbs: Math.floor(Math.random() * 50) + 20,
      fat: Math.floor(Math.random() * 15) + 3,
      fiber: Math.floor(Math.random() * 8) + 2
    }
    res.json({ success: true, nutrition: nutritionData })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.getSubstitution = async (req, res) => {
  try {
    const { ingredient } = req.body
    if (!ingredient) {
      return res.status(400).json({ success: false, message: 'Ingredient is required' })
    }
    const prompt = `Give 4 practical cooking substitutes for "${ingredient}". Reply ONLY with a valid JSON array of strings, no extra text. Example: ["substitute 1", "substitute 2", "substitute 3", "substitute 4"]`

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.5,
        max_tokens: 200
      })
    })
    const data = await response.json()
    const text = data.choices[0].message.content
    const clean = text.replace(/```json|```/g, '').trim()
    const substitutes = JSON.parse(clean)
    res.json({ success: true, substitutes })
  } catch (error) {
    res.json({
      success: true,
      substitutes: ['No AI substitution available', 'Try a similar ingredient', 'Check online for alternatives']
    })
  }
}