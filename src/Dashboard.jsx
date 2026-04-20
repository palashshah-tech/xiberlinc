import { useState, useEffect, useRef } from 'react'
import { auth } from './firebase'
import { signOut } from 'firebase/auth'
import './Dashboard.css'

const PRODUCTS = [
  {
    id: 'face-eeg',
    label: '01',
    name: 'FaceVoice2EEG',
    category: 'Emotion Intelligence',
    headline: 'Decode human emotion\nin real time.',
    body: 'A multimodal neural interface that fuses facial landmark analysis, voice biomarkers, and EEG signals to predict emotional states — arousal, valence, and expectation — with sub-50ms latency.',
    stat1: { value: '94.7%', label: 'Model accuracy' },
    stat2: { value: '<50ms', label: 'Round-trip latency' },
    stat3: { value: '1401', label: 'Input features' },
    accent: '#ffffff',
    status: 'Production',
  },
  {
    id: 'bci-neuro',
    label: '02',
    name: 'BCI Neurofeedback',
    category: 'Cognitive Enhancement',
    headline: 'Play Space Invaders\nwith your mind.',
    body: 'The world\'s first neurofeedback-controlled Space Invaders. Your focus and cognitive state drive your ship — hit peak neural performance and watch your score soar. No controller needed. Just your brain.',
    stat1: { value: 'Real-time', label: 'Brain-state decoding' },
    stat2: { value: 'Adaptive', label: 'Difficulty engine' },
    stat3: { value: '∞',       label: 'Play sessions' },
    accent: '#ffffff',
    status: 'Production',
  },
]

/* Minimal live EEG line */
function EEGLine({ color }) {
  const [pts, setPts] = useState(() =>
    Array.from({ length: 80 }, (_, i) => ({ x: i, y: 50 + (Math.random() - 0.5) * 30 }))
  )
  useEffect(() => {
    const id = setInterval(() => {
      setPts(prev => {
        const n = [...prev.slice(1)]
        const last = n[n.length - 1]
        const next = Math.max(5, Math.min(95, last.y + (Math.random() - 0.5) * 12))
        n.push({ x: last.x + 1, y: next })
        return n.map((p, i) => ({ ...p, x: i }))
      })
    }, 60)
    return () => clearInterval(id)
  }, [])

  const d = pts.reduce((acc, p, i) => {
    const x = (p.x / 79) * 100
    const y = p.y
    return acc + (i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`)
  }, '')

  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="eeg-svg">
      <path d={d} stroke={color} strokeWidth="0.8" fill="none" strokeLinecap="round" />
    </svg>
  )
}

/* Product card */
function ProductCard({ product, onOpen, user }) {
  const [hov, setHov] = useState(false)
  return (
    <div
      className={`pc ${hov ? 'pc-hov' : ''}`}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <div className="pc-top">
        <span className="pc-label">{product.label}</span>
        <span className="pc-status" style={{ color: product.accent, borderColor: `${product.accent}30` }}>
          {product.status}
        </span>
      </div>

      <div className="pc-category">{product.category}</div>
      <h3 className="pc-name">{product.name}</h3>

      <div className="pc-eeg">
        <EEGLine color={product.accent} />
      </div>

      <pre className="pc-headline">{product.headline}</pre>
      <p className="pc-body">{product.body}</p>

      <div className="pc-stats">
        {[product.stat1, product.stat2, product.stat3].map(s => (
          <div key={s.label} className="pc-stat">
            <span className="pc-stat-val" style={{ color: product.accent }}>{s.value}</span>
            <span className="pc-stat-lbl">{s.label}</span>
          </div>
        ))}
      </div>

      <button
        id={`open-${product.id}`}
        className="pc-cta"
        style={{ borderColor: `${product.accent}40`, color: product.accent }}
        onClick={async () => {
          if (product.id === 'face-eeg') {
            try {
              const token = await user.getIdToken()
              window.location.href = `https://temp-xiber.vercel.app/?sso_token=${encodeURIComponent(token)}&sso_email=${encodeURIComponent(user.email)}`
            } catch (err) {
              console.error('SSO handoff failed', err)
              window.location.href = 'https://temp-xiber.vercel.app/'
            }
          } else {
            onOpen(product)
          }
        }}
      >
        Open {product.name}
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  )
}

/* Main Dashboard */
export default function Dashboard({ user }) {
  const [active, setActive] = useState(null)
  const [time, setTime]     = useState(new Date())

  const userName = user?.displayName || user?.email?.split('@')[0] || 'User'
  const userInitials = userName.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()

  const handleLogout = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error('Logout failed', error)
    }
  }

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  if (active) return <Workspace product={active} user={user} onBack={() => setActive(null)} />

  return (
    <div className="db-root">
      {/* Nav */}
      <nav className="db-nav">
        <div className="db-nav-left">
          <img src="/logo.svg" alt="xiberlinc" className="db-nav-logo" />
        </div>
        <div className="db-nav-center">
          <span className="db-nav-item">Platform</span>
          <span className="db-nav-item">Docs</span>
          <span className="db-nav-item">Support</span>
        </div>
        <div className="db-nav-right">
          <span className="db-nav-time">{time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
          <div className="db-user-btn">
            <div className="db-avatar">{userInitials}</div>
            <span>{userName}</span>
          </div>
          <button id="db-signout" className="db-signout" onClick={handleLogout}>Sign out</button>
        </div>
      </nav>

      {/* Hero banner */}
      <div className="db-hero">
        <p className="db-hero-label" style={{ visibility: 'hidden' }}>xiberlinc Platform</p>
        <h1 className="db-hero-h1">
          Your neural<br />
          <span className="db-hero-thin">interface suite.</span>
        </h1>
        <p className="db-hero-sub">
          Two breakthrough products. One platform.
        </p>
      </div>

      {/* Stat bar */}
      <div className="db-statbar">
        {[
          { v: '3',     l: 'Active models' },
          { v: '43ms',  l: 'Avg latency' },
          { v: '99.9%', l: 'Uptime SLA' },
        ].map((s, i) => (
          <div key={i} className="db-statbar-item">
            <span className="db-statbar-val">{s.v}</span>
            <span className="db-statbar-lbl">{s.l}</span>
          </div>
        ))}
      </div>

      {/* Rule */}
      <div className="db-rule" />

      {/* Products */}
      <div className="db-products-head">
        <span className="db-products-eyebrow">Your products</span>
      </div>
      <div className="db-grid">
        {PRODUCTS.map((p, i) => (
          <div key={p.id} style={{ animation: `fadeUp 0.5s var(--ease) ${0.05 + i * 0.1}s both` }}>
            <ProductCard product={p} onOpen={setActive} user={user} />
          </div>
        ))}
      </div>

      <footer className="db-footer">
        {/* Logo removed - visibility:hidden to preserve footer layout */}
        <div style={{ width: '120px', visibility: 'hidden' }}>
          <img src="/logo.svg" alt="" className="db-footer-logo" />
        </div>
        <span>© 2025 xiberlinc Inc.</span>
        <span>Privacy · Terms · Support</span>
      </footer>
    </div>
  )
}

/* ── Product Workspace ── */
function Workspace({ product, user, onBack }) {
  const [tab, setTab] = useState('overview')
  const tabs = product.id === 'face-eeg'
    ? ['overview', 'session', 'history', 'settings']
    : ['overview', 'protocols', 'leaderboard', 'settings']

  return (
    <div className="ws-root">
      {/* Space Invaders background for BCI product only */}
      {product.id === 'bci-neuro' && <SpaceInvadersBg />}

      <nav className="ws-nav">
        <button id="ws-back" className="ws-back" onClick={onBack}>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M10 4L6 8l4 4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Dashboard
        </button>
        <div className="ws-nav-title">
          {product.name}
        </div>
        <div className="ws-nav-right">
          <span className="ws-plan">{user?.displayName || user?.email?.split('@')[0] || 'User'}</span>
          <img src="/logo.svg" alt="" className="ws-nav-logo" />
        </div>
      </nav>

      {/* Tab bar */}
      <div className="ws-tabbar">
        {tabs.map(t => (
          <button
            key={t}
            id={`ws-tab-${t}`}
            className={`ws-tab ${tab === t ? 'ws-tab-active' : ''}`}
            onClick={() => setTab(t)}
            style={tab === t ? { borderBottomColor: product.accent, color: '#fff' } : {}}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div className="ws-body" key={tab}>
        {tab === 'overview'
          ? <WorkspaceOverview product={product} />
          : <WorkspacePlaceholder product={product} tab={tab} />
        }
      </div>
    </div>
  )
}

/* ── Space Invaders animated background for BCI workspace ── */
function SpaceInvadersBg() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    canvas.width  = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    const W = canvas.width
    const H = canvas.height

    // Invader shape (classic pixelart grid)
    const INVADER = [
      [0,0,1,0,0,0,0,0,1,0,0],
      [0,0,0,1,0,0,0,1,0,0,0],
      [0,0,1,1,1,1,1,1,1,0,0],
      [0,1,1,0,1,1,1,0,1,1,0],
      [1,1,1,1,1,1,1,1,1,1,1],
      [1,0,1,1,1,1,1,1,1,0,1],
      [1,0,1,0,0,0,0,0,1,0,1],
      [0,0,0,1,1,0,1,1,0,0,0],
    ]

    const drawInvader = (x, y, size, alpha) => {
      ctx.save()
      ctx.globalAlpha = alpha
      ctx.fillStyle = '#ffffff'
      INVADER.forEach((row, ri) => {
        row.forEach((px, ci) => {
          if (px) ctx.fillRect(x + ci * size, y + ri * size, size - 0.5, size - 0.5)
        })
      })
      ctx.restore()
    }

    // Create fleet of invaders
    const invaders = []
    const cols = 10, rows = 5
    const baseX = (W - cols * 52) / 2
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        invaders.push({
          x: baseX + c * 52,
          y: 80 + r * 48,
          speed: 0.3 + Math.random() * 0.2,
          dir: 1,
          dead: Math.random() > 0.7,
          alpha: 0.03 + Math.random() * 0.04,
        })
      }
    }

    // Bullets
    const bullets = Array.from({ length: 6 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      speed: 1.5 + Math.random() * 1.5,
      alpha: 0.06 + Math.random() * 0.06,
      w: 2, h: 10 + Math.random() * 8,
    }))

    // Player ship (triangle at bottom)
    const ship = { x: W / 2, y: H - 80, speed: 0.8, dir: 1 }

    let frame = 0
    let animId

    const tick = () => {
      ctx.clearRect(0, 0, W, H)
      frame++

      // Move entire fleet left/right in sync
      const fleetX = Math.sin(frame * 0.004) * (W * 0.22)
      const fleetY = Math.sin(frame * 0.002) * 30

      invaders.forEach(inv => {
        if (inv.dead) return
        const rx = inv.x + fleetX
        const ry = inv.y + fleetY
        drawInvader(rx, ry, 3.2, inv.alpha)
      })

      // Bullets rising
      bullets.forEach(b => {
        b.y -= b.speed
        if (b.y + b.h < 0) { b.y = H + b.h; b.x = Math.random() * W }
        ctx.save()
        ctx.globalAlpha = b.alpha
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(b.x, b.y, b.w, b.h)
        ctx.restore()
      })

      // Player ship
      ship.x += ship.dir * ship.speed
      if (ship.x > W - 40 || ship.x < 40) ship.dir *= -1
      ctx.save()
      ctx.globalAlpha = 0.07
      ctx.fillStyle = '#ffffff'
      ctx.beginPath()
      ctx.moveTo(ship.x, ship.y - 14)
      ctx.lineTo(ship.x + 18, ship.y + 8)
      ctx.lineTo(ship.x - 18, ship.y + 8)
      ctx.closePath()
      ctx.fill()
      ctx.restore()

      animId = requestAnimationFrame(tick)
    }

    tick()

    const onResize = () => {
      canvas.width  = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return <canvas ref={canvasRef} className="si-canvas" />
}

function WorkspaceOverview({ product }) {
  const steps = product.id === 'face-eeg'
    ? ['Signal capture', 'Feature extraction', 'PCA transform', 'Model inference', 'Emotion output']
    : ['EEG streaming', 'Focus score decoding', 'Neural state mapping', 'Ship control signal', 'Game response']

  const caps = product.id === 'face-eeg'
    ? ['467 facial landmarks via MediaPipe', 'WebRTC DataChannel streaming', 'PyTorch inference engine', 'PCA dimensionality reduction (1401→5)', 'Arousal / Valence / Expectation output', 'iOS native WKWebView compatible']
    : ['Pure thought control — no physical input', 'Real-time EEG focus-score drives your ship', 'The harder you concentrate, the more you shoot', 'Adaptive difficulty matches your neural performance', 'Lab Streaming Layer (LSL) integration', 'Leaderboard driven by neurofeedback scores']

  return (
    <div className="wso-root">
      {/* Overview hero */}
      <div className="wso-hero">
        <div className="wso-hero-left">
          <p className="wso-cat" style={{ color: product.accent }}>{product.category}</p>
          <pre className="wso-headline">{product.headline}</pre>
          <p className="wso-body">{product.body}</p>
        </div>
        <div className="wso-hero-right">
          <div className="wso-eeg-big">
            <EEGLine color={product.accent} />
          </div>
          <div className="wso-stats-mini">
            {[product.stat1, product.stat2, product.stat3].map(s => (
              <div key={s.label} className="wso-stat-mini">
                <span style={{ color: product.accent, fontWeight: 300, fontSize: 28, letterSpacing: -1 }}>{s.value}</span>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.5px' }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pipeline */}
      <div className="wso-section">
        <p className="wso-section-label">How it works</p>
        <div className="wso-pipeline">
          {steps.map((step, i) => (
            <div key={step} className="wso-pipe-step">
              <span className="wso-pipe-n" style={{ color: product.accent }}>0{i + 1}</span>
              <span className="wso-pipe-name">{step}</span>
              {i < steps.length - 1 && <div className="wso-pipe-line" />}
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="wso-section">
        <p className="wso-section-label">Capabilities</p>
        <div className="wso-caps">
          {caps.map((cap, i) => (
            <div key={i} className="wso-cap" style={{ borderColor: `${product.accent}18` }}>
              <span className="wso-cap-dot" style={{ background: product.accent }} />
              {cap}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function WorkspacePlaceholder({ product, tab }) {
  return (
    <div className="wsp-root">
      <p className="wsp-eyebrow" style={{ color: product.accent }}>Coming next</p>
      <h2 className="wsp-title">{tab.charAt(0).toUpperCase() + tab.slice(1)}</h2>
      <p className="wsp-body">
        This module is being built for the full {product.name} release.<br />
        This POC demonstrates product architecture and navigation.
      </p>
      <div className="wsp-tags">
        {['UI designed', 'Backend integration next', 'POC phase'].map(t => (
          <span key={t} className="wsp-tag" style={{ borderColor: `${product.accent}25`, color: 'rgba(255,255,255,0.4)' }}>{t}</span>
        ))}
      </div>
    </div>
  )
}
