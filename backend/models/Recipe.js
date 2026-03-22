const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  ingredients: [{
    name: { type: String, required: true },
    quantity: { type: String, required: true },
    unit: { type: String, default: '' }
  }],
  steps: [{
    stepNumber: Number,
    instruction: { type: String, required: true },
    duration: { type: Number, default: 0 }
  }],
  category: {
    type: String,
    enum: ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert', 'Drink', 'Appetizer'],
    required: true
  },
  cuisine: {
    type: String,
    default: 'Indian'
  },
  dietType: {
    type: String,
    enum: ['veg', 'non-veg', 'vegan'],
    required: true
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Easy'
  },
  cookingTime: {
    type: Number,
    required: true
  },
  servings: {
    type: Number,
    default: 2
  },
  image: {
    type: String,
    default: ''
  },
  imagePublicId: {
    type: String,
    default: ''
  },
  nutrition: {
    calories: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    fat: { type: Number, default: 0 },
    fiber: { type: Number, default: 0 }
  },
  tags: [String],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userName: String,
    userAvatar: String,
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }],
  ratings: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number, min: 1, max: 5 }
  }],
  averageRating: {
    type: Number,
    default: 0
  },
  isPublished: {
    type: Boolean,
    default: true
  },
  views: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Index for search performance
recipeSchema.index({ title: 'text', description: 'text', tags: 'text' });
recipeSchema.index({ category: 1, dietType: 1, difficulty: 1 });
recipeSchema.index({ createdBy: 1 });

// Compute average rating before save
recipeSchema.pre('save', function(next) {
  if (this.ratings.length > 0) {
    this.averageRating = this.ratings.reduce((acc, r) => acc + r.rating, 0) / this.ratings.length;
  }
  next();
});

module.exports = mongoose.model('Recipe', recipeSchema);
