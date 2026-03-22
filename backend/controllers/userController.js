const User = require('../models/User');
const Recipe = require('../models/Recipe');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('savedRecipes', 'title image cookingTime dietType averageRating')
      .populate('createdRecipes', 'title image cookingTime dietType averageRating likes views')
      .select('-password');

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSavedRecipes = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: 'savedRecipes',
        populate: { path: 'createdBy', select: 'name avatar' }
      });

    res.json({ success: true, recipes: user.savedRecipes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMealPlan = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('mealPlan');
    res.json({ success: true, mealPlan: user.mealPlan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateMealPlan = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { mealPlan: req.body.mealPlan },
      { new: true }
    ).select('mealPlan');

    res.json({ success: true, mealPlan: user.mealPlan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getGroceryList = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('groceryList');
    res.json({ success: true, groceryList: user.groceryList });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateGroceryList = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { groceryList: req.body.groceryList },
      { new: true }
    ).select('groceryList');

    res.json({ success: true, groceryList: user.groceryList });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getUserPublicProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('name avatar bio createdRecipes followers following')
      .populate('createdRecipes', 'title image cookingTime dietType averageRating');

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.followUser = async (req, res) => {
  try {
    if (req.params.userId === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot follow yourself' });
    }

    const userToFollow = await User.findById(req.params.userId);
    if (!userToFollow) return res.status(404).json({ success: false, message: 'User not found' });

    const currentUser = await User.findById(req.user._id);
    const isFollowing = currentUser.following.includes(req.params.userId);

    if (isFollowing) {
      currentUser.following.pull(req.params.userId);
      userToFollow.followers.pull(req.user._id);
    } else {
      currentUser.following.push(req.params.userId);
      userToFollow.followers.push(req.user._id);
    }

    await currentUser.save();
    await userToFollow.save();

    res.json({ success: true, isFollowing: !isFollowing });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
