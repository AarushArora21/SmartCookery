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