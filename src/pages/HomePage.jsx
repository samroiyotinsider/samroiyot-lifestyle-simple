import { useState, useEffect } from 'react'
import PropertyCard from '../components/PropertyCard'
import './HomePage.css'

export default function HomePage() {
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchProperties()
  }, [])

  const fetchProperties = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/properties')
      if (!response.ok) throw new Error('Failed to fetch properties')
      const data = await response.json()
      setProperties(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="home-page">
      <div className="container">
        <div className="hero">
          <h2>Sam Roi Yot Insider</h2>
          <p>Properties for Sale</p>
        </div>

        {loading && <div className="loading">Loading properties...</div>}
        {error && <div className="error">Error: {error}</div>}

        {!loading && properties.length > 0 && (
          <div className="grid">
            {properties.map(property => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}

        {!loading && properties.length === 0 && (
          <div className="empty-state">
            <p>No properties available at the moment.</p>
          </div>
        )}
      </div>
    </main>
  )
}
