// Signal Vault — Mock Data Layer

export const MOCK_DOMAINS = [
  { id:'d1', domain:'acme-corp.io',    score:82, grade:'B+', risk:'medium',   scannedAt:'2026-10-04T18:00:00Z', scanId:'sv-8821' },
  { id:'d2', domain:'fintech-hub.com', score:34, grade:'F',  risk:'critical', scannedAt:'2026-10-04T17:30:00Z', scanId:'sv-8820' },
  { id:'d3', domain:'healthnet.org',   score:91, grade:'A',  risk:'low',      scannedAt:'2026-10-04T16:45:00Z', scanId:'sv-8819' },
  { id:'d4', domain:'logisticpro.net', score:58, grade:'C+', risk:'high',     scannedAt:'2026-10-03T11:00:00Z', scanId:'sv-8818' },
  { id:'d5', domain:'devcloud.app',    score:77, grade:'B',  risk:'medium',   scannedAt:'2026-10-03T09:15:00Z', scanId:'sv-8817' },
];

export const MOCK_SIGNALS = [
  { key:'SPF',    label:'SPF',    status:'pass', value:'v=spf1 include:_spf.acme-corp.io ~all', checkedAt:'18 min ago', color:'#00D4AA' },
  { key:'DKIM',   label:'DKIM',   status:'pass', value:'RSA-2048, selector: sv2026',             checkedAt:'18 min ago', color:'#00D4AA' },
  { key:'DMARC',  label:'DMARC',  status:'warn', value:'p=none — not enforced',                  checkedAt:'18 min ago', color:'#FFB800' },
  { key:'TLS',    label:'TLS',    status:'pass', value:'TLS 1.3, ECDHE-RSA-AES256-GCM',           checkedAt:'18 min ago', color:'#00D4AA' },
  { key:'SMTP',   label:'SMTP',   status:'fail', value:'STARTTLS not advertised on port 25',      checkedAt:'18 min ago', color:'#FF4455' },
  { key:'DNSSEC', label:'DNSSEC', status:'warn', value:'Zone unsigned',                           checkedAt:'18 min ago', color:'#FFB800' },
];

export const MOCK_FINDINGS = [
  { id:'f1', severity:'critical', title:'DMARC policy set to p=none',      evidence:'v=DMARC1; p=none; rua=mailto:dmarc@acme-corp.io', why:'p=none means spoofed emails reach inboxes with no enforcement.', fix:'Change to p=quarantine then p=reject after 30 days monitoring.',        field:'DMARC DNS Record' },
  { id:'f2', severity:'high',     title:'STARTTLS not enforced on MX',     evidence:'220 mail.acme-corp.io ESMTP — STARTTLS not in capabilities', why:'Emails can transit in plaintext, vulnerable to MitM interception.', fix:'Configure MTA to require STARTTLS and add DANE TLSA records.',     field:'SMTP Capabilities' },
  { id:'f3', severity:'high',     title:'DNSSEC not enabled',              evidence:'dig +dnssec acme-corp.io — no RRSIG records returned', why:'DNS responses can be spoofed via cache poisoning attacks.', fix:'Enable DNSSEC signing at your registrar or DNS provider.',              field:'DNS Zone' },
  { id:'f4', severity:'medium',   title:'SPF uses ~all (soft fail)',       evidence:'v=spf1 include:_spf.acme-corp.io ~all', why:'Soft fail permits SPF-failing senders to still deliver email.', fix:'Change ~all to -all after validating all sending sources.',             field:'SPF DNS Record' },
  { id:'f5', severity:'low',      title:'DKIM key is RSA — consider Ed25519', evidence:'k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ...', why:'Ed25519 keys are smaller, faster, and more future-proof.', fix:'Add a parallel Ed25519 DKIM selector alongside the RSA key.',          field:'DKIM Public Key' },
];

export const MOCK_SCORE_HISTORY = [
  { date:'Sep 28', score:44 }, { date:'Sep 29', score:51 },
  { date:'Sep 30', score:55 }, { date:'Oct 01', score:60 },
  { date:'Oct 02', score:68 }, { date:'Oct 03', score:74 },
  { date:'Oct 04', score:82 },
];

export const MOCK_RISK_DIST = [
  { label:'Critical', count:1, color:'#FF4455' },
  { label:'High',     count:2, color:'#FFB800' },
  { label:'Medium',   count:1, color:'#9B8AFF' },
  { label:'Low',      count:1, color:'#00D4AA' },
];

export const MOCK_AUDIT_LOGS = [
  { id:'ev-1001', type:'DOMAIN_SCAN',   domain:'acme-corp.io',    score:82, severity:'medium',   ts:'2026-10-04T18:00:00Z', hash:'0x8f21c3a1...441b', prevHash:'0x72ab91d4...cc82', block:4891, verified:true  },
  { id:'ev-1000', type:'HEADER_SCAN',   domain:'fintech-hub.com', score:34, severity:'critical', ts:'2026-10-04T17:30:00Z', hash:'0x72ab91d4...cc82', prevHash:'0x33b21fa0...90ce', block:4890, verified:true  },
  { id:'ev-0999', type:'DOMAIN_SCAN',   domain:'healthnet.org',   score:91, severity:'low',      ts:'2026-10-04T16:45:00Z', hash:'0x33b21fa0...90ce', prevHash:'0x17a9cef2...221b', block:4889, verified:true  },
  { id:'ev-0998', type:'DOMAIN_SCAN',   domain:'logisticpro.net', score:58, severity:'high',     ts:'2026-10-03T11:00:00Z', hash:'0x17a9cef2...221b', prevHash:'0x99e04d14...cc34', block:4888, verified:true  },
  { id:'ev-0997', type:'REPORT_EXPORT', domain:'devcloud.app',    score:77, severity:'medium',   ts:'2026-10-03T09:15:00Z', hash:'0x99e04d14...cc34', prevHash:'0x71c8a221...2bc8', block:4887, verified:true  },
  { id:'ev-0996', type:'DOMAIN_SCAN',   domain:'acme-corp.io',    score:74, severity:'medium',   ts:'2026-10-02T14:20:00Z', hash:'0x71c8a221...2bc8', prevHash:'0x3fa091c1...88d1', block:4886, verified:false },
];

export const MOCK_HEADER_RESULT = {
  origin_ip: '203.0.113.42',
  spf: 'pass', dkim: 'pass', dmarc: 'fail',
  confidence: 78,
  suspicious: ['DMARC policy not enforced (p=none)', 'Unusual relay hop delay: 8.4s on hop 3'],
  hops: [
    { server:'mail.sender-domain.com', ip:'203.0.113.42',  delay:'0ms',   location:'US / California', auth:'SPF pass'   },
    { server:'mx1.relay-network.net',  ip:'198.51.100.11', delay:'1.2s',  location:'EU / Netherlands',auth:'DKIM pass'  },
    { server:'inbound.target.org',     ip:'192.0.2.200',   delay:'8.4s',  location:'US / New York',   auth:'DMARC fail' },
    { server:'inbox.target.org',       ip:'192.0.2.201',   delay:'120ms', location:'US / New York',   auth:'Delivered'  },
  ],
};

export const MOCK_REPORTS = [
  { id:'r1', name:'Executive Security Summary',  desc:'High-level risk overview for leadership.',           lastGen:'2026-10-04', format:'PDF', status:'ready'    },
  { id:'r2', name:'Technical DNS Assessment',    desc:'Full SPF, DKIM, DMARC, and DNSSEC evaluation.',     lastGen:'2026-10-03', format:'PDF', status:'ready'    },
  { id:'r3', name:'Email Authentication Report', desc:'Detailed auth findings with remediation steps.',     lastGen:'2026-10-02', format:'PDF', status:'ready'    },
  { id:'r4', name:'Compliance Summary',          desc:'Indicative mapping to CIS, NIST CSF, ISO 27001.',   lastGen:null,         format:'PDF', status:'available' },
];

export const MOCK_NOTIFICATIONS = [
  { id:'n1', type:'alert',   msg:'DMARC p=none detected on acme-corp.io', ts:'18 min ago', read:false },
  { id:'n2', type:'info',    msg:'Scan completed for healthnet.org',       ts:'1 hr ago',   read:false },
  { id:'n3', type:'success', msg:'Audit ledger sealed — block #4891',      ts:'2 hr ago',   read:true  },
];

export const SCAN_STEPS = [
  { id:'resolve', label:'Resolving domain',        detail:'Querying authoritative nameservers...'    },
  { id:'dns',     label:'Inspecting DNS records',  detail:'Fetching MX, TXT, NS records...'          },
  { id:'spf',     label:'Validating SPF',          detail:'Parsing SPF policy chain...'              },
  { id:'dkim',    label:'Validating DKIM',         detail:'Checking selector and key strength...'    },
  { id:'dmarc',   label:'Evaluating DMARC',        detail:'Checking alignment and policy mode...'    },
  { id:'tls',     label:'Checking TLS posture',    detail:'Negotiating TLS handshake on port 25...'  },
  { id:'smtp',    label:'Inspecting SMTP',         detail:'Probing STARTTLS and capabilities...'     },
  { id:'threat',  label:'Running threat analysis', detail:'AI scoring 40+ cryptographic signals...'  },
  { id:'seal',    label:'Sealing audit result',    detail:'Writing tamper-evident ledger entry...'   },
];

export function scoreColor(n) {
  if (n >= 85) return '#00D4AA';
  if (n >= 65) return '#FFB800';
  if (n >= 40) return '#9B8AFF';
  return '#FF4455';
}
export function scoreLabel(n) {
  if (n >= 85) return 'Strong posture';
  if (n >= 65) return 'Moderate risk';
  if (n >= 40) return 'Elevated risk';
  return 'Critical exposure';
}
export function riskBadge(r) { return 'badge-' + (r||'neutral').toLowerCase(); }
export function statusBadge(s) {
  if (s === 'pass') return 'badge-pass';
  if (s === 'fail') return 'badge-fail';
  return 'badge-warn';
}
export function fmtTime(iso) {
  if (!iso) return 'Never';
  return new Date(iso).toLocaleString('en-IN', { dateStyle:'medium', timeStyle:'short' });
}
export function randHash() {
  return '0x' + Array.from({length:8}, ()=>Math.floor(Math.random()*16).toString(16)).join('') + '...' +
         Array.from({length:4}, ()=>Math.floor(Math.random()*16).toString(16)).join('');
}
