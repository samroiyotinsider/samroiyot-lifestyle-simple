import './PropertyCard.css'

export default function PropertyCard({ property }) {
  const handleCardClick = () => {
    if (property.listing_url) {
      window.open(property.listing_url, '_blank')
    }
  }

  // Display EUR prices directly, or THB if specified
  const getDisplayPrice = (property) => {
    if (property.price_thb) {
      return { amount: property.price_thb, currency: '฿' }
    }
    return { amount: property.price_eur, currency: '€' }
  }

  const formatPrice = (price) => {
    return price.toLocaleString('en-US')
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

        {(property.price_eur || property.price_thb) && (
          <div className="price">
            {getDisplayPrice(property).currency}{formatPrice(getDisplayPrice(property).amount)}
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
