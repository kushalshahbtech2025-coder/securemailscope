import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { soundManager } from '../data/sound.js';

/* ── colour tokens (match Midnight Crimson theme) ── */
const C = {
  crimson:  '#C8102E',
  gold:     '#D4AF37',
  gold2:    '#F0CC55',
  emerald:  '#00C896',
  rose:     '#FF4468',
  amber:    '#E8A020',
  bg:       'rgba(18,4,12,0.92)',
  bgDeep:   'rgba(10,2,8,0.98)',
  border:   'rgba(212,175,55,0.14)',
  borderHi: 'rgba(212,175,55,0.28)',
};

const SEV_COLORS = {
  CRITICAL: { bg:'rgba(200,16,46,0.14)', border:'rgba(200,16,46,0.30)', text:'#FF4468' },
  HIGH:     { bg:'rgba(232,160,32,0.12)', border:'rgba(232,160,32,0.28)', text:'#E8A020' },
  MEDIUM:   { bg:'rgba(212,175,55,0.11)', border:'rgba(212,175,55,0.26)', text:'#D4AF37' },
  LOW:      { bg:'rgba(0,200,150,0.10)', border:'rgba(0,200,150,0.24)', text:'#00C896' },
};

const STATUS_COLORS = {
  'In Review':    '#D4AF37',
  'Mitigated':    '#00C896',
  'Patched':      '#00C896',
  'Investigating':'#E8A020',
  'Resolved':     '#00C896',
};

const COVERS = [
  { name: 'SOC Command', gradient: 'linear-gradient(135deg, #0A0005 0%, #1A0010 40%, #2A0520 100%)' },
  { name: 'Crimson Grid', gradient: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(200,16,46,0.35), transparent 70%), linear-gradient(#0A0005, #150010)' },
  { name: 'Gold Vault', gradient: 'radial-gradient(ellipse 70% 50% at 80% 50%, rgba(212,175,55,0.22), transparent 65%), linear-gradient(135deg, #0A0005, #120A00)' },
  { name: 'Midnight War', gradient: 'linear-gradient(180deg, rgba(200,16,46,0.25) 0%, #0A0005 60%)' },
];
const ICONS = ['🛡️','🔐','⚡','⛓️','🚨','👾','🎯','📡','📜','🧠','🔥','💎'];

export default function CyberWorkspace() {
  const [docTitle, setDocTitle]       = useState('Incident Response & Zero-Trust Hardening Runbook');
  const [docIcon, setDocIcon]         = useState('🛡️');
  const [coverIdx, setCoverIdx]       = useState(0);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [filterSev, setFilterSev]     = useState('all');
  const [isSealing, setIsSealing]     = useState(false);
  const [sealedTx, setSealedTx]       = useState(null);
  const [newVector, setNewVector]     = useState('');
  const [openSections, setOpenSections] = useState({ triage:true, keys:true, onchain:true });

  const [tasks, setTasks] = useState([
    { id:1, text:'Audit authoritative SPF records and eliminate "+all" soft-fail permits', done:true,  phase:'Phase 1' },
    { id:2, text:'Enforce strict 2048-bit RSA / Ed25519 selector alignment on all outbound MTAs', done:true, phase:'Phase 1' },
    { id:3, text:'Migrate DMARC policy from "p=none" to active quarantine/reject "p=reject; pct=100"', done:false, phase:'Phase 2' },
    { id:4, text:'Mandate TLS 1.3 cipher suite negotiation with strict STARTTLS certificate pinning', done:true, phase:'Phase 2' },
    { id:5, text:'Deploy BIMI logo assertion record validated via Verified Mark Certificate (VMC)', done:false, phase:'Phase 3' },
    { id:6, text:'Anchor daily SHA-256 DNS state snapshot into Ethereum Sepolia Smart Contract', done:false, phase:'Phase 3' },
  ]);

  const [incidents, setIncidents] = useState([
    { id:'INC-2026-08', vector:'DKIM Replay',          sev:'CRITICAL', status:'In Review',     owner:'Kushal S. (SecOps)', hash:'0x8f21…441a', done:false },
    { id:'INC-2026-07', vector:'BGP DNS Spoof',         sev:'CRITICAL', status:'Mitigated',     owner:'AI Node 01',         hash:'0x33b2…90ce', done:true  },
    { id:'INC-2026-06', vector:'Subdomain Takeover',    sev:'HIGH',     status:'Patched',       owner:'DevSec Lead',        hash:'0x17a9…221b', done:true  },
    { id:'INC-2026-05', vector:'Lookalike Homoglyph',   sev:'HIGH',     status:'Investigating', owner:'Threat Desk',        hash:'0x99e0…cc34', done:false },
    { id:'INC-2026-04', vector:'STARTTLS Downgrade',    sev:'MEDIUM',   status:'Resolved',      owner:'Network Eng',        hash:'0x71c8…2bc8', done:true  },
  ]);

  const done = tasks.filter(t=>t.done).length;
  const pct  = Math.round((done/tasks.length)*100);

  const toggleTask = (id) => { soundManager.playClick(); setTasks(p=>p.map(t=>t.id===id?{...t,done:!t.done}:t)); };
  const toggleInc  = (id) => { soundManager.playClick(); setIncidents(p=>p.map(i=>i.id===id?{...i,done:!i.done,status:!i.done?'Resolved':'Investigating'}:i)); };
  const toggleSec  = (s)  => { soundManager.playClick(); setOpenSections(p=>({...p,[s]:!p[s]})); };

  const addIncident = () => {
    if(!newVector.trim()) return;
    soundManager.playClick();
    setIncidents(p=>[{ id:`INC-2026-0${p.length+1}`, vector:newVector.trim(), sev:'HIGH', status:'Investigating', owner:'SecOps Triage', hash:`0x${Math.random().toString(16).slice(2,6)}…${Math.random().toString(16).slice(2,6)}`, done:false },...p]);
    setNewVector('');
    toast.success('New incident logged to runbook');
  };

  const handleSeal = () => {
    soundManager.playScanPulse(); setIsSealing(true);
    setTimeout(()=>{
      soundManager.playSuccess(); setIsSealing(false);
      setSealedTx({
        txHash:`0x${Array.from({length:64},()=>Math.floor(Math.random()*16).toString(16)).join('')}`,
        block:4836,
        merkle:`0x${Array.from({length:40},()=>Math.floor(Math.random()*16).toString(16)).join('')}`,
        ipfs:`Qm${Array.from({length:44},()=>'abcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random()*36)]).join('')}`,
        timestamp:new Date().toLocaleTimeString()
      });
      toast.success('Runbook sealed immutably on Ethereum!');
    },1400);
  };

  const filtered = incidents.filter(i => filterSev==='all' || i.sev===filterSev);

  /* ── shared section header ── */
  const SectionHead = ({label, icon, open, onToggle, badge}) => (
    <button onClick={onToggle} style={{
      width:'100%', display:'flex', alignItems:'center', gap:'0.7rem',
      padding:'0.95rem 1.4rem', background:'none', border:'none', cursor:'pointer',
      borderBottom: open ? `1px solid ${C.border}` : 'none',
    }}>
      <span style={{fontSize:'1.05rem'}}>{icon}</span>
      <span style={{fontFamily:'var(--font-ui)', fontWeight:700, fontSize:'0.92rem', color:'var(--text-primary)', flex:1, textAlign:'left'}}>{label}</span>
      {badge && <span style={{padding:'0.10rem 0.55rem', background:'rgba(212,175,55,0.10)', border:`1px solid ${C.border}`, borderRadius:100, fontSize:'0.62rem', fontFamily:'var(--font-mono)', color:C.gold, fontWeight:700}}>{badge}</span>}
      <span style={{color:'var(--text-muted)', fontSize:'0.78rem', transform: open?'rotate(180deg)':'rotate(0deg)', transition:'transform 0.22s'}}>{open?'▲':'▼'}</span>
    </button>
  );

  return (
    <div className="animate-fade" style={{maxWidth:'1080px', margin:'0 auto', paddingBottom:'4rem'}}>

      {/* ── Page header ── */}
      <motion.div initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} transition={{duration:0.45}}
        style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'1rem',marginBottom:'1.75rem'}}>
        <div>
          <h2 style={{fontFamily:'var(--font-display)',fontSize:'1.55rem',fontWeight:800,letterSpacing:'-0.02em',marginBottom:'0.32rem'}}>
            SOC Interactive Runbook
          </h2>
          <p style={{color:'var(--text-secondary)',fontSize:'0.88rem'}}>
            Notion-style incident management · blockchain-sealed audit trail
          </p>
        </div>
        <div style={{display:'flex',gap:'0.6rem',alignItems:'center'}}>
          <motion.button
            className="btn btn-outline"
            style={{fontSize:'0.80rem'}}
            onClick={()=>{soundManager.playClick();setCoverIdx(i=>(i+1)%COVERS.length);}}
            whileHover={{y:-1}} whileTap={{scale:0.97}}
          >
            🖼️ {COVERS[coverIdx].name}
          </motion.button>
          <motion.button
            className={isSealing?'btn btn-outline':'btn btn-primary'}
            style={{fontSize:'0.80rem', ...(isSealing?{}:{background:`linear-gradient(135deg,${C.crimson},${C.gold})`})}}
            onClick={handleSeal} disabled={isSealing}
            whileHover={{y:-1}} whileTap={{scale:0.97}}
          >
            {isSealing ? '⏳ Sealing…' : '⛓️ Seal to Blockchain'}
          </motion.button>
        </div>
      </motion.div>

      {/* ── Document card ── */}
      <motion.div
        initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{duration:0.50,delay:0.06}}
        style={{background:C.bg, border:`1px solid ${C.border}`, borderRadius:20, overflow:'hidden',
          boxShadow:`0 20px 60px rgba(0,0,0,0.70), 0 0 0 1px rgba(212,175,55,0.05), inset 0 1px 0 rgba(212,175,55,0.06)`}}
      >
        {/* Cover */}
        <div style={{height:180, background:COVERS[coverIdx].gradient, position:'relative', overflow:'hidden'}}>
          <div style={{position:'absolute',inset:0,backgroundImage:'linear-gradient(rgba(212,175,55,0.022) 1px,transparent 1px),linear-gradient(90deg,rgba(212,175,55,0.022) 1px,transparent 1px)',backgroundSize:'40px 40px'}}/>
          <div style={{position:'absolute',bottom:0,left:0,right:0,height:'60px',background:'linear-gradient(transparent,rgba(10,0,5,0.70))'}}/>
          <div style={{position:'absolute',top:16,right:16,display:'flex',gap:'0.4rem'}}>
            {COVERS.map((_,i)=>(
              <button key={i} onClick={()=>setCoverIdx(i)} style={{
                width:8,height:8,borderRadius:'50%',border:'none',cursor:'pointer',transition:'all 0.2s',
                background:i===coverIdx?C.gold:'rgba(255,255,255,0.22)',
                boxShadow:i===coverIdx?`0 0 8px ${C.gold}`:undefined
              }}/>
            ))}
          </div>
        </div>

        {/* Document header */}
        <div style={{padding:'0 2.2rem 1.6rem'}}>
          {/* Icon + breadcrumb row */}
          <div style={{display:'flex',alignItems:'flex-end',justifyContent:'space-between',marginTop:-38,marginBottom:'1.25rem',position:'relative',zIndex:20}}>
            <div style={{position:'relative'}}>
              <motion.button
                onClick={()=>setShowIconPicker(!showIconPicker)}
                whileHover={{scale:1.06}} whileTap={{scale:0.95}}
                style={{width:76,height:76,borderRadius:18,background:C.bgDeep,
                  border:`2px solid ${C.borderHi}`,fontSize:'2.4rem',
                  display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',
                  boxShadow:`0 6px 24px rgba(0,0,0,0.80), 0 0 20px rgba(212,175,55,0.12)`}}
              >{docIcon}</motion.button>
              <AnimatePresence>
                {showIconPicker && (
                  <motion.div initial={{opacity:0,scale:0.9,y:-4}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:0.9}}
                    style={{position:'absolute',top:86,left:0,background:'rgba(16,4,12,0.98)',
                      border:`1px solid ${C.borderHi}`,borderRadius:12,padding:'0.7rem',
                      display:'grid',gridTemplateColumns:'repeat(6,1fr)',gap:6,zIndex:50,
                      boxShadow:'0 12px 40px rgba(0,0,0,0.80)'}}>
                    {ICONS.map(ic=>(
                      <button key={ic} onClick={()=>{setDocIcon(ic);setShowIconPicker(false);soundManager.playClick();}}
                        style={{width:36,height:36,fontSize:'1.35rem',background:ic===docIcon?'rgba(212,175,55,0.15)':'none',
                          border:`1px solid ${ic===docIcon?C.gold:'transparent'}`,borderRadius:8,cursor:'pointer',
                          display:'flex',alignItems:'center',justifyContent:'center',transition:'all 0.15s'}}
                      >{ic}</button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div style={{display:'flex',gap:'0.5rem',alignItems:'center',paddingBottom:8}}>
              <span style={{fontSize:'0.68rem',color:'var(--text-muted)',fontFamily:'var(--font-mono)'}}>SOC · Runbook · Active</span>
              <span style={{width:6,height:6,borderRadius:'50%',background:C.emerald,boxShadow:`0 0 8px ${C.emerald}`,animation:'pulse 1.5s infinite',display:'inline-block'}}/>
            </div>
          </div>

          {/* Editable title */}
          <input
            value={docTitle} onChange={e=>setDocTitle(e.target.value)}
            style={{
              width:'100%',background:'none',border:'none',outline:'none',
              fontFamily:'var(--font-display)',fontSize:'clamp(1.4rem,3vw,1.9rem)',fontWeight:900,
              color:'var(--text-primary)',letterSpacing:'-0.025em',lineHeight:1.2,
              borderBottom:`1px solid transparent`,padding:'0.1rem 0',marginBottom:'0.5rem',
              transition:'border-color 0.2s',cursor:'text'
            }}
            onFocus={e=>e.target.style.borderColor=C.border}
            onBlur={e=>e.target.style.borderColor='transparent'}
          />

          {/* Progress bar */}
          <div style={{display:'flex',alignItems:'center',gap:'0.85rem',marginBottom:'1.6rem',marginTop:'0.6rem'}}>
            <div style={{flex:1,height:4,background:'rgba(255,255,255,0.06)',borderRadius:4,overflow:'hidden'}}>
              <motion.div initial={{width:0}} animate={{width:`${pct}%`}} transition={{duration:1.2,ease:[0.16,1,0.3,1]}}
                style={{height:'100%',borderRadius:4,background:`linear-gradient(90deg,${C.crimson},${C.gold})`,boxShadow:`0 0 10px ${C.gold}50`}}/>
            </div>
            <span style={{fontFamily:'var(--font-mono)',fontSize:'0.72rem',color:C.gold,fontWeight:700,whiteSpace:'nowrap'}}>
              {done}/{tasks.length} · {pct}%
            </span>
          </div>

          {/* ═══ SECTION 1: TRIAGE CHECKLIST ═══ */}
          <div style={{background:'rgba(0,0,0,0.25)',border:`1px solid ${C.border}`,borderRadius:12,marginBottom:'1rem',overflow:'hidden'}}>
            <SectionHead label="Security Hardening Checklist" icon="✅" open={openSections.triage} onToggle={()=>toggleSec('triage')} badge={`${done}/${tasks.length} Done`}/>
            <AnimatePresence>
              {openSections.triage && (
                <motion.div initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}} transition={{duration:0.28}}>
                  <div style={{padding:'0.8rem 1.2rem',display:'flex',flexDirection:'column',gap:'0.5rem'}}>
                    {['Phase 1','Phase 2','Phase 3'].map(phase=>(
                      <div key={phase}>
                        <div style={{fontSize:'0.60rem',fontFamily:'var(--font-mono)',fontWeight:800,textTransform:'uppercase',letterSpacing:'0.12em',color:'var(--text-faint)',padding:'0.5rem 0 0.3rem'}}>{phase}</div>
                        {tasks.filter(t=>t.phase===phase).map((task,i)=>(
                          <motion.div key={task.id} initial={{opacity:0,x:-8}} animate={{opacity:1,x:0}} transition={{delay:i*0.05}}
                            onClick={()=>toggleTask(task.id)}
                            style={{display:'flex',alignItems:'center',gap:'0.8rem',padding:'0.62rem 0.85rem',
                              borderRadius:8,cursor:'pointer',transition:'all 0.18s',marginBottom:3,
                              background:task.done?'rgba(0,200,150,0.05)':'transparent',
                              border:`1px solid ${task.done?'rgba(0,200,150,0.12)':'transparent'}`}}
                            whileHover={{background:'rgba(212,175,55,0.04)',x:2}}
                          >
                            <div style={{width:20,height:20,borderRadius:6,flexShrink:0,border:`1.5px solid ${task.done?C.emerald:C.border}`,
                              background:task.done?C.emerald:'none',display:'flex',alignItems:'center',justifyContent:'center',
                              transition:'all 0.2s',boxShadow:task.done?`0 0 8px ${C.emerald}50`:undefined}}>
                              {task.done && <span style={{fontSize:'0.62rem',color:'#0A0005',fontWeight:900}}>✓</span>}
                            </div>
                            <span style={{fontSize:'0.855rem',fontWeight:500,flex:1,lineHeight:1.55,
                              color:task.done?'var(--text-muted)':'var(--text-secondary)',
                              textDecoration:task.done?'line-through':'none'}}>
                              {task.text}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ═══ SECTION 2: KEY ROTATION SCHEDULE ═══ */}
          <div style={{background:'rgba(0,0,0,0.25)',border:`1px solid ${C.border}`,borderRadius:12,marginBottom:'1rem',overflow:'hidden'}}>
            <SectionHead label="Cryptographic Key Rotation Schedule" icon="🔑" open={openSections.keys} onToggle={()=>toggleSec('keys')} badge="Auto-enforced"/>
            <AnimatePresence>
              {openSections.keys && (
                <motion.div initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}} transition={{duration:0.28}}>
                  <div style={{padding:'0.8rem 1.2rem'}}>
                    {[
                      {key:'DKIM Signing Key (RSA-2048)',  cycle:'90-day rotation',  last:'Aug 12, 2026',  next:'Nov 10, 2026', status:'OK'},
                      {key:'MTA TLS Server Certificate',   cycle:'Annual renewal',   last:'Jan 01, 2026',  next:'Jan 01, 2027', status:'OK'},
                      {key:'IPFS Node Identity Key',       cycle:'180-day rotation', last:'Jul 22, 2026',  next:'Jan 18, 2027', status:'OK'},
                      {key:'Ethereum Contract Signer',     cycle:'On compromise',    last:'Jun 05, 2026',  next:'On alert',     status:'WATCH'},
                    ].map((row,i)=>(
                      <div key={i} style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr 80px',gap:'0.5rem',alignItems:'center',
                        padding:'0.72rem 0.7rem',borderBottom:i<3?`1px solid rgba(212,175,55,0.055)`:'none',
                        borderRadius:6,transition:'background 0.18s'}}
                        onMouseEnter={e=>e.currentTarget.style.background='rgba(212,175,55,0.025)'}
                        onMouseLeave={e=>e.currentTarget.style.background='none'}
                      >
                        <span style={{fontWeight:600,fontSize:'0.848rem'}}>{row.key}</span>
                        <span style={{fontFamily:'var(--font-mono)',fontSize:'0.72rem',color:'var(--text-muted)'}}>{row.cycle}</span>
                        <span style={{fontFamily:'var(--font-mono)',fontSize:'0.72rem',color:'var(--text-muted)'}}>{row.last}</span>
                        <span style={{fontFamily:'var(--font-mono)',fontSize:'0.72rem',color:row.status==='WATCH'?C.amber:C.gold}}>{row.next}</span>
                        <span style={{padding:'0.12rem 0.5rem',borderRadius:6,fontSize:'0.60rem',fontWeight:800,fontFamily:'var(--font-mono)',
                          textAlign:'center',background:row.status==='OK'?'rgba(0,200,150,0.10)':'rgba(232,160,32,0.12)',
                          border:`1px solid ${row.status==='OK'?'rgba(0,200,150,0.22)':'rgba(232,160,32,0.24)'}`,
                          color:row.status==='OK'?C.emerald:C.amber}}>{row.status}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ═══ SECTION 3: ON-CHAIN INCIDENT TABLE ═══ */}
          <div style={{background:'rgba(0,0,0,0.25)',border:`1px solid ${C.border}`,borderRadius:12,marginBottom:'1rem',overflow:'hidden'}}>
            <SectionHead label="On-Chain Incident Registry" icon="⛓️" open={openSections.onchain} onToggle={()=>toggleSec('onchain')} badge={`${incidents.length} Records`}/>
            <AnimatePresence>
              {openSections.onchain && (
                <motion.div initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}} transition={{duration:0.28}}>
                  <div style={{padding:'0.8rem 1.2rem'}}>
                    {/* Filter + Add */}
                    <div style={{display:'flex',gap:'0.5rem',marginBottom:'0.85rem',flexWrap:'wrap'}}>
                      {['all','CRITICAL','HIGH','MEDIUM'].map(s=>(
                        <button key={s} onClick={()=>{setFilterSev(s);soundManager.playClick();}}
                          style={{padding:'0.24rem 0.70rem',borderRadius:100,fontSize:'0.66rem',fontFamily:'var(--font-mono)',fontWeight:700,cursor:'pointer',transition:'all 0.18s',
                            background:filterSev===s?`rgba(212,175,55,0.14)`:'rgba(255,255,255,0.03)',
                            border:`1px solid ${filterSev===s?C.gold:'rgba(255,255,255,0.08)'}`,
                            color:filterSev===s?C.gold:'var(--text-muted)'}}
                        >{s==='all'?'ALL':s}</button>
                      ))}
                      <div style={{flex:1,display:'flex',gap:'0.4rem',marginLeft:'auto',maxWidth:320}}>
                        <input value={newVector} onChange={e=>setNewVector(e.target.value)}
                          onKeyDown={e=>e.key==='Enter'&&addIncident()}
                          placeholder="Add threat vector…"
                          style={{flex:1,background:'rgba(0,0,0,0.35)',border:`1px solid ${C.border}`,borderRadius:8,
                            padding:'0.30rem 0.75rem',fontSize:'0.78rem',color:'var(--text-primary)',outline:'none',
                            fontFamily:'var(--font-mono)',transition:'border-color 0.2s'}}
                          onFocus={e=>e.target.style.borderColor=C.gold}
                          onBlur={e=>e.target.style.borderColor=C.border}
                        />
                        <button onClick={addIncident} className="btn btn-primary"
                          style={{fontSize:'0.76rem',padding:'0.28rem 0.85rem',background:`linear-gradient(135deg,${C.crimson},${C.gold})`}}>
                          + Log
                        </button>
                      </div>
                    </div>

                    {/* Table */}
                    <div style={{overflowX:'auto'}}>
                      <table style={{width:'100%',borderCollapse:'collapse',fontSize:'0.825rem'}}>
                        <thead>
                          <tr>
                            {['#','Vector','Severity','Status','Owner','Tx Hash','Done'].map(h=>(
                              <th key={h} style={{textAlign:'left',padding:'0.55rem 0.75rem',
                                borderBottom:`1px solid ${C.border}`,fontSize:'0.60rem',
                                textTransform:'uppercase',letterSpacing:'0.10em',
                                color:'var(--text-muted)',fontFamily:'var(--font-mono)',fontWeight:800}}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          <AnimatePresence>
                            {filtered.map((inc,i)=>{
                              const sc = SEV_COLORS[inc.sev]||SEV_COLORS.LOW;
                              const stColor = STATUS_COLORS[inc.status]||C.gold;
                              return (
                                <motion.tr key={inc.id} initial={{opacity:0,y:-6}} animate={{opacity:1,y:0}} exit={{opacity:0,x:20}}
                                  transition={{delay:i*0.04}}
                                  style={{borderBottom:`1px solid rgba(212,175,55,0.04)`,opacity:inc.done?0.55:1,
                                    transition:'background 0.18s,opacity 0.3s'}}
                                  onMouseEnter={e=>e.currentTarget.style.background='rgba(212,175,55,0.032)'}
                                  onMouseLeave={e=>e.currentTarget.style.background='none'}
                                >
                                  <td style={{padding:'0.70rem 0.75rem',fontFamily:'var(--font-mono)',fontSize:'0.72rem',color:C.gold}}>{inc.id}</td>
                                  <td style={{padding:'0.70rem 0.75rem',fontWeight:600,color:inc.done?'var(--text-muted)':'var(--text-primary)',textDecoration:inc.done?'line-through':'none'}}>{inc.vector}</td>
                                  <td style={{padding:'0.70rem 0.75rem'}}>
                                    <span style={{padding:'0.12rem 0.52rem',borderRadius:6,fontSize:'0.62rem',fontWeight:800,fontFamily:'var(--font-mono)',background:sc.bg,border:`1px solid ${sc.border}`,color:sc.text}}>{inc.sev}</span>
                                  </td>
                                  <td style={{padding:'0.70rem 0.75rem'}}>
                                    <span style={{fontSize:'0.78rem',fontWeight:600,color:stColor,display:'flex',alignItems:'center',gap:'0.35rem'}}>
                                      <span style={{width:5,height:5,borderRadius:'50%',background:stColor,display:'inline-block',flexShrink:0}}/>
                                      {inc.status}
                                    </span>
                                  </td>
                                  <td style={{padding:'0.70rem 0.75rem',fontSize:'0.78rem',color:'var(--text-secondary)'}}>{inc.owner}</td>
                                  <td style={{padding:'0.70rem 0.75rem',fontFamily:'var(--font-mono)',fontSize:'0.72rem',color:C.gold}}>{inc.hash}</td>
                                  <td style={{padding:'0.70rem 0.75rem'}}>
                                    <button onClick={()=>toggleInc(inc.id)} style={{
                                      width:22,height:22,borderRadius:6,border:`1.5px solid ${inc.done?C.emerald:C.border}`,
                                      background:inc.done?C.emerald:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',transition:'all 0.2s'}}>
                                      {inc.done&&<span style={{fontSize:'0.60rem',color:'#0A0005',fontWeight:900}}>✓</span>}
                                    </button>
                                  </td>
                                </motion.tr>
                              );
                            })}
                          </AnimatePresence>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Sealed Tx Receipt ── */}
          <AnimatePresence>
            {sealedTx && (
              <motion.div initial={{opacity:0,y:12,scale:0.98}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,scale:0.96}}
                style={{marginTop:'1rem',padding:'1.2rem 1.4rem',
                  background:`linear-gradient(135deg,rgba(200,16,46,0.10),rgba(212,175,55,0.10))`,
                  border:`1px solid ${C.gold}`,borderRadius:12,
                  boxShadow:`0 0 30px rgba(212,175,55,0.14)`}}
              >
                <div style={{display:'flex',alignItems:'center',gap:'0.6rem',marginBottom:'0.85rem'}}>
                  <span style={{fontSize:'1.1rem'}}>⛓️</span>
                  <span style={{fontFamily:'var(--font-ui)',fontWeight:800,color:C.gold}}>Ethereum Seal Confirmed</span>
                  <span style={{fontSize:'0.68rem',fontFamily:'var(--font-mono)',color:C.emerald,marginLeft:'auto'}}>✓ IMMUTABLE</span>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'0.5rem 1.5rem',fontFamily:'var(--font-mono)',fontSize:'0.72rem'}}>
                  {[
                    {k:'TX Hash', v:sealedTx.txHash.slice(0,24)+'…'},
                    {k:'Block #', v:sealedTx.block},
                    {k:'Merkle Root', v:sealedTx.merkle.slice(0,20)+'…'},
                    {k:'IPFS CID', v:sealedTx.ipfs.slice(0,20)+'…'},
                    {k:'Timestamp', v:sealedTx.timestamp},
                    {k:'Network', v:'Ethereum Sepolia'},
                  ].map(({k,v})=>(
                    <div key={k} style={{display:'flex',gap:'0.5rem'}}>
                      <span style={{color:'var(--text-muted)',minWidth:90}}>{k}:</span>
                      <span style={{color:C.gold,fontWeight:600}}>{v}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>{/* /doc body */}
      </motion.div>{/* /doc card */}
    </div>
  );
}
