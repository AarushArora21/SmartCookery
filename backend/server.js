const dns = require('dns')
dns.setDefaultResultOrder('ipv4first')

const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const dotenv = require('dotenv')
const helmet = require('helmet')
const xss = require('xss-clean')
const hpp = require('hpp')
const mongoSanitize = require('express-mongo-sanitize')
const rateLimit = require('express-rate-limit')

dotenv.config()

const app = express()

// Security middleware
app.use(helmet())
app.use(xss())
app.use(hpp())
app.use(mongoSanitize())

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests, please try again later' }
})
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many attempts, please try again later' }
})

app.use('/api', limiter)
app.use('/api/auth/login', authLimiter)
app.use('/api/auth/register', authLimiter)

// CORS
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}))

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/recipes', require('./routes/recipes'))
app.use('/api/user', require('./routes/user'))
app.use('/api/ai', require('./routes/ai'))
app.use('/api/nutrition', require('./routes/nutrition'))
app.use('/api/collections', require('./routes/collections'))

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Smart Cookery API is running' })
})

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  })
})

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected')
    const PORT = process.env.PORT || 5000
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
  })
  .catch(err => {
    console.error('MongoDB connection error:', err)
    process.exit(1)
  })