const Recipe = require('../models/Recipe');
const User = require('../models/User');
const { cloudinary } = require('../config/cloudinary');

exports.getAllRecipes = async (req, res) => {
  try {
    const {
      search, category, dietType, difficulty,
      minTime, maxTime, page = 1, limit = 12, sort = '-createdAt'
    } = req.query;

    const query = { isPublished: true };

    if (search) {
      query.$text = { $search: search };
    }
    if (category) query.category = category;
    if (dietType) query.dietType = dietType;
    if (difficulty) query.difficulty = difficulty;
    if (minTime || maxTime) {
      query.cookingTime = {};
      if (minTime) query.cookingTime.$gte = parseInt(minTime);
      if (maxTime) query.cookingTime.$lte = parseInt(maxTime);
    }

    const total = await Recipe.countDocuments(query);
    const recipes = await Recipe.find(query)
      .populate('createdBy', 'name avatar')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      recipes,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getRecipeById = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id)
      .populate('createdBy', 'name avatar bio')
      .populate('comments.user', 'name avatar');

    if (!recipe) {
      return res.status(404).json({ success: false, message: 'Recipe not found' });
    }

    recipe.views += 1;
    await recipe.save();

    res.json({ success: true, recipe });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createRecipe = async (req, res) => {
  try {
    const recipeData = {
      ...req.body,
      createdBy: req.user._id,
      ingredients: JSON.parse(req.body.ingredients || '[]'),
      steps: JSON.parse(req.body.steps || '[]'),
      tags: req.body.tags ? (Array.isArray(req.body.tags) ? req.body.tags : req.body.tags.split(',').map(t => t.trim()).filter(Boolean)): [],
      nutrition: JSON.parse(req.body.nutrition || '{}')
    };

    if (req.file) {
      recipeData.image = req.file.path;
      recipeData.imagePublicId = req.file.filename;
    }

    const recipe = await Recipe.create(recipeData);

    await User.findByIdAndUpdate(req.user._id, {
      $push: { createdRecipes: recipe._id }
    });

    res.status(201).json({ success: true, recipe });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateRecipe = async (req, res) => {
  try {
    let recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ success: false, message: 'Recipe not found' });

    if (recipe.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const updateData = { ...req.body };
    if (req.body.ingredients) updateData.ingredients = JSON.parse(req.body.ingredients);
    if (req.body.steps) updateData.steps = JSON.parse(req.body.steps);
    if (req.body.tags) updateData.tags = JSON.parse(req.body.tags);
    if (req.body.nutrition) updateData.nutrition = JSON.parse(req.body.nutrition);

    if (req.file) {
      if (recipe.imagePublicId) {
        await cloudinary.uploader.destroy(recipe.imagePublicId);
      }
      updateData.image = req.file.path;
      updateData.imagePublicId = req.file.filename;
    }

    recipe = await Recipe.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    res.json({ success: true, recipe });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ success: false, message: 'Recipe not found' });

    if (recipe.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (recipe.imagePublicId) {
      await cloudinary.uploader.destroy(recipe.imagePublicId);
    }

    await recipe.deleteOne();
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { createdRecipes: recipe._id }
    });

    res.json({ success: true, message: 'Recipe deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.likeRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ success: false, message: 'Recipe not found' });

    const isLiked = recipe.likes.includes(req.user._id);
    if (isLiked) {
      recipe.likes.pull(req.user._id);
    } else {
      recipe.likes.push(req.user._id);
    }
    await recipe.save();

    res.json({ success: true, likes: recipe.likes.length, isLiked: !isLiked });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addComment = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ success: false, message: 'Recipe not found' });

    const comment = {
      user: req.user._id,
      userName: req.user.name,
      userAvatar: req.user.avatar,
      text: req.body.text
    };

    recipe.comments.push(comment);
    await recipe.save();

    res.status(201).json({ success: true, comment: recipe.comments[recipe.comments.length - 1] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.rateRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ success: false, message: 'Recipe not found' });

    const existingRating = recipe.ratings.find(r => r.user.toString() === req.user._id.toString());
    if (existingRating) {
      existingRating.rating = req.body.rating;
    } else {
      recipe.ratings.push({ user: req.user._id, rating: req.body.rating });
    }

    await recipe.save();
    res.json({ success: true, averageRating: recipe.averageRating });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.saveRecipe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const isSaved = user.savedRecipes.includes(req.params.id);

    if (isSaved) {
      user.savedRecipes.pull(req.params.id);
    } else {
      user.savedRecipes.push(req.params.id);
    }
    await user.save();

    res.json({ success: true, isSaved: !isSaved });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getTrendingRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.find({ isPublished: true })
      .populate('createdBy', 'name avatar')
      .sort({ views: -1, likes: -1 })
      .limit(8);

    res.json({ success: true, recipes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
