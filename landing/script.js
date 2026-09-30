/* ============================================================
   SecureMailScope — Landing Page Interactions & Live Scanner
   ============================================================ */

// ── Navbar scroll effect ──
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
});

// ── Animated stat counters ──
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const duration = 1800;
  const start = performance.now();
  const update = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 4);
    el.textContent = Math.floor(ease * target);
    if (progress < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      document.querySelectorAll('.stat-number').forEach(animateCounter);
      observer.disconnect();
    }
  });
}, { threshold: 0.5 });

const statsEl = document.querySelector('.hero-stats');
if (statsEl) observer.observe(statsEl);

// ── Scroll reveal animation ──
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.feature-card, .step, .chain-block, .tech-item').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  revealObserver.observe(el);
});

// ── Live Scanner Demo ──
const domainInput = document.getElementById('domain-input');
const scanBtn     = document.getElementById('scan-btn');
const btnText     = document.getElementById('btn-text');
const btnSpinner  = document.getElementById('btn-spinner');
const resultsDiv  = document.getElementById('scanner-results');

// Simulated scan data (frontend demo)
const DEMO_DATA = {
  'google.com':    { score: 94, spf: 'pass', dkim: 'pass', dmarc: 'pass', tls: 'TLS 1.3', cert: 'Valid (365d)', breach: 'Not Found' },
  'yahoo.com':     { score: 79, spf: 'pass', dkim: 'pass', dmarc: 'warn', tls: 'TLS 1.2', cert: 'Valid (180d)', breach: 'Not Found' },
  'example.com':   { score: 31, spf: 'fail', dkim: 'fail', dmarc: 'fail', tls: 'TLS 1.0', cert: 'Expired',     breach: 'FOUND' },
  'microsoft.com': { score: 91, spf: 'pass', dkim: 'pass', dmarc: 'pass', tls: 'TLS 1.3', cert: 'Valid (300d)', breach: 'Not Found' },
  'default':       { score: 62, spf: 'pass', dkim: 'fail', dmarc: 'warn', tls: 'TLS 1.1', cert: 'Valid (90d)',  breach: 'Not Found' },
};

function getScoreClass(score) {
  if (score >= 80) return 'score-high';
  if (score >= 50) return 'score-medium';
  return 'score-low';
}
function getStatusClass(val) {
  if (val === 'pass' || val === 'TLS 1.3' || val === 'Not Found') return 'status-pass';
  if (val === 'fail' || val === 'Expired' || val === 'FOUND') return 'status-fail';
  return 'status-warn';
}
function getStatusIcon(val) {
  const cls = getStatusClass(val);
  if (cls === 'status-pass') return '✓';
  if (cls === 'status-fail') return '✗';
  return '⚠';
}

function runScan(domain) {
  if (!domain.trim()) return;

  // UI: scanning state
  btnText.style.display = 'none';
  btnSpinner.style.display = 'block';
  scanBtn.disabled = true;
  resultsDiv.innerHTML = `
    <div class="result-placeholder">
      <div style="font-size:2rem;animation:spin 0.8s linear infinite;display:inline-block">⚡</div>
      <p>Scanning <span class="mono accent">${domain}</span>…</p>
    </div>`;

  setTimeout(() => {
    const data = DEMO_DATA[domain.toLowerCase()] || { ...DEMO_DATA['default'] };

    const checks = [
      { name: 'SPF Record',       value: data.spf,    detail: data.spf === 'pass' ? 'v=spf1 include:_spf.google.com ~all' : 'No SPF record found' },
      { name: 'DKIM Signature',   value: data.dkim,   detail: data.dkim === 'pass' ? 'RSA-2048 key present' : 'Selector not found' },
      { name: 'DMARC Policy',     value: data.dmarc,  detail: data.dmarc === 'pass' ? 'p=reject; pct=100' : 'p=none (monitoring only)' },
      { name: 'TLS Version',      value: data.tls,    detail: `SMTP STARTTLS: ${data.tls}` },
      { name: 'SSL Certificate',  value: data.cert,   detail: data.cert },
      { name: 'Breach Intelligence', value: data.breach, detail: data.breach === 'FOUND' ? '⚠ Domain found in breach database' : 'No exposure found' },
    ];

    const scoreClass = getScoreClass(data.score);
    const scoreLabel = data.score >= 80 ? 'SECURE' : data.score >= 50 ? 'AT RISK' : 'CRITICAL';

    resultsDiv.innerHTML = `
      <div class="scan-result-header">
        <div>
          <div class="result-domain">${domain}</div>
          <div style="font-size:0.75rem;color:var(--text-muted);margin-top:2px">Security Posture Analysis</div>
        </div>
        <div class="result-score-badge ${scoreClass}">
          <span style="font-size:1.1rem">${data.score}</span>
          <span style="font-size:0.7rem;opacity:0.8">${scoreLabel}</span>
        </div>
      </div>
      <div class="scan-checks">
        ${checks.map((c, i) => `
          <div class="check-row" style="animation-delay:${i * 0.07}s">
            <div class="check-status ${getStatusClass(c.value)}">${getStatusIcon(c.value)}</div>
            <div class="check-name">${c.name}</div>
            <div class="check-value">${c.detail}</div>
          </div>
        `).join('')}
      </div>
      <div style="margin-top:1.25rem;padding:0.75rem 1rem;background:rgba(124,58,237,0.08);border:1px solid rgba(124,58,237,0.2);border-radius:8px;font-size:0.8rem;color:#A78BFA;display:flex;align-items:center;gap:0.5rem">
        <span>⛓</span>
        <span>This scan would be recorded on-chain · Tx: <span class="mono">0x${Math.random().toString(16).slice(2, 12)}…</span></span>
      </div>`;

    btnText.style.display = 'block';
    btnSpinner.style.display = 'none';
    scanBtn.disabled = false;
  }, 2200);
}

scanBtn.addEventListener('click', () => runScan(domainInput.value));
domainInput.addEventListener('keydown', e => { if (e.key === 'Enter') runScan(domainInput.value); });

// ── Pre-populate with animated typing effect ──
const demoTerms = ['google.com', 'example.com', 'yourdomain.com'];
let termIdx = 0;
function typeDomain() {
  if (document.activeElement === domainInput) return;
  const term = demoTerms[termIdx++ % demoTerms.length];
  let i = 0;
  domainInput.value = '';
  const typeInterval = setInterval(() => {
    domainInput.value += term[i++];
    if (i >= term.length) {
      clearInterval(typeInterval);
      setTimeout(typeDomain, 4000);
    }
  }, 80);
}
setTimeout(typeDomain, 2500);

// ── Hamburger menu ──
const hamburger = document.getElementById('hamburger');
hamburger.addEventListener('click', () => {
  const links = document.querySelector('.nav-links');
  if (links.style.display === 'flex') {
    links.style.display = '';
  } else {
    links.style.cssText = 'display:flex;flex-direction:column;position:absolute;top:72px;left:0;right:0;background:rgba(5,11,24,0.97);padding:1.5rem 2rem;border-bottom:1px solid #1A3A5C;z-index:99;gap:1.25rem;backdrop-filter:blur(20px)';
  }
});

// ── Smooth active nav highlight ──
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');
window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 120) current = s.id;
  });
  navLinks.forEach(a => {
    a.style.color = a.getAttribute('href') === `#${current}` ? 'var(--accent-cyan)' : '';
  });
});

console.log('%cSecureMailScope 🔐', 'color:#00D4FF;font-size:1.5rem;font-weight:bold');
console.log('%cSIH 2026 | AI-Assisted Cryptographic Email Security', 'color:#00FF88;font-size:0.9rem');
