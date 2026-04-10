import './PropertyCard.css'

export default function PropertyCard({ property }) {
  const handleCardClick = () => {
    if (property.listing_url) {
      window.open(property.listing_url, '_blank')
    }
  }

  // Convert EUR to THB (using current rate ~40 THB per EUR)
  const eurToThb = (eur) => {
    return Math.round(eur * 40)
  }

  const formatPrice = (price) => {
    return price.toLocaleString('th-TH')
  }

  return (
    <div className="card property-card" onClick={handleCardClick} style={{ cursor: property.listing_url ? 'pointer' : 'default' }}>
      <div className="property-image">
        {property.image_url ? (
          <img src={property.image_url} alt={property.name} />
        ) : (
          <div className="no-image">No Image</div>
        )}
      </div>
      <div className="property-content">
        <h3>{property.title}</h3>
        <p className="description">{property.description}</p>
        
        <div className="property-details">
          {property.bedrooms && (
            <span className="detail">
              <strong>{property.bedrooms}</strong> Bedrooms
            </span>
          )}
          {property.bathrooms && (
            <span className="detail">
              <strong>{property.bathrooms}</strong> Bathrooms
            </span>
          )}
        </div>

        {property.price_eur && (
          <div className="price">
            ฿{formatPrice(eurToThb(property.price_eur))}
          </div>
        )}

        <div className="property-footer">
          <a href={`tel:${property.contact_phone || ''}`} className="btn btn-primary">
            Contact
          </a>
        </div>
      </div>
    </div>
  )
}
