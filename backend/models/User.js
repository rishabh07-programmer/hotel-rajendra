const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['waiter', 'owner', 'kitchen', 'developer'],
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  deviceId: {
    type: String,
    default: null
  },
  deviceName: {
    type: String,
    default: null
  }
}, { timestamps: true })

module.exports = mongoose.model('User', userSchema)
