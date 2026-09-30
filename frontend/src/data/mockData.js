// Centralized mock data & scan simulation for the dashboard

export const SCAN_RESULTS = {
  'google.com': {
    domain: 'google.com', score: 96, grade: 'A+',
    checks: [
      { id: 'spf',   name: 'SPF Record',       status: 'pass', value: 'v=spf1 include:_spf.google.com ~all', severity: 'low' },
      { id: 'dkim',  name: 'DKIM Signature',   status: 'pass', value: 'RSA-2048, selector: 20230601',        severity: 'low' },
      { id: 'dmarc', name: 'DMARC Policy',     status: 'pass', value: 'p=reject; pct=100; rua=mailto:mailauth-reports@google.com', severity: 'low' },
      { id: 'tls',   name: 'TLS Version',      status: 'pass', value: 'TLS 1.3 (ECDHE-RSA-AES256-GCM)',     severity: 'low' },
      { id: 'cert',  name: 'SSL Certificate',  status: 'pass', value: 'Valid · Google Trust Services · 312 days remaining', severity: 'low' },
      { id: 'dnssec',name: 'DNSSEC Validation',status: 'pass', value: 'Enabled (NSEC3 cryptographically signed)', severity: 'low' },
      { id: 'breach',name: 'Breach Check',     status: 'pass', value: 'Zero darknet credential leak detected', severity: 'low' },
    ],
    tlsDetails: { version: 'TLS 1.3', cipher: 'ECDHE-RSA-AES256-GCM-SHA384', starttls: true, hsts: true },
  },
  'example.com': {
    domain: 'example.com', score: 28, grade: 'F',
    checks: [
      { id: 'spf',   name: 'SPF Record',       status: 'fail', value: 'No SPF record found — domain spoofable', severity: 'critical' },
      { id: 'dkim',  name: 'DKIM Signature',   status: 'fail', value: 'Selector missing; signatures unverified', severity: 'critical' },
      { id: 'dmarc', name: 'DMARC Policy',     status: 'fail', value: 'No DMARC record; spoofed emails pass', severity: 'high' },
      { id: 'tls',   name: 'TLS Version',      status: 'fail', value: 'TLS 1.0 — obsolete & vulnerable to POODLE', severity: 'critical' },
      { id: 'cert',  name: 'SSL Certificate',  status: 'fail', value: 'Expired certificate chain', severity: 'critical' },
      { id: 'dnssec',name: 'DNSSEC Validation',status: 'fail', value: 'Unsigned DNS zone vulnerable to cache poisoning', severity: 'medium' },
      { id: 'breach',name: 'Breach Check',     status: 'warn', value: '4 historical breaches on record', severity: 'high' },
    ],
    tlsDetails: { version: 'TLS 1.0', cipher: 'RC4-MD5 (WEAK)', starttls: false, hsts: false },
  },
  'microsoft.com': {
    domain: 'microsoft.com', score: 92, grade: 'A',
    checks: [
      { id: 'spf',   name: 'SPF Record',       status: 'pass', value: 'v=spf1 include:spf.protection.outlook.com ~all', severity: 'low' },
      { id: 'dkim',  name: 'DKIM Signature',   status: 'pass', value: 'RSA-2048 selector ms-prod-01 active', severity: 'low' },
      { id: 'dmarc', name: 'DMARC Policy',     status: 'pass', value: 'p=reject; pct=100; sp=reject', severity: 'low' },
      { id: 'tls',   name: 'TLS Version',      status: 'pass', value: 'TLS 1.3 (ChaCha20-Poly1305 / AES-256)', severity: 'low' },
      { id: 'cert',  name: 'SSL Certificate',  status: 'pass', value: 'Valid DigiCert Global Root G2 · 280 days left', severity: 'low' },
      { id: 'dnssec',name: 'DNSSEC Validation',status: 'pass', value: 'Signed with RSA/SHA-256 (NSEC3)', severity: 'low' },
      { id: 'breach',name: 'Breach Check',     status: 'pass', value: 'No exposure found', severity: 'low' },
    ],
    tlsDetails: { version: 'TLS 1.3', cipher: 'ECDHE-RSA-AES256-GCM-SHA384', starttls: true, hsts: true },
  },
  'apple.com': {
    domain: 'apple.com', score: 95, grade: 'A+',
    checks: [
      { id: 'spf',   name: 'SPF Record',       status: 'pass', value: 'v=spf1 redirect=_spf.apple.com', severity: 'low' },
      { id: 'dkim',  name: 'DKIM Signature',   status: 'pass', value: 'RSA-2048 selector apple-auth-1', severity: 'low' },
      { id: 'dmarc', name: 'DMARC Policy',     status: 'pass', value: 'p=reject; sp=reject; pct=100', severity: 'low' },
      { id: 'tls',   name: 'TLS Version',      status: 'pass', value: 'TLS 1.3 Strict MTA-STS enforced', severity: 'low' },
      { id: 'cert',  name: 'SSL Certificate',  status: 'pass', value: 'Valid Apple Public Root CA · 340 days', severity: 'low' },
      { id: 'dnssec',name: 'DNSSEC Validation',status: 'pass', value: 'Zone fully signed & anchored', severity: 'low' },
      { id: 'breach',name: 'Breach Check',     status: 'pass', value: 'No breach found', severity: 'low' },
    ],
    tlsDetails: { version: 'TLS 1.3', cipher: 'ECDHE-ECDSA-AES256-GCM-SHA384', starttls: true, hsts: true },
  },
  'github.com': {
    domain: 'github.com', score: 91, grade: 'A',
    checks: [
      { id: 'spf',   name: 'SPF Record',       status: 'pass', value: 'v=spf1 include:_spf.github.com ~all', severity: 'low' },
      { id: 'dkim',  name: 'DKIM Signature',   status: 'pass', value: 'RSA-2048 selector gh-mail-2024', severity: 'low' },
      { id: 'dmarc', name: 'DMARC Policy',     status: 'pass', value: 'p=reject; pct=100', severity: 'low' },
      { id: 'tls',   name: 'TLS Version',      status: 'pass', value: 'TLS 1.3 Strict Mode', severity: 'low' },
      { id: 'cert',  name: 'SSL Certificate',  status: 'pass', value: 'Valid DigiCert High Assurance · 190 days', severity: 'low' },
      { id: 'dnssec',name: 'DNSSEC Validation',status: 'pass', value: 'Enabled with DNSKEY algorithm 13', severity: 'low' },
      { id: 'breach',name: 'Breach Check',     status: 'pass', value: 'No enterprise credentials leaked', severity: 'low' },
    ],
    tlsDetails: { version: 'TLS 1.3', cipher: 'ECDHE-RSA-AES256-GCM-SHA384', starttls: true, hsts: true },
  },
  'proton.me': {
    domain: 'proton.me', score: 98, grade: 'A+',
    checks: [
      { id: 'spf',   name: 'SPF Record',       status: 'pass', value: 'v=spf1 include:_spf.protonmail.ch ~all', severity: 'low' },
      { id: 'dkim',  name: 'DKIM Signature',   status: 'pass', value: 'Ed25519 & RSA-4096 dual signature', severity: 'low' },
      { id: 'dmarc', name: 'DMARC Policy',     status: 'pass', value: 'p=reject; sp=reject; pct=100; adkim=s', severity: 'low' },
      { id: 'tls',   name: 'TLS Version',      status: 'pass', value: 'TLS 1.3 DANE / TLSA pinned', severity: 'low' },
      { id: 'cert',  name: 'SSL Certificate',  status: 'pass', value: 'Valid Let\'s Encrypt E1 · TLSA Match', severity: 'low' },
      { id: 'dnssec',name: 'DNSSEC Validation',status: 'pass', value: 'Enabled (Full Chain of Trust)', severity: 'low' },
      { id: 'breach',name: 'Breach Check',     status: 'pass', value: 'Zero exposures', severity: 'low' },
    ],
    tlsDetails: { version: 'TLS 1.3', cipher: 'TLS_AES_256_GCM_SHA384', starttls: true, hsts: true },
  }
};

export const DEFAULT_SCAN = {
  domain: 'yourdomain.com', score: 64, grade: 'C',
  checks: [
    { id: 'spf',   name: 'SPF Record',       status: 'pass', value: 'v=spf1 include:mailserver.com ~all', severity: 'low' },
    { id: 'dkim',  name: 'DKIM Signature',   status: 'fail', value: 'No DKIM selector found on default keys', severity: 'high' },
    { id: 'dmarc', name: 'DMARC Policy',     status: 'warn', value: 'p=none (monitoring only — not rejecting)', severity: 'medium' },
    { id: 'tls',   name: 'TLS Version',      status: 'warn', value: 'TLS 1.2 — upgrade to TLS 1.3 recommended', severity: 'medium' },
    { id: 'cert',  name: 'SSL Certificate',  status: 'pass', value: 'Valid · Expires in 90 days', severity: 'low' },
    { id: 'dnssec',name: 'DNSSEC Validation',status: 'fail', value: 'Not configured — vulnerable to DNS spoofing', severity: 'medium' },
    { id: 'breach',name: 'Breach Check',     status: 'pass', value: 'No exposure found', severity: 'low' },
  ],
  tlsDetails: { version: 'TLS 1.2', cipher: 'ECDHE-RSA-AES128-GCM-SHA256', starttls: true, hsts: false },
};

export const AUDIT_LOGS = [
  {
    id: 1, domain: 'proton.me', score: 98, grade: 'A+',
    txHash: '0x8f2a1b94c3d8e57190f84a26c7104b901e82d3ca',
    block: 4832, timestamp: 'Just now', status: 'confirmed',
    gasUsed: 21840, gasFeeEth: '0.000418 ETH',
    ipfsCid: 'bafybeih4j7qm5k26d7m2wqu7l8n0px2q8a1z4v7b9',
    merkleRoot: '0x7e812d4a9b64c01287f39d2c1840aef53182dcba7921e0',
    caller: '0x3F82C9814B3E0391DAF2104084AC9203841D8B90',
    network: 'Ethereum Sepolia',
    confirmations: 1,
  },
  {
    id: 2, domain: 'google.com', score: 96, grade: 'A+',
    txHash: '0x4a9f3b2184e912ca68d9014b270a18491c9fe7cc',
    block: 4831, timestamp: '2 mins ago', status: 'confirmed',
    gasUsed: 22100, gasFeeEth: '0.000424 ETH',
    ipfsCid: 'bafybeic9x8m12k0129fka823n91kaq72h901b8fa2',
    merkleRoot: '0x3f98c1a7d65b0981e74a819b21f98c6d123e45a0b78c9d',
    caller: '0x71C8F4a670183FadE19858A94dD8a5316B952bC8',
    network: 'Ethereum Sepolia',
    confirmations: 8,
  },
  {
    id: 3, domain: 'apple.com', score: 95, grade: 'A+',
    txHash: '0x9d1a7e0984f128c70124ba890123df6128493f52',
    block: 4830, timestamp: '6 mins ago', status: 'confirmed',
    gasUsed: 21540, gasFeeEth: '0.000412 ETH',
    ipfsCid: 'bafybeib8319fka0184bna7104b2910fa8412bca89',
    merkleRoot: '0x1928374a5b6c7d8e9f0123456789abcdef0123456789ab',
    caller: '0x3F82C9814B3E0391DAF2104084AC9203841D8B90',
    network: 'Ethereum Sepolia',
    confirmations: 24,
  },
  {
    id: 4, domain: 'github.com', score: 91, grade: 'A',
    txHash: '0x2b5c8d167194f01289b4a810938f712948011e09',
    block: 4829, timestamp: '14 mins ago', status: 'confirmed',
    gasUsed: 23150, gasFeeEth: '0.000445 ETH',
    ipfsCid: 'bafybeig0193kf81923m91a029381kfamc01283948',
    merkleRoot: '0xbcdef0123456789a1234567890abcdef1234567890abc',
    caller: '0x71C8F4a670183FadE19858A94dD8a5316B952bC8',
    network: 'Ethereum Sepolia',
    confirmations: 56,
  },
  {
    id: 5, domain: 'microsoft.com', score: 92, grade: 'A',
    txHash: '0x7c2e1f4491823ca87109284102938f0192848a11',
    block: 4828, timestamp: '28 mins ago', status: 'confirmed',
    gasUsed: 22400, gasFeeEth: '0.000430 ETH',
    ipfsCid: 'bafybeie9182kca9012384mfa019283ka019283910',
    merkleRoot: '0x4567890abcdef1234567890abcdef1234567890abcdef',
    caller: '0x3F82C9814B3E0391DAF2104084AC9203841D8B90',
    network: 'Ethereum Sepolia',
    confirmations: 112,
  },
  {
    id: 6, domain: 'cloudflare.com', score: 97, grade: 'A+',
    txHash: '0x5e192840acbe9012384910283940192830495810',
    block: 4827, timestamp: '42 mins ago', status: 'confirmed',
    gasUsed: 21900, gasFeeEth: '0.000420 ETH',
    ipfsCid: 'bafybeif0192384a0192834bfa0192839102938481',
    merkleRoot: '0x7890abcdef1234567890abcdef1234567890abcdef12',
    caller: '0x71C8F4a670183FadE19858A94dD8a5316B952bC8',
    network: 'Ethereum Sepolia',
    confirmations: 168,
  },
  {
    id: 7, domain: 'binance.com', score: 87, grade: 'B+',
    txHash: '0x1a82930491823746192830192839401928301928',
    block: 4826, timestamp: '1 hr ago', status: 'confirmed',
    gasUsed: 24200, gasFeeEth: '0.000465 ETH',
    ipfsCid: 'bafybeih0192834710293840192834910293847102',
    merkleRoot: '0x0123456789abcdef1234567890abcdef1234567890ab',
    caller: '0x99A04B3E0391DAF2104084AC9203841D8B9077EE',
    network: 'Ethereum Sepolia',
    confirmations: 240,
  },
  {
    id: 8, domain: 'acme-corp.net', score: 62, grade: 'C',
    txHash: '0x6e3f2a118491028394019283019283019283c4b7',
    block: 4825, timestamp: '2 hrs ago', status: 'confirmed',
    gasUsed: 22800, gasFeeEth: '0.000438 ETH',
    ipfsCid: 'bafybeia0192834710293840192834910293847103',
    merkleRoot: '0x34567890abcdef1234567890abcdef1234567890abcd',
    caller: '0x71C8F4a670183FadE19858A94dD8a5316B952bC8',
    network: 'Ethereum Sepolia',
    confirmations: 480,
  },
  {
    id: 9, domain: 'fintech-apex.io', score: 79, grade: 'B',
    txHash: '0x3c710491823746192830192839401928301928aa',
    block: 4824, timestamp: '3 hrs ago', status: 'confirmed',
    gasUsed: 21600, gasFeeEth: '0.000415 ETH',
    ipfsCid: 'bafybeib0192834710293840192834910293847104',
    merkleRoot: '0x67890abcdef1234567890abcdef1234567890abcdef1',
    caller: '0x3F82C9814B3E0391DAF2104084AC9203841D8B90',
    network: 'Ethereum Sepolia',
    confirmations: 720,
  },
  {
    id: 10, domain: 'example.com', score: 28, grade: 'F',
    txHash: '0x99f81029384019283019283940192830192839ff',
    block: 4823, timestamp: '4 hrs ago', status: 'confirmed',
    gasUsed: 25100, gasFeeEth: '0.000482 ETH',
    ipfsCid: 'bafybeic0192834710293840192834910293847105',
    merkleRoot: '0x90abcdef1234567890abcdef1234567890abcdef1234',
    caller: '0x99A04B3E0391DAF2104084AC9203841D8B9077EE',
    network: 'Ethereum Sepolia',
    confirmations: 960,
  },
  {
    id: 11, domain: 'defense-gov.org', score: 94, grade: 'A',
    txHash: '0x12bb901238491028394019283049581029384019',
    block: 4822, timestamp: '5 hrs ago', status: 'confirmed',
    gasUsed: 21950, gasFeeEth: '0.000421 ETH',
    ipfsCid: 'bafybeid0192834710293840192834910293847106',
    merkleRoot: '0xabcdef1234567890abcdef1234567890abcdef123456',
    caller: '0x71C8F4a670183FadE19858A94dD8a5316B952bC8',
    network: 'Ethereum Sepolia',
    confirmations: 1200,
  },
  {
    id: 12, domain: 'startup-seed.dev', score: 46, grade: 'D',
    txHash: '0xaa184910283940192830192839401928301928bb',
    block: 4821, timestamp: '6 hrs ago', status: 'confirmed',
    gasUsed: 23400, gasFeeEth: '0.000450 ETH',
    ipfsCid: 'bafybeie0192834710293840192834910293847107',
    merkleRoot: '0xbcdef1234567890abcdef1234567890abcdef1234567',
    caller: '0x3F82C9814B3E0391DAF2104084AC9203841D8B90',
    network: 'Ethereum Sepolia',
    confirmations: 1440,
  }
];

export const SCORE_HISTORY = [
  { date: 'Sep 24', score: 54 },
  { date: 'Sep 25', score: 62 },
  { date: 'Sep 26', score: 71 },
  { date: 'Sep 27', score: 79 },
  { date: 'Sep 28', score: 85 },
  { date: 'Sep 29', score: 89 },
  { date: 'Sep 30', score: 94 },
];

export const BREACH_DATA = [
  { date: 'Apr', count: 4 },
  { date: 'May', count: 2 },
  { date: 'Jun', count: 6 },
  { date: 'Jul', count: 1 },
  { date: 'Aug', count: 0 },
  { date: 'Sep', count: 0 },
];

export const SEVERITY_DIST = [
  { name: 'Critical', value: 0, color: '#EF4444' },
  { name: 'High',     value: 1, color: '#F59E0B' },
  { name: 'Medium',   value: 2, color: '#06B6D4' },
  { name: 'Low',      value: 6, color: '#10B981' },
];

export function getScoreColor(score) {
  if (score >= 85) return 'var(--accent-green)';
  if (score >= 60) return 'var(--accent-amber)';
  return 'var(--accent-red)';
}

export function getScoreClass(score) {
  if (score >= 85) return 'text-green';
  if (score >= 60) return 'text-amber';
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
      ? `AI Cryptographic Posture Assessment: Domain demonstrates enterprise-grade authentication with validated SPF and aligned DKIM cryptographic keys. Recommendations: Activate BIMI (Brand Indicators for Message Identification) and ensure periodic key rotation.`
      : `AI Cryptographic Posture Assessment: Critical deficiencies identified in public key authentication and DMARC enforcement. Domain is susceptible to adversary spoofing and BEC attacks. Priority: Enforce p=reject with DKIM selector alignment.`,
    source: 'rule_engine'
  };
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ ...base, ai_analysis });
    }, 2000);
  });
}

export function generateTxHash() {
  const hex = Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  return '0x' + hex;
}

export function createNewAuditRecord(domain, score, grade, blockNum = 4833) {
  const txHash = generateTxHash();
  const hexIpfs = Array.from({ length: 32 }, () => Math.floor(Math.random() * 36).toString(36)).join('');
  const merkleRoot = '0x' + Array.from({ length: 48 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  
  return {
    id: Date.now() + Math.random(),
    domain,
    score,
    grade,
    txHash,
    block: blockNum,
    timestamp: 'Just now',
    status: 'confirmed',
    gasUsed: Math.floor(21000 + Math.random() * 3500),
    gasFeeEth: (0.000400 + Math.random() * 0.00008).toFixed(6) + ' ETH',
    ipfsCid: `bafybeih${hexIpfs}`,
    merkleRoot,
    caller: '0x71C8F4a670183FadE19858A94dD8a5316B952bC8',
    network: 'Ethereum Sepolia',
    confirmations: 1,
    isNewlyMined: true
  };
}
