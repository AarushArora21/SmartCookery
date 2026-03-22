import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import recipeReducer from './slices/recipeSlice'
import uiReducer from './slices/uiSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    recipes: recipeReducer,
    ui: uiReducer,
  },
})
