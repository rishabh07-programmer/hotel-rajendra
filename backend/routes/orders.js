const express = require('express')
const router = express.Router()
const Order = require('../models/Order')
const jwt = require('jsonwebtoken')

const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']
  if (!token) {
    return res.status(401).json({ message: 'No token provided' })
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' })
  }
}

router.post('/new', verifyToken, async (req, res) => {
  try {
    const { tableNumber, items } = req.body
    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.qty), 0)
    const order = new Order({
      tableNumber,
      waiterName: req.user.name,
      waiterId: req.user.userId,
      items,
      totalAmount,
      status: 'active'
    })
    await order.save()
    res.json({ message: 'Order saved successfully', order })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

router.get('/active', verifyToken, async (req, res) => {
  try {
    const orders = await Order.find({ status: 'active' })
    res.json(orders)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

router.get('/table/:tableNumber', verifyToken, async (req, res) => {
  try {
    const order = await Order.findOne({
      tableNumber: req.params.tableNumber,
      status: 'active'
    })
    res.json(order)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

router.post('/bill/:id', verifyToken, async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: 'billed', billedAt: Date.now() },
      { new: true }
    )
    res.json({ message: 'Order billed successfully', order })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

router.post('/addItems/:id', verifyToken, async (req, res) => {
  try {
    const { items } = req.body
    const order = await Order.findById(req.params.id)
    items.forEach(item => order.items.push(item))
    order.totalAmount = order.items.reduce((sum, item) => sum + (item.price * item.qty), 0)
    await order.save()
    res.json({ message: 'Items added successfully', order })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

router.post('/status/:id', verifyToken, async (req, res) => {
  try {
    const { status } = req.body
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { kitchenStatus: status },
      { new: true }
    )
    res.json({ message: 'Status updated', order })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

router.post('/cancel/:id', verifyToken, async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id)
    res.json({ message: 'Order cancelled' })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

router.post('/void/:id', verifyToken, async (req, res) => {
  try {
    const { voidReason } = req.body
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { isVoided: true, voidedAt: new Date(), voidReason: voidReason || '' },
      { new: true }
    )
    if (!order) return res.status(404).json({ message: 'Order not found' })
    res.json({ message: 'Order voided successfully', order })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

router.get('/voided', verifyToken, async (req, res) => {
  try {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const orders = await Order.find({
      isVoided: true,
      voidedAt: { $gte: thirtyDaysAgo }
    }).sort({ voidedAt: -1 })
    res.json(orders)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

router.get('/billed/today', verifyToken, async (req, res) => {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const orders = await Order.find({
      status: 'billed',
      isVoided: { $ne: true },
      billedAt: { $gte: today, $lt: tomorrow }
    }).sort({ billedAt: -1 })
    res.json(orders)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router