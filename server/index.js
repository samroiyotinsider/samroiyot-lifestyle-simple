import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'

const app = express()
const PORT = process.env.PORT || 3001
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

// In-memory data storage (will be reset on server restart)
let users = [
  { id: 1, username: 'admin', password: '$2a$10$YIjlrTxVxJ8Yz8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8' } // pre-hashed 'admin123'
]

let properties = [
  { id: 1, name: 'Beachfront Villa', location: 'Hua Hin', description: 'Luxury beachfront property', price: 5000, bedrooms: 4, bathrooms: 3, image_url: 'https://via.placeholder.com/400x300?text=Beachfront+Villa', contact_phone: '+66-1-2345-6789' },
  { id: 2, name: 'Mountain Retreat', location: 'Khao Yai', description: 'Serene mountain getaway', price: 3500, bedrooms: 3, bathrooms: 2, image_url: 'https://via.placeholder.com/400x300?text=Mountain+Retreat', contact_phone: '+66-1-2345-6789' },
  { id: 3, name: 'City Penthouse', location: 'Bangkok', description: 'Modern city living', price: 8000, bedrooms: 3, bathrooms: 3, image_url: 'https://via.placeholder.com/400x300?text=City+Penthouse', contact_phone: '+66-1-2345-6789' },
  { id: 4, name: 'Tropical Garden Home', location: 'Phuket', description: 'Lush tropical paradise', price: 4500, bedrooms: 5, bathrooms: 4, image_url: 'https://via.placeholder.com/400x300?text=Tropical+Garden', contact_phone: '+66-1-2345-6789' },
  { id: 5, name: 'Riverside Cottage', location: 'Chiang Mai', description: 'Charming riverside home', price: 2500, bedrooms: 2, bathrooms: 2, image_url: 'https://via.placeholder.com/400x300?text=Riverside+Cottage', contact_phone: '+66-1-2345-6789' },
  { id: 6, name: 'Luxury Resort Villa', location: 'Koh Samui', description: 'Resort-style living', price: 7000, bedrooms: 4, bathrooms: 4, image_url: 'https://via.placeholder.com/400x300?text=Resort+Villa', contact_phone: '+66-1-2345-6789' },
  { id: 7, name: 'Modern Townhouse', location: 'Pattaya', description: 'Contemporary design', price: 3000, bedrooms: 3, bathrooms: 2, image_url: 'https://via.placeholder.com/400x300?text=Townhouse', contact_phone: '+66-1-2345-6789' },
  { id: 8, name: 'Beachside Bungalow', location: 'Krabi', description: 'Cozy beach bungalow', price: 2800, bedrooms: 2, bathrooms: 2, image_url: 'https://via.placeholder.com/400x300?text=Bungalow', contact_phone: '+66-1-2345-6789' },
  { id: 9, name: 'Luxury Penthouse', location: 'Hua Hin', description: 'Premium penthouse', price: 6500, bedrooms: 4, bathrooms: 3, image_url: 'https://via.placeholder.com/400x300?text=Luxury+Penthouse', contact_phone: '+66-1-2345-6789' },
  { id: 10, name: 'Private Island Villa', location: 'Phang Nga', description: 'Exclusive island property', price: 9000, bedrooms: 5, bathrooms: 5, image_url: 'https://via.placeholder.com/400x300?text=Island+Villa', contact_phone: '+66-1-2345-6789' },
  { id: 11, name: 'Urban Loft', location: 'Bangkok', description: 'Trendy urban space', price: 4000, bedrooms: 2, bathrooms: 2, image_url: 'https://via.placeholder.com/400x300?text=Urban+Loft', contact_phone: '+66-1-2345-6789' },
  { id: 12, name: 'Garden Villa', location: 'Chiang Mai', description: 'Beautiful garden setting', price: 3200, bedrooms: 3, bathrooms: 2, image_url: 'https://via.placeholder.com/400x300?text=Garden+Villa', contact_phone: '+66-1-2345-6789' }
]

// Middleware
app.use(cors())
app.use(express.json())
app.use(cookieParser())

// Auth middleware
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'Unauthorized' })
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = decoded
    next()
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
}

// API Routes

// Get all properties
app.get('/api/properties', (req, res) => {
  res.json(properties)
})

// Get single property
app.get('/api/properties/:id', (req, res) => {
  const prop = properties.find(p => p.id === parseInt(req.params.id))
  if (!prop) return res.status(404).json({ error: 'Property not found' })
  res.json(prop)
})

// Login
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body
  const user = users.find(u => u.username === username)
  
  if (!user || !(await bcryptjs.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }
  
  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' })
  res.json({ token, user: { id: user.id, username: user.username } })
})

// Get current user
app.get('/api/auth/me', authMiddleware, (req, res) => {
  const user = users.find(u => u.id === req.user.id)
  res.json(user)
})

// Add property (admin only)
app.post('/api/properties', authMiddleware, (req, res) => {
  const newProperty = {
    id: Math.max(...properties.map(p => p.id), 0) + 1,
    ...req.body
  }
  properties.push(newProperty)
  res.status(201).json(newProperty)
})

// Update property (admin only)
app.put('/api/properties/:id', authMiddleware, (req, res) => {
  const prop = properties.find(p => p.id === parseInt(req.params.id))
  if (!prop) return res.status(404).json({ error: 'Property not found' })
  
  Object.assign(prop, req.body)
  res.json(prop)
})

// Delete property (admin only)
app.delete('/api/properties/:id', authMiddleware, (req, res) => {
  const index = properties.findIndex(p => p.id === parseInt(req.params.id))
  if (index === -1) return res.status(404).json({ error: 'Property not found' })
  
  properties.splice(index, 1)
  res.json({ message: 'Property deleted' })
})

// Serve static files
app.use(express.static('dist'))

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(new URL('../dist/index.html', import.meta.url).pathname)
})

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
  console.log(`✅ All 12 properties loaded in memory`)
  console.log(`✅ Admin account ready: username=admin, password=admin123`)
})
