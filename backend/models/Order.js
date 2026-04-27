const mongoose = require('mongoose')

const orderItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  qty: {
    type: Number,
    required: true
  },
  price: {
    type: Number,
    required: true
  }
})

const orderSchema = new mongoose.Schema({
  tableNumber: {
    type: String,
    required: true
  },
  waiterName: {
    type: String,
    required: true
  },
  waiterId: {
    type: String,
    required: true
  },
  items: [orderItemSchema],
  status: {
    type: String,
    enum: ['active', 'billed'],
    default: 'active'
  },
  kitchenStatus: {
    type: String,
    enum: ['pending', 'received', 'ready'],
    default: 'pending'
  },
  totalAmount: {
    type: Number,
    default: 0
  },
  billedAt: {
    type: Date
  }
}, { timestamps: true })

module.exports = mongoose.model('Order', orderSchema)