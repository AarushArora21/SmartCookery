import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <p className="text-8xl mb-4">🍽️</p>
        <h1 className="text-6xl font-extrabold text-gray-200 dark:text-gray-700 mb-2">404</h1>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-3">Page not found</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8">Looks like this recipe got lost in the kitchen!</p>
        <Link to="/" className="btn-primary px-8 py-3 text-base">Back to Home</Link>
      </motion.div>
    </div>
  )
}
