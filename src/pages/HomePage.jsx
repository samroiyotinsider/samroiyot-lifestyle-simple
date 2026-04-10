import { useState, useEffect } from 'react'
import PropertyCard from '../components/PropertyCard'
import './HomePage.css'

export default function HomePage() {
  const [forSale, setForSale] = useState([])
  const [forRent, setForRent] = useState([])
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
      setForSale(data.for_sale || [])
      setForRent(data.for_rent || [])
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
          <img src="/banner-hero.webp" alt="Sam Roi Yot Insider - Thailand's Last Coastal Secret" className="hero-banner" />
        </div>

        <div className="youtube-section">
          <div className="youtube-content">
            <h3>Explore Our Properties</h3>
            <p>Watch detailed video tours and discover the beauty of Sam Roi Yot through our YouTube channel. Get an exclusive look at each property before you visit.</p>
            <a href="https://www.youtube.com/@SamRoiYotinsider/shorts" target="_blank" rel="noopener noreferrer" className="youtube-btn">
              <svg className="youtube-logo" viewBox="0 0 24 24" width="24" height="24">
                <path fill="#FF0000" d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
              Subscribe on YouTube
            </a>
          </div>
        </div>

        {loading && <div className="loading">Loading properties...</div>}
        {error && <div className="error">Error: {error}</div>}

        {!loading && forSale.length > 0 && (
          <div>
            <div className="grid">
              {forSale.map(property => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          </div>
        )}

        {!loading && forRent.length > 0 && (
          <div className="rentals-section">
            <h3>Properties for Rent</h3>
            <div className="grid">
              {forRent.map(property => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          </div>
        )}

        {!loading && forSale.length === 0 && forRent.length === 0 && (
          <div className="empty-state">
            <p>No properties available at the moment.</p>
          </div>
        )}
      </div>
    </main>
  )
}
