import { useState } from 'react';
import toast from 'react-hot-toast';
import { getScoreColor, getStatusDot, getStatusIcon, getSeverityClass, generateTxHash } from '../data/mockData.js';
import { scanDomain } from '../data/api.js';

const SCAN_STEPS = [
  { id: 'dns',    label: 'Resolving DNS records…' },
  { id: 'spf',   label: 'Validating SPF record…' },
  { id: 'dkim',  label: 'Checking DKIM selectors…' },
  { id: 'dmarc', label: 'Analyzing DMARC policy…' },
  { id: 'tls',   label: 'Inspecting TLS/SMTP handshake…' },
  { id: 'cert',  label: 'Verifying certificate chain…' },
  { id: 'breach',label: 'Querying breach intelligence…' },
  { id: 'ai',    label: 'Running AI threat scoring model…' },
  { id: 'chain', label: 'Recording to blockchain ledger…' },
];

export default function Scanner() {
  const [domain, setDomain]     = useState('');
  const [scanning, setScanning] = useState(false);
  const [stepIdx, setStepIdx]   = useState(-1);
  const [progress, setProgress] = useState(0);
  const [result, setResult]     = useState(null);
  const [source, setSource]     = useState('');   // 'live' | 'mock'

  async function runScan() {
    const d = domain.trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '').toLowerCase();
    if (!d || !d.includes('.')) { toast.error('Enter a valid domain (e.g. google.com)'); return; }

    setResult(null);
    setScanning(true);
    setStepIdx(0);
    setProgress(0);

    // Animate steps while API call runs in parallel
    const apiPromise = scanDomain(d);
    for (let i = 0; i < SCAN_STEPS.length; i++) {
      setStepIdx(i);
      setProgress(Math.round(((i + 1) / SCAN_STEPS.length) * 100));
      await new Promise(r => setTimeout(r, i < SCAN_STEPS.length - 1 ? 240 : 200));
    }

    const data = await apiPromise;
    const isLive = !!data.tx_hash && !data.domain?.startsWith('your');
    setSource(isLive ? 'live' : 'mock');
    setResult(data);
    setScanning(false);
    setStepIdx(-1);
    toast.success(isLive ? '✅ Live scan complete · Logged on-chain' : '⚡ Demo scan complete');
  }

  return (
    <div className="animate-fade">
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.4rem' }}>
          Domain Security Scanner
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Full cryptographic posture assessment via real DNS lookups. Results are logged to the Ethereum blockchain.
        </p>
      </div>

      {/* Input Card */}
      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <div className="card-body">
          <div className="scan-input-group scanner-container">
            <span className="mono" style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>@</span>
            <input
              type="text"
              value={domain}
              onChange={e => setDomain(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !scanning && runScan()}
              placeholder="Enter domain (e.g. google.com)"
              disabled={scanning}
            />
            <button className="btn-scan" onClick={runScan} disabled={scanning}>
              {scanning
                ? <><span style={{
                    width: 14, height: 14, border: '2px solid #050B18',
                    borderTopColor: 'transparent', borderRadius: '50%',
                    animation: 'spin 0.7s linear infinite', display: 'inline-block'
                  }} /> Scanning…</>
                : <>⚡ Scan Domain</>
              }
            </button>
          </div>

          {/* Quick domain pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Quick test:</span>
            {['google.com', 'microsoft.com', 'example.com', 'yahoo.com'].map(d => (
              <button key={d} onClick={() => setDomain(d)}
                className="tag tag-cyan"
                style={{ cursor: 'pointer', border: 'none', background: 'rgba(0,212,255,0.08)', padding: '0.2rem 0.65rem' }}>
                {d}
              </button>
            ))}
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-green)', animation: 'pulse 1.5s infinite' }} />
              Backend: http://127.0.0.1:8000
            </div>
          </div>
        </div>
      </div>

      {/* Scan Progress */}
      {scanning && (
        <div className="card animate-scale" style={{ marginBottom: '1.25rem' }}>
          <div className="card-header">
            <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block', fontSize: '1rem' }}>⟳</span>
              Scanning <span className="mono text-cyan" style={{ fontSize: '0.9rem' }}>{domain}</span>…
            </span>
            <span className="tag tag-cyan">{progress}%</span>
          </div>
          <div className="card-body">
            <div className="progress-bar-wrap" style={{ marginBottom: '1.5rem' }}>
              <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
            </div>
            <div className="scan-progress">
              {SCAN_STEPS.map((step, i) => (
                <div key={step.id}
                  className={`progress-step ${i < stepIdx ? 'done' : i === stepIdx ? 'active' : ''}`}>
                  <span className="progress-icon">
                    {i < stepIdx ? '✓' : i === stepIdx
                      ? <span style={{ display: 'inline-block', animation: 'pulse 0.8s infinite' }}>◌</span>
                      : '○'
                    }
                  </span>
                  {step.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {result && !scanning && (
        <div className="animate-fade">
          {/* Score Banner */}
          <div className="card" style={{ marginBottom: '1.25rem' }}>
            <div className="card-body" style={{
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem'
            }}>
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                  {result.domain}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                  <span className={`tag ${source === 'live' ? 'tag-green' : 'tag-amber'}`}>
                    {source === 'live' ? '🌐 Live DNS Scan' : '⚡ Demo Scan'}
                  </span>
                  <span className="tag tag-purple">Grade: {result.grade}</span>
                  <span className="tag tag-cyan">{result.checks?.length || 7} Checks Performed</span>
                </div>
              </div>

              {/* Big Score */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    fontFamily: 'var(--font-display)', fontSize: '3.5rem', fontWeight: 700,
                    lineHeight: 1, color: getScoreColor(result.score)
                  }}>{result.score}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>THREAT SCORE / 100</div>
                </div>
                {/* Mini score arc */}
                <svg width="80" height="80" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(26,58,92,0.6)" strokeWidth="6" />
                  <circle cx="40" cy="40" r="32" fill="none"
                    stroke={getScoreColor(result.score)} strokeWidth="6"
                    strokeDasharray={`${2 * Math.PI * 32}`}
                    strokeDashoffset={`${2 * Math.PI * 32 * (1 - result.score / 100)}`}
                    strokeLinecap="round"
                    transform="rotate(-90 40 40)"
                    style={{ transition: 'stroke-dashoffset 1s ease' }}
                  />
                </svg>

                <button className="btn btn-outline" style={{ fontSize: '0.8rem' }}
                  onClick={() => toast.success('PDF export — connect to backend /api/reports/{id}')}>
                  ↓ Export PDF
                </button>
              </div>
            </div>

            {/* Blockchain record bar */}
            {result.tx_hash && (
              <div style={{
                padding: '0.75rem 1.5rem',
                background: 'rgba(124,58,237,0.06)',
                borderTop: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                fontSize: '0.8rem', color: '#A78BFA', flexWrap: 'wrap'
              }}>
                <span>⛓</span>
                <span>Recorded on Ethereum Sepolia Testnet</span>
                <span className="mono" style={{ color: 'var(--accent-cyan)' }}>Tx: {result.tx_hash}</span>
                <span className="chain-badge" style={{ marginLeft: 'auto' }}>Confirmed</span>
              </div>
            )}
          </div>

          {/* AI Cryptographic Threat Assessment */}
          {result.ai_analysis?.content && (
            <div className="card animate-fade-in" style={{
              marginBottom: '1.25rem',
              borderLeft: '4px solid var(--accent-cyan)',
              background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.05) 0%, rgba(5, 11, 24, 0.7) 100%)'
            }}>
              <div className="card-header" style={{ paddingBottom: '0.4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.1rem' }}>🤖</span>
                  <span className="card-title">AI Cryptographic Threat Assessment</span>
                </div>
                <span className="tag" style={{
                  background: 'rgba(0,212,255,0.15)',
                  color: 'var(--accent-cyan)',
                  border: '1px solid rgba(0,212,255,0.3)',
                  fontSize: '0.75rem'
                }}>
                  {result.ai_analysis.source === 'gemini-1.5-flash' ? 'Google Gemini 1.5 Flash' : 'AI Security Engine'}
                </span>
              </div>
              <div className="card-body" style={{
                color: 'var(--text-secondary)',
                fontSize: '0.88rem',
                lineHeight: 1.6
              }}>
                {result.ai_analysis.content}
              </div>
            </div>
          )}

          {/* Checks + TLS grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
            {/* Security Checks */}
            <div className="card">
              <div className="card-header">
                <span className="card-title">Security Checks</span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <span className="tag tag-red">{result.checks?.filter(c => c.status === 'fail').length} Failed</span>
                  <span className="tag tag-amber">{result.checks?.filter(c => c.status === 'warn').length} Warn</span>
                  <span className="tag tag-green">{result.checks?.filter(c => c.status === 'pass').length} Pass</span>
                </div>
              </div>
              <div className="card-body">
                <div className="check-list">
                  {(result.checks || []).map((c, i) => (
                    <div className="check-item" key={c.id || i} style={{ animationDelay: `${i * 0.06}s` }}>
                      <div className={`check-dot ${getStatusDot(c.status)}`}>{getStatusIcon(c.status)}</div>
                      <span className="check-name">{c.name}</span>
                      <span className="check-val" style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {c.value}
                      </span>
                      <span className={`severity-badge ${getSeverityClass(c.severity)}`}>{c.severity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* TLS / Recommendations */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="card">
                <div className="card-header"><span className="card-title">TLS / SMTP Details</span></div>
                <div className="card-body">
                  {result.tls_details && Object.entries({
                    'TLS Version':  result.tls_details.value || result.tls_details.version || '—',
                    'STARTTLS':     result.tls_details.starttls !== undefined ? (result.tls_details.starttls ? 'Supported' : 'Not supported') : 'Checked',
                    'HSTS':         result.tls_details.hsts !== undefined ? (result.tls_details.hsts ? 'Present' : 'Missing') : '—',
                    'Status':       result.tls_details.status || '—',
                  }).map(([k, v]) => (
                    <div key={k} style={{
                      display: 'flex', justifyContent: 'space-between',
                      padding: '0.6rem 0', borderBottom: '1px solid rgba(26,58,92,0.4)', fontSize: '0.85rem'
                    }}>
                      <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                      <span className="mono" style={{
                        fontSize: '0.8rem', fontWeight: 600,
                        color: v === 'TLS 1.3' || v === 'Supported' || v === 'Present' || v === 'pass'
                          ? 'var(--accent-green)' : v === 'Missing' || v === 'fail' || v?.includes('1.0') || v?.includes('1.1')
                          ? 'var(--accent-red)' : 'var(--text-primary)'
                      }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              {result.recommendations?.length > 0 && (
                <div className="card">
                  <div className="card-header">
                    <span className="card-title">Recommendations</span>
                    <span className="tag tag-red">{result.recommendations.length} Issues</span>
                  </div>
                  <div className="card-body" style={{ maxHeight: 200, overflowY: 'auto' }}>
                    {result.recommendations.map((r, i) => (
                      <div key={i} style={{
                        padding: '0.6rem 0', borderBottom: '1px solid rgba(26,58,92,0.3)',
                        fontSize: '0.82rem'
                      }}>
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.2rem' }}>
                          <span style={{ fontWeight: 600 }}>{r.check}</span>
                          <span className={`severity-badge ${getSeverityClass(r.severity)}`}>{r.severity}</span>
                        </div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{r.detail}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Recommended DNS config */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Auto-Generated Hardened Config</span>
              <button className="btn btn-outline" style={{ fontSize: '0.78rem', padding: '0.3rem 0.75rem' }}
                onClick={() => { navigator.clipboard.writeText(`v=spf1 include:_spf.${result.domain} -all`); toast.success('Copied!'); }}>
                Copy ⎘
              </button>
            </div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem' }}>
                {[
                  { label: 'SPF (TXT)', val: `v=spf1 include:_spf.${result.domain} -all`, color: 'var(--accent-cyan)' },
                  { label: 'DMARC (TXT)', val: `v=DMARC1; p=reject; pct=100; rua=mailto:dmarc@${result.domain}`, color: 'var(--accent-green)' },
                  { label: 'TLS Policy', val: `SMTP require TLS 1.3\nSTARTTLS enforced\nHSTS: max-age=31536000`, color: '#A78BFA' },
                ].map(item => (
                  <div key={item.label} style={{
                    background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border)',
                    borderRadius: 8, padding: '0.85rem'
                  }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600, textTransform: 'uppercase' }}>
                      {item.label}
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-mono)', fontSize: '0.72rem',
                      color: item.color, lineHeight: 1.7, wordBreak: 'break-all'
                    }}>{item.val}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
