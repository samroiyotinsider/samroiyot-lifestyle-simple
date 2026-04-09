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
