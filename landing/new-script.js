/* ══════════════════════════════════════════
   SecureMailScope — New Landing JS
   Video Explainer + Scanner + Interactions
   ══════════════════════════════════════════ */

/* ─── Navbar scroll ── */
window.addEventListener('scroll', () => {
  document.getElementById('navbar').classList.toggle('scrolled', scrollY > 60);
});

/* ─── Hamburger ── */
document.getElementById('hamburger').addEventListener('click', () => {
  const links = document.getElementById('nav-links');
  const open  = links.style.display === 'flex';
  if (open) {
    links.style.display = '';
  } else {
    Object.assign(links.style, {
      display:'flex', flexDirection:'column',
      position:'absolute', top:'68px', left:0, right:0,
      background:'rgba(8,0,31,.97)', padding:'1.5rem 2rem',
      borderBottom:'1px solid rgba(255,255,255,.08)',
      zIndex:99, gap:'1.25rem', backdropFilter:'blur(20px)'
    });
  }
});

/* ══════════════════════════════════════════
   VIDEO EXPLAINER CONTROLLER
   ══════════════════════════════════════════ */
const SLIDES      = 4;
let   currentSlide = 0;
let   slideTimer;
let   elapsed      = 0;
let   timerInterval;
const SLIDE_DUR    = 8000; // ms per slide

const slides   = document.querySelectorAll('.vp-slide');
const dots     = document.querySelectorAll('.vp-dot');
const barEl    = document.getElementById('vp-bar');
const timeEl   = document.getElementById('vp-time');

function formatTime(ms) {
  const s = Math.floor(ms / 1000);
  const total = Math.floor(SLIDES * SLIDE_DUR / 1000);
  const cur   = currentSlide * Math.floor(SLIDE_DUR / 1000) + s % Math.floor(SLIDE_DUR / 1000);
  return `${Math.floor(cur/60)}:${String(cur%60).padStart(2,'0')} / ${Math.floor(total/60)}:${String(total%60).padStart(2,'0')}`;
}

function goToSlide(n, dir = 1) {
  const prev = slides[currentSlide];
  prev.classList.remove('active');
  prev.classList.add('exit');
  setTimeout(() => prev.classList.remove('exit'), 500);

  currentSlide = ((n % SLIDES) + SLIDES) % SLIDES;
  slides[currentSlide].classList.add('active');
  dots.forEach((d, i) => d.classList.toggle('active', i === currentSlide));
  elapsed = 0;
  barEl.style.width = '0%';
  onSlideEnter(currentSlide);
}

function nextSlide() { goToSlide(currentSlide + 1); }
function prevSlide() { goToSlide(currentSlide - 1, -1); }

document.getElementById('vp-next').addEventListener('click', () => { clearAuto(); nextSlide(); startAuto(); });
document.getElementById('vp-prev').addEventListener('click', () => { clearAuto(); prevSlide(); startAuto(); });
dots.forEach(d => d.addEventListener('click', () => { clearAuto(); goToSlide(+d.dataset.slide); startAuto(); }));

function clearAuto() { clearTimeout(slideTimer); clearInterval(timerInterval); }

function startAuto() {
  clearAuto();
  let start = Date.now();
  timerInterval = setInterval(() => {
    elapsed = Date.now() - start;
    const pct = Math.min(elapsed / SLIDE_DUR * 100, 100);
    barEl.style.width = pct + '%';
    if (timeEl) timeEl.textContent = formatTime(elapsed);
  }, 50);
  slideTimer = setTimeout(() => { nextSlide(); startAuto(); }, SLIDE_DUR);
}

/* ─── Slide-specific animations ── */
function onSlideEnter(n) {
  if (n === 0) animateTyping();
  if (n === 1) animateChecks();
  if (n === 2) animateGauge();
  if (n === 3) animateChain();
}

/* Slide 0: Typing */
function animateTyping() {
  const el    = document.getElementById('demo-typed');
  if (!el) return;
  const words = ['acme.com', 'yourdomain.com', 'startup.io'];
  let wi = 0;

  function typeWord() {
    const word = words[wi++ % words.length];
    el.textContent = '';
    let i = 0;
    const iv = setInterval(() => {
      el.textContent += word[i++];
      if (i >= word.length) {
        clearInterval(iv);
        setTimeout(() => { el.textContent = ''; setTimeout(typeWord, 400); }, 1800);
      }
    }, 80);
  }
  typeWord();
}

/* Slide 1: Animated check rows */
const CHECK_DATA = [
  { name:'SPF Record',       status:'pass', val:'v=spf1 include:… ~all', sev:'low' },
  { name:'DKIM Signature',   status:'fail', val:'No selector found',      sev:'critical' },
  { name:'DMARC Policy',     status:'warn', val:'p=none (not enforced)',   sev:'high' },
  { name:'TLS Version',      status:'warn', val:'TLS 1.1 — deprecated',   sev:'high' },
  { name:'SSL Certificate',  status:'pass', val:'Valid · 90 days',        sev:'low' },
  { name:'Breach Check',     status:'pass', val:'No exposure found',       sev:'low' },
];

function animateChecks() {
  const container = document.getElementById('slide-checks');
  if (!container) return;
  container.innerHTML = CHECK_DATA.map(c => {
    const cls = c.status === 'pass' ? 'rc-pass' : c.status === 'fail' ? 'rc-fail' : 'rc-warn';
    const ico = c.status === 'pass' ? '✓' : c.status === 'fail' ? '✗' : '⚠';
    const sev = c.sev === 'critical' ? 'sev-c' : c.sev === 'high' ? 'sev-h' : c.sev === 'medium' ? 'sev-m' : 'sev-l';
    return `<div class="s-check">
      <div class="s-icon ${cls}">${ico}</div>
      <span class="s-name">${c.name}</span>
      <span class="s-val ${c.status === 'pass' ? 'pass' : c.status === 'fail' ? 'fail' : 'warn'}">${c.val}</span>
      <span class="sev-badge ${sev}">${c.sev}</span>
    </div>`;
  }).join('');

  const rows = container.querySelectorAll('.s-check');
  rows.forEach((r, i) => setTimeout(() => r.classList.add('visible'), i * 250));
}

/* Slide 2: Score gauge */
function animateGauge() {
  const arc   = document.getElementById('gauge-arc');
  const score = document.getElementById('slide-score');
  if (!arc || !score) return;
  const target = 62;
  const circ   = 2 * Math.PI * 64; // r=64, total=402
  arc.style.strokeDashoffset = circ;

  setTimeout(() => {
    arc.style.strokeDashoffset = circ * (1 - target / 100);
  }, 300);

  let n = 0;
  const iv = setInterval(() => {
    n = Math.min(n + 1, target);
    score.textContent = n;
    if (n >= target) clearInterval(iv);
  }, 30);
}

/* Slide 3: Chain reveal */
function animateChain() {
  const hashEl = document.getElementById('chain-hash');
  if (hashEl) {
    hashEl.textContent = '0x···';
    setTimeout(() => {
      hashEl.textContent = '0x' + Array.from({length:16}, () => Math.floor(Math.random()*16).toString(16)).join('') + '…';
    }, 600);
  }
  ['cb-1','cb-2','cb-3'].forEach((id, i) => {
    const el = document.getElementById(id);
    if (el) setTimeout(() => el.classList.add('visible'), i * 350 + 400);
  });
}

/* Auto-start */
onSlideEnter(0);
startAuto();


/* ══════════════════════════════════════════
   LIVE SCANNER (Landing Page)
   ══════════════════════════════════════════ */
const MOCK = {
  'google.com':    { score:94, spf:'pass', dkim:'pass', dmarc:'pass', tls:'TLS 1.3', cert:'Valid · 312d', breach:'Clean' },
  'microsoft.com': { score:91, spf:'pass', dkim:'pass', dmarc:'pass', tls:'TLS 1.3', cert:'Valid · 280d', breach:'Clean' },
  'example.com':   { score:31, spf:'fail', dkim:'fail', dmarc:'fail', tls:'TLS 1.0', cert:'Expired',       breach:'FOUND' },
  'yahoo.com':     { score:78, spf:'pass', dkim:'pass', dmarc:'warn', tls:'TLS 1.2', cert:'Valid · 180d', breach:'Clean' },
};

function scoreClass(s) { return s >= 80 ? 'score-s' : s >= 50 ? 'score-m' : 'score-d'; }
function statusDot(v)  {
  if (v === 'pass' || v === 'TLS 1.3' || v === 'Clean') return 'rc-pass';
  if (v === 'fail' || v === 'Expired' || v === 'FOUND') return 'rc-fail';
  return 'rc-warn';
}
function statusIcon(v) {
  const c = statusDot(v);
  return c === 'rc-pass' ? '✓' : c === 'rc-fail' ? '✗' : '⚠';
}

function runScan(domain) {
  domain = domain.trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '').toLowerCase();
  if (!domain || !domain.includes('.')) { alert('Enter a valid domain'); return; }

  const btnText = document.getElementById('scan-btn-text');
  const spinner = document.getElementById('scan-spinner');
  const res     = document.getElementById('scan-results');
  const btn     = document.getElementById('scan-go');

  btnText.style.display = 'none';
  spinner.style.display = 'block';
  btn.disabled = true;

  res.innerHTML = `<div class="scan-placeholder"><div class="sp-icon" style="animation:spin 1s linear infinite">⚡</div><div>Scanning <span class="mono" style="color:var(--cyan)">${domain}</span>…</div></div>`;

  setTimeout(() => {
    const d = MOCK[domain] || { score:62, spf:'pass', dkim:'fail', dmarc:'warn', tls:'TLS 1.1', cert:'Valid · 90d', breach:'Clean' };
    const tx = '0x' + Array.from({length:12}, () => Math.floor(Math.random()*16).toString(16)).join('') + '…';

    const checks = [
      { name:'SPF Record',      val:d.spf },
      { name:'DKIM Signature',  val:d.dkim },
      { name:'DMARC Policy',    val:d.dmarc },
      { name:'TLS Version',     val:d.tls },
      { name:'SSL Certificate', val:d.cert },
      { name:'Breach Check',    val:d.breach },
    ];

    res.innerHTML = `
      <div class="result-header">
        <div>
          <div class="result-domain">${domain}</div>
          <div style="font-size:.72rem;color:var(--text-3);margin-top:3px">AI Threat Assessment · Just now</div>
        </div>
        <div class="score-badge ${scoreClass(d.score)}">${d.score} / 100</div>
      </div>
      <div class="result-checks">
        ${checks.map((c,i) => `
          <div class="r-check" style="animation-delay:${i*0.06}s">
            <div class="rc-dot ${statusDot(c.val)}">${statusIcon(c.val)}</div>
            <span class="rc-name">${c.name}</span>
            <span class="rc-val ${statusDot(c.val) === 'rc-pass' ? 'pass' : statusDot(c.val) === 'rc-fail' ? 'fail' : 'warn'}">${c.val}</span>
          </div>`).join('')}
      </div>
      <div class="result-chain">
        ⛓ <span>Blockchain record ·</span>
        <span class="mono" style="color:var(--cyan)">Tx: ${tx}</span>
        <span style="margin-left:auto;background:rgba(16,185,129,.12);padding:.15rem .5rem;border-radius:4px;font-size:.68rem;color:var(--green)">✓ Confirmed</span>
      </div>`;

    btnText.style.display = '';
    spinner.style.display = 'none';
    btn.disabled = false;
  }, 2400);
}

document.getElementById('scan-go').addEventListener('click', () => {
  runScan(document.getElementById('scan-input').value);
});
document.getElementById('scan-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') runScan(e.target.value);
});

/* ─── Scroll reveal ── */
const ro = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.opacity = '1';
      e.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.feat-card,.step-pill,.tech-pill').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity .55s ease, transform .55s ease';
  ro.observe(el);
});

console.log('%cSecureMailScope 🔐', 'color:#8B5CF6;font-size:1.6rem;font-weight:900;font-family:Outfit');
console.log('%cSIH 2026 · AI + Blockchain Email Security', 'color:#06B6D4;font-size:.9rem');
