const mongoose = require('mongoose')

const menuItemSchema = new mongoose.Schema({
  category: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  variable: { type: Boolean, default: false },
  sortOrder: { type: Number, default: 99 }
}, { timestamps: true })

module.exports = mongoose.model('MenuItem', menuItemSchema)
