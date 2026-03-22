const https = require('https')
const dns = require('dns')
dns.setDefaultResultOrder('ipv4first')

const groqRequest = (payload) => {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(payload)
    const options = {
      hostname: 'api.groq.com',
      path: '/openai/v1/chat/completions',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    }
    const req = https.request(options, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        try { resolve(JSON.parse(data)) }
        catch (e) { reject(new Error('Invalid JSON from Groq: ' + data.slice(0, 100))) }
      })
    })
    req.on('error', reject)
    req.write(body)
    req.end()
  })
}

exports.generateRecipe = async (req, res) => {
  try {
    const { ingredients, preferences } = req.body

    if (!ingredients || ingredients.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide ingredients' })
    }

    const prompt = `You are a professional chef. Generate a detailed recipe using: ${ingredients.join(', ')}.
    ${preferences ? `Preferences: ${preferences}` : ''}
    Respond ONLY with valid JSON, no extra text:
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

    const result = await groqRequest({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 1500
    })

    console.log('Groq generateRecipe response:', JSON.stringify(result).slice(0, 300))

    if (result.error) {
      return res.status(500).json({ success: false, message: result.error.message })
    }

    const text = result.choices[0].message.content
    const clean = text.replace(/```json|```/g, '').trim()
    const recipe = JSON.parse(clean)

    res.json({ success: true, recipe })

  } catch (error) {
    console.error('generateRecipe error:', error.message)
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

    const prompt = `Give 4 practical cooking substitutes for "${ingredient}". 
    Reply ONLY with a valid JSON array of strings, no extra text, no explanation.
    Example: ["substitute 1", "substitute 2", "substitute 3", "substitute 4"]`

    const result = await groqRequest({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
      max_tokens: 200
    })

    console.log('Groq getSubstitution response:', JSON.stringify(result).slice(0, 300))

    if (result.error) {
      return res.json({
        success: true,
        substitutes: ['AI unavailable — try a similar pantry ingredient']
      })
    }

    const text = result.choices[0].message.content
    const clean = text.replace(/```json|```/g, '').trim()
    const substitutes = JSON.parse(clean)

    res.json({ success: true, substitutes })

  } catch (error) {
    console.error('getSubstitution error:', error.message)
    res.json({
      success: true,
      substitutes: [
        'No AI substitution available',
        'Try a similar ingredient',
        'Check online for alternatives'
      ]
    })
  }
}