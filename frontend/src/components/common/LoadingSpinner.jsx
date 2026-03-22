// LoadingSpinner.jsx
export default function LoadingSpinner({ fullScreen, size = 'md' }) {
  const sizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' }
  const spinner = (
    <div className={`${sizes[size]} border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin`} />
  )
  if (fullScreen) {
    return <div className="fixed inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-950/80 z-50">{spinner}</div>
  }
  return <div className="flex justify-center py-12">{spinner}</div>
}
