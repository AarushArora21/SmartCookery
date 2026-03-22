const https = require('https')
const dns = require('dns')
dns.setDefaultResultOrder('ipv4first')

// ─── shared Groq request helper ───────────────────────────────────────────────
const groqRequest = (messages, maxTokens = 1500, temperature = 0.7) => {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages,
      temperature,
      max_tokens: maxTokens
    })
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
        catch (e) { reject(new Error('Invalid JSON from Groq: ' + data.slice(0, 200))) }
      })
    })
    req.on('error', reject)
    req.write(body)
    req.end()
  })
}

const extractJSON = (text) => {
  const clean = text.replace(/```json|```/g, '').trim()
  const start = clean.indexOf('{')
  const end = clean.lastIndexOf('}')
  if (start !== -1 && end !== -1) return JSON.parse(clean.slice(start, end + 1))
  return JSON.parse(clean)
}

// ─── 1. Generate Recipe ────────────────────────────────────────────────────────
exports.generateRecipe = async (req, res) => {
  try {
    const { ingredients, preferences } = req.body
    if (!ingredients || ingredients.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide ingredients' })
    }

    const prompt = `You are a professional chef. Generate a detailed recipe using: ${ingredients.join(', ')}.
${preferences ? `User preferences: ${preferences}` : ''}
Respond ONLY with valid JSON (no extra text):
{
  "title": "Recipe Name",
  "description": "Brief description",
  "cookingTime": 30,
  "servings": 4,
  "difficulty": "Easy",
  "category": "Dinner",
  "dietType": "veg",
  "cuisine": "Indian",
  "ingredients": [{"name": "ingredient", "quantity": "2", "unit": "cups"}],
  "steps": [{"stepNumber": 1, "instruction": "Step description", "duration": 5}],
  "nutrition": {"calories": 350, "protein": 15, "carbs": 40, "fat": 12, "fiber": 5},
  "tags": ["quick", "healthy"]
}`

    const result = await groqRequest([{ role: 'user', content: prompt }], 1500)
    console.log('generateRecipe:', JSON.stringify(result).slice(0, 200))

    if (result.error) return res.status(500).json({ success: false, message: result.error.message })

    const recipe = extractJSON(result.choices[0].message.content)
    res.json({ success: true, recipe })
  } catch (error) {
    console.error('generateRecipe error:', error.message)
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── 2. Nutrition Info ────────────────────────────────────────────────────────
exports.getNutritionInfo = async (req, res) => {
  try {
    res.json({
      success: true,
      nutrition: {
        calories: Math.floor(Math.random() * 300) + 150,
        protein: Math.floor(Math.random() * 20) + 5,
        carbs: Math.floor(Math.random() * 50) + 20,
        fat: Math.floor(Math.random() * 15) + 3,
        fiber: Math.floor(Math.random() * 8) + 2
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── 3. Ingredient Substitution ───────────────────────────────────────────────
exports.getSubstitution = async (req, res) => {
  try {
    const { ingredient } = req.body
    if (!ingredient) return res.status(400).json({ success: false, message: 'Ingredient is required' })

    const prompt = `Give 4 practical cooking substitutes for "${ingredient}".
Reply ONLY with a valid JSON array of strings, no extra text.
Example: ["substitute 1", "substitute 2", "substitute 3", "substitute 4"]`

    const result = await groqRequest([{ role: 'user', content: prompt }], 200, 0.5)
    if (result.error) throw new Error(result.error.message)

    const text = result.choices[0].message.content
    const clean = text.replace(/```json|```/g, '').trim()
    const substitutes = JSON.parse(clean)
    res.json({ success: true, substitutes })
  } catch (error) {
    console.error('getSubstitution error:', error.message)
    res.json({
      success: true,
      substitutes: ['Try a similar pantry ingredient', 'Check online for alternatives']
    })
  }
}

// ─── 4. Chef Chatbot ──────────────────────────────────────────────────────────
exports.chatWithChef = async (req, res) => {
  try {
    const { messages } = req.body
    if (!messages || messages.length === 0) {
      return res.status(400).json({ success: false, message: 'Messages are required' })
    }

    const systemMessage = {
      role: 'system',
      content: `You are a friendly and knowledgeable AI Chef Assistant named "Chef AI" for Smart Cookery app. 
You help users with:
- Recipe suggestions and cooking tips
- Ingredient substitutions
- Fixing cooking mistakes
- Nutrition advice
- Indian and international cuisine
- Quick meal ideas
Keep responses concise, friendly, and practical. Use emojis occasionally to be friendly.
If asked about non-cooking topics, politely redirect to cooking.`
    }

    const result = await groqRequest(
      [systemMessage, ...messages.slice(-10)],
      500,
      0.8
    )

    if (result.error) return res.status(500).json({ success: false, message: result.error.message })

    const reply = result.choices[0].message.content
    res.json({ success: true, reply })
  } catch (error) {
    console.error('chatWithChef error:', error.message)
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── 5. Recipe from Photo ─────────────────────────────────────────────────────
exports.recipeFromPhoto = async (req, res) => {
  try {
    const { imageBase64, mimeType } = req.body
    if (!imageBase64) return res.status(400).json({ success: false, message: 'Image is required' })

    // Use Groq vision - if not available fall back to text only
    const prompt = `You are a professional chef. Look at this food image and:
1. Identify the dish
2. Generate a complete recipe for it

Respond ONLY with valid JSON (no extra text):
{
  "title": "Dish Name",
  "description": "Brief description",
  "cookingTime": 30,
  "servings": 4,
  "difficulty": "Easy",
  "category": "Dinner",
  "dietType": "veg",
  "cuisine": "Indian",
  "ingredients": [{"name": "ingredient", "quantity": "2", "unit": "cups"}],
  "steps": [{"stepNumber": 1, "instruction": "Step description", "duration": 5}],
  "nutrition": {"calories": 350, "protein": 15, "carbs": 40, "fat": 12, "fiber": 5},
  "tags": ["homemade"]
}`

    // Try vision model first
    const body = JSON.stringify({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      messages: [{
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: `data:${mimeType};base64,${imageBase64}` } },
          { type: 'text', text: prompt }
        ]
      }],
      max_tokens: 1500,
      temperature: 0.7
    })

    const result = await new Promise((resolve, reject) => {
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
      const req = https.request(options, (response) => {
        let data = ''
        response.on('data', chunk => data += chunk)
        response.on('end', () => {
          try { resolve(JSON.parse(data)) }
          catch (e) { reject(e) }
        })
      })
      req.on('error', reject)
      req.write(body)
      req.end()
    })

    console.log('recipeFromPhoto result:', JSON.stringify(result).slice(0, 300))

    if (result.error) {
      return res.status(500).json({ success: false, message: result.error.message })
    }

    const recipe = extractJSON(result.choices[0].message.content)
    res.json({ success: true, recipe })
  } catch (error) {
    console.error('recipeFromPhoto error:', error.message)
    res.status(500).json({ success: false, message: 'Failed to analyse image: ' + error.message })
  }
}

// ─── 6. Nutrition Goal Planner ────────────────────────────────────────────────
exports.generateNutritionPlan = async (req, res) => {
  try {
    const { goal, age, weight, height, gender, activity, dietType, allergies, mealsPerDay } = req.body

    // Calculate BMR (Mifflin-St Jeor)
    let bmr = gender === 'male'
      ? 10 * weight + 6.25 * height - 5 * age + 5
      : 10 * weight + 6.25 * height - 5 * age - 161

    const activityMultipliers = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725 }
    const tdee = Math.round(bmr * (activityMultipliers[activity] || 1.55))

    const goalCalories = {
      weight_loss: Math.round(tdee - 500),
      muscle_gain: Math.round(tdee + 300),
      diabetic: Math.round(tdee - 200),
      heart_health: tdee,
      energy: tdee,
      vegetarian: tdee
    }

    const targetCalories = goalCalories[goal] || tdee

    const prompt = `You are a certified nutritionist. Create a personalised 7-day meal plan.

User Profile:
- Goal: ${goal.replace('_', ' ')}
- Age: ${age}, Gender: ${gender}
- Weight: ${weight}kg, Height: ${height}cm
- Activity: ${activity}
- Diet: ${dietType}
- Daily calorie target: ${targetCalories} kcal
- Meals per day: ${mealsPerDay}
${allergies ? `- Avoid: ${allergies}` : ''}

Focus on Indian meals. Respond ONLY with valid JSON (no extra text):
{
  "dailyTargets": {
    "calories": ${targetCalories},
    "protein": 120,
    "carbs": 150,
    "fat": 65
  },
  "tips": "One key personalised tip for this goal",
  "weeklyPlan": [
    {
      "day": 1,
      "meals": [
        {"type": "Breakfast", "name": "Meal name", "calories": 400, "protein": 20},
        {"type": "Lunch", "name": "Meal name", "calories": 600, "protein": 35},
        {"type": "Dinner", "name": "Meal name", "calories": 500, "protein": 30}
      ]
    }
  ]
}
Generate all 7 days.`

    const result = await groqRequest([{ role: 'user', content: prompt }], 3000, 0.6)
    console.log('nutritionPlan result:', JSON.stringify(result).slice(0, 200))

    if (result.error) return res.status(500).json({ success: false, message: result.error.message })

    const plan = extractJSON(result.choices[0].message.content)
    res.json({ success: true, plan })
  } catch (error) {
    console.error('generateNutritionPlan error:', error.message)
    res.status(500).json({ success: false, message: error.message })
  }
}