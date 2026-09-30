// Centralized mock data & scan simulation for the dashboard

export const SCAN_RESULTS = {
  'google.com': {
    domain: 'google.com', score: 94, grade: 'A',
    checks: [
      { id: 'spf',   name: 'SPF Record',       status: 'pass', value: 'v=spf1 include:_spf.google.com ~all', severity: 'low' },
      { id: 'dkim',  name: 'DKIM Signature',   status: 'pass', value: 'RSA-2048, selector: 20230601',        severity: 'low' },
      { id: 'dmarc', name: 'DMARC Policy',     status: 'pass', value: 'p=reject; pct=100; rua=…',           severity: 'low' },
      { id: 'tls',   name: 'TLS Version',      status: 'pass', value: 'TLS 1.3 (ECDHE-RSA-AES256-GCM)',     severity: 'low' },
      { id: 'cert',  name: 'SSL Certificate',  status: 'pass', value: 'Valid · Expires in 312 days',        severity: 'low' },
      { id: 'dnssec',name: 'DNSSEC',           status: 'pass', value: 'Enabled (NSEC3)',                    severity: 'low' },
      { id: 'breach',name: 'Breach Check',     status: 'pass', value: 'No exposure found',                  severity: 'low' },
    ],
    tlsDetails: { version: 'TLS 1.3', cipher: 'ECDHE-RSA-AES256-GCM-SHA384', starttls: true, hsts: true },
  },
  'example.com': {
    domain: 'example.com', score: 31, grade: 'F',
    checks: [
      { id: 'spf',   name: 'SPF Record',       status: 'fail', value: 'No SPF record found',                severity: 'critical' },
      { id: 'dkim',  name: 'DKIM Signature',   status: 'fail', value: 'Selector not found',                 severity: 'critical' },
      { id: 'dmarc', name: 'DMARC Policy',     status: 'fail', value: 'No DMARC record',                    severity: 'high' },
      { id: 'tls',   name: 'TLS Version',      status: 'fail', value: 'TLS 1.0 — deprecated',               severity: 'critical' },
      { id: 'cert',  name: 'SSL Certificate',  status: 'fail', value: 'Expired 45 days ago',                severity: 'critical' },
      { id: 'dnssec',name: 'DNSSEC',           status: 'fail', value: 'Not configured',                     severity: 'medium' },
      { id: 'breach',name: 'Breach Check',     status: 'warn', value: '3 exposures found in HaveIBeenPwned', severity: 'high' },
    ],
    tlsDetails: { version: 'TLS 1.0', cipher: 'RC4-MD5 (WEAK)', starttls: false, hsts: false },
  },
  'microsoft.com': {
    domain: 'microsoft.com', score: 91, grade: 'A',
    checks: [
      { id: 'spf',   name: 'SPF Record',       status: 'pass', value: 'v=spf1 include:spf.protection.outlook.com ~all', severity: 'low' },
      { id: 'dkim',  name: 'DKIM Signature',   status: 'pass', value: 'RSA-2048 present',                   severity: 'low' },
      { id: 'dmarc', name: 'DMARC Policy',     status: 'pass', value: 'p=reject; pct=100',                  severity: 'low' },
      { id: 'tls',   name: 'TLS Version',      status: 'pass', value: 'TLS 1.3',                            severity: 'low' },
      { id: 'cert',  name: 'SSL Certificate',  status: 'pass', value: 'Valid · Expires in 280 days',        severity: 'low' },
      { id: 'dnssec',name: 'DNSSEC',           status: 'warn', value: 'Partial — not all zones signed',      severity: 'medium' },
      { id: 'breach',name: 'Breach Check',     status: 'pass', value: 'No exposure found',                  severity: 'low' },
    ],
    tlsDetails: { version: 'TLS 1.3', cipher: 'ECDHE-RSA-AES256-GCM-SHA384', starttls: true, hsts: true },
  },
};

export const DEFAULT_SCAN = {
  domain: 'yourdomain.com', score: 62, grade: 'C',
  checks: [
    { id: 'spf',   name: 'SPF Record',       status: 'pass', value: 'v=spf1 include:mailserver.com ~all',   severity: 'low' },
    { id: 'dkim',  name: 'DKIM Signature',   status: 'fail', value: 'No DKIM selector found',               severity: 'high' },
    { id: 'dmarc', name: 'DMARC Policy',     status: 'warn', value: 'p=none (monitoring only — not enforced)', severity: 'medium' },
    { id: 'tls',   name: 'TLS Version',      status: 'warn', value: 'TLS 1.1 — upgrade recommended',         severity: 'high' },
    { id: 'cert',  name: 'SSL Certificate',  status: 'pass', value: 'Valid · Expires in 90 days',            severity: 'low' },
    { id: 'dnssec',name: 'DNSSEC',           status: 'fail', value: 'Not configured',                        severity: 'medium' },
    { id: 'breach',name: 'Breach Check',     status: 'pass', value: 'No exposure found',                     severity: 'low' },
  ],
  tlsDetails: { version: 'TLS 1.1', cipher: 'ECDHE-RSA-AES128-SHA', starttls: true, hsts: false },
};

export const AUDIT_LOGS = [
  { id: 1, domain: 'google.com',    score: 94, grade: 'A', txHash: '0x4a9f3b21...e7cc', block: 4821, timestamp: '2026-09-25 14:12', status: 'confirmed' },
  { id: 2, domain: 'acme.com',      score: 62, grade: 'C', txHash: '0x7c2e1f44...8a11', block: 4820, timestamp: '2026-09-25 13:55', status: 'confirmed' },
  { id: 3, domain: 'startup.io',    score: 31, grade: 'F', txHash: '0x9d1a7e09...3f52', block: 4819, timestamp: '2026-09-25 12:40', status: 'confirmed' },
  { id: 4, domain: 'enterprise.co', score: 88, grade: 'B', txHash: '0x2b5c8d16...1e09', block: 4818, timestamp: '2026-09-25 11:22', status: 'confirmed' },
  { id: 5, domain: 'test.org',      score: 45, grade: 'D', txHash: '0x6e3f2a11...c4b7', block: 4817, timestamp: '2026-09-25 10:05', status: 'confirmed' },
];

export const SCORE_HISTORY = [
  { date: 'Sep 19', score: 45 },
  { date: 'Sep 20', score: 52 },
  { date: 'Sep 21', score: 49 },
  { date: 'Sep 22', score: 58 },
  { date: 'Sep 23', score: 55 },
  { date: 'Sep 24', score: 67 },
  { date: 'Sep 25', score: 62 },
];

export const BREACH_DATA = [
  { date: 'Apr', count: 3 },
  { date: 'May', count: 1 },
  { date: 'Jun', count: 5 },
  { date: 'Jul', count: 2 },
  { date: 'Aug', count: 0 },
  { date: 'Sep', count: 1 },
];

export const SEVERITY_DIST = [
  { name: 'Critical', value: 2, color: '#FF3366' },
  { name: 'High',     value: 3, color: '#FFB800' },
  { name: 'Medium',   value: 1, color: '#00D4FF' },
  { name: 'Low',      value: 1, color: '#00FF88' },
];

export function getScoreColor(score) {
  if (score >= 80) return 'var(--accent-green)';
  if (score >= 50) return 'var(--accent-amber)';
  return 'var(--accent-red)';
}

export function getScoreClass(score) {
  if (score >= 80) return 'text-green';
  if (score >= 50) return 'text-amber';
  return 'text-red';
}

export function getStatusDot(status) {
  if (status === 'pass') return 'dot-pass';
  if (status === 'fail') return 'dot-fail';
  return 'dot-warn';
}

export function getStatusIcon(status) {
  if (status === 'pass') return '✓';
  if (status === 'fail') return '✗';
  return '⚠';
}

export function getSeverityClass(sev) {
  return `sev-${sev}`;
}

export function simulateScan(domain) {
  const lower = domain.toLowerCase().replace(/^www\./, '');
  const base = SCAN_RESULTS[lower] || { ...DEFAULT_SCAN, domain };
  const ai_analysis = {
    content: base.score >= 80
      ? `Executive Assessment: Domain demonstrates resilient cryptographic controls with hardened SPF/DKIM authentication. Recommendation: Maintain continuous posture monitoring and audit secondary MX mail relays.`
      : `Executive Assessment: Critical vulnerabilities detected in email authentication architecture. Missing enforcement allows potential domain spoofing and phishing abuse. Priority Action: Publish a strict DMARC reject policy with verified SPF alignment.`,
    source: 'rule_engine'
  };
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ ...base, ai_analysis });
    }, 2500);
  });
}

export function generateTxHash() {
  return '0x' + Array.from({ length: 12 }, () => Math.floor(Math.random() * 16).toString(16)).join('') + '…';
}
