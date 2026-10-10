import { useState, useEffect, useCallback } from "react";
import { BrowserRouter, Routes, Route, NavLink, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Toaster, toast } from "react-hot-toast";
import {
  LayoutDashboard, ScanSearch, Mail, BookOpen, FileText,
  Settings, ChevronLeft, ChevronRight, Search, Bell, ExternalLink,
  Command, X, Shield, Zap, Activity
} from "lucide-react";
import Overview        from "./pages/Overview.jsx";
import Scanner         from "./pages/Scanner.jsx";
import HeaderForensics from "./pages/HeaderForensics.jsx";
import AuditLog        from "./pages/AuditLog.jsx";
import Reports         from "./pages/Reports.jsx";
import Landing         from "./pages/Landing.jsx";
import { MOCK_NOTIFICATIONS } from "./data/mock.js";

const NAV = [
  { path:"/overview",  label:"Overview",         Icon:LayoutDashboard, end:true  },
  { path:"/scanner",   label:"Domain Scanner",   Icon:ScanSearch,      end:false },
  { path:"/forensics", label:"Header Forensics", Icon:Mail,            end:false },
  { path:"/ledger",    label:"Audit Ledger",     Icon:BookOpen,        badge:1,  end:false },
  { path:"/reports",   label:"Reports",          Icon:FileText,        end:false },
];

const CMD_ITEMS = [
  { label:"Landing Portal",         hint:"Portal", path:"/"         },
  { label:"Go to Overview",         hint:"Page",   path:"/overview"  },
  { label:"Scan a domain",          hint:"Action", path:"/scanner"   },
  { label:"Analyze email headers",  hint:"Action", path:"/forensics" },
  { label:"View Audit Ledger",      hint:"Page",   path:"/ledger"    },
  { label:"Generate Report",        hint:"Page",   path:"/reports"   },
];

const TICKER_DATA = [
  ["SPF", "pass"], ["DKIM", "pass"], ["DMARC", "warn"],
  ["TLS", "pass"], ["SMTP", "fail"], ["DNSSEC", "warn"],
  ["SPF", "pass"], ["DKIM", "pass"], ["DMARC", "warn"],
  ["TLS", "pass"], ["SMTP", "fail"], ["DNSSEC", "warn"],
];

/* ── Brand Icon SVG ── */
function BrandIcon() {
  return (
    <div className="brand-icon">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L3 7v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7L12 2Z"
          stroke="rgba(6,11,17,0.9)" strokeWidth="1.8" fill="none"/>
        <path d="M8 12l3 3 5-5" stroke="rgba(6,11,17,0.95)" strokeWidth="2.2"
          strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  );
}

/* ── Command Palette ── */
function CommandPalette({ open, onClose, navigate }) {
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const filtered = CMD_ITEMS.filter(i =>
    !q || i.label.toLowerCase().includes(q.toLowerCase())
  );

  useEffect(() => { if (open) { setQ(""); setSel(0); } }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = e => {
      if (e.key === "ArrowDown") { e.preventDefault(); setSel(s => Math.min(s+1, filtered.length-1)); }
      if (e.key === "ArrowUp")   { e.preventDefault(); setSel(s => Math.max(s-1, 0)); }
      if (e.key === "Enter" && filtered[sel]) { navigate(filtered[sel].path); onClose(); }
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, filtered, sel, navigate, onClose]);

  if (!open) return null;
  return (
    <>
      <div className="cmd-backdrop" onClick={onClose} />
      <div className="cmd-panel">
        <div className="cmd-input-row">
          <Command size={16} style={{color:"var(--text-muted)",flexShrink:0}}/>
          <input autoFocus className="cmd-input" placeholder="Search or jump to…"
            value={q} onChange={e=>{setQ(e.target.value);setSel(0);}}/>
          <button onClick={onClose} style={{color:"var(--text-muted)"}}>
            <X size={16}/>
          </button>
        </div>
        <div className="cmd-results">
          {filtered.length === 0
            ? <div className="empty-state" style={{padding:"1.5rem"}}><p className="empty-title">No results</p></div>
            : <>
              <div className="cmd-section-label">Navigation</div>
              {filtered.map((item, i) => (
                <div key={item.path}
                  className={`cmd-item${i===sel?" selected":""}`}
                  onClick={() => { navigate(item.path); onClose(); }}
                  onMouseEnter={() => setSel(i)}
                >
                  <span className="cmd-item-label">{item.label}</span>
                  <span className="cmd-item-hint">{item.hint}</span>
                </div>
              ))}
            </>
          }
        </div>
        <div className="cmd-footer">
          <span style={{display:"flex",alignItems:"center",gap:4}}>
            <kbd style={{background:"var(--bg-overlay)",border:"1px solid var(--border)",borderRadius:3,padding:"1px 5px",fontSize:"0.60rem"}}>↑↓</kbd> navigate
          </span>
          <span style={{display:"flex",alignItems:"center",gap:4}}>
            <kbd style={{background:"var(--bg-overlay)",border:"1px solid var(--border)",borderRadius:3,padding:"1px 5px",fontSize:"0.60rem"}}>↵</kbd> select
          </span>
          <span style={{display:"flex",alignItems:"center",gap:4}}>
            <kbd style={{background:"var(--bg-overlay)",border:"1px solid var(--border)",borderRadius:3,padding:"1px 5px",fontSize:"0.60rem"}}>Esc</kbd> close
          </span>
        </div>
      </div>
    </>
  );
}

/* ── Notifications Panel ── */
function NotifPanel({ open, onClose }) {
  const [items, setItems] = useState(MOCK_NOTIFICATIONS);
  if (!open) return null;
  const markRead = id => setItems(p => p.map(n => n.id===id ? {...n,read:true} : n));
  const typeColor = t => t==="alert"?"var(--red)":t==="success"?"var(--green)":"var(--cyan)";
  return (
    <>
      <div style={{position:"fixed",inset:0,zIndex:298}} onClick={onClose}/>
      <div style={{
        position:"fixed",top:"var(--topbar-h)",right:"1rem",width:340,
        background:"var(--bg-elevated)",border:"1px solid var(--border)",
        borderRadius:"var(--r-lg)",boxShadow:"var(--shadow-xl)",
        zIndex:299,animation:"scaleIn 0.2s var(--ease-out)"
      }}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0.9rem 1rem",borderBottom:"1px solid var(--border)"}}>
          <span style={{fontFamily:"var(--font-display)",fontWeight:700,fontSize:"0.88rem"}}>Notifications</span>
          <button onClick={onClose} style={{color:"var(--text-muted)"}}><X size={15}/></button>
        </div>
        {items.map(n => (
          <div key={n.id} onClick={()=>markRead(n.id)} style={{
            display:"flex",gap:"0.75rem",padding:"0.75rem 1rem",
            borderBottom:"1px solid var(--border-light)",cursor:"pointer",
            background:n.read?"none":"rgba(0,229,255,0.025)",
            transition:"background 0.15s"
          }}>
            <div style={{width:7,height:7,borderRadius:"50%",background:typeColor(n.type),marginTop:5,flexShrink:0,boxShadow:`0 0 6px ${typeColor(n.type)}`}}/>
            <div style={{flex:1}}>
              <div style={{fontSize:"0.82rem",color:"var(--text-primary)",lineHeight:1.4}}>{n.msg}</div>
              <div style={{fontSize:"0.68rem",color:"var(--text-faint)",marginTop:3,fontFamily:"var(--font-mono)"}}>{n.ts}</div>
            </div>
            {!n.read && <div style={{width:6,height:6,background:"var(--cyan)",borderRadius:"50%",marginTop:5,flexShrink:0}}/>}
          </div>
        ))}
      </div>
    </>
  );
}

/* ── App Shell (inner, uses useLocation) ── */
function AppShell() {
  const location = useLocation();
  const [collapsed,  setCollapsed]  = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cmdOpen,    setCmdOpen]    = useState(false);
  const [notifOpen,  setNotifOpen]  = useState(false);
  const [apiOnline,  setApiOnline]  = useState(false);
  const [, forceNav] = useState(0);

  const navigate = path => { window.history.pushState({}, "", path); forceNav(n=>n+1); };

  // Cmd+K shortcut
  useEffect(() => {
    const onKey = e => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setCmdOpen(o => !o); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // API health
  useEffect(() => {
    const ping = async () => {
      try { const r = await fetch("/health", {signal:AbortSignal.timeout(2000)}); setApiOnline(r.ok); }
      catch { setApiOnline(false); }
    };
    ping();
    const id = setInterval(ping, 15000);
    return () => clearInterval(id);
  }, []);

  const unread = MOCK_NOTIFICATIONS.filter(n => !n.read).length;

  // Breadcrumb from path
  const crumb = {
    "/overview":  "Overview",
    "/scanner":   "Domain Scanner",
    "/forensics": "Header Forensics",
    "/ledger":    "Audit Ledger",
    "/reports":   "Reports",
  }[location.pathname] || "Overview";

  const pageVariants = {
    initial: { opacity:0, y:12 },
    animate: { opacity:1, y:0, transition:{ duration:0.30, ease:[0.16,1,0.3,1] } },
    exit:    { opacity:0, y:-8, transition:{ duration:0.18 } },
  };

  return (
    <div className="app">
      {/* Overlay for mobile */}
      {mobileOpen && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:199,backdropFilter:"blur(4px)"}}
          onClick={()=>setMobileOpen(false)}/>
      )}

      {/* ── Sidebar ── */}
      <aside className={`sidebar${collapsed?" collapsed":""}${mobileOpen?" mobile-open":""}`}>
        {/* Brand */}
        <NavLink to="/" className="sidebar-brand" style={{textDecoration:"none",display:"flex",alignItems:"center",gap:"var(--s3)"}} title="Go to Landing Portal">
          <BrandIcon/>
          <div style={{overflow:"hidden"}}>
            <div className="brand-name">Signal Vault</div>
            <div className="brand-tag">SecureMailScope</div>
          </div>
        </NavLink>

        {/* Nav */}
        <nav className="sidebar-nav">
          <div className="nav-section">Platform</div>
          {NAV.slice(0,5).map(({path,label,Icon,badge,end}) => (
            <NavLink key={path} to={path} end={end}
              className={({isActive})=>`nav-item${isActive?" active":""}`}
              onClick={()=>setMobileOpen(false)}
            >
              <Icon className="nav-icon" size={15} strokeWidth={1.8}/>
              <span className="nav-label">{label}</span>
              {badge && <span className="nav-badge">{badge}</span>}
            </NavLink>
          ))}

          <div className="nav-section">Portal</div>
          <NavLink to="/" className="nav-item" title="Landing Page" onClick={()=>setMobileOpen(false)}>
            <Shield className="nav-icon" size={15} strokeWidth={1.8}/>
            <span className="nav-label">Landing Portal</span>
          </NavLink>
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <button
            className="sidebar-toggle-btn"
            onClick={()=>setCollapsed(c=>!c)}
            style={{cursor:"pointer"}}
          >
            {collapsed
              ? <ChevronRight size={14} style={{color:"var(--text-muted)"}}/>
              : <ChevronLeft  size={14} style={{color:"var(--text-muted)"}}/>
            }
            <span className="nav-label" style={{fontSize:"0.76rem",color:"var(--text-muted)"}}>
              {collapsed?"Expand":"Collapse"}
            </span>
          </button>
          <div className="user-row">
            <div className="user-avatar">SV</div>
            <div className="user-info">
              <div className="user-name">Signal Vault</div>
              <div className="user-role">workspace · admin</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className={`main${collapsed?" sidebar-collapsed":""}`}>

        {/* Intelligence ticker */}
        <div className="ticker-bar">
          <div className="ticker-track">
            {[...TICKER_DATA, ...TICKER_DATA].map(([label, status], i) => (
              <span key={i} className="ticker-item">
                <span className="ticker-label">{label}</span>
                <span className={status==="pass"?"ticker-pass":status==="fail"?"ticker-fail":"ticker-warn"}>
                  {status.toUpperCase()}
                </span>
              </span>
            ))}
          </div>
        </div>

        {/* ── Topbar ── */}
        <header className="topbar">
          <div className="topbar-left">
            {/* Mobile hamburger */}
            <button className="topbar-btn"
              style={{display:"none"}} id="hamburger"
              onClick={()=>setMobileOpen(o=>!o)}>
              ☰
            </button>

            {/* Breadcrumb */}
            <nav className="breadcrumb">
              <span className="breadcrumb-item">Signal Vault</span>
              <span className="breadcrumb-sep">/</span>
              <span className="breadcrumb-item current">{crumb}</span>
            </nav>
          </div>

          <div className="topbar-right">
            {/* Search */}
            <button className="search-trigger" onClick={()=>setCmdOpen(true)}>
              <Search size={14}/>
              <span>Quick search</span>
              <span className="search-kbd">
                <span>⌘</span><span>K</span>
              </span>
            </button>

            {/* API status */}
            <div className={`status-pill${apiOnline?" online":" offline"}`}>
              <span className="status-dot"/>
              {apiOnline?"API Live":"Demo Mode"}
            </div>

            {/* Notifications */}
            <button className="topbar-btn" onClick={()=>setNotifOpen(o=>!o)} style={{position:"relative"}}>
              <Bell size={15}/>
              {unread > 0 && <span className="notif-dot"/>}
            </button>

            {/* Docs link */}
            <button className="topbar-btn"
              onClick={()=>window.open("http://127.0.0.1:8000/docs","_blank")}
              title="API Docs">
              <ExternalLink size={14}/>
            </button>
          </div>
        </header>

        <NotifPanel open={notifOpen} onClose={()=>setNotifOpen(false)}/>
        <CommandPalette open={cmdOpen} onClose={()=>setCmdOpen(false)} navigate={path=>{window.location.href=path;}}/>

        {/* ── Pages ── */}
        <div className="page">
          <AnimatePresence mode="wait">
            <motion.div key={location.pathname}
              variants={pageVariants} initial="initial" animate="animate" exit="exit"
              style={{height:"100%"}}
            >
              <div className="page-inner">
                <Routes>
                  <Route path="/overview"  element={<Overview  apiOnline={apiOnline}/>}/>
                  <Route path="/scanner"   element={<Scanner   apiOnline={apiOnline}/>}/>
                  <Route path="/forensics" element={<HeaderForensics/>}/>
                  <Route path="/ledger"    element={<AuditLog   apiOnline={apiOnline}/>}/>
                  <Route path="/reports"   element={<Reports/>}/>
                  <Route path="*"          element={<Navigate to="/overview" replace/>}/>
                </Routes>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
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
        <Route path="/*" element={<AppShell/>}/>
      </Routes>
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3500,
          style: {
            background:"#111820", color:"#E8EDF2",
            border:"1px solid rgba(0,229,255,0.18)",
            boxShadow:"0 8px 32px rgba(0,0,0,0.6)",
            fontFamily:"'Inter',sans-serif",
            fontSize:"0.84rem", borderRadius:"10px",
          },
          success:{ iconTheme:{ primary:"#00D4AA", secondary:"#060B11" } },
          error:  { iconTheme:{ primary:"#FF4455", secondary:"#060B11" } },
        }}
      />
    </BrowserRouter>
  );
}
