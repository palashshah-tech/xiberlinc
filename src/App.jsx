import { useState } from 'react'
import LoginPage from './LoginPage'
import Dashboard from './Dashboard'
import './index.css'

export default function App() {
  const [user, setUser] = useState(null)
  const [page, setPage] = useState('login') // 'login' | 'dashboard'

  const handleLogin = (userData) => {
    setUser(userData)
    setPage('dashboard')
  }

  const handleLogout = () => {
    setUser(null)
    setPage('login')
  }

  if (page === 'dashboard' && user) {
    return <Dashboard user={user} onLogout={handleLogout} />
  }

  return <LoginPage onLogin={handleLogin} />
}
