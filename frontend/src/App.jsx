import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, NavLink, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import Landing        from './pages/Landing.jsx';
import Dashboard      from './pages/Dashboard.jsx';
import Scanner        from './pages/Scanner.jsx';
import CyberBrainstorm from './pages/CyberBrainstorm.jsx';
import HeaderAnalysis from './pages/HeaderAnalysis.jsx';
import AuditLog       from './pages/AuditLog.jsx';
import Reports        from './pages/Reports.jsx';
import { soundManager } from './data/sound.js';

const NAV_ITEMS = [
  { path:'/dashboard',            label:'Dashboard',        icon:'◈', end:true  },
  { path:'/dashboard/scanner',    label:'Domain Scanner',   icon:'⟳', end:false },
  { path:'/dashboard/brainstorm', label:'Threat Brainstorm',icon:'🧠', end:false },
  { path:'/dashboard/headers',    label:'Header Forensics', icon:'≡', end:false },
  { path:'/dashboard/audit',      label:'Blockchain Audit', icon:'⛓', end:false },
  { path:'/dashboard/reports',    label:'Reports',          icon:'↓', end:false },
];

const PAGE_META = {
  '/dashboard':           { title:'Dashboard',             crumb:'Security Overview'     },
  '/dashboard/scanner':   { title:'Domain Scanner',        crumb:'Run Security Scan'     },
  '/dashboard/brainstorm':{ title:'Cyber Threat Brainstorm',crumb:'AI Neural Attack Matrix' },
  '/dashboard/headers':   { title:'Header Forensics',      crumb:'Email Header Analysis' },
  '/dashboard/audit':     { title:'Blockchain Audit',      crumb:'Immutable Scan Ledger' },
  '/dashboard/reports':   { title:'Reports',               crumb:'Compliance & Export'   },
};


/* ── Sidebar ── */
function Sidebar({ collapsed, setCollapsed }) {
  return (
    <aside
      className="sidebar"
      style={{
        width: collapsed ? 68 : 'var(--sidebar-w)',
        transition: 'width 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
        overflow: 'hidden'
      }}
    >
      <div className="sidebar-logo" style={{ justifyContent: collapsed ? 'center' : 'flex-start', gap: collapsed ? 0 : undefined }}>
        <div
          className="logo-mark"
          style={{ flexShrink: 0, cursor: 'pointer', transition: 'transform 0.2s' }}
          onClick={() => {
            soundManager.playClick();
            setCollapsed(c => !c);
          }}
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
            <path
              d="M14 2L3 7.5V14C3 19.55 7.84 24.74 14 26C20.16 24.74 25 19.55 25 14V7.5L14 2Z"
              stroke="url(#sbg)"
              strokeWidth="1.8"
              fill="rgba(109,40,217,0.12)"
            />
            <path d="M9 14l3 3 7-7" stroke="#34D399" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            <defs>
              <linearGradient id="sbg" x1="3" y1="2" x2="25" y2="26">
                <stop stopColor="#8B5CF6"/>
                <stop offset="1" stopColor="#06B6D4"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        {!collapsed && (
          <div className="logo-text">
            SecureMailScope
            <div className="logo-sub">AI Cryptographic Posture</div>
          </div>
        )}
      </div>

      <nav className="sidebar-nav">
        {!collapsed && <div className="nav-section-title">Navigation</div>}
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            onClick={() => soundManager.playClick()}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            title={collapsed ? item.label : undefined}
            style={{
              justifyContent: collapsed ? 'center' : undefined,
              padding: collapsed ? '0.75rem 0.5rem' : undefined,
              transition: 'all 0.18s ease'
            }}
          >
            <span style={{ fontSize: '1.15rem', flexShrink: 0 }}>{item.icon}</span>
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}

        {!collapsed && (
          <>
            <div className="nav-section-title" style={{ marginTop: '1.25rem' }}>External Links</div>
            <NavLink to="/" onClick={() => soundManager.playClick()} className="nav-item">
              <span style={{ fontSize: '1rem' }}>↩</span>
              Landing Portal
            </NavLink>
            <button
              className="nav-item"
              onClick={() => {
                soundManager.playClick();
                window.open('http://127.0.0.1:8000/docs', '_blank');
              }}
              style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none' }}
            >
              <span style={{ fontSize: '1rem' }}>📖</span>
              Interactive API Docs
            </button>
          </>
        )}
      </nav>

      {!collapsed && (
        <div className="sidebar-footer">
          <div className="user-card" style={{ transition: 'background 0.2s' }}>
            <div className="user-avatar">SIH</div>
            <div>
              <div className="user-name">Team SecureScope</div>
              <div className="user-role">SIH 2026 · Admin Node</div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

/* ── Topbar with Cyber Sound Toggle ── */
function Topbar({ apiOnline }) {
  const loc = useLocation();
  const meta = PAGE_META[loc.pathname] || PAGE_META['/dashboard'];
  const [muted, setMuted] = useState(soundManager.getMuted());

  const handleToggleSound = () => {
    const next = soundManager.toggleMute();
    setMuted(next);
    if (!next) soundManager.playClick();
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <span className="page-title">{meta.title}</span>
        <span className="page-crumb">SecureMailScope · {meta.crumb}</span>
      </div>
      <div className="topbar-right">
        {/* Sound toggle button */}
        <button
          onClick={handleToggleSound}
          className="topbar-btn"
          title={muted ? 'Enable Cyber Sound Effects' : 'Mute UI Sounds'}
          style={{ fontSize: '1rem', border: '1px solid var(--border)' }}
        >
          {muted ? '🔇' : '🔊'}
        </button>

        {/* API connection status pill */}
        <div
          className={`status-pill ${apiOnline ? '' : 'warn'}`}
          style={apiOnline ? {} : { background: 'rgba(245,158,11,0.08)', borderColor: 'rgba(245,158,11,0.25)', color: 'var(--accent-amber)' }}
        >
          <div
            className="status-dot"
            style={apiOnline ? { boxShadow: '0 0 8px #10B981' } : { background: 'var(--accent-amber)', boxShadow: '0 0 8px #F59E0B' }}
          />
          {apiOnline ? 'API Connected' : 'Simulated Node'}
        </div>

        <button
          className="topbar-btn"
          onClick={() => {
            soundManager.playClick();
            window.open('http://127.0.0.1:8000/docs', '_blank');
          }}
          title="FastAPI Swagger Documentation"
        >
          📖
        </button>

        <NavLink
          to="/"
          onClick={() => soundManager.playClick()}
          className="btn btn-outline"
          style={{
            padding: '0.4rem 0.9rem',
            fontSize: '0.8rem',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem'
          }}
        >
          ↩ Landing
        </NavLink>
      </div>
    </header>
  );
}

/* ── Animated App Shell with Page Transitions ── */
function AppShell() {
  const [collapsed, setCollapsed] = useState(false);
  const [apiOnline, setApiOnline] = useState(false);
  const location = useLocation();

  useEffect(() => {
    async function ping() {
      try {
        const r = await fetch('http://127.0.0.1:8000/health', { signal: AbortSignal.timeout(2000) });
        setApiOnline(r.ok);
      } catch {
        setApiOnline(false);
      }
    }
    ping();
    const id = setInterval(ping, 12000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="app-layout">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed}/>
      <div
        className="main-content"
        style={{
          marginLeft: collapsed ? 68 : 'var(--sidebar-w)',
          transition: 'margin-left 0.28s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        <Topbar apiOnline={apiOnline}/>
        <main className="page-content">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            >
              <Routes location={location}>
                <Route index element={<Dashboard apiOnline={apiOnline}/>}/>
                <Route path="scanner" element={<Scanner apiOnline={apiOnline}/>}/>
                <Route path="brainstorm" element={<CyberBrainstorm/>}/>
                <Route path="headers" element={<HeaderAnalysis/>}/>
                <Route path="audit" element={<AuditLog apiOnline={apiOnline}/>}/>
                <Route path="reports" element={<Reports/>}/>
                <Route path="*" element={<Navigate to="/dashboard" replace/>}/>
              </Routes>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

/* ── Root ── */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing/>}/>
        <Route path="/dashboard/*" element={<AppShell/>}/>
        <Route path="*" element={<Navigate to="/" replace/>}/>
      </Routes>

      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#0D0028',
            color: '#F0EEFF',
            border: '1px solid rgba(139,92,246,0.3)',
            boxShadow: '0 8px 30px rgba(0,0,0,0.6)',
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: '0.85rem',
            borderRadius: '12px',
          },
          success: { iconTheme: { primary: '#10B981', secondary: '#08001F' } },
          error:   { iconTheme: { primary: '#EF4444', secondary: '#08001F' } },
        }}
      />
    </BrowserRouter>
  );
}
