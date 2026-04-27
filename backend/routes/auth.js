const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']
  if (!token) return res.status(401).json({ message: 'No token provided' })
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' })
  }
}

// Login
router.post('/login', async (req, res) => {
  try {
    const { userId, password } = req.body
    const user = await User.findOne({ userId })
    if (!user) return res.status(400).json({ message: 'Wrong ID or password' })

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) return res.status(400).json({ message: 'Wrong ID or password' })

    const token = jwt.sign(
      { userId: user.userId, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '16h' }
    )

    res.json({ token, role: user.role, name: user.name })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// Get all waiters (owner only)
router.get('/waiters', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'owner') return res.status(403).json({ message: 'Not allowed' })
    const waiters = await User.find({ role: 'waiter' }, '-password')
    res.json(waiters)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// Create new waiter (owner only)
router.post('/waiter/create', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'owner') return res.status(403).json({ message: 'Not allowed' })
    const { name, userId, password } = req.body

    const existing = await User.findOne({ userId })
    if (existing) return res.status(400).json({ message: 'User ID already exists' })

    const hashed = await bcrypt.hash(password, 10)
    const user = new User({ name, userId, password: hashed, role: 'waiter' })
    await user.save()

    res.json({ message: 'Waiter created', user: { _id: user._id, name: user.name, userId: user.userId, role: user.role } })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// Update waiter (owner only)
router.post('/waiter/update/:id', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'owner') return res.status(403).json({ message: 'Not allowed' })
    const { name, status } = req.body
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, status },
      { new: true }
    ).select('-password')
    res.json({ message: 'Waiter updated', user })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// Delete waiter (owner only)
router.post('/waiter/delete/:id', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'owner') return res.status(403).json({ message: 'Not allowed' })
    await User.findByIdAndDelete(req.params.id)
    res.json({ message: 'Waiter deleted' })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router
