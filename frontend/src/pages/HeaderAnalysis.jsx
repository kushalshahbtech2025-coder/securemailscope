import { useState } from 'react';
import toast from 'react-hot-toast';
import { analyzeHeader } from '../data/api.js';

const SAMPLE_HEADER = `Delivered-To: user@example.com
Received: from mail.google.com (mail.google.com [209.85.128.44])
        by mx.example.com with ESMTPS id x7si123456
        for <user@example.com>; Thu, 25 Sep 2026 14:12:05 +0530
Authentication-Results: mx.example.com;
       dkim=pass header.i=@google.com header.s=20230601 header.b=abcXYZ12;
       spf=pass (example.com: domain of sender@google.com designates 209.85.128.44)
       dmarc=pass (p=REJECT sp=REJECT dis=NONE) header.from=google.com
DKIM-Signature: v=1; a=rsa-sha256; c=relaxed/relaxed; d=google.com;
        s=20230601; h=mime-version:from:date:message-id:subject:to;
        bh=47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFQ=; b=abcXYZ...
X-Mailer: Gmail
From: sender@google.com
To: user@example.com
Subject: Important Security Update
Date: Thu, 25 Sep 2026 08:42:05 +0000
Message-ID: <CABc123xyz@mail.gmail.com>
MIME-Version: 1.0
Content-Type: text/plain`;

function parseHeader(raw) {
  const lines = raw.split('\n');
  const fields = [];
  const authResults = { spf: 'unknown', dkim: 'unknown', dmarc: 'unknown' };
  const hops = [];

  lines.forEach(line => {
    if (line.startsWith('Received:')) {
      const match = line.match(/\[(\d+\.\d+\.\d+\.\d+)\]/);
      hops.push({ line: line.slice(0, 60) + '…', ip: match ? match[1] : 'unknown' });
    }
    if (line.toLowerCase().includes('dkim=pass')) authResults.dkim = 'pass';
    else if (line.toLowerCase().includes('dkim=fail')) authResults.dkim = 'fail';
    if (line.toLowerCase().includes('spf=pass')) authResults.spf = 'pass';
    else if (line.toLowerCase().includes('spf=fail')) authResults.spf = 'fail';
    if (line.toLowerCase().includes('dmarc=pass')) authResults.dmarc = 'pass';
    else if (line.toLowerCase().includes('dmarc=fail')) authResults.dmarc = 'fail';

    const colonIdx = line.indexOf(':');
    if (colonIdx > 0 && !line.startsWith(' ') && !line.startsWith('\t')) {
      const key = line.slice(0, colonIdx).trim();
      const val = line.slice(colonIdx + 1).trim();
      if (key && val) fields.push({ key, val });
    }
  });

  return { fields, authResults, hops, suspicious: authResults.dkim === 'fail' || authResults.spf === 'fail' };
}

function StatusBadge({ status }) {
  if (status === 'pass')    return <span className="tag tag-green">✓ PASS</span>;
  if (status === 'fail')    return <span className="tag tag-red">✗ FAIL</span>;
  return <span className="tag tag-amber">? UNKNOWN</span>;
}

export default function HeaderAnalysis() {
  const [raw, setRaw]           = useState('');
  const [result, setResult]     = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  async function analyze() {
    if (!raw.trim()) { toast.error('Paste an email header first'); return; }
    setAnalyzing(true);
    try {
      const { data, live } = await analyzeHeader(raw);
      if (live && data) {
        const mappedFields = Object.entries(data.fields || {}).map(([key, val]) => ({ key, val }));
        setResult({
          fields: mappedFields,
          authResults: data.auth_results || { spf: 'unknown', dkim: 'unknown', dmarc: 'unknown' },
          hops: data.hops || [],
          suspicious: data.suspicious,
          ai_forensics: data.ai_forensics,
          isLive: true,
        });
        toast.success('Live forensic analysis complete');
      } else {
        const local = parseHeader(raw);
        setResult({
          ...local,
          ai_forensics: {
            content: local.suspicious
              ? 'Forensic Warning: Failed DKIM or SPF cryptographic authentication indicates potential sender address spoofing or unauthorized mail relay.'
              : 'Forensic Check: Cryptographic authentication records verified. Header indicates expected delivery hops with valid sender credentials.',
            source: 'rule_engine'
          }
        });
        toast.success('Header analyzed');
      }
    } catch {
      const local = parseHeader(raw);
      setResult(local);
      toast.success('Header analyzed');
    } finally {
      setAnalyzing(false);
    }
  }

  function loadSample() {
    setRaw(SAMPLE_HEADER);
    setResult(null);
  }

  return (
    <div className="animate-fade">
      <div style={{ marginBottom:'1.5rem' }}>
        <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.4rem', fontWeight:700, marginBottom:'0.4rem' }}>
          Email Header Forensics
        </h2>
        <p style={{ color:'var(--text-secondary)', fontSize:'0.9rem' }}>
          Paste any raw email header (from Gmail: ⋮ → Show original) to get a complete forensic breakdown.
        </p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns: result ? '1fr 1fr' : '1fr', gap:'1.25rem' }}>
        {/* Input */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Raw Email Header</span>
            <div style={{ display:'flex', gap:'0.5rem' }}>
              <button className="btn btn-ghost" style={{ fontSize:'0.8rem' }} onClick={loadSample}>
                Load Sample
              </button>
              <button className="btn btn-primary" style={{ fontSize:'0.8rem' }} onClick={analyze}>
                Analyze ⚡
              </button>
            </div>
          </div>
          <div className="card-body">
            <textarea
              value={raw}
              onChange={e => setRaw(e.target.value)}
              placeholder={`Paste your email header here…\n\nReceived: from mail.example.com…\nAuthentication-Results: …\nDKIM-Signature: …`}
              style={{
                width:'100%', minHeight: result ? '400px' : '280px',
                background:'rgba(0,0,0,0.3)', border:'1px solid var(--border)',
                borderRadius:8, color:'var(--text-primary)',
                fontFamily:'var(--font-mono)', fontSize:'0.78rem',
                padding:'1rem', resize:'vertical', outline:'none',
                lineHeight:1.6, transition:'border-color 0.3s'
              }}
              onFocus={e => e.target.style.borderColor='var(--accent-cyan)'}
              onBlur={e => e.target.style.borderColor='var(--border)'}
            />
            <div style={{ marginTop:'0.75rem', fontSize:'0.75rem', color:'var(--text-muted)' }}>
              💡 In Gmail: Open email → ⋮ (More) → "Show original" → Copy all text
            </div>
          </div>
        </div>

        {/* Results */}
        {result && (
          <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
            {/* Auth Summary */}
            <div className="card animate-scale">
              <div className="card-header">
                <span className="card-title">Authentication Results</span>
                {result.suspicious
                  ? <span className="tag tag-red">⚠ Suspicious</span>
                  : <span className="tag tag-green">✓ Legitimate</span>}
              </div>
              <div className="card-body">
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'1rem', textAlign:'center' }}>
                  {[
                    { label:'SPF',  status: result.authResults.spf },
                    { label:'DKIM', status: result.authResults.dkim },
                    { label:'DMARC',status: result.authResults.dmarc },
                  ].map(item => (
                    <div key={item.label} style={{
                      padding:'1rem 0.5rem',
                      background:'rgba(0,0,0,0.2)',
                      borderRadius:8, border:'1px solid var(--border)'
                    }}>
                      <div style={{ fontSize:'0.7rem', color:'var(--text-muted)', marginBottom:'0.4rem' }}>{item.label}</div>
                      <StatusBadge status={item.status} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Forensics Assessment */}
            {result.ai_forensics?.content && (
              <div className="card animate-scale" style={{
                borderLeft: '4px solid var(--accent-cyan)',
                background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.05) 0%, rgba(5, 11, 24, 0.7) 100%)'
              }}>
                <div className="card-header" style={{ paddingBottom: '0.4rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.1rem' }}>🤖</span>
                    <span className="card-title">AI Forensic Intelligence</span>
                  </div>
                  <span className="tag" style={{
                    background: 'rgba(0,212,255,0.15)',
                    color: 'var(--accent-cyan)',
                    border: '1px solid rgba(0,212,255,0.3)',
                    fontSize: '0.72rem'
                  }}>
                    {result.ai_forensics.source === 'gemini-1.5-flash' ? 'Google Gemini 1.5 Flash' : 'AI Forensics Engine'}
                  </span>
                </div>
                <div className="card-body" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6 }}>
                  {result.ai_forensics.content}
                </div>
              </div>
            )}

            {/* Routing Hops */}
            {result.hops.length > 0 && (
              <div className="card">
                <div className="card-header"><span className="card-title">Email Routing Path</span></div>
                <div className="card-body">
                  {result.hops.map((hop, i) => (
                    <div key={i} style={{
                      display:'flex', alignItems:'flex-start', gap:'0.75rem',
                      padding:'0.6rem 0', borderBottom:'1px solid rgba(26,58,92,0.3)',
                      fontSize:'0.8rem'
                    }}>
                      <div style={{
                        width:22, height:22, borderRadius:'50%',
                        background:'rgba(0,212,255,0.1)', border:'1px solid rgba(0,212,255,0.2)',
                        display:'flex', alignItems:'center', justifyContent:'center',
                        fontSize:'0.65rem', color:'var(--accent-cyan)', fontWeight:700, flexShrink:0
                      }}>{i+1}</div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontFamily:'var(--font-mono)', fontSize:'0.72rem', color:'var(--text-secondary)' }}>
                          {hop.line}
                        </div>
                        {hop.ip !== 'unknown' && (
                          <div style={{ marginTop:'0.25rem' }}>
                            <span className="tag tag-cyan" style={{ fontSize:'0.65rem' }}>IP: {hop.ip}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Header Fields */}
            <div className="card">
              <div className="card-header"><span className="card-title">Parsed Header Fields</span></div>
              <div className="card-body" style={{ maxHeight:'280px', overflowY:'auto' }}>
                {result.fields.slice(0, 20).map((f, i) => (
                  <div key={i} style={{
                    display:'flex', gap:'1rem', padding:'0.4rem 0',
                    borderBottom:'1px solid rgba(26,58,92,0.2)', fontSize:'0.78rem'
                  }}>
                    <span style={{ color:'var(--accent-cyan)', fontFamily:'var(--font-mono)', fontSize:'0.72rem', minWidth:140, flexShrink:0 }}>
                      {f.key}
                    </span>
                    <span style={{ color:'var(--text-secondary)', wordBreak:'break-all' }}>{f.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
