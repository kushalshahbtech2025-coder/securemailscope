import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { soundManager } from '../data/sound.js';

const BRAINSTORM_SCENARIOS = [
  {
    id: 'dkim-replay',
    title: 'DKIM Replay & Cryptographic Relay Spoofing',
    threatLevel: 'CRITICAL',
    vector: 'Cryptographic Signature Hijack',
    likelihood: 'HIGH',
    impact: '9.2 / 10',
    synapses: [
      { name: 'Adversary Ingress', desc: 'Attacker sniffs legitimate signed marketing email from enterprise relay', color: '#FF0055' },
      { name: 'Header Modification', desc: 'Replays identical RSA-2048 signature while appending malicious un-hashed subject headers', color: '#FFB703' },
      { name: 'Relay Forwarding', desc: 'Transmits via secondary open MTA without TLS 1.3 verification', color: '#00E5FF' },
      { name: 'Security Breach', desc: 'Recipient mail server sees valid DKIM selector and delivers to executive inbox', color: '#FF0055' },
    ],
    countermeasures: [
      'Enforce Oversigning on critical headers (Subject, From, To, Date)',
      'Deploy Strict DMARC (p=reject, pct=100) with RFC 8617 ARC validation',
      'Rotate RSA-2048 selectors to Ed25519 every 90 days',
      'Anchor DKIM Public Keys on Ethereum Sepolia for tamper-proof lookup'
    ],
    aiHypothesis: 'Adversary is leveraging legacy MTAs lacking ARC (Authenticated Received Chain) enforcement. By anchoring public keys onto the blockchain ledger, the recipient can cryptographically verify timestamped key revocation in sub-second latency.'
  },
  {
    id: 'mta-sts-downgrade',
    title: 'MTA-STS Downgrade & BGP DNS Route Hijacking',
    threatLevel: 'HIGH',
    vector: 'Transport Layer Protocol Downgrade',
    likelihood: 'MEDIUM',
    impact: '8.6 / 10',
    synapses: [
      { name: 'BGP Route Poisoning', desc: 'Adversary announces rogue ASN prefix to hijack MX traffic routes', color: '#FF0055' },
      { name: 'STARTTLS Stripping', desc: 'Interception proxy strips 250-STARTTLS command from SMTP handshake', color: '#FFB703' },
      { name: 'Cleartext Exposure', desc: 'Mail servers fallback to unencrypted SMTP port 25 transmission', color: '#FFB703' },
      { name: 'Eavesdropping', desc: 'Confidential emails and authentication tokens intercepted in transit', color: '#FF0055' },
    ],
    countermeasures: [
      'Deploy strict MTA-STS (mode: enforce) with max_age=1209600',
      'Publish TLS-RPT (RFC 8460) reporting to monitor decryption attempts',
      'Implement DANE / TLSA DNSSEC records anchored at authoritative root',
      'Continuous automated port 25 probe scanning with SecureMailScope'
    ],
    aiHypothesis: 'Strict MTA-STS cache prevents downgrade fallback. If any rogue node strips STARTTLS, sending MTAs abort delivery immediately and report telemetry to SOC operations.'
  },
  {
    id: 'subdomain-takeover',
    title: 'Dangling CNAME & Mail Subdomain Takeover',
    threatLevel: 'HIGH',
    vector: 'DNS Record Abandonment',
    likelihood: 'HIGH',
    impact: '8.9 / 10',
    synapses: [
      { name: 'Unclaimed CNAME', desc: 'Decommissioned cloud SaaS leaves orphaned mail-marketing.domain.com', color: '#FF0055' },
      { name: 'Attacker Claims Host', desc: 'Adversary registers abandoned cloud tenant bucket or host', color: '#FFB703' },
      { name: 'SPF Inheritance', desc: 'Subdomain automatically inherits parent root SPF trust policies', color: '#00E5FF' },
      { name: 'Phishing Campaign', desc: 'Adversary sends 100% authenticated SPF-passing spear phishing to VIP clients', color: '#FF0055' },
    ],
    countermeasures: [
      'Publish explicit DMARC subdomain policy (sp=reject) on root domain',
      'Automated DNS orphan detection scans across all zone records',
      'Explicit SPF "v=spf1 -all" on unused mail subdomains',
      'Hash full zone configuration to immutable blockchain audit trail'
    ],
    aiHypothesis: 'Inherited parent SPF permissions represent 64% of corporate spear-phishing origins. Enforcing sp=reject isolates rogue child namespaces from impersonating parent trust.'
  },
  {
    id: 'ai-spear-spoof',
    title: 'Deepfake Executive BEC & Lookalike Homograph Attack',
    threatLevel: 'CRITICAL',
    vector: 'IDN Homograph & AI Linguistic Mimicry',
    likelihood: 'HIGH',
    impact: '9.7 / 10',
    synapses: [
      { name: 'Homoglyph Registration', desc: 'Registration of lookalike domain using Cyrillic lookalike characters (e.g. gооgle.com)', color: '#FF0055' },
      { name: 'LLM Stylometric Clone', desc: 'Generative AI trains on executive public speeches to mirror writing tone', color: '#9D4EDD' },
      { name: 'Targeted Transmission', desc: 'Fraudulent wire request sent to finance team during out-of-office window', color: '#FFB703' },
      { name: 'Financial Exfiltration', desc: 'Urgent compliance override triggers unauthorized fund release', color: '#FF0055' },
    ],
    countermeasures: [
      'Implement RFC 5890 Internationalized Domain Name (IDN) punycode filters',
      'AI Neural Header Semantic parser to catch header vs display name mismatches',
      'BIMI (Brand Indicators) certification backed by VMC cryptographic certificate',
      'Zero-Trust Multi-Sig verification required for all outbound transaction emails'
    ],
    aiHypothesis: 'Linguistic spoofing bypasses conventional keyword filters. Combining cryptographic BIMI certificate validation with AI header anomaly detection achieves 99.4% interception rate.'
  }
];

export default function CyberBrainstorm() {
  const [selectedScenario, setSelectedScenario] = useState(BRAINSTORM_SCENARIOS[0]);
  const [isThinking, setIsThinking] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [brainstormLog, setBrainstormLog] = useState([
    '[INIT] Cyber Threat Neural Matrix loaded.',
    '[INFO] Real-time attack vector correlation active.',
    '[READY] Select an attack scenario or synthesize a new threat vector.'
  ]);

  // Animated synaptic pulse timer
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep(s => (s + 1) % 4);
    }, 2400);
    return () => clearInterval(timer);
  }, [selectedScenario]);

  // Synthesize / Brainstorm action
  async function runNeuralBrainstorm() {
    soundManager.playScanPulse();
    setIsThinking(true);
    setBrainstormLog(prev => [
      `[THREAT_SIM] Initiating deep neural attack tree brainstorm…`,
      ...prev
    ]);

    await new Promise(r => setTimeout(r, 600));
    setBrainstormLog(prev => [
      `[ANALYZE] Mapping SMTP attack surface for 4,200 mail exchange permutations…`,
      ...prev
    ]);

    await new Promise(r => setTimeout(r, 800));
    // Pick another scenario
    const nextIdx = (BRAINSTORM_SCENARIOS.findIndex(s => s.id === selectedScenario.id) + 1) % BRAINSTORM_SCENARIOS.length;
    setSelectedScenario(BRAINSTORM_SCENARIOS[nextIdx]);
    setIsThinking(false);
    soundManager.playSuccess();
    toast.success(`⚡ Neural Threat Scenario Synthesized: ${BRAINSTORM_SCENARIOS[nextIdx].title}`);
    setBrainstormLog(prev => [
      `[COMPLETE] Threat vector identified: ${BRAINSTORM_SCENARIOS[nextIdx].vector}. Defense playbook generated.`,
      ...prev
    ]);
  }

  return (
    <div className="animate-fade">
      {/* Cyber Brainstorm Top Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '1.5rem', animation: 'spin 10s linear infinite', display: 'inline-block' }}>🧠</span>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
              Cybersecurity Brainstorm & Threat Matrix
            </h2>
            <span className="tag tag-purple" style={{ fontSize: '0.72rem', letterSpacing: '0.08em' }}>
              NEURAL THREAT LAB
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '720px' }}>
            Interactive Red-Team / Blue-Team neural brainstorm engine. Simulate novel email attack vectors, map synaptic exploitation chains, and generate automated cryptographic countermeasures.
          </p>
        </div>

        {/* Brainstorm Action Button */}
        <button
          onClick={runNeuralBrainstorm}
          disabled={isThinking}
          className="btn btn-primary cyber-glow"
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.6rem 1.25rem', fontSize: '0.85rem',
            background: 'linear-gradient(135deg, #00FF9D 0%, #00E5FF 50%, #9D4EDD 100%)',
            color: '#020713', fontWeight: 800, border: 'none'
          }}
        >
          {isThinking ? (
            <>
              <span style={{ animation: 'spin 0.8s linear infinite', display: 'inline-block' }}>⚙️</span>
              Synthesizing Attack Matrix…
            </>
          ) : (
            <>
              <span>⚡</span>
              Brainstorm New Threat Vector
            </>
          )}
        </button>
      </div>

      {/* Attack Scenario Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', overflowX: 'auto', paddingBottom: '0.3rem' }}>
        {BRAINSTORM_SCENARIOS.map(sc => {
          const isSelected = sc.id === selectedScenario.id;
          return (
            <button
              key={sc.id}
              onClick={() => {
                setSelectedScenario(sc);
                soundManager.playClick();
              }}
              style={{
                background: isSelected ? 'rgba(0, 229, 255, 0.12)' : 'rgba(8, 20, 44, 0.6)',
                border: isSelected ? '1px solid var(--accent-cyan)' : '1px solid var(--border)',
                borderRadius: '10px',
                padding: '0.65rem 1rem',
                cursor: 'pointer',
                textAlign: 'left',
                minWidth: '220px',
                flex: '1',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: isSelected ? '0 0 16px rgba(0, 229, 255, 0.2)' : 'none'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                <span style={{ fontSize: '0.7rem', color: sc.threatLevel === 'CRITICAL' ? 'var(--accent-red)' : 'var(--accent-amber)', fontWeight: 700 }}>
                  ● {sc.threatLevel}
                </span>
                <span className="mono" style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                  CVSS {sc.impact}
                </span>
              </div>
              <div style={{ fontSize: '0.84rem', fontWeight: 700, color: isSelected ? '#FFF' : 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {sc.title}
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Neural Synapse Attack Chain Visualizer */}
      <div className="card" style={{ marginBottom: '1.5rem', position: 'relative', overflow: 'hidden' }}>
        {/* Subtle Cyber scanline overlay */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'linear-gradient(rgba(0, 229, 255, 0.03) 1px, transparent 1px)',
          backgroundSize: '100% 4px', opacity: 0.6
        }} />

        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#00FF9D', boxShadow: '0 0 8px #00FF9D' }} />
            <span className="card-title">Neural Attack Chain Visualizer</span>
          </div>
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <span className="tag tag-red">Vector: {selectedScenario.vector}</span>
            <span className="tag tag-cyan">Likelihood: {selectedScenario.likelihood}</span>
          </div>
        </div>

        <div className="card-body" style={{ padding: '1.5rem' }}>
          {/* Synaptic Attack Progression Path */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem', position: 'relative', marginBottom: '1.5rem'
          }}>
            {selectedScenario.synapses.map((syn, idx) => {
              const isActive = activeStep === idx;
              return (
                <div
                  key={idx}
                  style={{
                    background: isActive ? 'rgba(0, 229, 255, 0.08)' : 'rgba(0, 0, 0, 0.35)',
                    border: isActive ? `1px solid ${syn.color}` : '1px solid var(--border)',
                    borderRadius: '12px',
                    padding: '1.15rem',
                    position: 'relative',
                    transition: 'all 0.3s ease',
                    boxShadow: isActive ? `0 0 20px ${syn.color}35` : 'none'
                  }}
                >
                  {/* Step indicator */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                    <span className="mono" style={{ fontSize: '0.72rem', color: syn.color, fontWeight: 700 }}>
                      PHASE 0{idx + 1}
                    </span>
                    <span style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: isActive ? syn.color : 'rgba(255,255,255,0.1)',
                      boxShadow: isActive ? `0 0 10px ${syn.color}` : 'none'
                    }} />
                  </div>
                  <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#FFF', marginBottom: '0.4rem' }}>
                    {syn.name}
                  </h4>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {syn.desc}
                  </p>
                </div>
              );
            })}
          </div>

          {/* AI Neural Reasoning & Hypothesis Box */}
          <div style={{
            background: 'rgba(157, 78, 221, 0.08)',
            border: '1px solid rgba(157, 78, 221, 0.3)',
            borderRadius: '12px',
            padding: '1.25rem',
            marginBottom: '1.5rem',
            position: 'relative'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '1.1rem' }}>🔮</span>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--accent-purple)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                AI Red-Team Diagnostic Reasoning
              </span>
            </div>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-primary)', lineHeight: 1.6, fontStyle: 'italic' }}>
              "{selectedScenario.aiHypothesis}"
            </p>
          </div>

          {/* Blue-Team Cryptographic Countermeasures */}
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-green)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>🛡️</span>
              Blue-Team Cryptographic Countermeasures & Hardening Playbook
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.75rem' }}>
              {selectedScenario.countermeasures.map((cm, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: '0.6rem',
                    background: 'rgba(0, 255, 157, 0.04)',
                    border: '1px solid rgba(0, 255, 157, 0.15)',
                    borderRadius: '8px',
                    padding: '0.75rem 0.9rem',
                    fontSize: '0.82rem',
                    color: 'var(--text-primary)'
                  }}
                >
                  <span style={{ color: 'var(--accent-green)', fontWeight: 700, flexShrink: 0 }}>✓</span>
                  <span>{cm}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Live Neural Terminal Log & Attack Surface Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {/* Terminal Log */}
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="card-title">Neural Threat Event Stream</span>
            <span className="mono" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>SOC-TTY1</span>
          </div>
          <div className="card-body" style={{
            background: 'rgba(0,0,0,0.5)', padding: '1rem',
            fontFamily: 'var(--font-mono)', fontSize: '0.74rem',
            maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.35rem'
          }}>
            {brainstormLog.map((log, i) => (
              <div key={i} style={{ color: log.startsWith('[COMPLETE]') ? 'var(--accent-green)' : log.startsWith('[THREAT') ? 'var(--accent-red)' : 'var(--text-secondary)' }}>
                {log}
              </div>
            ))}
          </div>
        </div>

        {/* Brainstorm Attack Surface Radar Box */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Threat Vector Heatmap</span>
            <span className="tag tag-green">AI Active</span>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              { name: 'DNS Authentication Surface (SPF/DKIM)', risk: 85, color: '#00FF9D' },
              { name: 'SMTP Transport Security (TLS/STARTTLS)', risk: 72, color: '#00E5FF' },
              { name: 'Policy Enforcement Alignment (DMARC/BIMI)', risk: 91, color: '#9D4EDD' },
              { name: 'Identity Spoofing & BEC Susceptibility', risk: 64, color: '#FFB703' },
            ].map((metric, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.3rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{metric.name}</span>
                  <span style={{ color: metric.color, fontWeight: 700 }}>{metric.risk}% Resilient</span>
                </div>
                <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${metric.risk}%`, height: '100%', background: metric.color, borderRadius: 3, transition: 'width 0.8s ease' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
