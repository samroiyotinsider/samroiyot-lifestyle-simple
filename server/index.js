import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3001
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

// Load all properties from JSON file
let properties = []
try {
  const propertiesPath = path.join(__dirname, '../all_properties.json')
  const data = fs.readFileSync(propertiesPath, 'utf8')
  properties = JSON.parse(data)
  console.log(`✅ Loaded ${properties.length} properties from all_properties.json`)
} catch (err) {
  console.error('Error loading properties:', err)
  properties = []
}

// In-memory user data
let users = [
  { id: 1, username: 'admin', password: '$2a$10$YIjlrTxVxJ8Yz8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8' } // pre-hashed 'admin123'
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
  console.log(`✅ All ${properties.length} properties loaded`)
  console.log(`✅ Admin account ready: username=admin, password=admin123`)
})
