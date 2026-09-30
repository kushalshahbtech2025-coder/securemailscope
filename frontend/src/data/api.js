/**
 * SecureMailScope — API Service Layer
 * Handles all calls to FastAPI backend with mock fallback
 */

const API_ORIGIN = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const BASE = API_ORIGIN ? `${API_ORIGIN}/api` : '/api';

async function apiFetch(path, opts = {}) {
  try {
    const res = await fetch(BASE + path, {
      headers: { 'Content-Type': 'application/json' },
      ...opts,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return { data: await res.json(), live: true };
  } catch (err) {
    console.warn(`[API] ${path} failed (${err.message}) — using mock data`);
    return { data: null, live: false, error: err.message };
  }
}

export async function scanDomain(domain) {
  const { data, live } = await apiFetch('/scan/domain', {
    method: 'POST',
    body: JSON.stringify({ domain }),
  });
  if (live && data) return { ...data, _live: true };

  // Graceful mock fallback
  const { simulateScan } = await import('./mockData.js');
  const mock = await simulateScan(domain);
  return { ...mock, _live: false };
}

export async function analyzeHeader(rawHeader) {
  const { data, live } = await apiFetch('/headers/analyze', {
    method: 'POST',
    body: JSON.stringify({ raw_header: rawHeader }),
  });
  return { data, live };
}

export async function getBlockchainLogs(limit = 20, offset = 0) {
  const { data, live } = await apiFetch(`/blockchain/logs?limit=${limit}&offset=${offset}`);
  if (live && data) return { ...data, _live: true };

  const { AUDIT_LOGS } = await import('./mockData.js');
  return { total: AUDIT_LOGS.length, records: AUDIT_LOGS, _live: false };
}

export async function getBenchmark(domain) {
  const { data, live } = await apiFetch(`/benchmark/${encodeURIComponent(domain)}`);
  return { data, live };
}

export async function checkHealth() {
  try {
    const res = await fetch(API_ORIGIN ? `${API_ORIGIN}/health` : '/health');
    return res.ok;
  } catch { return false; }
}
