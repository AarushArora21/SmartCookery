function toggleSidebar() {
  var sidebar = document.getElementById('sidebar');
  if (sidebar.style.left === '-300px' || sidebar.style.left === '') {
      sidebar.style.left = '0';
  } else {
      sidebar.style.left = '-300px';
  }
}

function filterRecipes() {
  const filterInput = document.getElementById('filter-bar').value.toLowerCase();
  const recipes = document.querySelectorAll('.recipe-item');

  recipes.forEach(recipe => {
    const recipeName = recipe.textContent.toLowerCase();
    if (recipeName.includes(filterInput)) {
      recipe.style.display = '';
    } else {
      recipe.style.display = 'none';
    }
  });
}



function searchRecipe(event) {
  event.preventDefault();
  const searchInput = document.getElementById('search-bar').value.toLowerCase();
  if (searchInput === 'pizza') {
    window.location.href = 'recipes/pizza.html';
  } else if (searchInput === 'pasta') {
    window.location.href = 'recipes/pasta.html';
  } else if (searchInput === 'salad') {
    window.location.href = 'recipes/salad.html';
  } else if (searchInput === 'butter chicken') {
    window.location.href = 'recipes/butter chicken.html';
  } else if (searchInput === 'mutton') {
    window.location.href = 'recipes/mutton.html';
  } else if (searchInput === 'chocolate cake') {
    window.location.href = 'recipes/chocolate_cake.html';
    } else if (searchInput === 'maggie') {
      window.location.href = 'recipes/maggie.html';
  } else {
    alert('Recipe not found!');
  }
}

function openRecipe(recipePage) {
  window.location.href = `recipes/${recipePage}`;
}

function toggleDarkMode() {
  const body = document.body;
  body.classList.toggle('dark-mode');
}