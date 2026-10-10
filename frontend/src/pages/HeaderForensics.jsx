import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { Mail, Upload, CheckCircle, XCircle, AlertCircle, Copy, Download, ChevronRight } from "lucide-react";
import { MOCK_HEADER_RESULT } from "../data/mock.js";

const EXAMPLE_HEADER = `Delivered-To: user@target.org
Received: from inbox.target.org (192.0.2.201) by smtp.target.org
Received: from inbound.target.org (192.0.2.200) by mx.target.org; Sun, 04 Oct 2026 17:30:01 +0000
Received: from mx1.relay-network.net (198.51.100.11) by inbound.target.org; Sun, 04 Oct 2026 17:29:52 +0000
Received: from mail.sender-domain.com (203.0.113.42) by mx1.relay-network.net; Sun, 04 Oct 2026 17:28:40 +0000
Authentication-Results: mx.target.org;
  spf=pass smtp.mailfrom=sender-domain.com;
  dkim=pass header.d=sender-domain.com;
  dmarc=fail header.from=sender-domain.com
DKIM-Signature: v=1; a=rsa-sha256; d=sender-domain.com; s=sv2026;
  bh=abc123def456==; b=SampleSignatureData==
From: "Support Team" <support@sender-domain.com>
To: user@target.org
Subject: Account Security Notice
Date: Sun, 04 Oct 2026 17:28:35 +0000
Message-ID: <a1b2c3@mail.sender-domain.com>`;

function AuthBadge({ status }) {
  if (status === "pass") return <span className="badge badge-pass"><CheckCircle size={10}/>pass</span>;
  if (status === "fail") return <span className="badge badge-fail"><XCircle size={10}/>fail</span>;
  return <span className="badge badge-warn"><AlertCircle size={10}/>warn</span>;
}

function HopRow({ hop, index, total }) {
  return (
    <div style={{ display:"flex", gap:"0.85rem", position:"relative" }}>
      {/* connector */}
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", flexShrink:0 }}>
        <div style={{ width:28, height:28, borderRadius:"50%", background:hop.auth.includes("fail")?"var(--red-dim)":hop.auth.includes("pass")?"var(--green-dim)":"var(--bg-overlay)", border:`1.5px solid ${hop.auth.includes("fail")?"var(--red)":hop.auth.includes("pass")?"var(--green)":"var(--border)"}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.70rem", fontWeight:700, color:hop.auth.includes("fail")?"var(--red)":hop.auth.includes("pass")?"var(--green)":"var(--text-muted)", flexShrink:0, zIndex:1 }}>{index+1}</div>
        {index < total-1 && <div style={{ width:1, flex:1, background:"var(--border)", minHeight:20, margin:"2px 0" }}/>}
      </div>
      <div style={{ flex:1, padding:"0.65rem 0.85rem", background:"var(--bg-elevated)", border:"1px solid var(--border)", borderRadius:"var(--r-sm)", marginBottom:index<total-1?"0.5rem":0 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"0.4rem", flexWrap:"wrap", gap:"0.5rem" }}>
          <span style={{ fontFamily:"var(--font-mono)", fontSize:"0.78rem", color:"var(--cyan)", fontWeight:600 }}>{hop.server}</span>
          <AuthBadge status={hop.auth.includes("fail")?"fail":hop.auth.includes("pass")?"pass":"warn"}/>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"0.5rem" }}>
          {[["IP", hop.ip],["Delay", hop.delay],["Location", hop.location]].map(([k,v])=>(
            <div key={k}>
              <div style={{ fontSize:"0.60rem", color:"var(--text-faint)", fontFamily:"var(--font-mono)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:2 }}>{k}</div>
              <div style={{ fontSize:"0.76rem", color:"var(--text-secondary)", fontFamily:"var(--font-mono)" }}>{v}</div>
            </div>
          ))}
        </div>
        {hop.auth.includes("fail") && (
          <div style={{ marginTop:"0.5rem", fontSize:"0.70rem", color:"var(--red)", background:"var(--red-dim)", padding:"0.3rem 0.55rem", borderRadius:"var(--r-xs)" }}>
            ⚠ Authentication failure at this hop
          </div>
        )}
        {parseFloat(hop.delay)>5 && (
          <div style={{ marginTop:"0.4rem", fontSize:"0.70rem", color:"var(--amber)", background:"var(--amber-dim)", padding:"0.3rem 0.55rem", borderRadius:"var(--r-xs)" }}>
            ⚠ Unusual delay — possible relay issue
          </div>
        )}
      </div>
    </div>
  );
}

export default function HeaderForensics() {
  const [raw,     setRaw]     = useState("");
  const [phase,   setPhase]   = useState("idle");
  const [result,  setResult]  = useState(null);
  const [tab,     setTab]     = useState("summary");
  const [dragging,setDragging]= useState(false);

  const loadExample = () => { setRaw(EXAMPLE_HEADER); };

  const analyze = async () => {
    if (!raw.trim()) { toast.error("Paste email headers first"); return; }
    setPhase("analyzing");
    await new Promise(r => setTimeout(r, 1600));
    setResult(MOCK_HEADER_RESULT);
    setPhase("results");
    toast.success("Header analysis complete");
  };

  const onDrop = e => {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setRaw(ev.target.result);
    reader.readAsText(file);
  };

  const copy = text => { navigator.clipboard.writeText(text); toast.success("Copied!"); };

  return (
    <div style={{ paddingBottom:"3rem" }}>
      <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.35 }} style={{ marginBottom:"1.75rem" }}>
        <div className="section-label">Email Investigation</div>
        <h1 style={{ fontFamily:"var(--font-display)", fontSize:"clamp(1.4rem,3vw,1.85rem)", fontWeight:700, letterSpacing:"-0.02em" }}>Header Forensics</h1>
        <p style={{ color:"var(--text-muted)", fontSize:"0.84rem", marginTop:4 }}>Analyze raw email headers to trace routing, detect spoofing, and verify authentication.</p>
      </motion.div>

      {/* ── INPUT ── */}
      {phase !== "results" && (
        <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.35 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 320px", gap:"1rem" }}>
            {/* Header input */}
            <div className="card" style={{ padding:"1.25rem" }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"0.75rem" }}>
                <span className="card-title">Raw Email Headers</span>
                <div style={{ display:"flex", gap:"0.4rem" }}>
                  <button className="btn btn-ghost btn-xs" onClick={loadExample}>Load example</button>
                  <button className="btn btn-ghost btn-xs" onClick={()=>setRaw("")}>Clear</button>
                </div>
              </div>
              <div
                onDragOver={e=>{e.preventDefault();setDragging(true);}}
                onDragLeave={()=>setDragging(false)}
                onDrop={onDrop}
                style={{ position:"relative" }}
              >
                <textarea
                  className="input textarea"
                  style={{ minHeight:280, fontFamily:"var(--font-mono)", fontSize:"0.74rem" }}
                  placeholder={"Paste your raw email headers here...\n\nOr drag & drop a .eml file"}
                  value={raw}
                  onChange={e=>setRaw(e.target.value)}
                />
                {dragging && (
                  <div style={{ position:"absolute", inset:0, background:"var(--cyan-dim)", border:"2px dashed var(--cyan)", borderRadius:"var(--r-sm)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <div style={{ textAlign:"center", color:"var(--cyan)" }}>
                      <Upload size={28} style={{ margin:"0 auto 8px" }}/>
                      <div style={{ fontWeight:600 }}>Drop .eml file here</div>
                    </div>
                  </div>
                )}
              </div>
              <div style={{ marginTop:"0.85rem", display:"flex", gap:"0.6rem", alignItems:"center" }}>
                <button className="btn btn-primary" onClick={analyze} disabled={phase==="analyzing"}>
                  {phase==="analyzing" ? <><span className="animate-spin">⟳</span> Analyzing…</> : <><Mail size={15}/> Analyze Headers</>}
                </button>
                <span style={{ fontSize:"0.70rem", color:"var(--text-faint)" }}>Headers are processed locally and never stored</span>
              </div>
            </div>

            {/* Side guide */}
            <div style={{ display:"flex", flexDirection:"column", gap:"0.75rem" }}>
              <div className="card" style={{ padding:"1.1rem" }}>
                <div style={{ fontSize:"0.78rem", fontWeight:700, color:"var(--text-primary)", marginBottom:"0.65rem" }}>How to get headers</div>
                {[
                  ["Gmail", "⋮ menu → Show original"],
                  ["Outlook", "File → Properties → Headers"],
                  ["Apple Mail", "View → Message → All Headers"],
                  ["Thunderbird", "View → Message Source"],
                ].map(([c,s])=>(
                  <div key={c} style={{ display:"flex", justifyContent:"space-between", padding:"0.3rem 0", borderBottom:"1px solid var(--border-light)" }}>
                    <span style={{ fontSize:"0.78rem", fontWeight:600, color:"var(--text-secondary)" }}>{c}</span>
                    <span style={{ fontSize:"0.72rem", color:"var(--text-muted)" }}>{s}</span>
                  </div>
                ))}
              </div>
              <div className="card" style={{ padding:"1.1rem", background:"rgba(0,212,170,0.03)", border:"1px solid var(--green-dim)" }}>
                <div style={{ fontSize:"0.78rem", fontWeight:700, color:"var(--green)", marginBottom:"0.5rem" }}>🔒 Privacy</div>
                <p style={{ fontSize:"0.74rem", color:"var(--text-muted)", lineHeight:1.55 }}>Headers are analyzed in your browser session only. No data is sent to external services or stored in any database.</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── RESULTS ── */}
      {phase === "results" && result && (
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.4 }}>
          {/* Summary bar */}
          <div className="card" style={{ padding:"1rem 1.5rem", marginBottom:"1rem", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:"0.75rem" }}>
            <div style={{ display:"flex", alignItems:"center", gap:"1rem" }}>
              <div style={{ width:44, height:44, borderRadius:"50%", background:"var(--bg-overlay)", border:"1px solid var(--border)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <Mail size={20} style={{ color:"var(--cyan)" }}/>
              </div>
              <div>
                <div style={{ fontWeight:700, fontSize:"0.95rem", marginBottom:3 }}>Analysis Complete</div>
                <div style={{ display:"flex", gap:"0.5rem", flexWrap:"wrap" }}>
                  <span style={{ fontSize:"0.72rem", color:"var(--text-muted)" }}>Origin: <span style={{ fontFamily:"var(--font-mono)", color:"var(--cyan)" }}>{result.origin_ip}</span></span>
                  <span style={{ fontSize:"0.72rem", color:"var(--text-muted)" }}>·</span>
                  <span style={{ fontSize:"0.72rem", color:"var(--text-muted)" }}>Confidence: <span style={{ color:"var(--amber)", fontWeight:700 }}>{result.confidence}%</span></span>
                </div>
              </div>
            </div>
            <div style={{ display:"flex", gap:"0.75rem", alignItems:"center" }}>
              <AuthBadge status={result.spf}/>&nbsp;SPF
              <AuthBadge status={result.dkim}/>&nbsp;DKIM
              <AuthBadge status={result.dmarc}/>&nbsp;DMARC
            </div>
            <div style={{ display:"flex", gap:"0.5rem" }}>
              <button className="btn btn-secondary btn-sm" onClick={()=>{ setPhase("idle"); setResult(null); }}>New Analysis</button>
              <button className="btn btn-primary btn-sm" onClick={()=>{ copy(raw); }}><Copy size={13}/> Copy</button>
            </div>
          </div>

          {/* Suspicious alerts */}
          {result.suspicious.length > 0 && (
            <div style={{ marginBottom:"1rem" }}>
              {result.suspicious.map((s,i)=>(
                <div key={i} style={{ padding:"0.6rem 0.85rem", background:"rgba(255,68,85,0.06)", border:"1px solid rgba(255,68,85,0.18)", borderRadius:"var(--r-sm)", fontSize:"0.80rem", color:"var(--red)", display:"flex", alignItems:"center", gap:"0.6rem", marginBottom:"0.4rem" }}>
                  <AlertCircle size={14} style={{ flexShrink:0 }}/> {s}
                </div>
              ))}
            </div>
          )}

          {/* Tabs */}
          <div className="tabs" style={{ marginBottom:"1rem" }}>
            {["summary","route","raw"].map(t=>(
              <button key={t} className={`tab-btn${tab===t?" active":""}`} onClick={()=>setTab(t)}>
                {t==="summary"?"Summary":t==="route"?"Routing Hops":"Raw View"}
              </button>
            ))}
          </div>

          {tab === "route" && (
            <div className="card" style={{ padding:"1.25rem" }}>
              <div style={{ fontSize:"0.64rem", fontFamily:"var(--font-mono)", textTransform:"uppercase", letterSpacing:"0.10em", color:"var(--text-faint)", marginBottom:"1rem" }}>
                {result.hops.length} routing hops traced
              </div>
              {result.hops.map((hop,i)=>(
                <HopRow key={i} hop={hop} index={i} total={result.hops.length}/>
              ))}
            </div>
          )}

          {tab === "summary" && (
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem" }}>
              {[
                { label:"SPF Result",   val:result.spf,   status:result.spf  },
                { label:"DKIM Result",  val:result.dkim,  status:result.dkim },
                { label:"DMARC Result", val:result.dmarc, status:result.dmarc},
                { label:"Origin IP",    val:result.origin_ip, status:"info"  },
                { label:"Hops",         val:result.hops.length+" servers", status:"info" },
                { label:"Confidence",   val:result.confidence+"%", status:result.confidence>70?"pass":"warn" },
              ].map(f=>(
                <div key={f.label} className="card" style={{ padding:"1rem" }}>
                  <div style={{ fontSize:"0.64rem", fontFamily:"var(--font-mono)", textTransform:"uppercase", letterSpacing:"0.08em", color:"var(--text-faint)", marginBottom:"0.4rem" }}>{f.label}</div>
                  <div style={{ display:"flex", alignItems:"center", gap:"0.5rem" }}>
                    <span style={{ fontFamily:"var(--font-display)", fontSize:"1.1rem", fontWeight:700, color:f.status==="pass"?"var(--green)":f.status==="fail"?"var(--red)":f.status==="warn"?"var(--amber)":"var(--cyan)" }}>
                      {typeof f.val === "string" ? f.val.charAt(0).toUpperCase()+f.val.slice(1) : f.val}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "raw" && (
            <div className="card" style={{ padding:"1.25rem" }}>
              <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:"0.75rem" }}>
                <button className="btn btn-ghost btn-xs" onClick={()=>copy(raw)}><Copy size={12}/> Copy raw</button>
              </div>
              <pre style={{ fontFamily:"var(--font-mono)", fontSize:"0.72rem", color:"var(--text-secondary)", whiteSpace:"pre-wrap", wordBreak:"break-word", lineHeight:1.65 }}>{raw}</pre>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
