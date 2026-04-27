const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const dotenv = require('dotenv')
const User = require('./models/User')

dotenv.config()

mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000,
  family: 4
})

const createUsers = async () => {
  try {
    await User.deleteMany({})

    const users = [
      {
        name: 'Owner',
        userId: 'owner@123',
        password: await bcrypt.hash('owner2026', 10),
        role: 'owner'
      },
      {
        name: 'Atul',
        userId: 'atul@123',
        password: await bcrypt.hash('atul2026', 10),
        role: 'waiter'
      },
      {
        name: 'Kitchen',
        userId: 'kitchen@123',
        password: await bcrypt.hash('kitchen2026', 10),
        role: 'kitchen'
      }
    ]

    await User.insertMany(users)
    console.log('Users created successfully')
    console.log('Owner - ID: owner@123, Password: owner2026')
    console.log('Waiter - ID: atul@123, Password: atul2026')
    console.log('Kitchen - ID: kitchen@123, Password: kitchen2026')
    process.exit()
  } catch (err) {
    console.log('Error:', err)
    process.exit()
  }
}

createUsers()