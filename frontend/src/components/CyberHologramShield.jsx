import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { soundManager } from '../data/sound.js';

export default function CyberHologramShield({ onExplore }) {
  const [activeNode, setActiveNode] = useState(null);
  const [binaryStream, setBinaryStream] = useState([]);

  useEffect(() => {
    // Generate random binary stream lines
    const cols = Array.from({ length: 8 }, () =>
      Array.from({ length: 16 }, () => Math.round(Math.random())).join('')
    );
    setBinaryStream(cols);

    const interval = setInterval(() => {
      setBinaryStream(prev =>
        prev.map(col =>
          col.slice(1) + Math.round(Math.random())
        )
      );
    }, 180);
    return () => clearInterval(interval);
  }, []);

  const NODES = [
    { id: 'email', label: 'Email Security', sub: 'SPF · DKIM · DMARC', icon: '✉️', pos: { top: '24%', left: '16%' } },
    { id: 'blockchain', label: 'Ethereum Ledger', sub: 'Sepolia · PoS Consensus', icon: '⛓️', pos: { top: '22%', right: '16%' } },
    { id: 'crypto', label: 'Cryptographic Keys', sub: 'RSA-2048 · Ed25519', icon: '🔑', pos: { bottom: '22%', right: '18%' } },
    { id: 'database', label: 'IPFS Storage', sub: 'Decentralized Hash Pin', icon: '💾', pos: { bottom: '24%', left: '18%' } },
  ];

  return (
    <div style={{
      position: 'relative', width: '100%', maxWidth: '820px',
      margin: '0 auto', borderRadius: '20px', overflow: 'hidden',
      border: '1px solid rgba(0, 229, 255, 0.35)',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8), 0 0 45px rgba(0, 229, 255, 0.25)',
      background: '#020713'
    }}>
      {/* Background Graphic */}
      <div style={{ position: 'relative', width: '100%', height: '420px', overflow: 'hidden' }}>
        <img
          src="/cyber_hologram_lock.jpg"
          alt="Cybersecurity Blockchain Cryptographic Shield"
          style={{
            width: '100%', height: '100%', objectFit: 'cover',
            filter: 'contrast(1.1) brightness(0.95)'
          }}
        />

        {/* Gradient overlays for seamless blending */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(circle at 50% 50%, transparent 40%, rgba(2, 7, 19, 0.75) 100%)',
          pointerEvents: 'none'
        }} />

        {/* Binary stream columns on left and right */}
        <div style={{
          position: 'absolute', top: '15px', left: '18px',
          fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
          color: 'rgba(0, 229, 255, 0.45)', lineHeight: 1.3,
          letterSpacing: '0.15em', pointerEvents: 'none', userSelect: 'none'
        }}>
          {binaryStream.slice(0, 4).map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>

        <div style={{
          position: 'absolute', top: '15px', right: '18px',
          fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
          color: 'rgba(0, 255, 157, 0.45)', lineHeight: 1.3,
          letterSpacing: '0.15em', pointerEvents: 'none', userSelect: 'none', textAlign: 'right'
        }}>
          {binaryStream.slice(4, 8).map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>

        {/* Pulsing Concentric SVG Rings */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          <circle cx="50%" cy="50%" r="130" fill="none" stroke="rgba(0, 229, 255, 0.25)" strokeWidth="1.5" strokeDasharray="6 8" />
          <circle cx="50%" cy="50%" r="160" fill="none" stroke="rgba(0, 255, 157, 0.2)" strokeWidth="1" strokeDasharray="12 12" />
        </svg>

        {/* Interactive Floating Security Nodes */}
        {NODES.map(node => (
          <motion.div
            key={node.id}
            whileHover={{ scale: 1.08 }}
            style={{
              position: 'absolute', ...node.pos,
              background: 'rgba(2, 7, 19, 0.85)',
              border: activeNode === node.id ? '1px solid var(--accent-green)' : '1px solid rgba(0, 229, 255, 0.4)',
              borderRadius: '10px',
              padding: '0.45rem 0.85rem',
              backdropFilter: 'blur(10px)',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              boxShadow: activeNode === node.id ? '0 0 20px rgba(0, 255, 157, 0.5)' : '0 4px 15px rgba(0,0,0,0.6)',
              transition: 'all 0.2s ease',
              zIndex: 10
            }}
            onClick={() => {
              setActiveNode(node.id);
              soundManager.playClick();
              if (onExplore) onExplore(node.id);
            }}
          >
            <span style={{ fontSize: '1.1rem' }}>{node.icon}</span>
            <div>
              <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#FFF' }}>
                {node.label}
              </div>
              <div style={{ fontSize: '0.62rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                {node.sub}
              </div>
            </div>
          </motion.div>
        ))}

        {/* Center HUD status overlay */}
        <div style={{
          position: 'absolute', bottom: '15px', left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(2, 7, 19, 0.85)',
          border: '1px solid rgba(0, 229, 255, 0.3)',
          borderRadius: '100px',
          padding: '0.35rem 1.25rem',
          backdropFilter: 'blur(12px)',
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          boxShadow: '0 4px 20px rgba(0, 229, 255, 0.2)',
          zIndex: 10
        }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#00FF9D', boxShadow: '0 0 10px #00FF9D' }} />
          <span className="mono" style={{ fontSize: '0.72rem', color: '#EDF6FF', letterSpacing: '0.08em', fontWeight: 600 }}>
            ETHEREUM SEPOLIA IMMUTABLE AUDIT TRAIL · ON-CHAIN VERIFIED
          </span>
        </div>
      </div>
    </div>
  );
}
