import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, NavLink, useLocation, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Landing        from './pages/Landing.jsx';
import Dashboard      from './pages/Dashboard.jsx';
import Scanner        from './pages/Scanner.jsx';
import HeaderAnalysis from './pages/HeaderAnalysis.jsx';
import AuditLog       from './pages/AuditLog.jsx';
import Reports        from './pages/Reports.jsx';

const NAV_ITEMS = [
  { path:'/dashboard',            label:'Dashboard',        icon:'◈', end:true  },
  { path:'/dashboard/scanner',    label:'Domain Scanner',   icon:'⟳', end:false },
  { path:'/dashboard/headers',    label:'Header Forensics', icon:'≡', end:false },
  { path:'/dashboard/audit',      label:'Blockchain Audit', icon:'⛓', end:false },
  { path:'/dashboard/reports',    label:'Reports',          icon:'↓', end:false },
];

const PAGE_META = {
  '/dashboard':           { title:'Dashboard',        crumb:'Security Overview'     },
  '/dashboard/scanner':   { title:'Domain Scanner',   crumb:'Run Security Scan'     },
  '/dashboard/headers':   { title:'Header Forensics', crumb:'Email Header Analysis' },
  '/dashboard/audit':     { title:'Blockchain Audit', crumb:'Immutable Scan Ledger' },
  '/dashboard/reports':   { title:'Reports',          crumb:'Compliance & Export'   },
};

/* ── Sidebar ── */
function Sidebar({ collapsed, setCollapsed }) {
  const loc = useLocation();
  return (
    <aside className="sidebar" style={{ width: collapsed ? 64 : 'var(--sidebar-w)', transition:'width 0.3s ease', overflow:'hidden' }}>
      <div className="sidebar-logo" style={{ justifyContent: collapsed ? 'center' : 'flex-start', gap: collapsed ? 0 : undefined }}>
        <div className="logo-mark" style={{ flexShrink:0, cursor:'pointer' }} onClick={() => setCollapsed(c => !c)} title={collapsed ? 'Expand' : 'Collapse'}>
          <svg width="20" height="20" viewBox="0 0 28 28" fill="none">
            <path d="M14 2L3 7.5V14C3 19.55 7.84 24.74 14 26C20.16 24.74 25 19.55 25 14V7.5L14 2Z"
              stroke="url(#sbg)" strokeWidth="1.5" fill="rgba(109,40,217,0.08)"/>
            <path d="M9 14l3 3 7-7" stroke="#34D399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <defs>
              <linearGradient id="sbg" x1="3" y1="2" x2="25" y2="26">
                <stop stopColor="#6D28D9"/><stop offset="1" stopColor="#059669"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        {!collapsed && (
          <div className="logo-text">
            SecureMailScope
            <div className="logo-sub">AI Email Security</div>
          </div>
        )}
      </div>

      <nav className="sidebar-nav">
        {!collapsed && <div className="nav-section-title">Navigation</div>}
        {NAV_ITEMS.map(item => (
          <NavLink key={item.path} to={item.path} end={item.end}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            title={collapsed ? item.label : undefined}
            style={{ justifyContent: collapsed ? 'center' : undefined, padding: collapsed ? '0.7rem' : undefined }}>
            <span style={{ fontSize:'1.1rem', flexShrink:0 }}>{item.icon}</span>
            {!collapsed && item.label}
          </NavLink>
        ))}

        {!collapsed && (
          <>
            <div className="nav-section-title" style={{ marginTop:'1rem' }}>Links</div>
            <NavLink to="/" className="nav-item">
              <span style={{ fontSize:'1rem' }}>↩</span>
              Landing Page
            </NavLink>
            <button className="nav-item" onClick={() => window.open('http://127.0.0.1:8000/docs','_blank')}>
              <span style={{ fontSize:'1rem' }}>📖</span>
              API Docs
            </button>
          </>
        )}
      </nav>

      {!collapsed && (
        <div className="sidebar-footer">
          <div className="user-card">
            <div className="user-avatar">SIH</div>
            <div>
              <div className="user-name">Team Secure</div>
              <div className="user-role">SIH 2026 · Admin</div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

/* ── Topbar ── */
function Topbar({ apiOnline }) {
  const loc  = useLocation();
  const meta = PAGE_META[loc.pathname] || PAGE_META['/dashboard'];
  return (
    <header className="topbar">
      <div className="topbar-left">
        <span className="page-title">{meta.title}</span>
        <span className="page-crumb">SecureMailScope · {meta.crumb}</span>
      </div>
      <div className="topbar-right">
        <div className={`status-pill ${apiOnline ? '' : 'warn'}`}
          style={apiOnline ? {} : { background:'rgba(245,158,11,0.08)', borderColor:'rgba(245,158,11,0.2)', color:'var(--accent-amber)' }}>
          <div className="status-dot" style={apiOnline ? {} : { background:'var(--accent-amber)' }}/>
          {apiOnline ? 'API Online' : 'Demo Mode'}
        </div>
        <button className="topbar-btn" onClick={() => window.open('http://127.0.0.1:8000/docs','_blank')} title="API Docs">📖</button>
        <NavLink to="/" className="btn btn-outline" style={{ padding:'0.4rem 1rem', fontSize:'0.8rem', textDecoration:'none', display:'inline-flex', alignItems:'center', gap:'0.35rem' }}>
          ↩ Landing
        </NavLink>
      </div>
    </header>
  );
}

/* ── App Shell (wraps all dashboard routes) ── */
function AppShell() {
  const [collapsed,  setCollapsed]  = useState(false);
  const [apiOnline,  setApiOnline]  = useState(false);

  useEffect(() => {
    async function ping() {
      try {
        const r = await fetch('http://127.0.0.1:8000/health', { signal: AbortSignal.timeout(2000) });
        setApiOnline(r.ok);
      } catch { setApiOnline(false); }
    }
    ping();
    const id = setInterval(ping, 10000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="app-layout">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed}/>
      <div className="main-content" style={{ marginLeft: collapsed ? 64 : 'var(--sidebar-w)', transition:'margin-left 0.3s ease' }}>
        <Topbar apiOnline={apiOnline}/>
        <main className="page-content">
          <Routes>
            <Route index                  element={<Dashboard      apiOnline={apiOnline}/>}/>
            <Route path="scanner"         element={<Scanner        apiOnline={apiOnline}/>}/>
            <Route path="headers"         element={<HeaderAnalysis/>}/>
            <Route path="audit"           element={<AuditLog       apiOnline={apiOnline}/>}/>
            <Route path="reports"         element={<Reports/>}/>
            <Route path="*"               element={<Navigate to="/dashboard" replace/>}/>
          </Routes>
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
        {/* Landing page = first page at / */}
        <Route path="/" element={<Landing/>}/>

        {/* Dashboard shell at /dashboard/* */}
        <Route path="/dashboard/*" element={<AppShell/>}/>

        {/* Catch-all → landing */}
        <Route path="*" element={<Navigate to="/" replace/>}/>
      </Routes>

      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3500,
          style: {
            background:'#18181B',
            color:'#FAFAFA',
            border:'1px solid rgba(255,255,255,0.08)',
            fontFamily:'Inter, system-ui, sans-serif',
            fontSize:'0.875rem',
            borderRadius:'10px',
          },
          success:{ iconTheme:{ primary:'#34D399', secondary:'#09090B' } },
          error:  { iconTheme:{ primary:'#F87171', secondary:'#09090B' } },
        }}
      />
    </BrowserRouter>
  );
}
