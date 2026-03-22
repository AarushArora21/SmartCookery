// backend/controllers/collectionController.js
const Collection = require('../models/Collection')

exports.getMyCollections = async (req, res) => {
  try {
    const collections = await Collection.find({ owner: req.user._id })
      .populate('recipes', 'title image cookingTime dietType')
    res.json({ success: true, collections })
  } catch (e) { res.status(500).json({ success: false, message: e.message }) }
}

exports.createCollection = async (req, res) => {
  try {
    const { name, description, emoji, isPublic } = req.body
    const collection = await Collection.create({
      name, description, emoji: emoji || '📁', isPublic, owner: req.user._id
    })
    res.status(201).json({ success: true, collection })
  } catch (e) { res.status(500).json({ success: false, message: e.message }) }
}

exports.addRecipeToCollection = async (req, res) => {
  try {
    const collection = await Collection.findOne({ _id: req.params.id, owner: req.user._id })
    if (!collection) return res.status(404).json({ success: false, message: 'Collection not found' })
    if (!collection.recipes.includes(req.body.recipeId)) {
      collection.recipes.push(req.body.recipeId)
      await collection.save()
    }
    res.json({ success: true, collection })
  } catch (e) { res.status(500).json({ success: false, message: e.message }) }
}

exports.removeRecipeFromCollection = async (req, res) => {
  try {
    const collection = await Collection.findOne({ _id: req.params.id, owner: req.user._id })
    if (!collection) return res.status(404).json({ success: false, message: 'Collection not found' })
    collection.recipes.pull(req.params.recipeId)
    await collection.save()
    res.json({ success: true })
  } catch (e) { res.status(500).json({ success: false, message: e.message }) }
}

exports.deleteCollection = async (req, res) => {
  try {
    await Collection.findOneAndDelete({ _id: req.params.id, owner: req.user._id })
    res.json({ success: true, message: 'Collection deleted' })
  } catch (e) { res.status(500).json({ success: false, message: e.message }) }
}