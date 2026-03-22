import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { logout } from '../../redux/slices/authSlice'
import { toggleDarkMode } from '../../redux/slices/uiSlice'
import { getInitials } from '../../utils/helpers'
import { FiSun, FiMoon, FiMenu, FiX, FiHome, FiSearch,
  FiPlusCircle, FiUser, FiLogOut, FiCalendar, FiShoppingCart, FiCpu,
  FiCamera, FiActivity, FiFolder
} from 'react-icons/fi'

export default function Navbar() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user, token } = useSelector(s => s.auth)
  const { darkMode } = useSelector(s => s.ui)
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropOpen, setDropOpen] = useState(false)

  const navLinks = [
    { to: '/', label: 'Home', icon: <FiHome /> },
    { to: '/search', label: 'Explore', icon: <FiSearch /> },
    ...(token ? [
      { to: '/ai-generator', label: 'AI Chef', icon: <FiCpu /> },
      { to: '/meal-planner', label: 'Meal Plan', icon: <FiCalendar /> },
      { to: '/recipe-from-photo', label: 'Photo Recipe', icon: <FiCamera /> },
      { to: '/nutrition-planner', label: 'Nutrition', icon: <FiActivity /> },
      { to: '/collections', label: 'Collections', icon: <FiFolder /> },
    ] : [])
  ]

  const handleLogout = () => {
    dispatch(logout())
    setDropOpen(false)
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-primary-500">
            <span className="text-2xl">🍲</span>
            <span className="hidden sm:block">Smart Cookery</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(l => (
              <NavLink key={l.to} to={l.to} end={l.to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                    : 'text-gray-600 dark:text-gray-300 hover:text-primary-500 hover:bg-gray-50 dark:hover:bg-gray-800'}`
                }>
                {l.icon} {l.label}
              </NavLink>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <button onClick={() => dispatch(toggleDarkMode())}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              {darkMode ? <FiSun size={18} /> : <FiMoon size={18} />}
            </button>

            {token ? (
              <>
                <Link to="/add-recipe"
                  className="hidden sm:flex items-center gap-1.5 btn-primary text-sm py-2">
                  <FiPlusCircle size={16} /> Add Recipe
                </Link>

                <div className="relative">
                  <button onClick={() => setDropOpen(!dropOpen)}
                    className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-primary-300 transition-all">
                    {user?.avatar
                      ? <img src={user.avatar} className="w-8 h-8 rounded-full object-cover" alt="avatar" />
                      : <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-xs font-bold">
                          {getInitials(user?.name)}
                        </div>
                    }
                  </button>

                  <AnimatePresence>
                    {dropOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                        className="absolute right-0 mt-2 w-52 card py-1 shadow-xl">
                        <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                          <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">{user?.name}</p>
                          <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        </div>
                        {[
                          { to: '/dashboard', icon: <FiUser size={14} />, label: 'Dashboard' },
                          { to: '/grocery-list', icon: <FiShoppingCart size={14} />, label: 'Grocery List' },
                        ].map(item => (
                          <Link key={item.to} to={item.to} onClick={() => setDropOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                            {item.icon} {item.label}
                          </Link>
                        ))}
                        <button onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                          <FiLogOut size={14} /> Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/login" className="btn-secondary text-sm py-2">Login</Link>
                <Link to="/register" className="btn-primary text-sm py-2">Sign Up</Link>
              </div>
            )}

            <button onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800">
              {menuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
            className="md:hidden overflow-hidden bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
            <div className="px-4 py-3 space-y-1">
              {navLinks.map(l => (
                <NavLink key={l.to} to={l.to} end={l.to === '/'} onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium ${isActive ? 'bg-primary-50 text-primary-600' : 'text-gray-700 dark:text-gray-300'}`}>
                  {l.icon} {l.label}
                </NavLink>
              ))}
              {!token && (
                <div className="pt-2 flex gap-2">
                  <Link to="/login" onClick={() => setMenuOpen(false)} className="flex-1 btn-secondary text-center text-sm py-2">Login</Link>
                  <Link to="/register" onClick={() => setMenuOpen(false)} className="flex-1 btn-primary text-center text-sm py-2">Sign Up</Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
