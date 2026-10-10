import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { AUDIT_LOGS, getScoreColor } from '../data/mockData.js';

const REPORT_TEMPLATES = [
  {
    id: 'executive',
    title: 'Executive Summary',
    desc: 'High-level overview of email security posture for C-suite stakeholders.',
    icon: '📊',
    pages: 4,
    tag: 'PDF',
    tagColor: 'tag-cyan',
  },
  {
    id: 'technical',
    title: 'Full Technical Audit',
    desc: 'Detailed vulnerability breakdown with CVSS scores, cipher analysis, and remediation steps.',
    icon: '🔬',
    pages: 12,
    tag: 'PDF',
    tagColor: 'tag-amber',
  },
  {
    id: 'compliance',
    title: 'Compliance Report',
    desc: 'Maps findings to ISO 27001, NIST CSF, and GDPR requirements for regulatory submissions.',
    icon: '✅',
    pages: 8,
    tag: 'PDF',
    tagColor: 'tag-green',
  },
  {
    id: 'blockchain',
    title: 'Blockchain Audit Trail',
    desc: 'Cryptographic proof of all scans including TX hashes and IPFS report links.',
    icon: '⛓',
    pages: 3,
    tag: 'PDF + JSON',
    tagColor: 'tag-gold',
  },
];

function ReportCard({ template, onGenerate, generating, index }) {
  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ y: -4 }}
      style={{ transition:'all 0.3s' }}
    >
      <div className="card-body" style={{ display:'flex', flexDirection:'column', gap:'1rem', height:'100%' }}>
        <div style={{ fontSize:'2.5rem' }}>{template.icon}</div>
        <div>
          <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:'1rem', marginBottom:'0.4rem' }}>
            {template.title}
          </div>
          <div style={{ color:'var(--text-secondary)', fontSize:'0.85rem', lineHeight:1.6 }}>
            {template.desc}
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginTop:'auto' }}>
          <span className={`tag ${template.tagColor}`}>{template.tag}</span>
          <span style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>~{template.pages} pages</span>
        </div>
        <button
          className="btn btn-outline"
          style={{ width:'100%', justifyContent:'center', display:'flex', alignItems:'center', gap:'0.5rem' }}
          onClick={() => onGenerate(template.id)}
          disabled={generating === template.id}
        >
          {generating === template.id
            ? <><span style={{ width:12,height:12,border:'2px solid var(--accent-cyan)',borderTopColor:'transparent',borderRadius:'50%',animation:'spin 0.7s linear infinite',display:'inline-block' }}/> Generating…</>
            : <>↓ Generate Report</>
          }
        </button>
      </div>
    </motion.div>
  );
}

export default function Reports() {
  const [generating, setGenerating] = useState(null);

  async function handleGenerate(id) {
    setGenerating(id);
    await new Promise(r => setTimeout(r, 2200));
    setGenerating(null);
    toast.success(`Report generated! (Demo — PDF would download here)`, { icon: '📄' });
  }

  return (
    <div className="animate-fade">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ marginBottom:'1.75rem' }}
      >
        <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.5rem', fontWeight:800, marginBottom:'0.4rem', letterSpacing: '-0.02em' }}>
          Compliance Reports
        </h2>
        <p style={{ color:'var(--text-secondary)', fontSize:'0.95rem', lineHeight: 1.6 }}>
          Generate enterprise-grade PDF reports for compliance, regulatory, and executive stakeholders.
        </p>
      </motion.div>

      {/* Report Templates */}
      <motion.div
        style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:'1.5rem', marginBottom:'1.75rem' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {REPORT_TEMPLATES.map((t, i) => (
          <ReportCard key={t.id} template={t} onGenerate={handleGenerate} generating={generating} index={i} />
        ))}
      </motion.div>

      {/* Recent Reports */}
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        whileHover={{ y: -2 }}
      >
        <div className="card-header">
          <span className="card-title">Generated Report History</span>
          <button className="btn btn-outline" style={{ fontSize:'0.78rem', padding:'0.3rem 0.75rem' }}>
            ↓ Download All
          </button>
        </div>
        <div style={{ overflowX:'auto' }}>
          <table className="log-table">
            <thead>
              <tr>
                <th>Report</th>
                <th>Domain</th>
                <th>Score</th>
                <th>Generated</th>
                <th>IPFS Hash</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {AUDIT_LOGS.map((log, i) => (
                <tr key={log.id}>
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
                      <span>📄</span>
                      <span style={{ fontSize:'0.85rem', fontWeight:500 }}>Technical Audit</span>
                    </div>
                  </td>
                  <td><span className="mono" style={{ fontSize:'0.85rem' }}>{log.domain}</span></td>
                  <td>
                    <span style={{ fontWeight:700, color: getScoreColor(log.score) }}>{log.score}/100</span>
                  </td>
                  <td><span style={{ fontSize:'0.8rem', color:'var(--text-muted)' }}>{log.timestamp}</span></td>
                  <td>
                    <span className="tx-hash" style={{ fontSize:'0.75rem' }}>
                      Qm{Math.random().toString(36).slice(2, 14)}…
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-ghost" style={{ fontSize:'0.8rem', padding:'0.25rem 0.6rem' }}
                      onClick={() => toast.success('Demo: PDF would download')}>
                      ↓ PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Report Features */}
      <motion.div
        className="card"
        style={{ marginTop:'1.5rem' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        whileHover={{ y: -2 }}
      >
        <div className="card-header"><span className="card-title">Report Contents</span></div>
        <div className="card-body">
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1rem' }}>
            {[
              { icon:'🛡', title:'CVSS Scoring',   desc:'Every vulnerability rated with CVSS v3.1 base score and vector string' },
              { icon:'🔧', title:'Auto-Fix Configs',desc:'Ready-to-paste SPF, DKIM, DMARC and TLS configuration blocks' },
              { icon:'⛓', title:'Blockchain Proof', desc:'TX hash and IPFS link embedded in the PDF for audit verification' },
              { icon:'📈', title:'Score Trend',     desc:'Historical score graph showing your improvement over time' },
              { icon:'🏢', title:'Industry Benchmark',desc:'Your posture vs average for your industry vertical' },
              { icon:'📋', title:'Compliance Map',  desc:'ISO 27001, NIST CSF, and GDPR control mapping table' },
            ].map(f => (
              <div key={f.title} style={{
                padding:'1rem', background:'rgba(0,0,0,0.2)', borderRadius:8,
                border:'1px solid var(--border)', transition:'border-color 0.2s'
              }}>
                <div style={{ fontSize:'1.5rem', marginBottom:'0.5rem' }}>{f.icon}</div>
                <div style={{ fontWeight:600, fontSize:'0.875rem', marginBottom:'0.3rem' }}>{f.title}</div>
                <div style={{ color:'var(--text-muted)', fontSize:'0.78rem', lineHeight:1.5 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
