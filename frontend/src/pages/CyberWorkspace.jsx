import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { soundManager } from '../data/sound.js';

export default function CyberWorkspace() {
  const [docTitle, setDocTitle] = useState('Incident Response & Zero-Trust Hardening Runbook');
  const [docIcon, setDocIcon] = useState('🛡️');
  const [coverIndex, setCoverIndex] = useState(0);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [slashMenuOpen, setSlashMenuOpen] = useState(false);
  const [slashQuery, setSlashQuery] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [isSealing, setIsSealing] = useState(false);
  const [sealedTx, setSealedTx] = useState(null);

  const COVERS = [
    { name: 'SOC Battlestation', url: '/soc_lab_command.jpg' },
    { name: 'Cryptographic Lock', url: '/cyber_hologram_lock.jpg' },
    { name: 'Quantum Void', gradient: 'linear-gradient(135deg, #030712 0%, #06152B 50%, #00223E 100%)' },
    { name: 'Cyber Laser Grid', gradient: 'radial-gradient(circle at 50% 50%, rgba(0, 245, 255, 0.15), transparent 70%), linear-gradient(#030712, #070F1E)' }
  ];

  const ICONS = ['🛡️', '🔐', '⚡', '⛓️', '🚨', '👾', '🎯', '📡', '📜', '🧠'];

  // Interactive Checklist
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Audit authoritative SPF records and eliminate "+all" soft-fail permits', done: true, phase: 'Phase 1' },
    { id: 2, text: 'Enforce strict 2048-bit RSA / Ed25519 selector alignment on all outbound MTAs', done: true, phase: 'Phase 1' },
    { id: 3, text: 'Migrate DMARC policy from "p=none" to active quarantine/reject "p=reject; pct=100"', done: false, phase: 'Phase 2' },
    { id: 4, text: 'Mandate TLS 1.3 cipher suite negotiation with strict STARTTLS certificate pinning', done: true, phase: 'Phase 2' },
    { id: 5, text: 'Deploy BIMI logo assertion record validated via Verified Mark Certificate (VMC)', done: false, phase: 'Phase 3' },
    { id: 6, text: 'Anchor daily SHA-256 DNS state snapshot into Ethereum Sepolia Smart Contract', done: false, phase: 'Phase 3' },
  ]);

  // Collapsible Toggles
  const [openToggles, setOpenToggles] = useState({
    triage: true,
    keys: true,
    onchain: true
  });

  const toggleSection = (sec) => {
    soundManager.playClick();
    setOpenToggles(p => ({ ...p, [sec]: !p[sec] }));
  };

  // Notion-style Incident Table
  const [incidents, setIncidents] = useState([
    { id: 'INC-2026-08', vector: 'DKIM Replay', sev: 'CRITICAL', status: 'In Review', owner: 'Kushal S. (SecOps)', hash: '0x8f21…441a', done: false },
    { id: 'INC-2026-07', vector: 'BGP DNS Spoof', sev: 'CRITICAL', status: 'Mitigated', owner: 'AI Node 01', hash: '0x33b2…90ce', done: true },
    { id: 'INC-2026-06', vector: 'Subdomain Takeover', sev: 'HIGH', status: 'Patched', owner: 'DevSec Lead', hash: '0x17a9…221b', done: true },
    { id: 'INC-2026-05', vector: 'Lookalike Homoglyph', sev: 'HIGH', status: 'Investigating', owner: 'Threat Desk', hash: '0x99e0…cc34', done: false },
    { id: 'INC-2026-04', vector: 'STARTTLS Downgrade', sev: 'MEDIUM', status: 'Resolved', owner: 'Network Eng', hash: '0x71c8…2bc8', done: true },
  ]);

  const [newIncidentVector, setNewIncidentVector] = useState('');

  const handleToggleTask = (id) => {
    soundManager.playClick();
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const handleToggleIncident = (id) => {
    soundManager.playClick();
    setIncidents(prev => prev.map(inc => inc.id === id ? { ...inc, done: !inc.done, status: !inc.done ? 'Resolved' : 'Investigating' } : inc));
  };

  const handleAddIncident = () => {
    if (!newIncidentVector.trim()) return;
    soundManager.playClick();
    const newInc = {
      id: `INC-2026-${String(incidents.length + 1).padStart(2, '0')}`,
      vector: newIncidentVector.trim(),
      sev: 'HIGH',
      status: 'Investigating',
      owner: 'SecOps Triage',
      hash: `0x${Math.random().toString(16).slice(2, 6)}…${Math.random().toString(16).slice(2, 6)}`,
      done: false
    };
    setIncidents([newInc, ...incidents]);
    setNewIncidentVector('');
    toast.success('Added new threat incident block to workspace');
  };

  // Seal Document to Blockchain
  const handleSealToChain = () => {
    soundManager.playScanPulse();
    setIsSealing(true);

    setTimeout(() => {
      soundManager.playSuccess();
      setIsSealing(false);
      const mockTx = {
        txHash: `0x${Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('')}`,
        block: 4836,
        merkle: `0x${Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('')}`,
        ipfs: `Qm${Array.from({length: 44}, () => 'abcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random()*36)]).join('')}`,
        timestamp: new Date().toLocaleTimeString()
      };
      setSealedTx(mockTx);
      toast.success('Document sealed immutably on Ethereum Sepolia!');
    }, 1400);
  };

  const completedCount = tasks.filter(t => t.done).length;
  const progressPct = Math.round((completedCount / tasks.length) * 100);

  const filteredIncidents = incidents.filter(i => {
    if (filterSeverity === 'all') return true;
    return i.sev.toLowerCase() === filterSeverity.toLowerCase();
  });

  return (
    <div className="animate-fade" style={{ maxWidth: '1080px', margin: '0 auto', paddingBottom: '4rem' }}>
      
      {/* ── NOTION DOCUMENT CONTAINER ── */}
      <div style={{
        background: 'rgba(6, 14, 28, 0.92)',
        border: '1px solid rgba(0, 245, 255, 0.22)',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 12px 40px rgba(0,0,0,0.6), 0 0 25px rgba(0, 245, 255, 0.08)'
      }}>
        
        {/* ── COVER IMAGE / BANNER ── */}
        <div style={{
          position: 'relative',
          height: '200px',
          width: '100%',
          overflow: 'hidden',
          background: COVERS[coverIndex].gradient || undefined
        }}>
          {COVERS[coverIndex].url && (
            <img
              src={COVERS[coverIndex].url}
              alt="Cover"
              style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.75) contrast(1.1)' }}
            />
          )}

          {/* Cover Controls */}
          <div style={{
            position: 'absolute', bottom: '12px', right: '16px',
            display: 'flex', gap: '0.5rem', zIndex: 10
          }}>
            <button
              onClick={() => {
                soundManager.playClick();
                setCoverIndex((coverIndex + 1) % COVERS.length);
              }}
              style={{
                padding: '0.35rem 0.75rem',
                background: 'rgba(3, 7, 18, 0.75)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(0, 245, 255, 0.3)',
                borderRadius: '6px',
                color: '#00F5FF',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              🖼️ Change Cover ({COVERS[coverIndex].name})
            </button>
          </div>
        </div>

        {/* ── DOCUMENT BODY ── */}
        <div style={{ padding: '0 2.5rem 2.5rem' }}>
          
          {/* Icon & Breadcrumbs */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: '-38px', marginBottom: '1.25rem', position: 'relative', zIndex: 20 }}>
            {/* Interactive Icon */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowIconPicker(!showIconPicker)}
                style={{
                  width: '76px', height: '76px',
                  borderRadius: '16px',
                  background: '#030712',
                  border: '2px solid rgba(0, 245, 255, 0.4)',
                  fontSize: '2.5rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.8)'
                }}
                title="Click to change icon"
              >
                {docIcon}
              </button>

              {/* Icon Picker Popover */}
              {showIconPicker && (
                <div style={{
                  position: 'absolute', top: '85px', left: 0,
                  background: '#070D18',
                  border: '1px solid rgba(0, 245, 255, 0.3)',
                  borderRadius: '10px',
                  padding: '0.6rem',
                  display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.4rem',
                  zIndex: 50, boxShadow: '0 8px 30px rgba(0,0,0,0.8)'
                }}>
                  {ICONS.map(ic => (
                    <button
                      key={ic}
                      onClick={() => {
                        setDocIcon(ic);
                        setShowIconPicker(false);
                        soundManager.playClick();
                      }}
                      style={{
                        background: 'rgba(255,255,255,0.05)', border: 'none',
                        borderRadius: '6px', fontSize: '1.4rem', padding: '0.4rem',
                        cursor: 'pointer'
                      }}
                    >
                      {ic}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Blockchain Seal Action */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button
                onClick={handleSealToChain}
                disabled={isSealing}
                className="btn btn-primary"
                style={{
                  padding: '0.45rem 1.1rem', fontSize: '0.8rem',
                  background: 'linear-gradient(135deg, #00FFA3 0%, #00F5FF 100%)',
                  color: '#030712', fontWeight: 800, border: 'none',
                  display: 'inline-flex', alignItems: 'center', gap: '0.4rem'
                }}
              >
                <span>⛓️</span>
                {isSealing ? 'Sealing Runbook to Ethereum…' : 'Seal Runbook On-Chain'}
              </button>
            </div>
          </div>

          {/* Breadcrumb Hierarchy */}
          <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            SOC Workspaces / Threat Defense / Zero-Trust MTA / <span style={{ color: '#00F5FF' }}>IR-2026-PLAYBOOK</span>
          </div>

          {/* Editable Document Title */}
          <input
            type="text"
            value={docTitle}
            onChange={(e) => setDocTitle(e.target.value)}
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontFamily: 'var(--font-display)',
              fontSize: '2rem',
              fontWeight: 900,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
              marginBottom: '0.75rem'
            }}
          />

          {/* Document Properties Bar */}
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: '1.5rem',
            padding: '0.75rem 1rem',
            background: 'rgba(0,0,0,0.3)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '8px',
            fontSize: '0.78rem',
            marginBottom: '1.75rem'
          }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Status: </span>
              <span style={{ color: '#00FFA3', fontWeight: 700 }}>ACTIVE ENFORCEMENT</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Classification: </span>
              <span style={{ color: '#FBBF24', fontWeight: 700 }}>TLP:AMBER // STRICT</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Network Anchor: </span>
              <span style={{ color: '#00F5FF', fontFamily: 'var(--font-mono)' }}>Sepolia Block #4834</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>SecOps Lead: </span>
              <span style={{ color: 'var(--text-primary)' }}>Team SecureScope</span>
            </div>
          </div>

          {/* ── NOTION CALLOUT BLOCK: CRITICAL THREAT ADVISORY ── */}
          <div style={{
            padding: '1.1rem 1.25rem',
            background: 'rgba(255, 0, 85, 0.08)',
            borderLeft: '4px solid #FF0055',
            borderRadius: '0 8px 8px 0',
            marginBottom: '1.5rem',
            display: 'flex', gap: '1rem', alignItems: 'flex-start'
          }}>
            <span style={{ fontSize: '1.6rem', flexShrink: 0 }}>🚨</span>
            <div>
              <div style={{ fontWeight: 800, color: '#FF0055', fontSize: '0.9rem', marginBottom: '0.2rem' }}>
                ACTIVE EXPLOITATION VECTOR DETECTED [CVE-2026-9142]
              </div>
              <div style={{ fontSize: '0.84rem', color: 'var(--text-primary)', lineHeight: 1.55 }}>
                Adversaries weaponizing DNS cache poisoning to forge DKIM-signed executive payloads.
                Mandatory mitigation requires setting DMARC alignment mode to strict (<code>adkim=s; aspf=s</code>) and verifying transaction hash on-chain.
              </div>
            </div>
          </div>

          {/* ── PROGRESS BAR (NOTION MILESTONES) ── */}
          <div style={{
            background: 'rgba(0, 245, 255, 0.04)',
            border: '1px solid rgba(0, 245, 255, 0.18)',
            borderRadius: '10px',
            padding: '1rem 1.25rem',
            marginBottom: '2rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', fontSize: '0.84rem' }}>
              <span style={{ fontWeight: 700, color: '#00F5FF', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span>🎯</span> Playbook Hardening Progress
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#00FFA3' }}>
                {completedCount} / {tasks.length} Completed ({progressPct}%)
              </span>
            </div>
            <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${progressPct}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #00FFA3, #00F5FF)',
                  transition: 'width 0.4s ease',
                  boxShadow: '0 0 10px #00FFA3'
                }}
              />
            </div>
          </div>

          {/* ── NOTION TOGGLE LIST 1: Phase 1 Triage & DNS Hardening ── */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div
              onClick={() => toggleSection('triage')}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.6rem',
                fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)',
                cursor: 'pointer', userSelect: 'none', padding: '0.35rem 0'
              }}
            >
              <span style={{ color: '#00F5FF', fontSize: '0.85rem', transition: 'transform 0.2s', transform: openToggles.triage ? 'rotate(90deg)' : 'none' }}>
                ▶
              </span>
              <span>Phase 1: DNS &amp; MTA Authentication Triage</span>
              <span className="tag tag-cyan" style={{ fontSize: '0.65rem' }}>STRICT CHECK</span>
            </div>

            {openToggles.triage && (
              <div style={{ paddingLeft: '1.5rem', marginTop: '0.6rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {tasks.filter(t => t.phase === 'Phase 1').map(t => (
                  <label
                    key={t.id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.75rem',
                      padding: '0.5rem 0.75rem',
                      background: t.done ? 'rgba(0, 255, 163, 0.05)' : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${t.done ? 'rgba(0, 255, 163, 0.2)' : 'rgba(255,255,255,0.06)'}`,
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      color: t.done ? 'var(--text-primary)' : 'var(--text-secondary)',
                      textDecoration: t.done ? 'none' : 'none'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={t.done}
                      onChange={() => handleToggleTask(t.id)}
                      style={{ accentColor: '#00FFA3', width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                    <span>{t.text}</span>
                    {t.done && <span style={{ marginLeft: 'auto', color: '#00FFA3', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>[VERIFIED]</span>}
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* ── NOTION TOGGLE LIST 2: Phase 2 Cryptographic Key Rotation ── */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div
              onClick={() => toggleSection('keys')}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.6rem',
                fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)',
                cursor: 'pointer', userSelect: 'none', padding: '0.35rem 0'
              }}
            >
              <span style={{ color: '#00F5FF', fontSize: '0.85rem', transition: 'transform 0.2s', transform: openToggles.keys ? 'rotate(90deg)' : 'none' }}>
                ▶
              </span>
              <span>Phase 2: Cryptographic Key Rotation &amp; TLS 1.3 Pinning</span>
              <span className="tag tag-gold" style={{ fontSize: '0.65rem' }}>SECURE SHELL</span>
            </div>

            {openToggles.keys && (
              <div style={{ paddingLeft: '1.5rem', marginTop: '0.6rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {/* Embedded Code Snippet Block */}
                <div style={{
                  background: '#02050B',
                  border: '1px solid rgba(0, 245, 255, 0.25)',
                  borderRadius: '8px',
                  padding: '1rem',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.78rem',
                  lineHeight: 1.7,
                  position: 'relative'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.3rem' }}>
                    <span>BASH // OPENSSL ROTATION</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText('openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out dkim_2026.key\nopenssl rsa -in dkim_2026.key -pubout -out dkim_2026.pub');
                        toast.success('Copied rotation command');
                      }}
                      style={{ background: 'none', border: 'none', color: '#00F5FF', cursor: 'pointer', fontSize: '0.72rem' }}
                    >
                      Copy 📋
                    </button>
                  </div>
                  <div style={{ color: '#00FFA3' }}>$ openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out dkim_2026.key</div>
                  <div style={{ color: '#38BDF8' }}>$ openssl rsa -in dkim_2026.key -pubout -out dkim_2026.pub</div>
                  <div style={{ color: '#FBBF24' }}>$ python -m securemailscope.cli --verify-alignment yourdomain.com</div>
                </div>

                {tasks.filter(t => t.phase === 'Phase 2').map(t => (
                  <label
                    key={t.id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.75rem',
                      padding: '0.5rem 0.75rem',
                      background: t.done ? 'rgba(0, 255, 163, 0.05)' : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${t.done ? 'rgba(0, 255, 163, 0.2)' : 'rgba(255,255,255,0.06)'}`,
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      color: t.done ? 'var(--text-primary)' : 'var(--text-secondary)'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={t.done}
                      onChange={() => handleToggleTask(t.id)}
                      style={{ accentColor: '#00FFA3', width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                    <span>{t.text}</span>
                    {t.done && <span style={{ marginLeft: 'auto', color: '#00FFA3', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>[VERIFIED]</span>}
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* ── NOTION TOGGLE LIST 3: Phase 3 Blockchain Merkle Consensus ── */}
          <div style={{ marginBottom: '2.5rem' }}>
            <div
              onClick={() => toggleSection('onchain')}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.6rem',
                fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)',
                cursor: 'pointer', userSelect: 'none', padding: '0.35rem 0'
              }}
            >
              <span style={{ color: '#00F5FF', fontSize: '0.85rem', transition: 'transform 0.2s', transform: openToggles.onchain ? 'rotate(90deg)' : 'none' }}>
                ▶
              </span>
              <span>Phase 3: Decentralized Storage &amp; Smart Contract Settlement</span>
              <span className="chain-badge" style={{ fontSize: '0.65rem' }}>SOLIDITY WEB3</span>
            </div>

            {openToggles.onchain && (
              <div style={{ paddingLeft: '1.5rem', marginTop: '0.6rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {tasks.filter(t => t.phase === 'Phase 3').map(t => (
                  <label
                    key={t.id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.75rem',
                      padding: '0.5rem 0.75rem',
                      background: t.done ? 'rgba(0, 255, 163, 0.05)' : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${t.done ? 'rgba(0, 255, 163, 0.2)' : 'rgba(255,255,255,0.06)'}`,
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      color: t.done ? 'var(--text-primary)' : 'var(--text-secondary)'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={t.done}
                      onChange={() => handleToggleTask(t.id)}
                      style={{ accentColor: '#00FFA3', width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                    <span>{t.text}</span>
                    {t.done && <span style={{ marginLeft: 'auto', color: '#00FFA3', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>[VERIFIED]</span>}
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* ── NOTION-STYLE INCIDENT DATABASE / TABLE ── */}
          <div style={{ marginTop: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.2rem' }}>📊</span>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 800 }}>
                  Active Threat Matrix Database
                </h3>
              </div>

              {/* Filter Pills */}
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                {['all', 'critical', 'high', 'medium'].map(sev => (
                  <button
                    key={sev}
                    onClick={() => {
                      soundManager.playClick();
                      setFilterSeverity(sev);
                    }}
                    style={{
                      padding: '0.25rem 0.65rem',
                      fontSize: '0.72rem',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      borderRadius: '6px',
                      background: filterSeverity === sev ? 'rgba(0, 245, 255, 0.18)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${filterSeverity === sev ? '#00F5FF' : 'rgba(255,255,255,0.08)'}`,
                      color: filterSeverity === sev ? '#00F5FF' : 'var(--text-muted)',
                      cursor: 'pointer'
                    }}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: '10px' }}>
              <table className="log-table" style={{ margin: 0 }}>
                <thead>
                  <tr>
                    <th style={{ width: '40px' }}>STATUS</th>
                    <th>INCIDENT ID</th>
                    <th>ATTACK VECTOR</th>
                    <th>SEVERITY</th>
                    <th>ASSIGNED NODE</th>
                    <th>ON-CHAIN TX</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredIncidents.map(inc => (
                    <tr key={inc.id}>
                      <td style={{ textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={inc.done}
                          onChange={() => handleToggleIncident(inc.id)}
                          style={{ accentColor: '#00FFA3', cursor: 'pointer' }}
                        />
                      </td>
                      <td className="mono" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                        {inc.id}
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        {inc.vector}
                      </td>
                      <td>
                        <span className={`tag ${inc.sev === 'CRITICAL' ? 'tag-red' : inc.sev === 'HIGH' ? 'tag-amber' : 'tag-cyan'}`}>
                          {inc.sev}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {inc.owner}
                      </td>
                      <td>
                        <span className="mono" style={{ color: '#00F5FF', fontSize: '0.75rem' }}>
                          {inc.hash}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Add New Row input */}
            <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.85rem' }}>
              <input
                type="text"
                placeholder="+ Type new threat vector to add block (e.g. 'SPF DNS Lookup Exceeded Limit')..."
                value={newIncidentVector}
                onChange={(e) => setNewIncidentVector(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAddIncident(); }}
                style={{
                  flex: 1,
                  background: 'rgba(0,0,0,0.35)',
                  border: '1px dashed rgba(0, 245, 255, 0.3)',
                  borderRadius: '6px',
                  padding: '0.55rem 0.85rem',
                  color: 'var(--text-primary)',
                  fontSize: '0.82rem',
                  outline: 'none'
                }}
              />
              <button
                onClick={handleAddIncident}
                className="btn btn-outline"
                style={{ fontSize: '0.8rem', padding: '0.45rem 1rem' }}
              >
                + Add Block
              </button>
            </div>
          </div>

          {/* ── IMMUTABLE ON-CHAIN RECEIPT CARD (IF SEALED) ── */}
          {sealedTx && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                marginTop: '2rem',
                padding: '1.25rem 1.5rem',
                background: 'rgba(0, 255, 163, 0.04)',
                border: '1px solid rgba(0, 255, 163, 0.3)',
                borderRadius: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.2rem' }}>⛓️</span>
                  <span style={{ fontWeight: 800, color: '#00FFA3', fontSize: '0.9rem' }}>
                    IMMUTABLE RUNBOOK STATE ROOT SEALED
                  </span>
                </div>
                <span className="chain-badge">Sepolia Block #{sealedTx.block}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.6rem', fontSize: '0.76rem', fontFamily: 'var(--font-mono)' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>TRANSACTION: </span>
                  <span style={{ color: '#00F5FF' }}>{sealedTx.txHash.slice(0, 24)}…</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>MERKLE ROOT: </span>
                  <span style={{ color: '#FBBF24' }}>{sealedTx.merkle.slice(0, 20)}…</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>IPFS PIN: </span>
                  <span style={{ color: 'var(--text-primary)' }}>{sealedTx.ipfs.slice(0, 22)}…</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>SETTLED AT: </span>
                  <span style={{ color: '#00FFA3' }}>{sealedTx.timestamp}</span>
                </div>
              </div>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
}
