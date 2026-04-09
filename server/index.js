import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { Pool } from 'pg'
import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const app = express()
const PORT = process.env.PORT || 3001
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: false }
})

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

// Sample properties data
const sampleProperties = [
  { name: 'Beachfront Villa', location: 'Hua Hin', description: 'Luxury beachfront property', price: 5000, bedrooms: 4, bathrooms: 3, image_url: 'https://via.placeholder.com/400x300?text=Beachfront+Villa', contact_phone: '+66-1-2345-6789' },
  { name: 'Mountain Retreat', location: 'Khao Yai', description: 'Serene mountain getaway', price: 3500, bedrooms: 3, bathrooms: 2, image_url: 'https://via.placeholder.com/400x300?text=Mountain+Retreat', contact_phone: '+66-1-2345-6789' },
  { name: 'City Penthouse', location: 'Bangkok', description: 'Modern city living', price: 8000, bedrooms: 3, bathrooms: 3, image_url: 'https://via.placeholder.com/400x300?text=City+Penthouse', contact_phone: '+66-1-2345-6789' },
  { name: 'Tropical Garden Home', location: 'Phuket', description: 'Lush tropical paradise', price: 4500, bedrooms: 5, bathrooms: 4, image_url: 'https://via.placeholder.com/400x300?text=Tropical+Garden', contact_phone: '+66-1-2345-6789' },
  { name: 'Riverside Cottage', location: 'Chiang Mai', description: 'Charming riverside home', price: 2500, bedrooms: 2, bathrooms: 2, image_url: 'https://via.placeholder.com/400x300?text=Riverside+Cottage', contact_phone: '+66-1-2345-6789' },
  { name: 'Luxury Resort Villa', location: 'Koh Samui', description: 'Resort-style living', price: 7000, bedrooms: 4, bathrooms: 4, image_url: 'https://via.placeholder.com/400x300?text=Resort+Villa', contact_phone: '+66-1-2345-6789' },
  { name: 'Modern Townhouse', location: 'Pattaya', description: 'Contemporary design', price: 3000, bedrooms: 3, bathrooms: 2, image_url: 'https://via.placeholder.com/400x300?text=Townhouse', contact_phone: '+66-1-2345-6789' },
  { name: 'Beachside Bungalow', location: 'Krabi', description: 'Cozy beach bungalow', price: 2800, bedrooms: 2, bathrooms: 2, image_url: 'https://via.placeholder.com/400x300?text=Bungalow', contact_phone: '+66-1-2345-6789' },
  { name: 'Luxury Penthouse', location: 'Hua Hin', description: 'Premium penthouse', price: 6500, bedrooms: 4, bathrooms: 3, image_url: 'https://via.placeholder.com/400x300?text=Luxury+Penthouse', contact_phone: '+66-1-2345-6789' },
  { name: 'Private Island Villa', location: 'Phang Nga', description: 'Exclusive island property', price: 9000, bedrooms: 5, bathrooms: 5, image_url: 'https://via.placeholder.com/400x300?text=Island+Villa', contact_phone: '+66-1-2345-6789' },
  { name: 'Urban Loft', location: 'Bangkok', description: 'Trendy urban space', price: 4000, bedrooms: 2, bathrooms: 2, image_url: 'https://via.placeholder.com/400x300?text=Urban+Loft', contact_phone: '+66-1-2345-6789' },
  { name: 'Garden Villa', location: 'Chiang Mai', description: 'Beautiful garden setting', price: 3200, bedrooms: 3, bathrooms: 2, image_url: 'https://via.placeholder.com/400x300?text=Garden+Villa', contact_phone: '+66-1-2345-6789' }
]

// Initialize database
async function initializeDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    await pool.query(`
      CREATE TABLE IF NOT EXISTS properties (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        location VARCHAR(255),
        description TEXT,
        price DECIMAL(10, 2),
        bedrooms INT,
        bathrooms INT,
        image_url TEXT,
        contact_phone VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Seed sample properties if table is empty
    const result = await pool.query('SELECT COUNT(*) FROM properties')
    if (result.rows[0].count === '0') {
      for (const prop of sampleProperties) {
        await pool.query(
          `INSERT INTO properties (name, location, description, price, bedrooms, bathrooms, image_url, contact_phone)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [prop.name, prop.location, prop.description, prop.price, prop.bedrooms, prop.bathrooms, prop.image_url, prop.contact_phone]
        )
      }
      console.log('Seeded 12 sample properties')
    }

    // Create admin user if doesn't exist
    const userResult = await pool.query('SELECT COUNT(*) FROM users WHERE username = $1', ['admin'])
    if (userResult.rows[0].count === '0') {
      const hashedPassword = await bcryptjs.hash('admin123', 10)
      await pool.query(
        'INSERT INTO users (username, password) VALUES ($1, $2)',
        ['admin', hashedPassword]
      )
      console.log('Created admin user (username: admin, password: admin123)')
    }

    console.log('Database initialized')
  } catch (err) {
    console.error('Database initialization error:', err)
  }
}

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password } = req.body
    const hashedPassword = await bcryptjs.hash(password, 10)
    
    const result = await pool.query(
      'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username',
      [username, hashedPassword]
    )

    const token = jwt.sign({ id: result.rows[0].id, username }, JWT_SECRET)
    res.json({ token, user: result.rows[0] })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body
    
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    )

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const user = result.rows[0]
    const validPassword = await bcryptjs.compare(password, user.password)

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET)
    res.json({ token, user: { id: user.id, username: user.username } })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// Property routes
app.get('/api/properties', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM properties ORDER BY created_at DESC')
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.get('/api/properties/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM properties WHERE id = $1', [req.params.id])
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' })
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/properties', authMiddleware, async (req, res) => {
  try {
    const { name, location, description, price, bedrooms, bathrooms, image_url, contact_phone } = req.body
    
    const result = await pool.query(
      `INSERT INTO properties (name, location, description, price, bedrooms, bathrooms, image_url, contact_phone)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [name, location, description, price, bedrooms, bathrooms, image_url, contact_phone]
    )

    res.status(201).json(result.rows[0])
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

app.put('/api/properties/:id', authMiddleware, async (req, res) => {
  try {
    const { name, location, description, price, bedrooms, bathrooms, image_url, contact_phone } = req.body
    
    const result = await pool.query(
      `UPDATE properties 
       SET name = $1, location = $2, description = $3, price = $4, bedrooms = $5, bathrooms = $6, image_url = $7, contact_phone = $8, updated_at = CURRENT_TIMESTAMP
       WHERE id = $9
       RETURNING *`,
      [name, location, description, price, bedrooms, bathrooms, image_url, contact_phone, req.params.id]
    )

    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' })
    res.json(result.rows[0])
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

app.delete('/api/properties/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM properties WHERE id = $1 RETURNING id', [req.params.id])
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Serve static files from Vite build
app.use(express.static(path.join(__dirname, '../dist')))

// Fallback to index.html for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'))
})

// Start server
initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
})
