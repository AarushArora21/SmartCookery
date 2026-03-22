// frontend/src/pages/NutritionPlannerPage.jsx
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../utils/api'
import toast from 'react-hot-toast'

const GOALS = [
  { id: 'weight_loss', emoji: '🔥', label: 'Lose Weight', desc: 'Calorie deficit diet' },
  { id: 'muscle_gain', emoji: '💪', label: 'Build Muscle', desc: 'High protein diet' },
  { id: 'diabetic', emoji: '🩺', label: 'Diabetic Diet', desc: 'Low sugar, low carb' },
  { id: 'heart_health', emoji: '❤️', label: 'Heart Health', desc: 'Low fat, low sodium' },
  { id: 'energy', emoji: '⚡', label: 'Boost Energy', desc: 'Balanced macros' },
  { id: 'vegetarian', emoji: '🥗', label: 'Vegetarian', desc: 'Plant-based nutrition' },
]

const ACTIVITY = [
  { id: 'sedentary', label: 'Sedentary', desc: 'Little or no exercise' },
  { id: 'light', label: 'Lightly Active', desc: '1-3 days/week' },
  { id: 'moderate', label: 'Moderate', desc: '3-5 days/week' },
  { id: 'active', label: 'Very Active', desc: '6-7 days/week' },
]

export default function NutritionPlannerPage() {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({
    goal: '',
    age: '',
    weight: '',
    height: '',
    gender: 'male',
    activity: 'moderate',
    dietType: 'veg',
    allergies: '',
    mealsPerDay: 3,
  })
  const [loading, setLoading] = useState(false)
  const [plan, setPlan] = useState(null)

  const set = (k) => (v) => setForm({ ...form, [k]: v })

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const { data } = await api.post('/ai/nutrition-plan', form)
      setPlan(data.plan)
      setStep(3)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate plan')
    }
    setLoading(false)
  }

  const STEPS = ['Goal', 'Profile', 'Preferences', 'Your Plan']

  return (
    <div className="page-container max-w-3xl">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg">
          🥗
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Nutrition Goal Planner</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">AI-powered personalised weekly meal plan based on your health goals</p>
      </div>

      {/* Step tabs */}
      <div className="flex gap-1 mb-8 bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl">
        {STEPS.map((s, i) => (
          <button key={s} onClick={() => i < step && setStep(i)}
            className={`flex-1 py-2 px-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
              step === i ? 'bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
              : i < step ? 'text-gray-500 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300'
              : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
            }`}>
            {i < step ? '✓ ' : ''}{s}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Step 0 — Goal */}
        {step === 0 && (
          <motion.div key="goal" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">What's your health goal?</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
              {GOALS.map(g => (
                <button key={g.id} onClick={() => set('goal')(g.id)}
                  className={`card p-4 text-left transition-all hover:-translate-y-0.5 ${
                    form.goal === g.id ? 'ring-2 ring-emerald-400 bg-emerald-50 dark:bg-emerald-900/20' : ''
                  }`}>
                  <span className="text-3xl block mb-2">{g.emoji}</span>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">{g.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{g.desc}</p>
                </button>
              ))}
            </div>
            <button onClick={() => setStep(1)} disabled={!form.goal} className="btn-primary w-full py-3 disabled:opacity-40">
              Next →
            </button>
          </motion.div>
        )}

        {/* Step 1 — Profile */}
        {step === 1 && (
          <motion.div key="profile" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Tell us about yourself</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Gender</label>
                  <div className="flex gap-2">
                    {['male', 'female'].map(g => (
                      <button key={g} onClick={() => set('gender')(g)}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all capitalize ${
                          form.gender === g ? 'bg-emerald-500 text-white border-emerald-500' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'
                        }`}>{g}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Age</label>
                  <input type="number" min={10} max={100} value={form.age}
                    onChange={e => set('age')(e.target.value)}
                    placeholder="25" className="input-field" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Weight (kg)</label>
                  <input type="number" value={form.weight} onChange={e => set('weight')(e.target.value)}
                    placeholder="70" className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Height (cm)</label>
                  <input type="number" value={form.height} onChange={e => set('height')(e.target.value)}
                    placeholder="170" className="input-field" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Activity Level</label>
                <div className="grid grid-cols-2 gap-2">
                  {ACTIVITY.map(a => (
                    <button key={a.id} onClick={() => set('activity')(a.id)}
                      className={`p-3 rounded-xl text-left border transition-all ${
                        form.activity === a.id ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20' : 'border-gray-200 dark:border-gray-700'
                      }`}>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">{a.label}</p>
                      <p className="text-xs text-gray-400">{a.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep(0)} className="btn-secondary flex-1">← Back</button>
              <button onClick={() => setStep(2)} disabled={!form.age || !form.weight || !form.height}
                className="btn-primary flex-1 disabled:opacity-40">Next →</button>
            </div>
          </motion.div>
        )}

        {/* Step 2 — Preferences */}
        {step === 2 && (
          <motion.div key="prefs" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Diet Preferences</h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Diet Type</label>
                <div className="flex gap-2">
                  {['veg', 'non-veg', 'vegan'].map(d => (
                    <button key={d} onClick={() => set('dietType')(d)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all capitalize ${
                        form.dietType === d ? 'bg-emerald-500 text-white border-emerald-500' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'
                      }`}>{d}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Meals per day: <span className="text-emerald-500">{form.mealsPerDay}</span>
                </label>
                <input type="range" min={2} max={6} value={form.mealsPerDay}
                  onChange={e => set('mealsPerDay')(parseInt(e.target.value))}
                  className="w-full accent-emerald-500" />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>2 meals</span><span>6 meals</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Allergies / Foods to avoid
                </label>
                <input type="text" value={form.allergies} onChange={e => set('allergies')(e.target.value)}
                  placeholder="e.g. nuts, dairy, gluten" className="input-field" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep(1)} className="btn-secondary flex-1">← Back</button>
              <button onClick={handleGenerate} disabled={loading}
                className="btn-primary flex-1 flex items-center justify-center gap-2">
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Generating...</>
                ) : '🥗 Generate My Plan'}
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3 — Plan Result */}
        {step === 3 && plan && (
          <motion.div key="plan" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Daily targets */}
            <div className="card p-5">
              <h2 className="font-bold text-gray-900 dark:text-white text-lg mb-4">📊 Your Daily Targets</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Calories', val: plan.dailyTargets?.calories, unit: 'kcal', color: 'text-orange-500' },
                  { label: 'Protein', val: plan.dailyTargets?.protein, unit: 'g', color: 'text-blue-500' },
                  { label: 'Carbs', val: plan.dailyTargets?.carbs, unit: 'g', color: 'text-yellow-500' },
                  { label: 'Fat', val: plan.dailyTargets?.fat, unit: 'g', color: 'text-pink-500' },
                ].map(t => (
                  <div key={t.label} className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-3 text-center">
                    <p className={`text-2xl font-extrabold ${t.color}`}>{t.val}</p>
                    <p className="text-xs text-gray-400">{t.unit}</p>
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-300 mt-0.5">{t.label}</p>
                  </div>
                ))}
              </div>
              {plan.tips && (
                <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                  <p className="text-sm text-emerald-700 dark:text-emerald-300">💡 {plan.tips}</p>
                </div>
              )}
            </div>

            {/* Weekly meal plan */}
            <div className="space-y-4">
              <h2 className="font-bold text-gray-900 dark:text-white text-lg">📅 Your 7-Day Meal Plan</h2>
              {plan.weeklyPlan?.map((day, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }} className="card p-4">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-3">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]} — Day {i + 1}
                  </h3>
                  <div className="space-y-2">
                    {day.meals?.map((meal, j) => (
                      <div key={j} className="flex items-start gap-3">
                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 w-20 flex-shrink-0 pt-0.5">
                          {meal.type}
                        </span>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{meal.name}</p>
                          {meal.calories && (
                            <p className="text-xs text-gray-400">{meal.calories} kcal · {meal.protein}g protein</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>

            <button onClick={() => { setPlan(null); setStep(0); setForm({ goal: '', age: '', weight: '', height: '', gender: 'male', activity: 'moderate', dietType: 'veg', allergies: '', mealsPerDay: 3 }) }}
              className="btn-secondary w-full">
              🔄 Generate New Plan
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}