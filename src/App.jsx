import { useState } from 'react'
import LoginPage from './LoginPage'
import Dashboard from './Dashboard'
import './index.css'

function LangToggle({ lang, setLang }) {
  return (
    <div className="lang-toggle-fixed">
      <button 
        className={`lang-btn ${lang === 'en' ? 'active' : ''}`}
        onClick={() => setLang('en')}
      >
        EN
      </button>
      <span className="lang-sep">/</span>
      <button 
        className={`lang-btn ${lang === 'jp' ? 'active' : ''}`}
        onClick={() => setLang('jp')}
      >
        JP
      </button>
    </div>
  )
}

export default function App() {
  const [user, setUser] = useState(null)
  const [page, setPage] = useState('login') // 'login' | 'dashboard'
  const [lang, setLang] = useState('en')

  const handleLogin = (userData) => {
    setUser(userData)
    setPage('dashboard')
  }

  const handleLogout = () => {
    setUser(null)
    setPage('login')
  }

  return (
    <>
      <LangToggle lang={lang} setLang={setLang} />
      {page === 'dashboard' && user ? (
        <Dashboard user={user} onLogout={handleLogout} lang={lang} />
      ) : (
        <LoginPage onLogin={handleLogin} lang={lang} />
      )}
    </>
  )
}
