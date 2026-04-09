import { useState, useEffect } from 'react'
import './PropertyForm.css'

export default function PropertyForm({ propertyId, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    description: '',
    price: '',
    bedrooms: '',
    bathrooms: '',
    image_url: '',
    contact_phone: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (propertyId) {
      fetchProperty()
    }
  }, [propertyId])

  const fetchProperty = async () => {
    try {
      const response = await fetch(`/api/properties/${propertyId}`)
      if (!response.ok) throw new Error('Failed to fetch property')
      const data = await response.json()
      setFormData(data)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const url = propertyId 
        ? `/api/properties/${propertyId}`
        : '/api/properties'
      const method = propertyId ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) throw new Error('Failed to save property')
      onSave()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="property-form" onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}
      
      <div className="form-group">
        <label>Property Name *</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label>Location *</label>
        <input
          type="text"
          name="location"
          value={formData.location}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label>Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="4"
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Price per Night *</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Bedrooms</label>
          <input
            type="number"
            name="bedrooms"
            value={formData.bedrooms}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Bathrooms</label>
          <input
            type="number"
            name="bathrooms"
            value={formData.bathrooms}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="form-group">
        <label>Image URL</label>
        <input
          type="url"
          name="image_url"
          value={formData.image_url}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label>Contact Phone</label>
        <input
          type="tel"
          name="contact_phone"
          value={formData.contact_phone}
          onChange={handleChange}
        />
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving...' : 'Save Property'}
        </button>
      </div>
    </form>
  )
}
