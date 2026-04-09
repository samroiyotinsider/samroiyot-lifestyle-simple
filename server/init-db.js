import pg from 'pg';
import bcrypt from 'bcryptjs';

const { Client } = pg;

const properties = [
  { name: 'Beachfront Villa', location: 'Hua Hin', price: 5000, bedrooms: 4, bathrooms: 3, image: 'https://via.placeholder.com/400x300?text=Beachfront+Villa', description: 'Luxury beachfront property' },
  { name: 'Mountain Retreat', location: 'Khao Yai', price: 3500, bedrooms: 3, bathrooms: 2, image: 'https://via.placeholder.com/400x300?text=Mountain+Retreat', description: 'Serene mountain getaway' },
  { name: 'City Penthouse', location: 'Bangkok', price: 8000, bedrooms: 3, bathrooms: 3, image: 'https://via.placeholder.com/400x300?text=City+Penthouse', description: 'Modern city living' },
  { name: 'Tropical Garden Home', location: 'Phuket', price: 4500, bedrooms: 5, bathrooms: 4, image: 'https://via.placeholder.com/400x300?text=Tropical+Garden', description: 'Lush tropical paradise' },
  { name: 'Riverside Cottage', location: 'Chiang Mai', price: 2500, bedrooms: 2, bathrooms: 2, image: 'https://via.placeholder.com/400x300?text=Riverside+Cottage', description: 'Charming riverside home' },
  { name: 'Luxury Resort Villa', location: 'Koh Samui', price: 7000, bedrooms: 4, bathrooms: 4, image: 'https://via.placeholder.com/400x300?text=Resort+Villa', description: 'Resort-style living' },
  { name: 'Modern Townhouse', location: 'Pattaya', price: 3000, bedrooms: 3, bathrooms: 2, image: 'https://via.placeholder.com/400x300?text=Townhouse', description: 'Contemporary design' },
  { name: 'Beachside Bungalow', location: 'Krabi', price: 2800, bedrooms: 2, bathrooms: 2, image: 'https://via.placeholder.com/400x300?text=Bungalow', description: 'Cozy beach bungalow' },
  { name: 'Luxury Penthouse', location: 'Hua Hin', price: 6500, bedrooms: 4, bathrooms: 3, image: 'https://via.placeholder.com/400x300?text=Luxury+Penthouse', description: 'Premium penthouse' },
  { name: 'Private Island Villa', location: 'Phang Nga', price: 9000, bedrooms: 5, bathrooms: 5, image: 'https://via.placeholder.com/400x300?text=Island+Villa', description: 'Exclusive island property' },
  { name: 'Urban Loft', location: 'Bangkok', price: 4000, bedrooms: 2, bathrooms: 2, image: 'https://via.placeholder.com/400x300?text=Urban+Loft', description: 'Trendy urban space' },
  { name: 'Garden Villa', location: 'Chiang Mai', price: 3200, bedrooms: 3, bathrooms: 2, image: 'https://via.placeholder.com/400x300?text=Garden+Villa', description: 'Beautiful garden setting' }
];

async function initDB() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Create tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS properties (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        location VARCHAR(255),
        price DECIMAL(10, 2),
        bedrooms INT,
        bathrooms INT,
        image TEXT,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await client.query(
      'INSERT INTO users (email, password, name, role) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO NOTHING',
      ['admin@samroiyot.com', hashedPassword, 'Admin', 'admin']
    );

    // Insert properties
    for (const prop of properties) {
      await client.query(
        'INSERT INTO properties (name, location, price, bedrooms, bathrooms, image, description) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [prop.name, prop.location, prop.price, prop.bedrooms, prop.bathrooms, prop.image, prop.description]
      );
    }

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
  } finally {
    await client.end();
  }
}

initDB();
