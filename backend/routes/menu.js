const express = require('express')
const router = express.Router()
const MenuItem = require('../models/MenuItem')
const Order = require('../models/Order')
const jwt = require('jsonwebtoken')

const defaultMenu = [
  { category: 'Light Food', name: 'Vada Pav', price: 20, variable: false },
  { category: 'Light Food', name: 'Bhaji', price: 30, variable: false },
  { category: 'Light Food', name: 'Samosa', price: 20, variable: false },
  { category: 'Light Food', name: 'Bhaji Pav', price: 40, variable: false },
  { category: 'Light Food', name: 'Bhel', price: 60, variable: false },
  { category: 'Light Food', name: 'Dhokla', price: 40, variable: false },
  { category: 'Light Food', name: 'Fafda', price: 40, variable: false },
  { category: 'Light Food', name: 'Extra Pav', price: 5, variable: false },
  { category: 'Main Menu', name: 'Misal Pav', price: 80, variable: false },
  { category: 'Main Menu', name: 'Vada Sampal', price: 70, variable: false },
  { category: 'Main Menu', name: 'Vada Sambar', price: 70, variable: false },
  { category: 'Main Menu', name: 'Puri Bhaji', price: 70, variable: false },
  { category: 'Main Menu', name: 'Mendu Vada Sambar', price: 60, variable: false },
  { category: 'Main Menu', name: 'Idli Sambar', price: 50, variable: false },
  { category: 'Main Menu', name: 'Uttapa', price: 70, variable: false },
  { category: 'Main Menu', name: 'Plain Dosa', price: 70, variable: false },
  { category: 'Main Menu', name: 'Masala Dosa', price: 80, variable: false },
  { category: 'Main Menu', name: 'Paper Dosa', price: 100, variable: false },
  { category: 'Main Menu', name: 'Cut Dosa', price: 100, variable: false },
  { category: 'Main Menu', name: 'Pav Bhaji', price: 80, variable: false },
  { category: 'Main Menu', name: 'Extra Pav', price: 5, variable: false },
  { category: 'Main Menu', name: 'Puri Plate', price: 30, variable: false },
  { category: 'Sweet & Farsan', name: 'Chivda', price: 0, variable: true },
  { category: 'Sweet & Farsan', name: 'Farsan', price: 0, variable: true },
  { category: 'Sweet & Farsan', name: 'Sweet', price: 0, variable: true },
  { category: 'Sweet & Farsan', name: 'Wafers', price: 0, variable: true },
  { category: 'Hot Drinks', name: 'Chai', price: 15, variable: false },
  { category: 'Hot Drinks', name: 'Coffee', price: 20, variable: false },
  { category: 'Hot Drinks', name: 'Doodh', price: 15, variable: false },
  { category: 'Hot Drinks', name: 'Black Tea', price: 15, variable: false },
  { category: 'Cold Drinks', name: 'Soft Drink', price: 0, variable: true },
  { category: 'Cold Drinks', name: 'Water Bottle', price: 20, variable: false },
  { category: 'Cold Drinks', name: 'Lassi', price: 30, variable: false },
  { category: 'Cold Drinks', name: 'Taak', price: 35, variable: false },
]

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

const CATEGORY_ORDER = ['Main Menu', 'South Indian', 'Hot Drinks', 'Cold Drinks', 'Sweet & Farsan']
const categoryRank = (category) => {
  const idx = CATEGORY_ORDER.indexOf(category)
  return idx === -1 ? CATEGORY_ORDER.length : idx
}

// Get full menu (public - no auth needed so waiter can fetch)
router.get('/', async (req, res) => {
  try {
    // Rule out stale cached responses (browser/proxy) as a source of items
    // appearing to be in the wrong category on the client.
    res.set('Cache-Control', 'no-store')
    let items = await MenuItem.find()
    if (items.length === 0) {
      await MenuItem.insertMany(defaultMenu)
      items = await MenuItem.find()
    }

    // Total quantity sold per item name, from completed sales (same criteria as analytics top-items)
    const soldOrders = await Order.find({ status: 'billed', isVoided: { $ne: true } }, 'items')
    const qtySoldByName = {}
    soldOrders.forEach(order => {
      order.items.forEach(item => {
        qtySoldByName[item.name] = (qtySoldByName[item.name] || 0) + item.qty
      })
    })

    // Group by category
    const categories = []
    items.forEach(item => {
      const existing = categories.find(c => c.category === item.category)
      const entry = { _id: item._id, name: item.name, price: item.price, variable: item.variable, sortOrder: item.sortOrder }
      if (existing) {
        existing.items.push(entry)
      } else {
        categories.push({ category: item.category, items: [entry] })
      }
    })
    // Within each category: pinned items (sortOrder < 99) stay first, in ascending sortOrder
    // order, unchanged. Everything else (sortOrder 99) is sorted by total quantity sold
    // descending, so best sellers float to the top of the unpinned items.
    categories.forEach(cat => {
      const pinned = cat.items.filter(i => (i.sortOrder ?? 99) < 99).sort((a, b) => a.sortOrder - b.sortOrder)
      const bestSelling = cat.items.filter(i => (i.sortOrder ?? 99) >= 99)
        .sort((a, b) => (qtySoldByName[b.name] || 0) - (qtySoldByName[a.name] || 0))
      cat.items = [...pinned, ...bestSelling]
    })
    // Sort categories: Main Menu, South Indian, Hot Drinks, Cold Drinks, Sweet & Farsan, then the rest
    categories.sort((a, b) => categoryRank(a.category) - categoryRank(b.category))
    res.json(categories)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// Update a single item price (owner only)
router.post('/update/:id', verifyToken, async (req, res) => {
  try {
    if (!['owner', 'developer'].includes(req.user.role)) return res.status(403).json({ message: 'Not allowed' })
    const { price, variable } = req.body
    const item = await MenuItem.findByIdAndUpdate(
      req.params.id,
      { price, variable },
      { new: true }
    )
    res.json({ message: 'Price updated', item })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// Add new item (owner only)
router.post('/add', verifyToken, async (req, res) => {
  try {
    if (!['owner', 'developer'].includes(req.user.role)) return res.status(403).json({ message: 'Not allowed' })
    const { category, name, price, variable } = req.body
    const item = new MenuItem({ category, name, price, variable })
    await item.save()
    res.json({ message: 'Item added', item })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// Delete item (owner only)
router.post('/delete/:id', verifyToken, async (req, res) => {
  try {
    if (!['owner', 'developer'].includes(req.user.role)) return res.status(403).json({ message: 'Not allowed' })
    await MenuItem.findByIdAndDelete(req.params.id)
    res.json({ message: 'Item deleted' })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router
