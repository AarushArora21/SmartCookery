import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchRecipeById } from '../redux/slices/recipeSlice'
import RecipeForm from '../components/recipe/RecipeForm'
import LoadingSpinner from '../components/common/LoadingSpinner'

export default function EditRecipePage() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const { currentRecipe, loading } = useSelector(s => s.recipes)

  useEffect(() => { dispatch(fetchRecipeById(id)) }, [dispatch, id])

  if (loading || !currentRecipe) return <LoadingSpinner fullScreen />
  return <RecipeForm initialData={currentRecipe} />
}
