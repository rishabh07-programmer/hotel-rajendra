const mongoose = require('mongoose')
const dotenv = require('dotenv')
const MenuItem = require('./models/MenuItem')

dotenv.config()

mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000,
  family: 4
})

const menuItems = [
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

const seed = async () => {
  try {
    await MenuItem.deleteMany({})
    await MenuItem.insertMany(menuItems)
    console.log(`Seeded ${menuItems.length} menu items successfully`)
    process.exit()
  } catch (err) {
    console.log('Seed error:', err)
    process.exit(1)
  }
}

seed()
