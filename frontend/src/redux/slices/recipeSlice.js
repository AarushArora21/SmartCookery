import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../utils/api'
import toast from 'react-hot-toast'

export const fetchRecipes = createAsyncThunk('recipes/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/recipes', { params })
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message)
  }
})

export const fetchRecipeById = createAsyncThunk('recipes/fetchOne', async (id, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/recipes/${id}`)
    return data.recipe
  } catch (err) {
    return rejectWithValue(err.response?.data?.message)
  }
})

export const fetchTrending = createAsyncThunk('recipes/trending', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/recipes/trending')
    return data.recipes
  } catch (err) {
    return rejectWithValue(err.response?.data?.message)
  }
})

export const createRecipe = createAsyncThunk('recipes/create', async (formData, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/recipes', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    toast.success('Recipe created successfully!')
    return data.recipe
  } catch (err) {
    toast.error(err.response?.data?.message || 'Failed to create recipe')
    return rejectWithValue(err.response?.data?.message)
  }
})

export const updateRecipe = createAsyncThunk('recipes/update', async ({ id, formData }, { rejectWithValue }) => {
  try {
    const { data } = await api.put(`/recipes/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    toast.success('Recipe updated!')
    return data.recipe
  } catch (err) {
    return rejectWithValue(err.response?.data?.message)
  }
})

export const deleteRecipe = createAsyncThunk('recipes/delete', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/recipes/${id}`)
    toast.success('Recipe deleted')
    return id
  } catch (err) {
    return rejectWithValue(err.response?.data?.message)
  }
})

export const likeRecipe = createAsyncThunk('recipes/like', async (id) => {
  const { data } = await api.post(`/recipes/${id}/like`)
  return { id, ...data }
})

export const saveRecipe = createAsyncThunk('recipes/save', async (id) => {
  const { data } = await api.post(`/recipes/${id}/save`)
  return { id, ...data }
})

const recipeSlice = createSlice({
  name: 'recipes',
  initialState: {
    recipes: [],
    trending: [],
    currentRecipe: null,
    loading: false,
    totalPages: 1,
    currentPage: 1,
    total: 0,
    filters: { search: '', category: '', dietType: '', difficulty: '', sort: '-createdAt' },
    error: null,
  },
  reducers: {
    setFilters: (state, action) => { state.filters = { ...state.filters, ...action.payload } },
    clearCurrentRecipe: (state) => { state.currentRecipe = null },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRecipes.pending, (state) => { state.loading = true })
      .addCase(fetchRecipes.fulfilled, (state, action) => {
        state.loading = false
        state.recipes = action.payload.recipes
        state.totalPages = action.payload.totalPages
        state.currentPage = action.payload.currentPage
        state.total = action.payload.total
      })
      .addCase(fetchRecipes.rejected, (state) => { state.loading = false })
      .addCase(fetchRecipeById.pending, (state) => { state.loading = true })
      .addCase(fetchRecipeById.fulfilled, (state, action) => {
        state.loading = false; state.currentRecipe = action.payload
      })
      .addCase(fetchRecipeById.rejected, (state) => { state.loading = false })
      .addCase(fetchTrending.fulfilled, (state, action) => { state.trending = action.payload })
      .addCase(createRecipe.fulfilled, (state, action) => {
        state.recipes.unshift(action.payload)
      })
      .addCase(deleteRecipe.fulfilled, (state, action) => {
        state.recipes = state.recipes.filter(r => r._id !== action.payload)
      })
      .addCase(likeRecipe.fulfilled, (state, action) => {
        const recipe = state.recipes.find(r => r._id === action.payload.id)
        if (recipe) recipe.likes = action.payload.likes
        if (state.currentRecipe?._id === action.payload.id) {
          state.currentRecipe.likesCount = action.payload.likes
        }
      })
  }
})

export const { setFilters, clearCurrentRecipe } = recipeSlice.actions
export default recipeSlice.reducer
