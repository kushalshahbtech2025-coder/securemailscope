import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { soundManager } from '../data/sound.js';

export default function SocCommandCenter({ onLaunchScanner }) {
  const [activeTab, setActiveTab] = useState('threat-map');
  const [attackActive, setAttackActive] = useState(false);
  const [terminalLines, setTerminalLines] = useState([
    '[INIT] SOC BATTLESTATION INTERFACE READY.',
    '[NET] Interface eth0 bound to SMTP gateway (port 25, 587, 465).',
    '[CRYPTO] Loaded authoritative DNSSEC trust anchors & Ed25519 root.',
    '[CHAIN] Connected to Ethereum Sepolia RPC (Block #4833, latency: 12ms).',
    '[MONITOR] 0 anomalous packet signatures detected in the last 60s.'
  ]);

  const [attacks, setAttacks] = useState([
    { id: 1, origin: '185.220.101.42 (Frankfurt)', target: 'mx1.securemailscope.io', vector: 'DKIM Replay Spoof', status: 'INTERCEPTED', color: '#00FF9D' },
    { id: 2, origin: '103.145.13.88 (Singapore)', target: 'relay.smtp-inbound.net', vector: 'STARTTLS Downgrade Probe', status: 'BLOCKED', color: '#FF0055' },
    { id: 3, origin: '45.154.255.90 (Bucharest)', target: 'dmarc-reporter.internal', vector: 'SPF Lookup Exhaustion', status: 'RATE_LIMITED', color: '#FFB703' },
  ]);

  // Terminal telemetry auto-scroll
  useEffect(() => {
    const commands = [
      '[DNS] Queried TXT record for _dmarc.enterprise.com -> v=DMARC1; p=reject',
      '[TLS] Verified certificate chain: DigiCert Global Root G2 (valid 280d)',
      '[ARC] Validated Authenticated-Received-Chain seal instance #1 -> PASS',
      '[CHAIN] Emitted event AuditRecorded(domain="acme.com", root=0x7e81...2bC8)',
      '[AI] Threat scoring model evaluated 42 cryptographic features: RISK=LOW',
      '[BIMI] Verified SVG indicator cert: VMC certificate fingerprint matches'
    ];
    let idx = 0;
    const interval = setInterval(() => {
      setTerminalLines(prev => [
        commands[idx % commands.length],
        ...prev.slice(0, 9)
      ]);
      idx++;
    }, 3200);
    return () => clearInterval(interval);
  }, []);

  // Trigger Simulated Attack
  function triggerAttackSimulation() {
    soundManager.playThreatWarning();
    setAttackActive(true);
    const newAttack = {
      id: Date.now(),
      origin: '91.240.118.15 (Rogue ASN 44021)',
      target: 'mx-primary.mailauth.org',
      vector: 'Zero-Day SMTP Injection & Header Spoof',
      status: 'MITIGATING…',
      color: '#FF0055'
    };
    setAttacks(prev => [newAttack, ...prev.slice(0, 4)]);
    setTerminalLines(prev => [
      '[ALERT] CRITICAL INTRUSION VECTOR DETECTED: Rogue MTA attempting STARTTLS stripping!',
      `[SOC] Applying automated blue-team rule: Force TLS 1.3 strict rejection.`,
      ...prev
    ]);

    setTimeout(() => {
      soundManager.playSuccess();
      setAttackActive(false);
      setAttacks(prev => prev.map(a => a.id === newAttack.id ? { ...a, status: 'BLOCKED & LOGGED ON-CHAIN', color: '#00FF9D' } : a));
      setTerminalLines(prev => [
        `[SEALED] Threat neutralized and anchored to Ethereum Block #4834 (Tx: 0x9f1a...44c2).`,
        ...prev
      ]);
    }, 2800);
  }

  return (
    <div style={{
      width: '100%', maxWidth: '1080px', margin: '0 auto',
      background: 'rgba(7, 11, 18, 0.95)',
      border: '1px solid rgba(0, 240, 255, 0.35)',
      borderRadius: '16px', overflow: 'hidden',
      boxShadow: '0 25px 70px rgba(0,0,0,0.8), 0 0 50px rgba(0, 240, 255, 0.18)',
      position: 'relative'
    }}>
      {/* Top SOC Console Control Bar */}
      <div style={{
        background: '#0B111E', borderBottom: '1px solid rgba(0, 240, 255, 0.25)',
        padding: '0.75rem 1.25rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '0.8rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            width: 10, height: 10, borderRadius: '50%',
            background: attackActive ? '#FF0055' : '#00FF66',
            boxShadow: attackActive ? '0 0 14px #FF0055' : '0 0 10px #00FF66',
            animation: 'pulse 1.2s infinite'
          }} />
          <span className="mono" style={{ fontWeight: 800, fontSize: '0.86rem', color: '#FFF', letterSpacing: '0.08em' }}>
            CYBERSECURITY LAB // SOC OPERATIONS COMMAND
          </span>
          <span className="tag tag-cyan" style={{ fontSize: '0.65rem', background: 'rgba(0,240,255,0.1)', borderColor: 'rgba(0,240,255,0.3)' }}>
            NODE: ETH-SEPOLIA-01
          </span>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button
            onClick={triggerAttackSimulation}
            disabled={attackActive}
            className="btn btn-outline"
            style={{
              borderColor: attackActive ? '#FF0055' : 'rgba(255, 0, 85, 0.4)',
              color: '#FF0055', background: attackActive ? 'rgba(255,0,85,0.15)' : 'transparent',
              fontSize: '0.75rem', padding: '0.35rem 0.8rem', fontWeight: 700
            }}
          >
            {attackActive ? '🚨 INTRUSION UNDERWAY…' : '⚡ Simulate Cyber Attack'}
          </button>
          <button
            onClick={() => {
              soundManager.playClick();
              if (onLaunchScanner) onLaunchScanner();
            }}
            className="btn btn-primary"
            style={{
              background: 'linear-gradient(135deg, #00FF66 0%, #00F0FF 100%)',
              color: '#070B12', fontWeight: 800, fontSize: '0.75rem',
              padding: '0.35rem 0.95rem', border: 'none'
            }}
          >
            Execute Live DNS Audit →
          </button>
        </div>
      </div>

      {/* Main Multi-Monitor Workstation Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1px', background: 'rgba(0, 240, 255, 0.15)' }}>
        
        {/* Monitor Pane 1: Global Cyber Threat Attack Map */}
        <div style={{ background: '#070B12', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span className="mono" style={{ fontSize: '0.76rem', color: 'var(--accent-cyan)', fontWeight: 700 }}>
              [MONITOR 01: GLOBAL CYBER ATTACK TRAJECTORY]
            </span>
            <span style={{ fontSize: '0.68rem', color: '#00FF66', fontFamily: 'var(--font-mono)' }}>● LIVE INTERCEPT</span>
          </div>

          {/* World map attack arc visualization */}
          <div style={{
            position: 'relative', width: '100%', height: '170px',
            background: 'radial-gradient(circle at 50% 50%, #0B1628 0%, #03060C 100%)',
            borderRadius: '8px', border: '1px solid rgba(0, 240, 255, 0.2)',
            overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            {/* World grid lines */}
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.35 }}>
              <line x1="0" y1="25%" x2="100%" y2="25%" stroke="rgba(0,240,255,0.2)" strokeDasharray="3 3" />
              <line x1="0" y1="50%" x2="100%" y2="50%" stroke="rgba(0,240,255,0.3)" />
              <line x1="0" y1="75%" x2="100%" y2="75%" stroke="rgba(0,240,255,0.2)" strokeDasharray="3 3" />
              <line x1="33%" y1="0" x2="33%" y2="100%" stroke="rgba(0,240,255,0.2)" strokeDasharray="3 3" />
              <line x1="66%" y1="0" x2="66%" y2="100%" stroke="rgba(0,240,255,0.2)" strokeDasharray="3 3" />
            </svg>

            {/* Simulated attack trajectories */}
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
              {/* Arc 1 */}
              <path d="M 60 120 Q 150 20 280 80" fill="none" stroke="#FF0055" strokeWidth="2" strokeDasharray="6 4" style={{ animation: 'radarSweep 3s linear infinite' }} />
              {/* Arc 2 */}
              <path d="M 280 80 Q 200 130 110 50" fill="none" stroke="#00FF66" strokeWidth="2" strokeDasharray="8 4" />
              
              {/* Target Hub */}
              <circle cx="280" cy="80" r="6" fill="#00F0FF" />
              <circle cx="280" cy="80" r="14" fill="none" stroke="#00F0FF" strokeWidth="1" opacity="0.6" style={{ animation: 'pulse 1.5s infinite' }} />
              
              {/* Adversary nodes */}
              <circle cx="60" cy="120" r="4" fill="#FF0055" />
              <circle cx="110" cy="50" r="4" fill="#FFB703" />
            </svg>

            <div style={{ position: 'absolute', bottom: '8px', left: '10px', fontSize: '0.66rem', color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--font-mono)' }}>
              TARGET: <span style={{ color: '#00F0FF' }}>SECUREMAILSCOPE MX SHIELD</span> (LAT: 37.77 / LON: -122.41)
            </div>
          </div>

          {/* Recent Intercepted Attacks Table */}
          <div style={{ marginTop: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {attacks.map(atk => (
              <div key={atk.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '0.4rem 0.65rem', background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.05)', borderRadius: '6px',
                fontSize: '0.72rem', fontFamily: 'var(--font-mono)'
              }}>
                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '65%' }}>
                  <span style={{ color: atk.color }}>▶</span> <span style={{ color: '#FFF' }}>{atk.vector}</span>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.64rem' }}>FROM: {atk.origin}</div>
                </div>
                <span style={{
                  color: atk.color, fontWeight: 700, fontSize: '0.66rem',
                  padding: '0.15rem 0.45rem', borderRadius: '4px',
                  background: `${atk.color}18`, border: `1px solid ${atk.color}35`
                }}>
                  {atk.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Monitor Pane 2: Live TTY Packet & DNS Inspection Terminal */}
        <div style={{ background: '#05080E', padding: '1.25rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span className="mono" style={{ fontSize: '0.76rem', color: '#00FF66', fontWeight: 700 }}>
              [MONITOR 02: KALI LINUX DNS FORENSICS STREAM]
            </span>
            <span className="mono" style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>TTY_3 · SH-5.2</span>
          </div>

          <div style={{
            flex: 1, background: '#020408', border: '1px solid rgba(0, 255, 102, 0.2)',
            borderRadius: '8px', padding: '0.85rem', fontFamily: 'var(--font-mono)',
            fontSize: '0.72rem', lineHeight: 1.6, overflowY: 'auto', maxHeight: '280px',
            color: '#34D399', display: 'flex', flexDirection: 'column', gap: '0.35rem'
          }}>
            <div style={{ color: 'var(--text-muted)' }}># kali-linux-lab:~$ tail -f /var/log/securemailscope/audit.log</div>
            {terminalLines.map((line, i) => (
              <div key={i} style={{
                color: line.includes('ALERT') ? '#FF1744' : line.includes('INIT') ? '#00F0FF' : line.includes('SEALED') ? '#00FF66' : '#94A3B8'
              }}>
                <span style={{ color: '#475569', marginRight: '0.5rem' }}>[{new Date().toTimeString().slice(0, 8)}]</span>
                {line}
              </div>
            ))}
            <div style={{ color: '#00FF66', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span>root@securescope-lab:~#</span>
              <span style={{ width: 7, height: 13, background: '#00FF66', display: 'inline-block', animation: 'pulse 0.8s infinite' }} />
            </div>
          </div>

          {/* Server Rack Hardware Stats Footer */}
          <div style={{
            marginTop: '0.85rem', padding: '0.65rem 0.85rem',
            background: '#0B111E', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '6px', display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', fontSize: '0.7rem', fontFamily: 'var(--font-mono)'
          }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>RACK_SWITCH: </span>
              <span style={{ color: '#00F0FF' }}>CISCO CATALYST 9300</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>CIPHER: </span>
              <span style={{ color: '#00FF66' }}>AES-256-GCM / SHA384</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>BLOCK: </span>
              <span style={{ color: '#A78BFA' }}>#4834</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cinematic SOC Lab Photo Banner at the bottom */}
      <div style={{ position: 'relative', width: '100%', height: '140px', overflow: 'hidden', borderTop: '1px solid rgba(0, 240, 255, 0.2)' }}>
        <img
          src="/soc_lab_command.jpg"
          alt="Cybersecurity Lab Battlestation"
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 40%', filter: 'contrast(1.15) brightness(0.7)' }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(90deg, #070B12 10%, transparent 50%, #070B12 90%), linear-gradient(180deg, transparent 0%, #070B12 100%)',
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute', inset: 0, padding: '1rem 1.5rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#FFF', fontFamily: 'var(--font-display)', letterSpacing: '0.04em' }}>
              CYBERSECURITY OPERATIONS LAB · 24/7 AUTONOMOUS DEFENSE
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
              ACTIVE SURVEILLANCE: MONITORING 14,000+ MX RELAYS ACROSS 42 CLOUD ZONES
            </div>
          </div>
          <button
            onClick={() => {
              soundManager.playClick();
              if (onLaunchScanner) onLaunchScanner();
            }}
            className="btn btn-outline"
            style={{ borderColor: 'var(--accent-cyan)', color: 'var(--accent-cyan)', fontSize: '0.78rem', padding: '0.4rem 0.95rem' }}
          >
            Open Full Scanner ↗
          </button>
        </div>
      </div>
    </div>
  );
}
