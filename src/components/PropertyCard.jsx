import './PropertyCard.css'

export default function PropertyCard({ property }) {
  return (
    <div className="card property-card">
      <div className="property-image">
        {property.image_url ? (
          <img src={property.image_url} alt={property.name} />
        ) : (
          <div className="no-image">No Image</div>
        )}
      </div>
      <div className="property-content">
        <h3>{property.name}</h3>
        <p className="location">{property.location}</p>
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

        {property.price && (
          <div className="price">
            ${property.price.toLocaleString()} / night
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
