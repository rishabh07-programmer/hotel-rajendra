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
    const { userId, password, deviceId, deviceName } = req.body
    const user = await User.findOne({ userId })
    if (!user) return res.status(400).json({ message: 'Wrong ID or password' })

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) return res.status(400).json({ message: 'Wrong ID or password' })

    if (user.role !== 'developer' && deviceId) {
      if (!user.deviceId) {
        // Atomic conditional update: only claims the device slot if deviceId is still
        // null at write time, so two concurrent first-logins can't both win the race.
        const filter = { _id: user._id, deviceId: null }
        const update = { $set: { deviceId, deviceName: deviceName || 'Unknown device' } }
        console.log('[Device Lock] Claiming device for', userId, '- filter:', filter, 'update:', update)
        const claimed = await User.findOneAndUpdate(filter, update, { new: true })
        console.log('[Device Lock] Claim result for', userId, '- saved deviceId:', claimed ? claimed.deviceId : '(lost race)')

        if (!claimed) {
          const fresh = await User.findOne({ userId })
          if (fresh.deviceId !== deviceId) {
            return res.status(403).json({ message: 'This ID is already active on another device. Ask your manager to logout that device first.' })
          }
        }
      } else if (user.deviceId !== deviceId) {
        console.log('[Device Lock] Blocked login for', userId, '- stored deviceId:', user.deviceId, 'incoming:', deviceId)
        return res.status(403).json({ message: 'This ID is already active on another device. Ask your manager to logout that device first.' })
      }
    }

    const token = jwt.sign(
      { userId: user.userId, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    )

    res.json({ token, role: user.role, name: user.name })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// Get all waiters (owner only)
router.get('/waiters', verifyToken, async (req, res) => {
  try {
    if (!['owner', 'developer'].includes(req.user.role)) return res.status(403).json({ message: 'Not allowed' })
    const waiters = await User.find({ role: 'waiter' }, '-password')
    res.json(waiters)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// Create new waiter (owner only)
router.post('/waiter/create', verifyToken, async (req, res) => {
  try {
    if (!['owner', 'developer'].includes(req.user.role)) return res.status(403).json({ message: 'Not allowed' })
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
    if (!['owner', 'developer'].includes(req.user.role)) return res.status(403).json({ message: 'Not allowed' })
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
    if (!['owner', 'developer'].includes(req.user.role)) return res.status(403).json({ message: 'Not allowed' })
    await User.findByIdAndDelete(req.params.id)
    res.json({ message: 'Waiter deleted' })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// Force logout a waiter's device (owner only)
router.post('/waiter/force-logout/:id', verifyToken, async (req, res) => {
  try {
    if (!['owner', 'developer'].includes(req.user.role)) return res.status(403).json({ message: 'Not allowed' })
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { deviceId: null, deviceName: null },
      { new: true }
    ).select('-password')
    res.json({ message: 'Device logged out', user })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// Get all owners with their active device (developer only)
router.get('/owners', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'developer') return res.status(403).json({ message: 'Not allowed' })
    const owners = await User.find({ role: 'owner' }, '-password')
    res.json(owners)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// Force logout an owner's device (developer only)
router.post('/owner/force-logout/:id', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'developer') return res.status(403).json({ message: 'Not allowed' })
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { deviceId: null, deviceName: null },
      { new: true }
    ).select('-password')
    res.json({ message: 'Device logged out', user })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router
