import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import {
  DEFAULT_SCAN, SCORE_HISTORY, BREACH_DATA, SEVERITY_DIST, AUDIT_LOGS,
  getScoreColor, getStatusDot, getStatusIcon, getSeverityClass
} from '../data/mockData.js';
import { getBlockchainLogs } from '../data/api.js';
import { soundManager } from '../data/sound.js';

/* ── Animated SVG Gauge ── */
function ScoreGauge({ score }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let frame;
    const start = performance.now();
    const dur   = 1200;
    const tick  = now => {
      const t = Math.min((now - start) / dur, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(ease * score));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [score]);

  const color  = getScoreColor(score);
  const r = 68; const cx = 88; const cy = 88;
  const circ   = 2 * Math.PI * r;
  const offset = circ * (1 - score / 100);
  const label  = score >= 80 ? 'SECURE' : score >= 50 ? 'AT RISK' : 'CRITICAL';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1rem 0' }}>
      <div style={{ position: 'relative', display: 'inline-flex' }}>
        <svg width={176} height={176} viewBox="0 0 176 176">
          {/* Track */}
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(26,58,92,0.5)" strokeWidth={10} />
          {/* Progress */}
          <circle cx={cx} cy={cy} r={r} fill="none"
            stroke={color} strokeWidth={10}
            strokeDasharray={circ} strokeDashoffset={offset}
            strokeLinecap="round"
            transform={`rotate(-90 ${cx} ${cy})`}
            style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)', filter: `drop-shadow(0 0 6px ${color}60)` }}
          />
          {/* Tick marks at 0, 25, 50, 75, 100 */}
          {[0, 25, 50, 75, 100].map(v => {
            const a = (v / 100) * 2 * Math.PI - Math.PI / 2;
            const x1 = cx + (r - 14) * Math.cos(a);
            const y1 = cy + (r - 14) * Math.sin(a);
            const x2 = cx + (r - 6) * Math.cos(a);
            const y2 = cy + (r - 6) * Math.sin(a);
            return <line key={v} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.15)" strokeWidth={1.5} />;
          })}
        </svg>
        {/* Center label with Holographic Lock Icon */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center'
        }}>
          <span style={{ fontSize: '1rem', color, filter: `drop-shadow(0 0 8px ${color})`, marginBottom: -2 }}>🔒</span>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '2.3rem', fontWeight: 800, lineHeight: 1, color }}>{display}</span>
          <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 800, letterSpacing: '0.14em', marginTop: 2 }}>{label}</span>
        </div>
      </div>

      {/* Severity pills */}
      <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem' }}>
        {SEVERITY_DIST.map(s => (
          <div key={s.name} style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', marginTop: 1 }}>{s.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Custom Recharts Tooltip ── */
function ChartTip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 8, padding: '0.6rem 0.9rem', fontSize: '0.8rem'
    }}>
      <div style={{ color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ color: p.color || p.stroke, fontWeight: 600 }}>
          {p.name}: {p.value}
        </div>
      ))}
    </div>
  );
}

/* ── Stat Card ── */
function StatCard({ label, value, unit, color, icon, sub, delay }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (typeof value !== 'number') return;
    let frame;
    const start = performance.now();
    const dur   = 900 + delay * 80;
    const tick  = now => {
      const t = Math.min((now - start) / dur, 1);
      setV(Math.round((1 - Math.pow(1 - t, 3)) * value));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return (
    <div className="stat-card" style={{ '--accent-color': color, animationDelay: `${delay * 0.08}s` }}>
      <div className="stat-card-icon">{icon}</div>
      <div className="stat-card-label">{label}</div>
      <div className="stat-card-value" style={{ color }}>
        {typeof value === 'number' ? v : value}
        {unit && <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 400 }}>{unit}</span>}
      </div>
      {sub && <div className="stat-card-sub">{sub}</div>}
    </div>
  );
}

/* ── Dashboard Page ── */
export default function Dashboard({ apiOnline }) {
  const navigate = useNavigate();
  const data = DEFAULT_SCAN;
  const [logs, setLogs] = useState(AUDIT_LOGS);
  const [activeChain, setActiveChain] = useState('sepolia');

  useEffect(() => {
    getBlockchainLogs(5).then(r => { if (r?.records?.length) setLogs(r.records); });
  }, []);

  const CHAINS = [
    { id: 'sepolia', name: 'Ethereum Sepolia', icon: '⛓️', consensus: 'PoS (Finalized)', rpc: '12ms', color: '#FBBF24' },
    { id: 'arbitrum', name: 'Arbitrum Nitro', icon: '🚀', consensus: 'Rollup L2', rpc: '8ms', color: '#00F5FF' },
    { id: 'besu', name: 'Hyperledger Besu', icon: '🛡️', consensus: 'IBFT 2.0 Enterprise', rpc: '4ms', color: '#00FFA3' },
    { id: 'polygon', name: 'Polygon zkEVM', icon: '⚡', consensus: 'Zero-Knowledge Proof', rpc: '15ms', color: '#38BDF8' },
  ];

  return (
    <div className="animate-fade">
      {/* ── HIGH-TECH MULTI-CHAIN CONSENSUS & NODE STATUS BAR ── */}
      <div style={{
        marginBottom: '1.25rem', padding: '0.85rem 1.25rem',
        background: 'rgba(6, 14, 28, 0.95)',
        border: '1px solid rgba(0, 245, 255, 0.25)',
        borderRadius: '12px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '1rem',
        boxShadow: '0 4px 20px rgba(0,0,0,0.4), inset 0 0 20px rgba(0, 245, 255, 0.03)'
      }}>
        {/* Left: Chain Selectors */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            NODE NETWORK:
          </span>
          {CHAINS.map(c => {
            const active = activeChain === c.id;
            return (
              <button
                key={c.id}
                onClick={() => {
                  soundManager.playClick();
                  setActiveChain(c.id);
                }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                  padding: '0.3rem 0.65rem',
                  background: active ? `${c.color}20` : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${active ? c.color : 'rgba(255,255,255,0.08)'}`,
                  borderRadius: '6px',
                  color: active ? c.color : 'var(--text-secondary)',
                  fontSize: '0.75rem', fontWeight: 700,
                  fontFamily: 'var(--font-mono)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: active ? `0 0 12px ${c.color}35` : 'none'
                }}
              >
                <span>{c.icon}</span>
                <span>{c.name}</span>
                {active && (
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: c.color, boxShadow: `0 0 6px ${c.color}` }} />
                )}
              </button>
            );
          })}
        </div>

        {/* Right: Cryptographic Telemetry Stats */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', fontSize: '0.74rem', fontFamily: 'var(--font-mono)' }}>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>GAS: </span>
            <span style={{ color: '#00F5FF', fontWeight: 700 }}>18.2 GWEI</span>
          </div>
          <div style={{ color: 'rgba(255,255,255,0.15)' }}>|</div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>CONTRACT: </span>
            <span style={{ color: '#00FFA3', fontWeight: 700 }}>0x71C8…2bC8 ✓</span>
          </div>
          <div style={{ color: 'rgba(255,255,255,0.15)' }}>|</div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>STATUS: </span>
            <span style={{ color: '#FBBF24', fontWeight: 700 }}>100% SYNCED</span>
          </div>
        </div>
      </div>

      {/* Cyber Threat Brainstorm Alert Banner */}
      <div style={{
        marginBottom: '1.25rem', padding: '1rem 1.35rem',
        background: 'linear-gradient(135deg, rgba(0,245,255,0.07) 0%, rgba(251,191,36,0.08) 100%)',
        border: '1px solid rgba(0,245,255,0.25)', borderRadius: '12px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.85rem',
        boxShadow: '0 4px 24px rgba(0,245,255,0.06)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <span style={{ fontSize: '1.5rem', animation: 'spin 12s linear infinite', display: 'inline-block' }}>🧠</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.94rem', color: '#FFF', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Cybersecurity Threat Matrix &amp; Attack Surface
              <span className="tag tag-cyan" style={{ fontSize: '0.65rem' }}>AI FORENSICS</span>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Synthesizing 4 active email attack vectors: DKIM Replay, BGP DNS Route Hijack &amp; Subdomain Takeover.
            </div>
          </div>
        </div>
        <button
          onClick={() => {
            soundManager.playClick();
            navigate('/dashboard/brainstorm');
          }}
          className="btn btn-primary"
          style={{
            fontSize: '0.82rem', padding: '0.45rem 1rem',
            background: 'linear-gradient(135deg, #00FFA3 0%, #00F5FF 100%)',
            color: '#030712', fontWeight: 800, border: 'none'
          }}
        >
          Launch Threat Brainstormer ↗
        </button>
      </div>

      {/* API mode banner */}
      {!apiOnline && (
        <div style={{
          marginBottom: '1rem', padding: '0.65rem 1.25rem',
          background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.25)',
          borderRadius: 10, fontSize: '0.82rem', color: 'var(--accent-amber)',
          display: 'flex', alignItems: 'center', gap: '0.6rem'
        }}>
          <span>⚡</span>
          <span>Running in <strong>Demo Mode</strong> — start the FastAPI backend to enable live DNS scans:</span>
          <code style={{ background: 'rgba(0,0,0,0.3)', padding: '0.15rem 0.5rem', borderRadius: 4, fontSize: '0.78rem', color: 'var(--text-primary)' }}>
            uvicorn main:app --reload --port 8000
          </code>
        </div>
      )}

      {/* Stat Cards */}
      <div className="stat-grid">
        <StatCard label="Security Score" value={data.score} unit="/100" color={getScoreColor(data.score)} icon="🛡" sub={`Grade ${data.grade} · yourdomain.com`} delay={0} />
        <StatCard label="Critical Issues" value={data.checks.filter(c => c.status === 'fail').length} color="var(--accent-red)" icon="⚠" sub={`${data.checks.filter(c => c.status === 'warn').length} warnings · ${data.checks.filter(c => c.status === 'pass').length} passed`} delay={1} />
        <StatCard label="Scans Today" value={12} color="var(--accent-cyan)" icon="⟳" sub="+3 from yesterday" delay={2} />
        <StatCard label="Blockchain Logs" value={logs.length} color="var(--accent-gold)" icon="⛓" sub="All confirmed on-chain" delay={3} />
      </div>

      {/* Row 1: Area Chart + Gauge */}
      <div className="dashboard-grid" style={{ marginBottom: '1.25rem' }}>
        <div className="card">
          <div className="card-header">
            <span className="card-title">Security Score — 7 Day Trend</span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <span className="tag tag-cyan">yourdomain.com</span>
              <span className="tag tag-green">↑ +17 pts this week</span>
            </div>
          </div>
          <div className="card-body" style={{ padding: '1rem' }}>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={SCORE_HISTORY} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#00D4FF" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00D4FF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(26,58,92,0.35)" strokeDasharray="4 4" />
                <XAxis dataKey="date" tick={{ fill: '#4A6B8A', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: '#4A6B8A', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTip />} />
                <Area type="monotone" dataKey="score" name="Score"
                  stroke="#00D4FF" strokeWidth={2.5}
                  fill="url(#sg)"
                  dot={{ fill: '#00D4FF', r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: '#00D4FF', stroke: '#050B18', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Posture Score</span>
            <span className="tag tag-amber">yourdomain.com</span>
          </div>
          <ScoreGauge score={data.score} />
        </div>
      </div>

      {/* Row 2: Checks + Breach + Logs */}
      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header">
            <span className="card-title">Last Scan Results</span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <span className="tag tag-red">{data.checks.filter(c => c.status === 'fail').length} Failed</span>
              <span className="tag tag-amber">{data.checks.filter(c => c.status === 'warn').length} Warn</span>
              <span className="tag tag-green">{data.checks.filter(c => c.status === 'pass').length} Pass</span>
            </div>
          </div>
          <div className="card-body">
            <div className="check-list">
              {data.checks.map((c, i) => (
                <div className="check-item" key={c.id} style={{ animationDelay: `${i * 0.06}s` }}>
                  <div className={`check-dot ${getStatusDot(c.status)}`}>{getStatusIcon(c.status)}</div>
                  <span className="check-name">{c.name}</span>
                  <span className="check-val" style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {c.value}
                  </span>
                  <span className={`severity-badge ${getSeverityClass(c.severity)}`}>{c.severity}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Breach Chart */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Threat Exposure Heuristics</span>
              <span className="tag tag-amber">CVE &amp; BREACH DB</span>
            </div>
            <div className="card-body" style={{ padding: '1rem' }}>
              <ResponsiveContainer width="100%" height={140}>
                <LineChart data={BREACH_DATA} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="rgba(26,58,92,0.35)" strokeDasharray="4 4" />
                  <XAxis dataKey="date" tick={{ fill: '#4A6B8A', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fill: '#4A6B8A', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTip />} />
                  <Line type="monotone" dataKey="count" name="Breaches"
                    stroke="#F59E0B" strokeWidth={2.5}
                    dot={{ fill: '#F59E0B', r: 4, strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: '#F59E0B', stroke: '#030712', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
              <div style={{
                marginTop: '0.75rem', padding: '0.6rem 0.85rem',
                background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)',
                borderRadius: 8, display: 'flex', gap: '0.5rem', fontSize: '0.78rem', color: '#FCD34D'
              }}>
                <span>⚠</span> 1 active exposure · HaveIBeenPwned &amp; DarkWeb Monitor
              </div>
            </div>
          </div>

          {/* Blockchain Logs */}
          <div className="card" style={{ flex: 1 }}>
            <div className="card-header">
              <span className="card-title">Immutable Audit Trail</span>
              <button
                onClick={() => {
                  soundManager.playClick();
                  navigate('/dashboard/audit');
                }}
                className="btn btn-outline"
                style={{
                  fontSize: '0.72rem', padding: '0.2rem 0.6rem',
                  display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                  borderColor: 'rgba(251,191,36,0.35)', color: '#FBBF24'
                }}
              >
                <span>⛓</span> Explorer ↗
              </button>
            </div>
            <div className="card-body" style={{ padding: '0.5rem 0.75rem' }}>
              {logs.slice(0, 4).map(log => (
                <div key={log.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0.55rem 0.5rem', borderBottom: '1px solid rgba(26,58,92,0.25)',
                  fontSize: '0.8rem', gap: '0.75rem', transition: 'background 0.2s',
                  borderRadius: 4, cursor: 'pointer'
                }}
                  onClick={() => {
                    soundManager.playClick();
                    navigate('/dashboard/audit');
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,245,255,0.05)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <span className="mono" style={{ color: 'var(--accent-cyan)', fontSize: '0.75rem', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {log.domain}
                  </span>
                  <span className="chain-badge" style={{ flexShrink: 0 }}>#{log.block}</span>
                  <span style={{ fontWeight: 700, color: getScoreColor(log.score), flexShrink: 0 }}>{log.score}</span>
                </div>
              ))}
              <div style={{
                marginTop: '0.65rem', padding: '0.4rem 0.6rem',
                background: 'rgba(0,245,255,0.03)', border: '1px dashed rgba(0,245,255,0.18)',
                borderRadius: 6, fontSize: '0.68rem', fontFamily: 'var(--font-mono)',
                color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between'
              }}>
                <span>MERKLE: 0x4f82…d91a</span>
                <span style={{ color: '#00FFA3' }}>secp256k1 ✓</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
