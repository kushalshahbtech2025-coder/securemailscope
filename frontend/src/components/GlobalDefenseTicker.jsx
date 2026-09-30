import { useState, useEffect } from 'react';

export default function GlobalDefenseTicker() {
  const [blockHeight, setBlockHeight] = useState(4834);
  const [gasGwei, setGasGwei] = useState('18.2');

  useEffect(() => {
    const interval = setInterval(() => {
      setBlockHeight(b => b + 1);
      setGasGwei((17 + Math.random() * 3).toFixed(1));
    }, 14000);
    return () => clearInterval(interval);
  }, []);

  const TICKER_ITEMS = [
    { icon: '⛓️', label: 'ETHEREUM SEPOLIA', val: `BLOCK #${blockHeight} [FINALIZED]`, color: '#FBBF24' },
    { icon: '⚡', label: 'NETWORK GAS', val: `${gasGwei} GWEI (~$0.00041)`, color: '#00F5FF' },
    { icon: '📜', label: 'SMART CONTRACT', val: '0x71C8…2bC8 (AuditLog.sol)', color: '#00FFA3' },
    { icon: '🛡️', label: 'CRYPTOGRAPHIC DEFENSE', val: 'ZERO-TRUST MTA ENFORCED', color: '#00FFA3' },
    { icon: '🔐', label: 'DNSSEC ROOT', val: 'ANCHOR KEY 20394 ACTIVE', color: '#00F5FF' },
    { icon: '💾', label: 'IPFS DECENTRALIZED STORAGE', val: 'PINATA GATEWAY PINNED', color: '#A855F7' },
    { icon: '🚨', label: 'THREAT DETECTION RADAR', val: 'SURVEILLANCE LEVEL 1', color: '#FF0055' },
  ];

  return (
    <div style={{
      width: '100%', height: '30px',
      background: '#02050B',
      borderBottom: '1px solid rgba(0, 245, 255, 0.2)',
      display: 'flex', alignItems: 'center',
      overflow: 'hidden', whiteSpace: 'nowrap',
      fontSize: '0.7rem', fontFamily: 'var(--font-mono)',
      position: 'relative', zIndex: 100
    }}>
      {/* Label Badge on Left */}
      <div style={{
        background: 'linear-gradient(90deg, #070D18 0%, rgba(7,13,24,0.9) 100%)',
        padding: '0 0.85rem', height: '100%',
        display: 'flex', alignItems: 'center', gap: '0.45rem',
        borderRight: '1px solid rgba(0, 245, 255, 0.25)',
        zIndex: 2, flexShrink: 0
      }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00FFA3', boxShadow: '0 0 8px #00FFA3' }} />
        <span style={{ color: '#00F5FF', fontWeight: 800, letterSpacing: '0.08em' }}>ON-CHAIN FEED</span>
      </div>

      {/* Marquee Ticker Stream */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '2.5rem',
        animation: 'tickerSlide 32s linear infinite',
        paddingLeft: '1rem'
      }}>
        {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, idx) => (
          <div key={idx} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <span>{item.icon}</span>
            <span style={{ color: 'var(--text-muted)' }}>{item.label}:</span>
            <span style={{ color: item.color, fontWeight: 700 }}>{item.val}</span>
            <span style={{ color: 'rgba(255,255,255,0.15)', marginLeft: '1rem' }}>|</span>
          </div>
        ))}
      </div>
    </div>
  );
}
