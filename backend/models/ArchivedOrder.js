const mongoose = require('mongoose')

const archivedOrderSchema = new mongoose.Schema({
  tableNumber: String,
  waiterName: String,
  waiterId: String,
  items: [{ name: String, qty: Number, price: Number }],
  status: String,
  kitchenStatus: String,
  totalAmount: Number,
  billedAt: Date,
  isVoided: Boolean,
  voidedAt: Date,
  voidReason: String,
  createdAt: Date,
  updatedAt: Date,
  archivedAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('ArchivedOrder', archivedOrderSchema)
