import { useState, useEffect } from 'react'
import PropertyForm from '../components/PropertyForm'
import './AdminPage.css'

export default function AdminPage({ onLogout }) {
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)

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

  const handleDelete = async (id) => {
    if (!confirm('Are you sure?')) return
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/properties/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (!response.ok) throw new Error('Failed to delete')
      setProperties(properties.filter(p => p.id !== id))
    } catch (err) {
      alert('Error: ' + err.message)
    }
  }

  const handleSave = () => {
    fetchProperties()
    setShowForm(false)
    setEditingId(null)
  }

  return (
    <main className="admin-page">
      <div className="container">
        <div className="admin-header">
          <h2>Property Management</h2>
          <button 
            className="btn btn-primary"
            onClick={() => {
              setEditingId(null)
              setShowForm(!showForm)
            }}
          >
            {showForm ? 'Cancel' : 'Add Property'}
          </button>
        </div>

        {showForm && (
          <PropertyForm 
            propertyId={editingId}
            onSave={handleSave}
          />
        )}

        {loading && <div className="loading">Loading...</div>}
        {error && <div className="error">Error: {error}</div>}

        {!loading && properties.length > 0 && (
          <div className="properties-table">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Location</th>
                  <th>Price</th>
                  <th>Bedrooms</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {properties.map(property => (
                  <tr key={property.id}>
                    <td>{property.name}</td>
                    <td>{property.location}</td>
                    <td>${property.price}</td>
                    <td>{property.bedrooms}</td>
                    <td className="actions">
                      <button 
                        className="btn btn-secondary"
                        onClick={() => {
                          setEditingId(property.id)
                          setShowForm(true)
                        }}
                      >
                        Edit
                      </button>
                      <button 
                        className="btn btn-danger"
                        onClick={() => handleDelete(property.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  )
}
