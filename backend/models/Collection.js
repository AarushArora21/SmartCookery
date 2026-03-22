// backend/models/Collection.js
const mongoose = require('mongoose')

const collectionSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  emoji: { type: String, default: '📁' },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }],
  isPublic: { type: Boolean, default: false }
}, { timestamps: true })

module.exports = mongoose.model('Collection', collectionSchema)