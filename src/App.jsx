import { useState, useEffect } from 'react'
import HomePage from './pages/HomePage'
import AdminPage from './pages/AdminPage'
import './App.css'

export default function App() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token')
    if (token) {
      setIsAdmin(true)
      const userData = JSON.parse(localStorage.getItem('user') || '{}')
      setUser(userData)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setIsAdmin(false)
    setUser(null)
  }

  return (
    <div className="app">
      <nav className="navbar">
        <div className="container">
          <div className="nav-content">
            <h1 className="logo">Sam Roi Yot Insider</h1>
            <div className="nav-right">
              {isAdmin && user && (
                <>
                  <span className="user-name">Welcome, {user.username}</span>
                  <button className="btn btn-secondary" onClick={handleLogout}>
                    Logout
                  </button>
                </>
              )}
              {!isAdmin && (
                <a href="/admin" className="btn btn-primary">
                  Admin
                </a>
              )}
            </div>
          </div>
        </div>
      </nav>

      {isAdmin ? (
        <AdminPage onLogout={handleLogout} />
      ) : (
        <HomePage onAdminLogin={() => setIsAdmin(true)} />
      )}
    </div>
  )
}
