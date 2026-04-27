const express = require('express')
const router = express.Router()
const Order = require('../models/Order')
const jwt = require('jsonwebtoken')

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

// Today's sales
router.get('/today', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'owner') return res.status(403).json({ message: 'Not allowed' })

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const orders = await Order.find({
      status: 'billed',
      billedAt: { $gte: today, $lt: tomorrow }
    })

    const totalSales = orders.reduce((sum, order) => sum + order.totalAmount, 0)
    const orderCount = orders.length

    res.json({ totalSales, orderCount, orders })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// Monthly sales
router.get('/monthly/:year/:month', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'owner') return res.status(403).json({ message: 'Not allowed' })

    const { year, month } = req.params
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 1)

    const orders = await Order.find({
      status: 'billed',
      billedAt: { $gte: startDate, $lt: endDate }
    })

    const totalSales = orders.reduce((sum, order) => sum + order.totalAmount, 0)
    const orderCount = orders.length

    res.json({ totalSales, orderCount, month, year })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// Yearly sales
router.get('/yearly/:year', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'owner') return res.status(403).json({ message: 'Not allowed' })

    const { year } = req.params
    const startDate = new Date(year, 0, 1)
    const endDate = new Date(year, 12, 1)

    const orders = await Order.find({
      status: 'billed',
      billedAt: { $gte: startDate, $lt: endDate }
    })

    const totalSales = orders.reduce((sum, order) => sum + order.totalAmount, 0)
    const orderCount = orders.length

    const monthlyData = Array(12).fill(0)
    orders.forEach(order => {
      const month = new Date(order.billedAt).getMonth()
      monthlyData[month] += order.totalAmount
    })

    res.json({ totalSales, orderCount, year, monthlyData })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// Top items (all time or by date range)
router.get('/top-items', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'owner') return res.status(403).json({ message: 'Not allowed' })

    const orders = await Order.find({ status: 'billed' })

    const itemSales = {}
    orders.forEach(order => {
      order.items.forEach(item => {
        if (!itemSales[item.name]) {
          itemSales[item.name] = { qty: 0, revenue: 0 }
        }
        itemSales[item.name].qty += item.qty
        itemSales[item.name].revenue += item.price * item.qty
      })
    })

    const topItems = Object.entries(itemSales)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 15)

    res.json(topItems)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router
