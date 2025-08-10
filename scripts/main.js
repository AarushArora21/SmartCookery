const recipes = [
    { name: "Paneer Tikka", url: "recipe1.html" },
    { name: "Butter Chicken", url: "recipe2.html" },
    { name: "Dal Tadka", url: "recipe3.html" },
    { name: "Aloo Gobi", url: "recipe4.html" },
    { name: "Chole Bhature", url: "recipe5.html" }
];

function searchRecipe() {
    const searchQuery = document.getElementById("search").value.toLowerCase();
    const filteredRecipes = recipes.filter(recipe =>
        recipe.name.toLowerCase().includes(searchQuery)
    );

    const recipeCards = document.querySelectorAll(".recipe-card");
    recipeCards.forEach((card, index) => {
        const recipeName = recipes[index].name.toLowerCase();
        card.style.display = recipeName.includes(searchQuery) ? "block" : "none";
    });
}

// Hamburger Sidebar Toggle
document.getElementById("hamburger").addEventListener("click", function() {
    document.querySelector(".sidebar").classList.toggle("active");
});
