import { useState } from 'react'
import { auth } from './firebase'
import { signInWithEmailAndPassword } from 'firebase/auth'
import './LoginPage.css'

export default function LoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [done, setDone]         = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email, password)
      setDone(true)
      // onAuthStateChanged in App.jsx will handle the redirect
    } catch (err) {
      const msg = err.code === 'auth/invalid-credential'
        ? 'Invalid email or password.'
        : err.code === 'auth/user-not-found'
        ? 'No account found with this email.'
        : err.code === 'auth/wrong-password'
        ? 'Incorrect password.'
        : err.code === 'auth/too-many-requests'
        ? 'Too many attempts. Please wait and try again.'
        : 'Authentication failed. Please try again.'
      setError(msg)
      setLoading(false)
    }
  }

  return (
    <div className="lp-root">
      {/* Full-bleed left visual */}
      <div className="lp-visual">
        <div className="lp-visual-bg" />
        <div className="lp-visual-content">
          <img src="/logo.svg" alt="xiberlinc" className="lp-visual-logo" />
          <div className="lp-visual-text">
            <p className="lp-visual-eyebrow" style={{ visibility: 'hidden' }}>Neural Interface Platform</p>
            <h1 className="lp-visual-headline">
              Decode<br />the mind.
            </h1>
            <p className="lp-visual-body">
              Real-time emotion AI and adaptive neurofeedback — engineered for the next generation of human-computer interaction.
            </p>
          </div>
          <div className="lp-visual-badges" style={{ visibility: 'hidden' }}>
            <span><span className="dot dot-live" />Live on 3 models</span>
            <span>Sub-50ms latency</span>
            <span>SOC 2 certified</span>
          </div>
        </div>
        {/* Subtle scan line effect */}
        <div className="lp-scan-line" />
      </div>

      {/* Right — Auth panel */}
      <div className="lp-panel">
        <div className="lp-panel-inner">
          {done ? (
            <div className="lp-success">
              <div className="lp-success-check">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <p>Signing you in…</p>
            </div>
          ) : (
            <>
              <div className="lp-panel-head">
                <h2>Sign in</h2>
                <p>Access your xiberlinc research suite</p>
              </div>

              <form onSubmit={submit} className="lp-form">
                <div className="lp-field">
                  <label htmlFor="lp-email">Email</label>
                  <input
                    id="lp-email"
                    type="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError('') }}
                    placeholder="you@xiberlinc.com"
                    autoComplete="email"
                    required
                  />
                </div>

                <div className="lp-field">
                  <div className="lp-field-row">
                    <label htmlFor="lp-pw">Password</label>
                    <button type="button" className="lp-text-btn">Forgot?</button>
                  </div>
                  <div className="lp-pw-wrap">
                    <input
                      id="lp-pw"
                      type={showPw ? 'text' : 'password'}
                      value={password}
                      onChange={e => { setPassword(e.target.value); setError('') }}
                      placeholder="········"
                      autoComplete="current-password"
                      required
                    />
                    <button type="button" className="lp-eye" onClick={() => setShowPw(s => !s)}>
                      {showPw ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>

                {error && <p className="lp-error">{error}</p>}

                <button
                  id="lp-submit"
                  type="submit"
                  className="lp-btn-primary"
                  disabled={loading}
                >
                  {loading
                    ? <span className="lp-spinner" />
                    : 'Continue →'
                  }
                </button>
              </form>

              <p className="lp-footer-note">
                New to xiberlinc? <button type="button" className="lp-text-btn">Request access</button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
