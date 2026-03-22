import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div>
            <Link to="/" className="flex items-center gap-2 font-bold text-xl text-primary-500 mb-3">
              <span>🍲</span> Smart Cookery
            </Link>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              AI-powered personalized cooking assistant and recipe social platform.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Explore</h4>
            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              {[['/', 'Home'], ['/search', 'Browse Recipes'], ['/ai-generator', 'AI Chef'], ['/meal-planner', 'Meal Planner']].map(([to, label]) => (
                <li key={to}><Link to={to} className="hover:text-primary-500 transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Account</h4>
            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              {[['/login', 'Login'], ['/register', 'Sign Up'], ['/dashboard', 'Dashboard'], ['/grocery-list', 'Grocery List']].map(([to, label]) => (
                <li key={to}><Link to={to} className="hover:text-primary-500 transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 text-center text-sm text-gray-400">
          © {new Date().getFullYear()} Smart Cookery. Built with ❤️ and React.
        </div>
      </div>
    </footer>
  )
}
