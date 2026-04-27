const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const dotenv = require('dotenv')

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000,
  family: 4
})
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.log('MongoDB connection error:', err))

app.use('/api/auth', require('./routes/auth'))
app.use('/api/orders', require('./routes/orders'))
app.use('/api/menu', require('./routes/menu'))
app.use('/api/analytics', require('./routes/analytics'))

app.get('/', (req, res) => {
  res.send('Hotel Rajendra server is running')
})

const PORT = 8080
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`)
})
