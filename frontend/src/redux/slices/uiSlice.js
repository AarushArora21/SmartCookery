import { createSlice } from '@reduxjs/toolkit'

const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
const savedTheme = localStorage.getItem('theme')
const isDark = savedTheme ? savedTheme === 'dark' : prefersDark

if (isDark) document.documentElement.classList.add('dark')

const uiSlice = createSlice({
  name: 'ui',
  initialState: { darkMode: isDark, mobileMenuOpen: false },
  reducers: {
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode
      localStorage.setItem('theme', state.darkMode ? 'dark' : 'light')
      document.documentElement.classList.toggle('dark', state.darkMode)
    },
    setMobileMenu: (state, action) => { state.mobileMenuOpen = action.payload },
  }
})

export const { toggleDarkMode, setMobileMenu } = uiSlice.actions
export default uiSlice.reducer
