// CookMode.jsx
// Place in: frontend/src/components/recipe/CookMode.jsx

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiX, FiChevronLeft, FiChevronRight, FiPlay,
  FiPause, FiRotateCcw, FiVolume2, FiVolumeX
} from 'react-icons/fi'

export default function CookMode({ recipe, onClose }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [timeLeft, setTimeLeft] = useState(null)
  const [isRunning, setIsRunning] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [completedSteps, setCompletedSteps] = useState([])
  const timerRef = useRef(null)
  const wakeLockRef = useRef(null)

  const steps = recipe.steps || []
  const step = steps[currentStep]
  const totalSteps = steps.length

  // Request WakeLock to keep screen on
  useEffect(() => {
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLockRef.current = await navigator.wakeLock.request('screen')
        }
      } catch (e) {}
    }
    requestWakeLock()
    return () => {
      if (wakeLockRef.current) wakeLockRef.current.release()
    }
  }, [])

  // Set timer when step changes
  useEffect(() => {
    clearInterval(timerRef.current)
    setIsRunning(false)
    if (step?.duration > 0) {
      setTimeLeft(step.duration * 60)
    } else {
      setTimeLeft(null)
    }
  }, [currentStep, step])

  // Timer countdown
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current)
            setIsRunning(false)
            speak('Timer done! Step complete.')
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      clearInterval(timerRef.current)
    }
    return () => clearInterval(timerRef.current)
  }, [isRunning, timeLeft])

  const speak = useCallback((text) => {
    if (!voiceEnabled || !window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.9
    utterance.pitch = 1
    window.speechSynthesis.speak(utterance)
  }, [voiceEnabled])

  // Read step aloud when it changes
  useEffect(() => {
    if (step) {
      speak(`Step ${currentStep + 1}. ${step.instruction}`)
    }
  }, [currentStep, speak])

  const goNext = () => {
    if (currentStep < totalSteps - 1) {
      setCompletedSteps(prev => [...new Set([...prev, currentStep])])
      setCurrentStep(currentStep + 1)
    }
  }

  const goPrev = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1)
  }

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const progress = ((currentStep + 1) / totalSteps) * 100

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-gray-950 flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-widest">Cook Mode</p>
            <h2 className="text-white font-bold text-lg line-clamp-1">{recipe.title}</h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className={`p-2 rounded-xl transition-colors ${voiceEnabled ? 'text-primary-400 bg-primary-900/30' : 'text-gray-500 bg-gray-800'}`}
            >
              {voiceEnabled ? <FiVolume2 size={18} /> : <FiVolumeX size={18} />}
            </button>
            <button onClick={onClose} className="p-2 rounded-xl bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors">
              <FiX size={18} />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-gray-800">
          <motion.div
            className="h-full bg-gradient-to-r from-primary-500 to-orange-400"
            animate={{ width: `${progress}%` }}
            transition={{ type: 'spring', stiffness: 60 }}
          />
        </div>

        {/* Step Counter */}
        <div className="flex justify-center gap-2 py-4 px-6 overflow-x-auto">
          {steps.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentStep(i)}
              className={`w-8 h-8 rounded-full text-xs font-bold flex-shrink-0 transition-all ${
                i === currentStep
                  ? 'bg-primary-500 text-white scale-110'
                  : completedSteps.includes(i)
                  ? 'bg-green-700 text-green-100'
                  : 'bg-gray-700 text-gray-400'
              }`}
            >
              {completedSteps.includes(i) ? '✓' : i + 1}
            </button>
          ))}
        </div>

        {/* Main Step Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-4 max-w-2xl mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              className="w-full text-center"
            >
              <div className="w-16 h-16 rounded-full bg-primary-500 text-white text-2xl font-extrabold flex items-center justify-center mx-auto mb-6">
                {currentStep + 1}
              </div>
              <p className="text-white text-2xl sm:text-3xl font-medium leading-relaxed mb-6">
                {step?.instruction}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Timer */}
          {timeLeft !== null && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 text-center"
            >
              <div className={`text-6xl font-mono font-extrabold mb-4 ${
                timeLeft < 30 && isRunning ? 'text-red-400 animate-pulse' : 'text-primary-400'
              }`}>
                {formatTime(timeLeft)}
              </div>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setIsRunning(!isRunning)}
                  className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-2xl font-semibold transition-colors"
                >
                  {isRunning ? <FiPause /> : <FiPlay />}
                  {isRunning ? 'Pause' : 'Start Timer'}
                </button>
                <button
                  onClick={() => { setTimeLeft(step.duration * 60); setIsRunning(false) }}
                  className="p-3 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-2xl transition-colors"
                >
                  <FiRotateCcw />
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Navigation */}
        <div className="px-6 pb-8 flex gap-4 max-w-2xl mx-auto w-full">
          <button
            onClick={goPrev}
            disabled={currentStep === 0}
            className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-gray-800 text-gray-300 font-semibold disabled:opacity-30 hover:bg-gray-700 transition-colors"
          >
            <FiChevronLeft /> Previous
          </button>

          {currentStep === totalSteps - 1 ? (
            <button
              onClick={onClose}
              className="flex-1 py-4 rounded-2xl bg-green-600 hover:bg-green-500 text-white font-bold transition-colors"
            >
              🎉 Done!
            </button>
          ) : (
            <button
              onClick={goNext}
              className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-primary-500 hover:bg-primary-600 text-white font-bold transition-colors"
            >
              Next <FiChevronRight />
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}