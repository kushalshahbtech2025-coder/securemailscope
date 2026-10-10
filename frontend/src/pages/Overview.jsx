import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import {
  Shield, ScanSearch, Mail, ArrowRight, TrendingUp,
  AlertTriangle, CheckCircle, AlertCircle, Info
} from "lucide-react";
import {
  MOCK_SIGNALS, MOCK_DOMAINS, MOCK_RISK_DIST, MOCK_SCORE_HISTORY,
  scoreColor, scoreLabel, statusBadge, riskBadge, fmtTime
} from "../data/mock.js";

/* ── Animated number counter ── */
function Counter({ target, duration = 1200 }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        const t0 = performance.now();
        const tick = now => {
          const p = Math.min((now - t0) / duration, 1);
          setVal(Math.round((1 - Math.pow(1 - p, 3)) * target));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target, duration]);
  return <span ref={ref}>{val}</span>;
}

/* ── SVG Score Gauge ── */
function ScoreGauge({ score }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const t0 = performance.now();
    const tick = now => {
      const p = Math.min((now - t0) / 1400, 1);
      setDisplay(Math.round((1 - Math.pow(1 - p, 3)) * score));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [score]);

  const r = 70; const cx = 88; const cy = 88;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - score / 100);
  const color = scoreColor(score);

  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"0.75rem" }}>
      <div style={{ position:"relative", display:"inline-flex" }}>
        <svg width={176} height={176} viewBox="0 0 176 176">
          {/* Background rings */}
          {[0.25, 0.5, 0.75].map(f => (
            <circle key={f} cx={cx} cy={cy} r={r * f} fill="none"
              stroke="rgba(255,255,255,0.02)" strokeWidth={1} strokeDasharray="3 4"/>
          ))}
          {/* Track */}
          <circle cx={cx} cy={cy} r={r} fill="none"
            stroke="rgba(255,255,255,0.06)" strokeWidth={10}/>
          {/* Fill */}
          <circle cx={cx} cy={cy} r={r} fill="none"
            stroke={color} strokeWidth={10}
            strokeDasharray={circ} strokeDashoffset={offset}
            strokeLinecap="round"
            transform={`rotate(-90 ${cx} ${cy})`}
            style={{ transition:"stroke-dashoffset 1.4s cubic-bezier(0.16,1,0.3,1)", filter:`drop-shadow(0 0 8px ${color}80)` }}
          />
          {/* Tick marks */}
          {[0,25,50,75,100].map(v => {
            const a = (v/100)*2*Math.PI - Math.PI/2;
            return <line key={v}
              x1={cx+(r-14)*Math.cos(a)} y1={cy+(r-14)*Math.sin(a)}
              x2={cx-(1)*Math.cos(a)+cx+(r-7)*Math.cos(a)-(cx+(r-14)*Math.cos(a))+cx+(r-14)*Math.cos(a)}
              y2={cy+(r-7)*Math.sin(a)}
              stroke="rgba(255,255,255,0.12)" strokeWidth={1.5}/>;
          })}
        </svg>
        <div style={{
          position:"absolute", inset:0,
          display:"flex", flexDirection:"column",
          alignItems:"center", justifyContent:"center"
        }}>
          <Shield size={16} style={{ color, marginBottom:2, filter:`drop-shadow(0 0 6px ${color})` }}/>
          <span style={{ fontFamily:"var(--font-display)", fontSize:"2.4rem", fontWeight:700, color, lineHeight:1 }}>
            {display}
          </span>
          <span style={{ fontSize:"0.60rem", color:"var(--text-muted)", fontFamily:"var(--font-mono)", letterSpacing:"0.10em", textTransform:"uppercase", marginTop:2 }}>
            / 100
          </span>
        </div>
      </div>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontFamily:"var(--font-display)", fontWeight:700, fontSize:"0.95rem", color }}>
          {scoreLabel(score)}
        </div>
        <div style={{ fontSize:"0.72rem", color:"var(--text-faint)", fontFamily:"var(--font-mono)", marginTop:2 }}>
          acme-corp.io · last scan 18 min ago
        </div>
      </div>
    </div>
  );
}

/* ── Chart tooltip ── */
function ChartTip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:"var(--bg-overlay)", border:"1px solid var(--border)", borderRadius:8, padding:"0.5rem 0.75rem", fontSize:"0.78rem" }}>
      <div style={{ color:"var(--text-muted)", marginBottom:3 }}>{label}</div>
      <div style={{ color:"var(--cyan)", fontWeight:700 }}>Score: {payload[0].value}</div>
    </div>
  );
}

/* ── Signal status icon ── */
function SigIcon({ status }) {
  if (status === "pass") return <CheckCircle size={13} style={{ color:"var(--green)" }}/>;
  if (status === "fail") return <AlertTriangle size={13} style={{ color:"var(--red)" }}/>;
  return <AlertCircle size={13} style={{ color:"var(--amber)" }}/>;
}

const score = 82;

export default function Overview({ apiOnline }) {
  const navigate = useNavigate();

  return (
    <div style={{ paddingBottom:"3rem" }}>

      {/* ── Hero greeting ── */}
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.45 }}
        style={{ marginBottom:"1.75rem" }}>
        <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", flexWrap:"wrap", gap:"1rem" }}>
          <div>
            <div style={{ fontSize:"0.68rem", color:"var(--text-faint)", fontFamily:"var(--font-mono)", textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:4 }}>
              Security Posture · acme-corp.io workspace
            </div>
            <h1 style={{ fontFamily:"var(--font-display)", fontSize:"clamp(1.5rem,3vw,2rem)", fontWeight:700, letterSpacing:"-0.02em", lineHeight:1.2 }}>
              Overview Dashboard
            </h1>
            <p style={{ color:"var(--text-muted)", fontSize:"0.84rem", marginTop:4 }}>
              {apiOnline ? "Live data from SecureMailScope API" : "Showing representative demo data — start the backend for live scans"}
            </p>
          </div>
          <div style={{ display:"flex", gap:"0.6rem" }}>
            <button className="btn btn-secondary btn-sm" onClick={()=>navigate("/forensics")}>
              <Mail size={14}/> Analyze Headers
            </button>
            <button className="btn btn-primary" onClick={()=>navigate("/scanner")}>
              <ScanSearch size={14}/> Scan a Domain
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── Row 1: Gauge + Risk dist + Actions ── */}
      <div style={{ display:"grid", gridTemplateColumns:"auto 1fr auto", gap:"1rem", marginBottom:"1rem", alignItems:"stretch" }}>

        {/* Gauge card */}
        <motion.div className="card animate-fade-up" style={{ padding:"1.75rem", minWidth:220 }}>
          <ScoreGauge score={score}/>
          <div style={{ marginTop:"1rem", padding:"0.65rem 0.85rem", background:"rgba(0,229,255,0.04)", border:"1px solid var(--border-cyan)", borderRadius:"var(--r-sm)" }}>
            <div style={{ fontSize:"0.65rem", color:"var(--text-faint)", fontFamily:"var(--font-mono)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:2 }}>
              vs previous scan
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:"0.84rem", fontWeight:700, color:"var(--green)" }}>
              <TrendingUp size={14}/> +8 pts this week
            </div>
          </div>
        </motion.div>

        {/* Risk distribution */}
        <motion.div className="card animate-fade-up stagger-1" style={{ padding:"1.25rem" }}>
          <div style={{ fontSize:"0.64rem", fontFamily:"var(--font-mono)", textTransform:"uppercase", letterSpacing:"0.10em", color:"var(--text-faint)", marginBottom:"0.85rem" }}>
            Risk Distribution
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:"0.55rem" }}>
            {MOCK_RISK_DIST.map(r => (
              <div key={r.label} style={{ display:"flex", alignItems:"center", gap:"0.75rem" }}>
                <div style={{ width:80, fontSize:"0.72rem", color:"var(--text-muted)", fontFamily:"var(--font-mono)" }}>{r.label}</div>
                <div style={{ flex:1, height:6, background:"var(--bg-overlay)", borderRadius:3, overflow:"hidden" }}>
                  <motion.div
                    initial={{ width:0 }} animate={{ width:`${(r.count/5)*100}%` }}
                    transition={{ duration:0.9, delay:0.3, ease:[0.16,1,0.3,1] }}
                    style={{ height:"100%", background:r.color, borderRadius:3, boxShadow:`0 0 6px ${r.color}60` }}
                  />
                </div>
                <div style={{ width:24, fontSize:"0.80rem", fontWeight:700, color:r.color, textAlign:"right" }}>{r.count}</div>
              </div>
            ))}
          </div>
          <div className="divider"/>
          <div style={{ display:"flex", gap:"0.5rem", flexWrap:"wrap" }}>
            <span className="badge badge-critical"><span className="badge-dot"/>1 Critical</span>
            <span className="badge badge-high"><span className="badge-dot"/>2 High</span>
            <span className="badge badge-medium"><span className="badge-dot"/>1 Medium</span>
            <span className="badge badge-low"><span className="badge-dot"/>1 Low</span>
          </div>
        </motion.div>

        {/* Recommended actions */}
        <motion.div className="card animate-fade-up stagger-2" style={{ padding:"1.25rem", minWidth:220 }}>
          <div style={{ fontSize:"0.64rem", fontFamily:"var(--font-mono)", textTransform:"uppercase", letterSpacing:"0.10em", color:"var(--text-faint)", marginBottom:"0.85rem" }}>
            Priority Actions
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:"0.5rem" }}>
            {[
              { color:"var(--red)",    label:"Enforce DMARC p=reject",   badge:"Critical" },
              { color:"var(--amber)",  label:"Enable STARTTLS on port 25",badge:"High"    },
              { color:"var(--amber)",  label:"Sign DNS zone with DNSSEC", badge:"High"    },
              { color:"var(--purple)", label:"Harden SPF to -all",        badge:"Medium"  },
            ].map((a,i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:"0.6rem", padding:"0.45rem 0.6rem", background:"var(--bg-overlay)", borderRadius:"var(--r-sm)", cursor:"pointer", transition:"background 0.15s" }}
                onMouseEnter={e=>e.currentTarget.style.background="var(--bg-hover)"}
                onMouseLeave={e=>e.currentTarget.style.background="var(--bg-overlay)"}
                onClick={()=>navigate("/scanner")}
              >
                <div style={{ width:6, height:6, borderRadius:"50%", background:a.color, boxShadow:`0 0 6px ${a.color}`, flexShrink:0 }}/>
                <span style={{ flex:1, fontSize:"0.78rem", color:"var(--text-secondary)" }}>{a.label}</span>
                <ArrowRight size={12} style={{ color:"var(--text-faint)" }}/>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Security Signals grid ── */}
      <motion.div animate-fade-up className="animate-fade-up stagger-3" style={{ marginBottom:"1rem" }}>
        <div style={{ marginBottom:"0.75rem", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <div className="section-label">Email Security Signals</div>
            <div className="section-title">Authentication Status</div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={()=>navigate("/scanner")}>
            Rescan <ArrowRight size={13}/>
          </button>
        </div>
        <div className="signal-grid">
          {MOCK_SIGNALS.map((sig, i) => (
            <motion.div key={sig.key}
              className="signal-card animate-fade-up"
              style={{ "--sig-color": sig.color, animationDelay:`${i*60}ms` }}
            >
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"0.5rem" }}>
                <div className="signal-name">{sig.label}</div>
                <SigIcon status={sig.status}/>
              </div>
              <div className="signal-status" style={{ color: sig.status==="pass"?"var(--green)":sig.status==="fail"?"var(--red)":"var(--amber)" }}>
                {sig.status === "pass" ? "Passing" : sig.status === "fail" ? "Failing" : "Warning"}
              </div>
              <div className="signal-time">{sig.checkedAt}</div>
              <div style={{ marginTop:"0.5rem", fontSize:"0.64rem", color:"var(--text-faint)", fontFamily:"var(--font-mono)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }} title={sig.value}>
                {sig.value}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ── Row 3: Chart + Recent Scans ── */}
      <div style={{ display:"grid", gridTemplateColumns:"1.4fr 1fr", gap:"1rem", marginBottom:"1rem" }}>

        {/* Trend chart */}
        <motion.div className="card animate-fade-up stagger-4">
          <div className="card-header">
            <div>
              <div className="card-title">Security Score Trend</div>
              <div className="card-subtitle" style={{ fontSize:"0.70rem" }}>7-day posture history</div>
            </div>
            <span className="badge badge-info">acme-corp.io</span>
          </div>
          <div className="card-body" style={{ padding:"1rem" }}>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={MOCK_SCORE_HISTORY} margin={{ top:4, right:4, left:-24, bottom:0 }}>
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#00E5FF" stopOpacity={0.22}/>
                    <stop offset="95%" stopColor="#00E5FF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="4 4"/>
                <XAxis dataKey="date" tick={{ fill:"#4A5568", fontSize:10 }} axisLine={false} tickLine={false}/>
                <YAxis domain={[0,100]} tick={{ fill:"#4A5568", fontSize:10 }} axisLine={false} tickLine={false}/>
                <Tooltip content={<ChartTip/>}/>
                <Area type="monotone" dataKey="score" stroke="#00E5FF" strokeWidth={2}
                  fill="url(#grad)" dot={{ fill:"#00E5FF", r:3, strokeWidth:0 }}
                  activeDot={{ r:5, fill:"#00E5FF", stroke:"#060B11", strokeWidth:2 }}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Recent scans */}
        <motion.div className="card animate-fade-up stagger-5">
          <div className="card-header">
            <span className="card-title">Recent Scans</span>
            <button className="btn btn-ghost btn-xs" onClick={()=>navigate("/scanner")}>
              New scan
            </button>
          </div>
          <div style={{ overflowX:"auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Domain</th>
                  <th>Score</th>
                  <th>Risk</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_DOMAINS.map(d => (
                  <tr key={d.id} style={{ cursor:"pointer" }} onClick={()=>navigate("/scanner")}>
                    <td>
                      <span style={{ fontFamily:"var(--font-mono)", fontSize:"0.78rem", color:"var(--text-primary)" }}>{d.domain}</span>
                    </td>
                    <td>
                      <span style={{ fontWeight:700, color:scoreColor(d.score), fontFamily:"var(--font-display)" }}>{d.score}</span>
                    </td>
                    <td>
                      <span className={`badge ${riskBadge(d.risk)}`}>{d.risk}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>

      {/* ── Quick actions footer ── */}
      <motion.div className="animate-fade-up stagger-6"
        style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"0.75rem" }}>
        {[
          { icon:<ScanSearch size={20}/>, title:"Run Full Assessment", sub:"Scan SPF, DKIM, DMARC, TLS, SMTP", path:"/scanner",   color:"var(--cyan)"   },
          { icon:<Mail size={20}/>,       title:"Header Forensics",    sub:"Analyze raw email headers",          path:"/forensics", color:"var(--purple)" },
          { icon:<Shield size={20}/>,     title:"Audit Ledger",        sub:"View tamper-evident scan history",   path:"/ledger",    color:"var(--green)"  },
        ].map((a,i) => (
          <div key={i}
            style={{ padding:"1rem 1.25rem", background:"var(--bg-surface)", border:"1px solid var(--border)", borderRadius:"var(--r-lg)", cursor:"pointer", transition:"all 0.18s", display:"flex", alignItems:"center", gap:"0.85rem" }}
            onMouseEnter={e=>{ e.currentTarget.style.borderColor=a.color; e.currentTarget.style.background="var(--bg-elevated)"; }}
            onMouseLeave={e=>{ e.currentTarget.style.borderColor="var(--border)"; e.currentTarget.style.background="var(--bg-surface)"; }}
            onClick={()=>navigate(a.path)}
          >
            <div style={{ color:a.color, opacity:0.8 }}>{a.icon}</div>
            <div>
              <div style={{ fontWeight:700, fontSize:"0.84rem", color:"var(--text-primary)" }}>{a.title}</div>
              <div style={{ fontSize:"0.72rem", color:"var(--text-muted)", marginTop:2 }}>{a.sub}</div>
            </div>
            <ArrowRight size={14} style={{ marginLeft:"auto", color:"var(--text-faint)" }}/>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
