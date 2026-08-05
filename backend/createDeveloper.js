const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const dotenv = require('dotenv')
const User = require('./models/User')

dotenv.config()

const createDeveloper = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      family: 4
    })

    const existing = await User.findOne({ userId: 'dev@rajendra' })
    if (existing) {
      console.log('Developer account already exists — no changes made')
      process.exit()
    }

    await User.create({
      name: 'Developer',
      userId: 'dev@rajendra',
      password: await bcrypt.hash('dev2026secure', 10),
      role: 'developer'
    })

    console.log('Developer account created successfully')
    console.log('ID: dev@rajendra, Password: dev2026secure')
    process.exit()
  } catch (err) {
    console.log('Error:', err)
    process.exit(1)
  }
}

createDeveloper()
