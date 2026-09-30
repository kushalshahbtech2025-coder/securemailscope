import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { getScoreColor, AUDIT_LOGS, createNewAuditRecord } from '../data/mockData.js';
import { getBlockchainLogs } from '../data/api.js';
import { soundManager } from '../data/sound.js';

const NETWORKS = [
  { id: 'sepolia',  name: 'Ethereum Sepolia', icon: '⟠', blockTime: '12s', gasPrice: '18 Gwei', contract: '0x71C8…2bC8' },
  { id: 'arbitrum', name: 'Arbitrum One',     icon: '🔵', blockTime: '0.25s', gasPrice: '0.1 Gwei', contract: '0x99A0…77EE' },
  { id: 'polygon',  name: 'Polygon zkEVM',    icon: '🟣', blockTime: '2s', gasPrice: '1.2 Gwei', contract: '0x3F82…8B90' },
  { id: 'besu',     name: 'Hyperledger Besu', icon: '🏛️', blockTime: '1s', gasPrice: 'Zero Gas', contract: '0xBESU…0042' },
];

export default function AuditLog({ apiOnline }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedTx, setSelectedTx] = useState(null);
  const [activeNetwork, setActiveNetwork] = useState(NETWORKS[0]);
  const [isMining, setIsMining] = useState(false);
  const [miningStep, setMiningStep] = useState(0);
  const [liveStream, setLiveStream] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const result = await getBlockchainLogs(20, 0);
      setLogs(result.records || AUDIT_LOGS);
      setLoading(false);
    }
    load();
  }, []);

  // Live stream auto-transaction simulation
  useEffect(() => {
    if (!liveStream) return;
    const sampleDomains = [
      { domain: 'cloudflare.com', score: 98, grade: 'A+' },
      { domain: 'defense-cloud.mil', score: 95, grade: 'A' },
      { domain: 'veritas-ledger.io', score: 89, grade: 'B+' },
      { domain: 'apex-mail.ai', score: 92, grade: 'A' },
      { domain: 'insecure-relay.org', score: 35, grade: 'E' },
    ];
    let counter = 0;
    const interval = setInterval(() => {
      const pick = sampleDomains[counter % sampleDomains.length];
      counter++;
      const nextBlock = (logs[0]?.block || 4833) + 1;
      const newTx = createNewAuditRecord(pick.domain, pick.score, pick.grade, nextBlock);
      newTx.network = activeNetwork.name;
      setLogs(prev => [newTx, ...prev]);
      soundManager.playClick();
      toast.success(`⛓️ New Audit Tx mined on Block #${nextBlock} (${pick.domain})`, {
        icon: '◈',
        style: { background: '#0D0028', color: '#00D4FF', border: '1px solid rgba(0,212,255,0.2)' }
      });
    }, 7000);
    return () => clearInterval(interval);
  }, [liveStream, logs, activeNetwork]);

  const filtered = logs.filter(log => {
    if (search && !log.domain?.toLowerCase().includes(search.toLowerCase()) && !log.txHash?.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (filter === 'pass' && log.score < 80) return false;
    if (filter === 'risk' && (log.score >= 80 || log.score < 50)) return false;
    if (filter === 'critical' && log.score >= 50) return false;
    return true;
  });

  // Interactive Miner simulation
  async function triggerMining() {
    soundManager.playClick();
    setIsMining(true);
    setMiningStep(1); // 1: Hashing payload
    await new Promise(r => setTimeout(r, 600));
    setMiningStep(2); // 2: Merkle Tree aggregation
    await new Promise(r => setTimeout(r, 700));
    setMiningStep(3); // 3: Broadcasting to network nodes
    await new Promise(r => setTimeout(r, 800));
    setMiningStep(4); // 4: Consensus achieved

    const nextBlock = (logs[0]?.block || 4833) + 1;
    const customRecord = createNewAuditRecord('securescope-node.internal', 97, 'A+', nextBlock);
    customRecord.network = activeNetwork.name;
    setLogs(prev => [customRecord, ...prev]);
    soundManager.playSuccess();
    toast.success(`🎉 Block #${nextBlock} committed to ${activeNetwork.name}!`);
    setTimeout(() => {
      setIsMining(false);
      setMiningStep(0);
      setSelectedTx(customRecord);
    }, 500);
  }

  const copyToClipboard = (text, msg = 'Copied to clipboard!') => {
    navigator.clipboard.writeText(text);
    soundManager.playClick();
    toast.success(msg);
  };

  return (
    <div className="animate-fade">
      {/* Header section with live network status */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800 }}>
              Blockchain Security Audit Ledger
            </h2>
            <span className="tag tag-cyan" style={{ fontSize: '0.72rem', letterSpacing: '0.05em' }}>
              EVM IMMUTABLE
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '680px' }}>
            Every cryptographic assessment and MTA verification is signed via ECDSA, bundled into a Merkle tree, and anchored to decentralized smart contracts.
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
          {/* Live auto stream toggle */}
          <button
            onClick={() => {
              setLiveStream(!liveStream);
              soundManager.playClick();
              toast(liveStream ? 'Live auto-stream paused' : '⚡ Live transaction stream activated');
            }}
            className={liveStream ? 'btn btn-primary' : 'btn btn-outline'}
            style={{ fontSize: '0.8rem', padding: '0.45rem 0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <span style={{
              width: 8, height: 8, borderRadius: '50%',
              background: liveStream ? '#00FF88' : 'var(--text-muted)',
              boxShadow: liveStream ? '0 0 8px #00FF88' : 'none'
            }} />
            {liveStream ? 'Live Stream Active' : 'Enable Live Stream'}
          </button>

          {/* Mine Block Button */}
          <button
            onClick={triggerMining}
            disabled={isMining}
            className="btn btn-primary"
            style={{
              fontSize: '0.82rem', padding: '0.45rem 1rem',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              background: 'linear-gradient(135deg, #00FFA3 0%, #00F5FF 100%)',
              color: '#030712', fontWeight: 800,
              border: 'none', boxShadow: '0 0 16px rgba(0, 245, 255, 0.3)'
            }}
          >
            {isMining ? '⛏️ Mining Block…' : '⛏️ Mine New Audit Block'}
          </button>
        </div>
      </div>

      {/* Network Selector Tabs */}
      <div style={{
        display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', overflowX: 'auto',
        paddingBottom: '0.25rem'
      }}>
        {NETWORKS.map(net => {
          const isCurrent = activeNetwork.id === net.id;
          return (
            <button
              key={net.id}
              onClick={() => {
                setActiveNetwork(net);
                soundManager.playClick();
              }}
              style={{
                background: isCurrent ? 'rgba(0, 245, 255, 0.12)' : 'rgba(255,255,255,0.03)',
                border: isCurrent ? '1px solid var(--accent-cyan)' : '1px solid var(--border)',
                borderRadius: '10px',
                padding: '0.55rem 0.95rem',
                display: 'flex', alignItems: 'center', gap: '0.6rem',
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: isCurrent ? '0 0 14px rgba(0, 245, 255, 0.25)' : 'none'
              }}
            >
              <span style={{ fontSize: '1.1rem' }}>{net.icon}</span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: isCurrent ? '#FFF' : 'var(--text-secondary)' }}>
                  {net.name}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                  {net.blockTime} · {net.gasPrice}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Chain Stats Banner */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
        {[
          { label: 'Total Verified Audits', value: logs.length, color: 'var(--accent-cyan)', icon: '⛓', sub: `${activeNetwork.name}` },
          { label: 'Latest Block Height', value: `#${logs[0]?.block || 4833}`, color: 'var(--accent-gold)', icon: '◈', sub: 'PoS Finalized' },
          { label: 'Active Smart Contract', value: activeNetwork.contract, color: 'var(--accent-green)', icon: '📜', sub: 'Verified ABI' },
          { label: 'Average Gas Used', value: '22,410 gas', color: 'var(--accent-amber)', icon: '⚡', sub: '~0.00042 ETH ($1.42)' },
        ].map((s, i) => (
          <div className="stat-card" key={i} style={{ '--accent-color': s.color, position: 'relative', overflow: 'hidden' }}>
            <div className="stat-card-icon">{s.icon}</div>
            <div className="stat-card-label">{s.label}</div>
            <div className="stat-card-value" style={{ color: s.color, fontSize: '1.35rem', margin: '0.2rem 0' }}>
              {s.value}
            </div>
            <div className="stat-card-sub" style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>
              {s.sub}
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Mining Modal */}
      <AnimatePresence>
        {isMining && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="card"
            style={{
              marginBottom: '1.25rem',
              background: 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(6,182,212,0.08))',
              border: '1px solid rgba(139,92,246,0.35)',
              boxShadow: '0 8px 32px rgba(139,92,246,0.15)'
            }}
          >
            <div className="card-body" style={{ padding: '1.25rem 1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{ animation: 'spin 1.2s linear infinite', display: 'inline-block', fontSize: '1.2rem' }}>⚙️</span>
                  <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#FFF' }}>
                    Mining Transaction to {activeNetwork.name}…
                  </span>
                </div>
                <span className="mono" style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)' }}>
                  STAGE {miningStep} OF 4
                </span>
              </div>

              {/* Step indicator bars */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '0.75rem' }}>
                {[
                  '1. SHA-256 Hash',
                  '2. Merkle Tree Leaf',
                  '3. Node P2P Broadcast',
                  '4. State Finality'
                ].map((st, i) => (
                  <div key={i} style={{
                    padding: '0.5rem',
                    background: miningStep > i ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.03)',
                    border: miningStep > i ? '1px solid var(--accent-green)' : '1px solid var(--border)',
                    borderRadius: '6px',
                    fontSize: '0.72rem',
                    color: miningStep > i ? 'var(--accent-green)' : 'var(--text-muted)',
                    textAlign: 'center',
                    fontWeight: miningStep > i ? 600 : 400
                  }}>
                    {st}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter and Search Bar */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div className="card-body" style={{ padding: '0.85rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          {/* Search */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)',
            borderRadius: 8, padding: '0.45rem 0.85rem', flex: 1, minWidth: 260
          }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>🔍</span>
            <input
              type="text"
              placeholder="Search by domain, block # or 0x tx hash…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: '0.85rem', flex: 1 }}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {[
              { key: 'all',      label: 'All Transactions' },
              { key: 'pass',     label: '✓ Grade A / Secure' },
              { key: 'risk',     label: '⚠ Moderate Risk' },
              { key: 'critical', label: '✗ High Vulnerability' },
            ].map(f => (
              <button
                key={f.key}
                onClick={() => {
                  setFilter(f.key);
                  soundManager.playClick();
                }}
                className={filter === f.key ? 'btn btn-primary' : 'btn btn-outline'}
                style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Records count & Export */}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Showing {filtered.length} of {logs.length} audits
            </span>
            <button
              className="btn btn-outline"
              style={{ fontSize: '0.78rem', padding: '0.35rem 0.8rem' }}
              onClick={() => {
                const jsonStr = JSON.stringify(filtered, null, 2);
                const blob = new Blob([jsonStr], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `securemailscope-blockchain-audit-${Date.now()}.json`;
                a.click();
                toast.success('Downloaded complete blockchain audit ledger');
              }}
            >
              ↓ Export JSON
            </button>
          </div>
        </div>
      </div>

      {/* Main Ledger Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</div>
            <div style={{ color: 'var(--text-muted)', marginTop: '0.75rem', fontSize: '0.875rem' }}>
              Synchronizing cryptographic records with node…
            </div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="log-table">
              <thead>
                <tr>
                  <th>Block Height</th>
                  <th>Target Domain</th>
                  <th>Security Score</th>
                  <th>Grade</th>
                  <th>Transaction Hash</th>
                  <th>Gas Used</th>
                  <th>Timestamp</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence initial={false}>
                  {filtered.map((log, i) => (
                    <motion.tr
                      key={log.id || log.txHash || i}
                      initial={log.isNewlyMined ? { opacity: 0, backgroundColor: 'rgba(139,92,246,0.25)' } : { opacity: 0 }}
                      animate={{ opacity: 1, backgroundColor: 'transparent' }}
                      transition={{ duration: 0.4 }}
                      style={{ cursor: 'pointer' }}
                      onClick={() => {
                        setSelectedTx(log);
                        soundManager.playClick();
                      }}
                    >
                      <td>
                        <span className="chain-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                          <span style={{ fontSize: '0.75rem' }}>◈</span>
                          #{log.block}
                        </span>
                      </td>
                      <td>
                        <span className="mono" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                          {log.domain}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ width: 44, height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                            <div style={{ width: `${log.score}%`, height: '100%', background: getScoreColor(log.score), borderRadius: 3 }} />
                          </div>
                          <span style={{ color: getScoreColor(log.score), fontWeight: 700, fontSize: '0.85rem' }}>
                            {log.score}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.95rem', color: getScoreColor(log.score) }}>
                          {log.grade}
                        </span>
                      </td>
                      <td>
                        <span
                          className="tx-hash"
                          title="Click to copy hash"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(log.txHash || log.tx_hash, 'Transaction Hash copied!');
                          }}
                        >
                          {(log.txHash || log.tx_hash)?.slice(0, 10)}…{(log.txHash || log.tx_hash)?.slice(-6)}
                        </span>
                      </td>
                      <td>
                        <span className="mono" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                          {log.gasUsed ? `${log.gasUsed.toLocaleString()} gas` : '21,800 gas'}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {log.timestamp}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-outline"
                          style={{ padding: '0.2rem 0.55rem', fontSize: '0.72rem' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTx(log);
                            soundManager.playClick();
                          }}
                        >
                          Inspect ↗
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>

            {filtered.length === 0 && (
              <div style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                No blockchain records match your search query.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Transaction Details Inspector Modal / Drawer */}
      <AnimatePresence>
        {selectedTx && (
          <div
            style={{
              position: 'fixed', inset: 0, zIndex: 100,
              background: 'rgba(5, 0, 20, 0.75)',
              backdropFilter: 'blur(8px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '1.5rem'
            }}
            onClick={() => setSelectedTx(null)}
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 15 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              style={{
                width: '100%', maxWidth: '720px',
                background: '#0D0028',
                border: '1px solid rgba(139,92,246,0.3)',
                borderRadius: '16px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.8), 0 0 30px rgba(139,92,246,0.2)',
                overflow: 'hidden'
              }}
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Topbar */}
              <div style={{
                padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: 'rgba(255,255,255,0.02)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{ fontSize: '1.2rem' }}>📜</span>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
                      On-Chain Security Receipt
                    </h3>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Block #{selectedTx.block} · {selectedTx.network || activeNetwork.name}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTx(null)}
                  style={{
                    background: 'rgba(255,255,255,0.06)', border: 'none',
                    color: 'var(--text-secondary)', width: 28, height: 28,
                    borderRadius: '50%', cursor: 'pointer', display: 'flex',
                    alignItems: 'center', justifyContent: 'center'
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Modal Content */}
              <div style={{ padding: '1.5rem', maxHeight: '72vh', overflowY: 'auto' }}>
                {/* Status Hero */}
                <div style={{
                  padding: '1rem', borderRadius: '10px',
                  background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem'
                }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--accent-green)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      Status
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#FFF' }}>
                      Confirmed & Sealed on Ledger
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: getScoreColor(selectedTx.score) }}>
                      {selectedTx.score}/100 ({selectedTx.grade})
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      Assessed Posture
                    </div>
                  </div>
                </div>

                {/* Key Values List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
                  {[
                    { label: 'Target Domain', val: selectedTx.domain, mono: true, copy: selectedTx.domain },
                    { label: 'Transaction Hash', val: selectedTx.txHash || selectedTx.tx_hash, mono: true, copy: selectedTx.txHash || selectedTx.tx_hash, color: 'var(--accent-cyan)' },
                    { label: 'Smart Contract', val: activeNetwork.contract, mono: true, copy: activeNetwork.contract },
                    { label: 'Gas Consumption', val: `${selectedTx.gasUsed || 21840} gas (${selectedTx.gasFeeEth || '0.000412 ETH'})` },
                    { label: 'Merkle Root Hash', val: selectedTx.merkleRoot || '0x7e812d4a9b64c01287f39d2c1840aef53182dcba7921e0', mono: true, copy: selectedTx.merkleRoot },
                    { label: 'Decentralized Storage (IPFS CID)', val: selectedTx.ipfsCid || 'bafybeih4j7qm5k26d7m2wqu7l8n0px2q8a1z4v7b9', mono: true, copy: selectedTx.ipfsCid, color: 'var(--accent-gold)' },
                  ].map((row, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '0.6rem 0.8rem', background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.04)', borderRadius: 8
                      }}
                    >
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', minWidth: 140 }}>
                        {row.label}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', maxWidth: '65%' }}>
                        <span
                          className={row.mono ? 'mono' : ''}
                          style={{
                            color: row.color || 'var(--text-primary)',
                            fontSize: row.mono ? '0.76rem' : '0.84rem',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                          }}
                        >
                          {row.val}
                        </span>
                        {row.copy && (
                          <button
                            title="Copy"
                            onClick={() => copyToClipboard(row.copy)}
                            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.75rem' }}
                          >
                            📋
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Merkle Proof Tree Diagram */}
                <div style={{ marginTop: '1.25rem' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                    Merkle Cryptographic Inclusion Proof:
                  </div>
                  <div style={{
                    background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border)',
                    borderRadius: 8, padding: '0.85rem', fontFamily: 'var(--font-mono)', fontSize: '0.72rem',
                    lineHeight: 1.6
                  }}>
                    <div style={{ color: 'var(--accent-green)' }}>
                      [Leaf] H(Domain: "{selectedTx.domain}" + Score: {selectedTx.score} + TLS: 1.3)
                    </div>
                    <div style={{ color: 'var(--text-muted)', paddingLeft: '1rem' }}>
                      ↳ Combined with Sibling Hash [0x9b4f…31a0]
                    </div>
                    <div style={{ color: 'var(--accent-cyan)', paddingLeft: '2rem' }}>
                      ↳ Merkle Branch: 0x8a91…c820
                    </div>
                    <div style={{ color: 'var(--accent-gold)', paddingLeft: '3rem', fontWeight: 600 }}>
                      ↳ State Root: {selectedTx.merkleRoot?.slice(0, 24) || '0x7e812d4a9b64c01287f39d2c'}… ✓ VERIFIED
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div style={{
                padding: '1rem 1.5rem', borderTop: '1px solid var(--border)',
                display: 'flex', justifyContent: 'flex-end', gap: '0.75rem',
                background: 'rgba(255,255,255,0.02)'
              }}>
                <button
                  className="btn btn-outline"
                  onClick={() => setSelectedTx(null)}
                  style={{ fontSize: '0.8rem', padding: '0.4rem 1rem' }}
                >
                  Close Receipt
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => copyToClipboard(selectedTx.txHash || selectedTx.tx_hash, 'Hash copied for Etherscan verification')}
                  style={{ fontSize: '0.8rem', padding: '0.4rem 1rem' }}
                >
                  Verify On Etherscan
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Smart Contract Panel */}
      <div className="card" style={{ marginTop: '1.25rem' }}>
        <div className="card-header">
          <span className="card-title">Deployed Smart Contract — AuditLog.sol</span>
          <span className="tag tag-cyan">{activeNetwork.name}</span>
        </div>
        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {/* Details */}
            <div>
              {[
                { label: 'Contract Address', val: activeNetwork.contract, mono: true, color: 'var(--accent-cyan)' },
                { label: 'Target Network', val: activeNetwork.name },
                { label: 'Consensus Mechanism', val: 'Proof of Stake (PoS) Finality' },
                { label: 'Compiler Version', val: 'Solidity ^0.8.24 + Via-IR Optimizer' },
                { label: 'Off-Chain Archival', val: 'Pinata IPFS Decentralized Pinning' },
                { label: 'Cryptographic Primitive', val: 'Keccak-256 + ECDSA Signature' },
              ].map(r => (
                <div key={r.label} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '0.6rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.85rem'
                }}>
                  <span style={{ color: 'var(--text-muted)' }}>{r.label}</span>
                  <span className={r.mono ? 'mono' : ''} style={{ color: r.color || 'var(--text-primary)', fontSize: r.mono ? '0.78rem' : undefined }}>
                    {r.val}
                  </span>
                </div>
              ))}
            </div>

            {/* Solidity Code Preview */}
            <div style={{
              background: 'rgba(0,0,0,0.45)', border: '1px solid var(--border)',
              borderRadius: 10, padding: '1.25rem',
              fontFamily: 'var(--font-mono)', fontSize: '0.74rem',
              lineHeight: 1.85, overflowX: 'auto'
            }}>
              <div style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>// SPDX-License-Identifier: MIT</div>
              <div>
                <span style={{ color: 'var(--accent-cyan)' }}>event</span>
                <span style={{ color: 'var(--text-primary)' }}> AuditRecorded(</span>
              </div>
              <div style={{ paddingLeft: '1rem', color: 'var(--text-secondary)' }}>
                string indexed domain, uint8 score, bytes32 reportHash
              </div>
              <div><span style={{ color: 'var(--text-primary)' }}>);</span></div>
              <br />
              <div>
                <span style={{ color: 'var(--accent-cyan)' }}>function</span>
                <span style={{ color: '#E8F4FD' }}> recordAudit(</span>
                <span style={{ color: 'var(--text-secondary)' }}>string calldata domain, uint8 score, bytes32 root</span>
                <span style={{ color: '#E8F4FD' }}>)</span>
                <span style={{ color: 'var(--accent-cyan)' }}> external </span>
                <span style={{ color: 'var(--accent-green)' }}>returns</span>
                <span style={{ color: '#E8F4FD' }}> (bytes32 txHash) {'{'}</span>
              </div>
              <div style={{ paddingLeft: '1rem', color: 'var(--accent-green)' }}>
                bytes32 leaf = keccak256(abi.encodePacked(domain, score, block.timestamp));
              </div>
              <div style={{ paddingLeft: '1rem', color: 'var(--text-secondary)' }}>
                emit AuditRecorded(domain, score, leaf);
              </div>
              <div style={{ paddingLeft: '1rem', color: 'var(--text-muted)' }}>
                return leaf;
              </div>
              <div><span style={{ color: '#E8F4FD' }}>{'}'}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
