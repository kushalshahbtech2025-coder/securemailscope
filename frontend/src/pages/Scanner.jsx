import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { ScanSearch, CheckCircle, XCircle, AlertCircle, Loader, ChevronDown, ChevronUp, RotateCcw, Download, X } from "lucide-react";
import { SCAN_STEPS, MOCK_FINDINGS, scoreColor, scoreLabel } from "../data/mock.js";

const EXAMPLE_DOMAINS = ["acme-corp.io","fintech-hub.com","healthnet.org","devcloud.app"];
const SCAN_MODES = [
  { id:"full",  label:"Full Assessment",        desc:"All checks: DNS, auth, TLS, SMTP, AI" },
  { id:"dns",   label:"DNS Only",               desc:"SPF, DKIM, DMARC, DNSSEC" },
  { id:"mail",  label:"Mail Authentication",    desc:"SPF, DKIM, DMARC alignment" },
  { id:"tls",   label:"TLS + SMTP",             desc:"Certificate, cipher, STARTTLS" },
];

function StepIcon({ state }) {
  if (state === "done")    return <CheckCircle  size={13} style={{ color:"var(--green)" }}/>;
  if (state === "failed")  return <XCircle      size={13} style={{ color:"var(--red)" }}/>;
  if (state === "active")  return <Loader       size={13} style={{ color:"var(--cyan)" }} className="animate-spin"/>;
  return <div style={{ width:13, height:13, borderRadius:"50%", border:"1.5px solid var(--text-faint)" }}/>;
}

function FindingCard({ f }) {
  const [open, setOpen] = useState(false);
  const sevClass = "badge-" + f.severity;
  return (
    <div className="finding-card">
      <div className="finding-header" onClick={() => setOpen(o => !o)}>
        <span className={`badge ${sevClass}`}>{f.severity}</span>
        <span className="finding-title">{f.title}</span>
        {open ? <ChevronUp size={14} style={{ color:"var(--text-muted)" }}/> : <ChevronDown size={14} style={{ color:"var(--text-muted)" }}/>}
      </div>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height:0, opacity:0 }} animate={{ height:"auto", opacity:1 }} exit={{ height:0, opacity:0 }} transition={{ duration:0.22 }}>
            <div className="finding-body">
              <div className="finding-field" style={{ marginBottom:"0.75rem" }}>
                <div className="finding-field-label">Evidence</div>
                <div className="finding-code">{f.evidence}</div>
              </div>
              <div className="finding-field" style={{ marginBottom:"0.75rem" }}>
                <div className="finding-field-label">Why it matters</div>
                <div className="finding-field-value">{f.why}</div>
              </div>
              <div className="finding-field">
                <div className="finding-field-label">Recommended fix</div>
                <div className="finding-field-value" style={{ color:"var(--green)" }}>{f.fix}</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Scanner({ apiOnline }) {
  const [domain,   setDomain]   = useState("");
  const [mode,     setMode]     = useState("full");
  const [phase,    setPhase]    = useState("idle"); // idle | scanning | results
  const [steps,    setSteps]    = useState([]);
  const [pct,      setPct]      = useState(0);
  const [logs,     setLogs]     = useState([]);
  const [logsOpen, setLogsOpen] = useState(false);
  const [score,    setScore]    = useState(0);
  const [findings, setFindings] = useState([]);
  const [err,      setErr]      = useState("");
  const stepRef = useRef(null);

  const validate = d => /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](\.[a-zA-Z]{2,})+$/.test(d.trim());

  const startScan = async () => {
    const d = domain.trim();
    if (!d) { setErr("Please enter a domain name."); return; }
    if (!validate(d)) { setErr("Enter a valid domain like company.example.com"); return; }
    setErr(""); setPhase("scanning"); setLogs([]);
    const initial = SCAN_STEPS.map((s,i) => ({ ...s, state: i===0?"active":"pending" }));
    setSteps(initial);

    let completed = 0;
    for (let i = 0; i < SCAN_STEPS.length; i++) {
      const delay = 600 + Math.random()*600;
      await new Promise(r => setTimeout(r, delay));
      completed++;
      setPct(Math.round((completed/SCAN_STEPS.length)*100));
      setLogs(p => [...p, `[${new Date().toLocaleTimeString()}] ${SCAN_STEPS[i].label} — completed`]);
      setSteps(p => p.map((s,idx) => ({
        ...s,
        state: idx < completed ? "done" : idx === completed ? "active" : "pending"
      })));
    }
    setSteps(p => p.map(s => ({ ...s, state:"done" })));

    const mockScore = 55 + Math.floor(Math.random()*35);
    setScore(mockScore);
    setFindings(MOCK_FINDINGS);
    setTimeout(() => { setPhase("results"); toast.success(`Scan complete — ${d}`); }, 500);
  };

  const reset = () => { setPhase("idle"); setDomain(""); setSteps([]); setPct(0); setLogs([]); setFindings([]); setScore(0); };

  const sevOrder = ["critical","high","medium","low"];
  const sorted = [...findings].sort((a,b) => sevOrder.indexOf(a.severity) - sevOrder.indexOf(b.severity));

  return (
    <div style={{ paddingBottom:"3rem" }}>
      <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.35 }} style={{ marginBottom:"1.75rem" }}>
        <div className="section-label">Security Assessment</div>
        <h1 style={{ fontFamily:"var(--font-display)", fontSize:"clamp(1.4rem,3vw,1.85rem)", fontWeight:700, letterSpacing:"-0.02em" }}>
          Domain Scanner
        </h1>
        <p style={{ color:"var(--text-muted)", fontSize:"0.84rem", marginTop:4 }}>
          Scan any domain for SPF, DKIM, DMARC, TLS, SMTP, and DNSSEC posture.
        </p>
      </motion.div>

      {/* ── IDLE ── */}
      {phase === "idle" && (
        <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.4 }}>
          <div className="card" style={{ padding:"2rem", maxWidth:680, margin:"0 auto" }}>
            <div style={{ textAlign:"center", marginBottom:"1.75rem" }}>
              <div style={{ width:64, height:64, background:"var(--cyan-dim)", border:"1px solid var(--border-cyan)", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 1rem" }}>
                <ScanSearch size={26} style={{ color:"var(--cyan)" }}/>
              </div>
              <h2 style={{ fontFamily:"var(--font-display)", fontWeight:700, fontSize:"1.2rem", marginBottom:6 }}>
                Start a Security Assessment
              </h2>
              <p style={{ color:"var(--text-muted)", fontSize:"0.84rem" }}>
                Checks public DNS records and SMTP configuration only. No login or credentials required.
              </p>
            </div>

            {/* Domain input */}
            <div className="input-group" style={{ marginBottom:"1rem" }}>
              <label className="input-label">Domain Name</label>
              <input className={`input${err?" input-error":""}`}
                placeholder="company.example.com"
                value={domain}
                onChange={e=>{ setDomain(e.target.value); setErr(""); }}
                onKeyDown={e=>e.key==="Enter"&&startScan()}
              />
              {err && <span style={{ fontSize:"0.74rem", color:"var(--red)", marginTop:4 }}>{err}</span>}
            </div>

            {/* Scan mode */}
            <div style={{ marginBottom:"1.25rem" }}>
              <label className="input-label">Scan Mode</label>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:"0.5rem", marginTop:"0.5rem" }}>
                {SCAN_MODES.map(m => (
                  <div key={m.id}
                    onClick={()=>setMode(m.id)}
                    style={{ padding:"0.65rem 0.85rem", borderRadius:"var(--r-sm)", border:`1px solid ${mode===m.id?"var(--border-cyan)":"var(--border)"}`, background:mode===m.id?"var(--bg-active)":"var(--bg-elevated)", cursor:"pointer", transition:"all 0.15s" }}
                  >
                    <div style={{ fontSize:"0.82rem", fontWeight:600, color:mode===m.id?"var(--cyan)":"var(--text-secondary)", marginBottom:2 }}>{m.label}</div>
                    <div style={{ fontSize:"0.68rem", color:"var(--text-faint)" }}>{m.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent */}
            <div style={{ marginBottom:"1.25rem" }}>
              <label className="input-label">Recent Domains</label>
              <div style={{ display:"flex", gap:"0.4rem", flexWrap:"wrap", marginTop:"0.5rem" }}>
                {EXAMPLE_DOMAINS.map(d => (
                  <button key={d} className="btn btn-secondary btn-xs"
                    onClick={()=>{ setDomain(d); setErr(""); }}>
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <button className="btn btn-primary w-full" style={{ justifyContent:"center" }} onClick={startScan}>
              <ScanSearch size={16}/> Begin Assessment
            </button>

            <p style={{ fontSize:"0.70rem", color:"var(--text-faint)", textAlign:"center", marginTop:"0.85rem" }}>
              Only public-facing DNS and SMTP signals are inspected. No private data is accessed.
            </p>
          </div>
        </motion.div>
      )}

      {/* ── SCANNING ── */}
      {phase === "scanning" && (
        <motion.div initial={{ opacity:0, scale:0.97 }} animate={{ opacity:1, scale:1 }} transition={{ duration:0.35 }}
          style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1.25rem" }}>
          {/* Left: animation */}
          <div className="card" style={{ padding:"1.75rem", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:"1.25rem" }}>
            <div style={{ position:"relative", width:120, height:120 }}>
              {[0,1,2].map(i => (
                <div key={i} style={{ position:"absolute", inset:`${i*-16}px`, borderRadius:"50%", border:"1.5px solid var(--cyan)", animation:`scanPing ${1.8+i*0.6}s ease-out infinite`, animationDelay:`${i*0.5}s`, opacity:0 }}/>
              ))}
              <div style={{ width:120, height:120, borderRadius:"50%", background:"var(--cyan-dim)", border:"1px solid var(--border-cyan)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <ScanSearch size={40} style={{ color:"var(--cyan)" }}/>
              </div>
            </div>
            <div style={{ textAlign:"center" }}>
              <div style={{ fontFamily:"var(--font-display)", fontSize:"1.1rem", fontWeight:700, marginBottom:6 }}>
                Scanning {domain}
              </div>
              <div style={{ fontSize:"0.78rem", color:"var(--text-muted)" }}>
                {steps.find(s=>s.state==="active")?.detail || "Initializing..."}
              </div>
            </div>
            <div style={{ width:"100%" }}>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:"0.70rem", color:"var(--text-muted)", marginBottom:6 }}>
                <span>Progress</span><span style={{ color:"var(--cyan)", fontFamily:"var(--font-mono)", fontWeight:700 }}>{pct}%</span>
              </div>
              <div className="progress-bar"><div className="progress-fill" style={{ width:`${pct}%` }}/></div>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={reset}>
              <X size={14}/> Cancel
            </button>
          </div>

          {/* Right: timeline */}
          <div className="card" style={{ padding:"1.25rem" }}>
            <div style={{ fontSize:"0.64rem", fontFamily:"var(--font-mono)", textTransform:"uppercase", letterSpacing:"0.10em", color:"var(--text-faint)", marginBottom:"0.85rem" }}>
              Scan Timeline
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:"0.4rem" }}>
              {steps.map(s => (
                <div key={s.id} className={`scan-step ${s.state}`}>
                  <div className={`step-icon ${s.state}`}>
                    {s.state==="done" ? "✓" : s.state==="failed" ? "✗" : s.state==="active" ? "⟳" : ""}
                  </div>
                  <div>
                    <div className="step-label">{s.label}</div>
                    {s.state==="active" && <div className="step-detail">{s.detail}</div>}
                  </div>
                  <div style={{ marginLeft:"auto" }}>
                    <StepIcon state={s.state}/>
                  </div>
                </div>
              ))}
            </div>
            {/* Live log */}
            <div style={{ marginTop:"0.75rem" }}>
              <button className="btn btn-ghost btn-xs" style={{ fontSize:"0.68rem" }} onClick={()=>setLogsOpen(o=>!o)}>
                {logsOpen?"Hide":"Show"} technical log ({logs.length})
              </button>
              {logsOpen && (
                <div style={{ marginTop:"0.5rem", background:"var(--bg-overlay)", borderRadius:"var(--r-sm)", padding:"0.65rem", fontFamily:"var(--font-mono)", fontSize:"0.66rem", color:"var(--green)", maxHeight:120, overflowY:"auto" }}>
                  {logs.map((l,i)=><div key={i}>{l}</div>)}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* ── RESULTS ── */}
      {phase === "results" && (
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.4 }}>
          {/* Score bar */}
          <div className="card" style={{ padding:"1.25rem 1.5rem", marginBottom:"1rem", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:"1rem" }}>
            <div style={{ display:"flex", alignItems:"center", gap:"1.25rem" }}>
              <div style={{ textAlign:"center" }}>
                <div style={{ fontFamily:"var(--font-display)", fontSize:"2.8rem", fontWeight:700, color:scoreColor(score), lineHeight:1 }}>{score}</div>
                <div style={{ fontSize:"0.62rem", color:"var(--text-faint)", fontFamily:"var(--font-mono)" }}>/100</div>
              </div>
              <div>
                <div style={{ fontFamily:"var(--font-display)", fontWeight:700, fontSize:"1.0rem", color:scoreColor(score) }}>{scoreLabel(score)}</div>
                <div style={{ fontSize:"0.80rem", color:"var(--text-muted)", marginTop:2 }}>{domain} · just now</div>
                <div style={{ marginTop:6, display:"flex", gap:"0.4rem", flexWrap:"wrap" }}>
                  {["1 Critical","2 High","1 Medium","1 Low"].map((b,i)=>(
                    <span key={i} className={`badge ${["badge-critical","badge-high","badge-medium","badge-low"][i]}`}>{b}</span>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ display:"flex", gap:"0.6rem" }}>
              <button className="btn btn-secondary btn-sm" onClick={reset}><RotateCcw size={14}/> Scan Again</button>
              <button className="btn btn-primary btn-sm" onClick={()=>toast.success("Report export started")}><Download size={14}/> Export</button>
            </div>
          </div>

          {/* Findings */}
          <div>
            <div style={{ marginBottom:"0.75rem" }}>
              <div className="section-label">Assessment Findings</div>
              <div className="section-title">{sorted.length} Issues Detected</div>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:"0.5rem" }}>
              {sorted.map((f,i) => (
                <motion.div key={f.id} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.06 }}>
                  <FindingCard f={f}/>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
