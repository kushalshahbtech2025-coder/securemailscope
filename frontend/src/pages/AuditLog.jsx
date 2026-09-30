import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getScoreColor } from '../data/mockData.js';
import { getBlockchainLogs } from '../data/api.js';

export default function AuditLog({ apiOnline }) {
  const [logs,    setLogs]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState('all');
  const [search,  setSearch]  = useState('');
  const [meta,    setMeta]    = useState({ total: 0, contract: '0xABcD…0001', network: 'Ethereum Sepolia' });

  useEffect(() => {
    async function load() {
      setLoading(true);
      const result = await getBlockchainLogs(20, 0);
      setLogs(result.records || []);
      if (result.total) setMeta(m => ({ ...m, total: result.total }));
      if (result.contract) setMeta(m => ({ ...m, contract: result.contract }));
      setLoading(false);
    }
    load();
  }, []);

  const filtered = logs.filter(log => {
    if (search && !log.domain?.includes(search.toLowerCase())) return false;
    if (filter === 'pass'     && log.score <  80) return false;
    if (filter === 'risk'     && (log.score >= 80 || log.score < 50)) return false;
    if (filter === 'critical' && log.score >= 50) return false;
    return true;
  });

  return (
    <div className="animate-fade">
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.4rem' }}>
          Blockchain Audit Ledger
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Every scan is cryptographically hashed and recorded on Ethereum — tamper-proof, immutable, permanent.
        </p>
      </div>

      {/* Chain Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem', marginBottom: '1.25rem' }}>
        {[
          { label: 'Total Records',      value: meta.total || logs.length, color: 'var(--accent-cyan)',   icon: '⛓', live: apiOnline },
          { label: 'Latest Block',       value: '#4821',                   color: '#A78BFA',              icon: '◈', live: false },
          { label: 'Network',            value: 'Sepolia',                 color: 'var(--accent-amber)',  icon: '🌐', live: false },
          { label: 'Avg Confirmation',   value: '~12 sec',                 color: 'var(--accent-green)',  icon: '⚡', live: false },
        ].map((s, i) => (
          <div className="stat-card" key={i} style={{ '--accent-color': s.color }}>
            <div className="stat-card-icon">{s.icon}</div>
            <div className="stat-card-label">{s.label}</div>
            <div className="stat-card-value" style={{ color: s.color, fontSize: '1.5rem' }}>{s.value}</div>
            {s.live && <div className="stat-card-sub" style={{ color: 'var(--accent-green)', fontSize: '0.7rem' }}>● Live data</div>}
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div className="card-body" style={{ padding: '0.85rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          {/* Search */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)',
            borderRadius: 8, padding: '0.4rem 0.85rem', flex: 1, maxWidth: 280
          }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>🔍</span>
            <input type="text" placeholder="Search domain…" value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: '0.875rem', flex: 1 }}
            />
          </div>
          {/* Filters */}
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {[
              { key: 'all',      label: 'All' },
              { key: 'pass',     label: '✓ Secure' },
              { key: 'risk',     label: '⚠ At Risk' },
              { key: 'critical', label: '✗ Critical' },
            ].map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)}
                className={filter === f.key ? 'btn btn-primary' : 'btn btn-outline'}
                style={{ fontSize: '0.78rem', padding: '0.35rem 0.8rem' }}>
                {f.label}
              </button>
            ))}
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{filtered.length} records</span>
            <button className="btn btn-outline" style={{ fontSize: '0.78rem', padding: '0.35rem 0.8rem' }}
              onClick={() => toast.success('Export to JSON / CSV — backend endpoint ready')}>
              ↓ Export
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</div>
            <div style={{ color: 'var(--text-muted)', marginTop: '0.75rem', fontSize: '0.875rem' }}>Fetching blockchain records…</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="log-table">
              <thead>
                <tr>
                  <th>Block</th>
                  <th>Domain</th>
                  <th>Score</th>
                  <th>Grade</th>
                  <th>Transaction Hash</th>
                  <th>Timestamp</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((log, i) => (
                  <tr key={log.id || i} style={{ animation: `fadeIn 0.3s ease ${i * 0.04}s both` }}>
                    <td><span className="chain-badge">#{log.block}</span></td>
                    <td>
                      <span className="mono" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{log.domain}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: 48, height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                          <div style={{ width: `${log.score}%`, height: '100%', background: getScoreColor(log.score), borderRadius: 3 }} />
                        </div>
                        <span style={{ color: getScoreColor(log.score), fontWeight: 700, fontSize: '0.875rem' }}>{log.score}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: getScoreColor(log.score) }}>
                        {log.grade}
                      </span>
                    </td>
                    <td>
                      <span className="tx-hash"
                        style={{ cursor: 'pointer' }}
                        title="Click to copy"
                        onClick={() => { navigator.clipboard.writeText(log.tx_hash || log.txHash || ''); toast.success('TX hash copied!'); }}>
                        {log.tx_hash || log.txHash}
                      </span>
                    </td>
                    <td><span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{log.timestamp}</span></td>
                    <td><span className="tag tag-green">✓ Confirmed</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                No records match your filter.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Smart Contract Panel */}
      <div className="card" style={{ marginTop: '1.25rem' }}>
        <div className="card-header">
          <span className="card-title">Smart Contract — AuditLog.sol</span>
          <span className="tag tag-purple">Ethereum Sepolia</span>
        </div>
        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            {/* Details */}
            <div>
              {[
                { label: 'Contract Address', val: meta.contract || '0xABcD…0001', mono: true, color: 'var(--accent-cyan)' },
                { label: 'Network',          val: meta.network || 'Ethereum Sepolia Testnet' },
                { label: 'Compiler',         val: 'Solidity ^0.8.0' },
                { label: 'License',          val: 'MIT' },
                { label: 'Storage',          val: 'IPFS (Pinata)' },
                { label: 'Hash Function',    val: 'SHA-256' },
              ].map(r => (
                <div key={r.label} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '0.6rem 0', borderBottom: '1px solid rgba(26,58,92,0.35)', fontSize: '0.85rem'
                }}>
                  <span style={{ color: 'var(--text-muted)' }}>{r.label}</span>
                  <span className={r.mono ? 'mono' : ''} style={{ color: r.color || 'var(--text-primary)', fontSize: r.mono ? '0.78rem' : undefined }}>
                    {r.val}
                  </span>
                </div>
              ))}
            </div>
            {/* Solidity snippet */}
            <div style={{
              background: 'rgba(0,0,0,0.45)', border: '1px solid var(--border)',
              borderRadius: 10, padding: '1.25rem',
              fontFamily: 'var(--font-mono)', fontSize: '0.72rem',
              lineHeight: 1.85
            }}>
              <div style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>// AuditLog.sol</div>
              <div>
                <span style={{ color: '#7C3AED' }}>struct</span>
                <span style={{ color: 'var(--text-primary)' }}> ScanRecord {'{'}</span>
              </div>
              <div style={{ paddingLeft: '1rem' }}>
                <span style={{ color: 'var(--accent-green)' }}>string</span>
                <span style={{ color: 'var(--text-secondary)' }}> domain;</span>
              </div>
              <div style={{ paddingLeft: '1rem' }}>
                <span style={{ color: 'var(--accent-green)' }}>uint8</span>
                <span style={{ color: 'var(--text-secondary)' }}> score;</span>
              </div>
              <div style={{ paddingLeft: '1rem' }}>
                <span style={{ color: 'var(--accent-green)' }}>bytes32</span>
                <span style={{ color: 'var(--text-secondary)' }}> reportHash;</span>
              </div>
              <div style={{ paddingLeft: '1rem' }}>
                <span style={{ color: 'var(--accent-green)' }}>uint256</span>
                <span style={{ color: 'var(--text-secondary)' }}> timestamp;</span>
              </div>
              <div style={{ color: 'var(--text-primary)' }}>{'}'}</div>
              <br />
              <div>
                <span style={{ color: 'var(--accent-cyan)' }}>function</span>
                <span style={{ color: '#E8F4FD' }}> logScan(</span>
              </div>
              <div style={{ paddingLeft: '1rem', color: 'var(--text-secondary)' }}>
                string memory domain,
              </div>
              <div style={{ paddingLeft: '1rem', color: 'var(--text-secondary)' }}>
                uint8 score,
              </div>
              <div style={{ paddingLeft: '1rem', color: 'var(--text-secondary)' }}>
                bytes32 reportHash
              </div>
              <div>
                <span style={{ color: '#E8F4FD)' }}>)</span>
                <span style={{ color: 'var(--accent-cyan)' }}> public </span>
                <span style={{ color: '#E8F4FD' }}>{'{ … }'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
