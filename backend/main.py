"""
SecureMailScope — FastAPI Backend
AI-Assisted Cryptographic Security Posture Assessment
SIH 2026 | Problem ID: SIH26159
"""

from fastapi import FastAPI, HTTPException, Path, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, field_validator
from typing import Optional
import asyncio
import ipaddress
import os
import httpx
import dns.resolver
import smtplib
import ssl
import hashlib
import sqlite3
import time
import re
from contextlib import closing

try:
    from dotenv import load_dotenv
    load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))
except ImportError:
    pass

import numpy as np
try:
    from .ml_model import model_instance, FEATURE_NAMES
    from .train_model import train_pipeline
except ImportError:
    from ml_model import model_instance, FEATURE_NAMES
    from train_model import train_pipeline

app = FastAPI(
    title="SecureMailScope API",
    description="AI-Assisted Cryptographic Security Posture Assessment for Secure Email",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

cors_origins = [origin.strip() for origin in os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",") if origin.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

DATABASE_PATH = os.getenv("AUDIT_DB_PATH", os.path.join(os.path.dirname(__file__), "audit.sqlite3"))
AUDIT_LIMIT = 1000
_scan_semaphore = asyncio.Semaphore(8)
_training_lock = asyncio.Lock()


def init_audit_db():
    with closing(sqlite3.connect(DATABASE_PATH)) as conn:
        conn.execute("CREATE TABLE IF NOT EXISTS audit_log (id INTEGER PRIMARY KEY AUTOINCREMENT, domain TEXT NOT NULL, score INTEGER NOT NULL, grade TEXT NOT NULL, tx_hash TEXT NOT NULL, timestamp TEXT NOT NULL)")
        conn.commit()


@app.on_event("startup")
def startup():
    init_audit_db()


# ── Pydantic Models ──

class ScanRequest(BaseModel):
    domain: str = Field(min_length=3, max_length=253)

    @field_validator("domain")
    @classmethod
    def validate_domain(cls, value):
        normalized = clean_domain(value)
        if not normalized or len(normalized) > 253 or ":" in normalized or re.fullmatch(r"\d+(?:\.\d+){3}", normalized) or any(not re.fullmatch(r"[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?", label) for label in normalized.rstrip(".").split(".")) or "." not in normalized.rstrip("."):
            raise ValueError("Enter a valid domain name")
        return normalized.rstrip(".")

class HeaderRequest(BaseModel):
    raw_header: str = Field(min_length=1, max_length=100_000)

class AIChatRequest(BaseModel):
    prompt: str = Field(min_length=1, max_length=4000)
    context: Optional[dict] = None

class ModelTrainRequest(BaseModel):
    samples: int = Field(default=3500, ge=500, le=20000)

class ModelPredictRequest(BaseModel):
    checks: Optional[dict] = None
    tls_details: Optional[dict] = None
    features: Optional[list[float]] = None


# ── Gemini AI Helper ──

async def generate_gemini_analysis(prompt: str, fallback_text: str = "") -> dict:
    """Call Google Gemini Flash via REST API with multi-model fallback."""
    api_key = os.environ.get("GEMINI_API_KEY", "").strip()
    if not api_key:
        return {"content": fallback_text, "source": "rule_engine"}

    candidate_models = ["gemini-3-flash-preview", "gemini-3.8-flash", "gemini-flash-latest"]
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.3, "maxOutputTokens": 600}
    }

    try:
        async with httpx.AsyncClient(timeout=httpx.Timeout(12.0, connect=3.0)) as client:
            for model in candidate_models:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
                try:
                    resp = await client.post(url, params={"key": api_key}, json=payload)
                    if resp.status_code == 200:
                        candidates = resp.json().get("candidates", [])
                        parts = candidates[0].get("content", {}).get("parts", []) if candidates else []
                        if parts and parts[0].get("text"):
                            return {"content": parts[0]["text"].strip(), "source": model}
                    if resp.status_code not in (404, 429, 500, 502, 503):
                        break
                except httpx.HTTPError:
                    continue
    except httpx.HTTPError:
        pass
    return {"content": fallback_text, "source": "rule_engine"}


# ── Helper Functions ──

def clean_domain(domain: str) -> str:
    value = domain.strip()
    if "://" in value:
        value = value.split("://", 1)[1]
    return value.split("/", 1)[0].split(":", 1)[0].rstrip(".").lower()

def compute_score(checks: dict) -> int:
    weights = {"spf": 20, "dkim": 20, "dmarc": 15, "tls": 20, "cert": 15, "dnssec": 5, "breach": 5}
    assessed_weight = sum(weight for key, weight in weights.items() if checks.get(key, {}).get("status") in {"pass", "warn", "fail"})
    if not assessed_weight:
        return 0
    earned = sum(
        weight * (1 if checks[key]["status"] == "pass" else 0.5 if checks[key]["status"] == "warn" else 0)
        for key, weight in weights.items()
        if checks.get(key, {}).get("status") in {"pass", "warn", "fail"}
    )
    return round(earned * 100 / assessed_weight)

def score_to_grade(score: int) -> str:
    if score >= 90: return 'A+'
    if score >= 80: return 'A'
    if score >= 70: return 'B'
    if score >= 60: return 'C'
    if score >= 50: return 'D'
    return 'F'

def check_spf(domain: str) -> dict:
    try:
        answers = dns.resolver.resolve(domain, 'TXT', lifetime=3)
        for rdata in answers:
            txt = str(rdata)
            if 'v=spf1' in txt:
                if '-all' in txt:
                    return {'status': 'pass', 'value': txt[:80], 'severity': 'low', 'detail': 'SPF record with hard fail (-all)'}
                elif '~all' in txt:
                    return {'status': 'warn', 'value': txt[:80], 'severity': 'medium', 'detail': 'SPF uses softfail (~all) — consider -all'}
                return {'status': 'pass', 'value': txt[:80], 'severity': 'low', 'detail': 'SPF record found'}
        return {'status': 'fail', 'value': 'No SPF record found', 'severity': 'critical', 'detail': 'Add a v=spf1 TXT record'}
    except Exception:
        return {'status': 'fail', 'value': 'DNS lookup failed', 'severity': 'critical', 'detail': 'Could not resolve domain'}

def check_dmarc(domain: str) -> dict:
    try:
        answers = dns.resolver.resolve(f'_dmarc.{domain}', 'TXT', lifetime=3)
        for rdata in answers:
            txt = str(rdata)
            if 'v=DMARC1' in txt:
                if 'p=reject' in txt:
                    return {'status': 'pass', 'value': txt[:80], 'severity': 'low', 'detail': 'DMARC with reject policy'}
                elif 'p=quarantine' in txt:
                    return {'status': 'warn', 'value': txt[:80], 'severity': 'medium', 'detail': 'DMARC quarantine — consider p=reject'}
                return {'status': 'warn', 'value': txt[:80], 'severity': 'high', 'detail': 'DMARC p=none — monitoring only, not enforced'}
        return {'status': 'fail', 'value': 'No DMARC record', 'severity': 'high', 'detail': 'Add _dmarc TXT record with p=reject'}
    except Exception:
        return {'status': 'fail', 'value': 'No DMARC record found', 'severity': 'high', 'detail': 'Add _dmarc TXT record'}

def check_dkim(domain: str) -> dict:
    selectors = ['default', 'google', 'mail', 'k1', 'selector1', 'selector2', '20230601']
    for sel in selectors:
        try:
            dns.resolver.resolve(f'{sel}._domainkey.{domain}', 'TXT', lifetime=2)
            return {'status': 'pass', 'value': f'Selector: {sel}', 'severity': 'low', 'detail': f'DKIM key found at {sel}._domainkey'}
        except Exception:
            continue
    return {'status': 'fail', 'value': 'No DKIM selector found', 'severity': 'high', 'detail': 'Configure DKIM signing and publish public key'}

def check_tls(domain: str) -> dict:
    try:
        mx_records = dns.resolver.resolve(domain, "MX", lifetime=4)
        mx_host = str(sorted(mx_records, key=lambda r: r.preference)[0].exchange).rstrip(".")
        addresses = dns.resolver.resolve(mx_host, "A", lifetime=4)
        public_addresses = [str(record) for record in addresses if ipaddress.ip_address(str(record)).is_global]
        if not public_addresses:
            return {"status": "unknown", "value": "No public MX address", "severity": "medium", "detail": "SMTP TLS could not be safely checked"}
        with smtplib.SMTP(timeout=4) as client:
            client.connect(public_addresses[0], 25)
            client.ehlo()
            if not client.has_extn("starttls"):
                return {"status": "fail", "value": "STARTTLS unavailable", "severity": "critical", "detail": "The mail server did not advertise STARTTLS"}
            client.starttls(context=ssl.create_default_context())
            version = client.sock.version()
            if version == "TLSv1.3":
                return {"status": "pass", "value": version, "severity": "low", "detail": "SMTP STARTTLS negotiated TLS 1.3"}
            if version == "TLSv1.2":
                return {"status": "warn", "value": version, "severity": "medium", "detail": "SMTP STARTTLS negotiated TLS 1.2"}
            return {"status": "fail", "value": version or "Unknown TLS", "severity": "critical", "detail": "SMTP server negotiated a deprecated TLS version"}
    except (dns.resolver.NXDOMAIN, dns.resolver.NoAnswer):
        return {"status": "unknown", "value": "MX record unavailable", "severity": "medium", "detail": "SMTP STARTTLS could not be checked because no MX record was found"}
    except Exception:
        return {"status": "unknown", "value": "TLS check unavailable", "severity": "medium", "detail": "SMTP STARTTLS probe failed or timed out"}


# ── API Routes ──

@app.get("/")
async def root():
    return {
        "name": "SecureMailScope API",
        "version": "1.0.0",
        "status": "online",
        "problem_id": "SIH26159",
        "theme": "Blockchain & Cybersecurity"
    }

@app.get("/health")
async def health():
    try:
        with closing(sqlite3.connect(DATABASE_PATH, timeout=1)) as conn:
            conn.execute("SELECT 1")
        return {"status": "healthy", "database": "ready", "model": "ready" if model_instance.pipeline is not None else "baseline", "timestamp": time.time()}
    except sqlite3.Error:
        raise HTTPException(status_code=503, detail="Audit storage unavailable")


@app.post("/api/scan/domain")
async def scan_domain(req: ScanRequest):
    """Full cryptographic posture assessment for a domain."""
    domain = req.domain
    async with _scan_semaphore:
        loop = asyncio.get_running_loop()
        checks_raw = await asyncio.gather(
            loop.run_in_executor(None, check_spf, domain),
            loop.run_in_executor(None, check_dkim, domain),
            loop.run_in_executor(None, check_dmarc, domain),
            loop.run_in_executor(None, check_tls, domain),
        )
    checks_raw = dict(zip(("spf", "dkim", "dmarc", "tls"), checks_raw))
    checks_raw["cert"] = {"status": "unknown", "value": "Not checked", "severity": "medium", "detail": "Certificate validation is not implemented"}
    checks_raw["dnssec"] = {"status": "unknown", "value": "Not checked", "severity": "medium", "detail": "DNSSEC validation is not implemented"}
    checks_raw["breach"] = {"status": "unknown", "value": "Not checked", "severity": "medium", "detail": "No breach intelligence provider is configured"}

    score = compute_score(checks_raw)
    grade = score_to_grade(score)
    ml_eval = model_instance.predict_score(checks_raw, checks_raw.get("tls", {}))
    ml_eval["score"] = score
    ml_eval["grade"] = grade
    audit_ref = hashlib.sha256(f"{domain}-{time.time_ns()}".encode()).hexdigest()

    checks = [
        {'id': k, 'name': {
            'spf':'SPF Record','dkim':'DKIM Signature','dmarc':'DMARC Policy',
            'tls':'TLS Version','cert':'SSL Certificate','dnssec':'DNSSEC','breach':'Breach Check'
        }[k], **v}
        for k, v in checks_raw.items()
    ]

    recommendations = []
    for c in checks:
        if c['status'] != 'pass':
            recommendations.append({
                'check': c['name'],
                'severity': c['severity'],
                'detail': c['detail'],
            })

    # AI Threat Assessment via Gemini
    ai_prompt = (
        f"You are an AI cryptographic cybersecurity auditor for email communications (SIH 2026). "
        f"Analyze domain: {domain}. Overall posture score: {score}/100 (Grade: {grade}). "
        f"Checks: SPF={checks_raw.get('spf',{}).get('detail')}, "
        f"DKIM={checks_raw.get('dkim',{}).get('detail')}, "
        f"DMARC={checks_raw.get('dmarc',{}).get('detail')}, "
        f"TLS={checks_raw.get('tls',{}).get('detail')}. "
        f"In 2 to 3 concise sentences, provide an executive cryptographic risk evaluation and the #1 prioritized remediation action."
    )
    fallback_summary = (
        f"Domain posture assessed at {grade} ({score}/100). "
        + ("Strong baseline cryptographic enforcement observed across SPF, DKIM, and DMARC." if score >= 80 else "Immediate remediation recommended to enforce DMARC rejection policy and secure cipher suites.")
    )
    ai_analysis = await generate_gemini_analysis(ai_prompt, fallback_summary)

    result = {
        'domain': domain,
        'score': score,
        'grade': grade,
        'checks': checks,
        'tls_details': checks_raw['tls'],
        'recommendations': recommendations,
        'ai_analysis': ai_analysis,
        'ml_posture': {
            'confidence': ml_eval.get('confidence', 0.993),
            'model_engine': ml_eval.get('model_engine'),
            'feature_breakdown': ml_eval.get('feature_breakdown', []),
            'cvss_vector': ml_eval.get('cvss_vector', {})
        },
        'tx_hash': None,
        'audit_ref': audit_ref,
        'timestamp': time.time(),
    }

    with closing(sqlite3.connect(DATABASE_PATH, timeout=5)) as conn:
        cursor = conn.execute(
            "INSERT INTO audit_log (domain, score, grade, tx_hash, timestamp) VALUES (?, ?, ?, ?, ?)",
            (domain, score, grade, audit_ref, time.strftime("%Y-%m-%d %H:%M:%S UTC", time.gmtime())),
        )
        result["audit_id"] = cursor.lastrowid
        conn.execute("DELETE FROM audit_log WHERE id NOT IN (SELECT id FROM audit_log ORDER BY id DESC LIMIT ?)", (AUDIT_LIMIT,))
        conn.commit()

    return JSONResponse(content=result)


@app.post("/api/headers/analyze")
async def analyze_header(req: HeaderRequest):
    """Parse and analyze a raw email header."""
    raw = req.raw_header
    unfolded = re.sub(r"\r?\n[ \t]+", " ", raw)
    lines = unfolded.splitlines()

    auth = {'spf': 'unknown', 'dkim': 'unknown', 'dmarc': 'unknown'}
    hops = []
    fields = {}

    for line in lines:
        lower = line.lower()
        if 'dkim=pass' in lower:   auth['dkim'] = 'pass'
        elif 'dkim=fail' in lower: auth['dkim'] = 'fail'
        if 'spf=pass' in lower:    auth['spf']  = 'pass'
        elif 'spf=fail' in lower:  auth['spf']  = 'fail'
        if 'dmarc=pass' in lower:  auth['dmarc'] = 'pass'
        elif 'dmarc=fail' in lower:auth['dmarc'] = 'fail'

        if line.lower().startswith('received:'):
            ip_match = re.search(r'\[([0-9a-fA-F:.]+)\]', line)
            ip = None
            if ip_match:
                try:
                    ip = str(ipaddress.ip_address(ip_match.group(1)))
                except ValueError:
                    pass
            hops.append({'line': line[:200], 'ip': ip})

        colon = line.find(':')
        if colon > 0 and not line.startswith((' ', '\t')):
            k = line[:colon].strip()
            v = line[colon+1:].strip()
            if k: fields[k] = v

    is_suspicious = auth['dkim'] == 'fail' or auth['spf'] == 'fail'

    ai_header_prompt = (
        f"You are an email forensics specialist. "
        f"Analyze these email authentication header results: "
        f"SPF: {auth['spf']}, DKIM: {auth['dkim']}, DMARC: {auth['dmarc']}. "
        f"Hops detected: {len(hops)}. "
        f"Suspicious flag: {is_suspicious}. "
        f"In 2 sentences, provide a forensic evaluation on spoofing risk and sender authenticity."
    )
    fallback_header_ai = (
        "Email headers indicate standard delivery path with valid authentication."
        if not is_suspicious
        else "High risk of domain spoofing or unauthorized relay detected based on failed cryptographic authentication."
    )
    ai_forensics = await generate_gemini_analysis(ai_header_prompt, fallback_header_ai)

    return {
        'auth_results': auth,
        'hops': hops,
        'fields': fields,
        'suspicious': is_suspicious,
        'field_count': len(fields),
        'hop_count': len(hops),
        'ai_forensics': ai_forensics,
    }


@app.post("/api/ai/ask")
async def ask_gemini_ai(req: AIChatRequest):
    """Direct query to Gemini AI for cryptographic and email security posture questions."""
    system_ctx = (
        "You are SecureMailScope AI, an expert cryptographic email security auditor for Smart India Hackathon (SIH 2026). "
        "Answer concisely and technically about SPF, DKIM, DMARC, TLS/STARTTLS, MTA-STS, DNSSEC, or email header forensics."
    )
    prompt = f"{system_ctx}\n\nUser Question: {req.prompt}"
    res = await generate_gemini_analysis(prompt, "AI service currently operating on rule-based security fallback.")
    return res


@app.get("/api/blockchain/logs")
async def get_audit_logs(limit: int = Query(default=20, ge=1, le=100), offset: int = Query(default=0, ge=0)):
    """Return persisted audit records; this is not a blockchain ledger."""
    with closing(sqlite3.connect(DATABASE_PATH, timeout=5)) as conn:
        conn.row_factory = sqlite3.Row
        total = conn.execute("SELECT COUNT(*) FROM audit_log").fetchone()[0]
        rows = conn.execute("SELECT id, domain, score, grade, tx_hash, timestamp FROM audit_log ORDER BY id DESC LIMIT ? OFFSET ?", (limit, offset)).fetchall()
    records = [{**dict(row), "status": "recorded"} for row in rows]
    return {"total": total, "records": records, "storage": "sqlite"}


@app.get("/api/benchmark/{domain}")
async def benchmark(domain: str = Path(..., min_length=3, max_length=253)):
    """Return the latest recorded score for the requested domain, if available."""
    domain = clean_domain(domain)
    if not re.fullmatch(r"[a-z0-9](?:[a-z0-9.-]{0,251}[a-z0-9])?\.[a-z0-9-]{2,63}", domain):
        raise HTTPException(status_code=400, detail="Invalid domain name")
    with closing(sqlite3.connect(DATABASE_PATH, timeout=5)) as conn:
        row = conn.execute("SELECT score FROM audit_log WHERE domain = ? ORDER BY id DESC LIMIT 1", (domain,)).fetchone()
    return {"domain": domain, "your_score": row[0] if row else None, "industry_avg": None, "top_10_percent": None, "comparison_available": False}


# ── ML Model Pipeline Endpoints ──

@app.get("/api/model/info")
async def get_model_info():
    """Retrieve active machine learning pipeline metadata, performance, and feature ranking."""
    metadata = model_instance.metadata or {}
    return {
        "status": "online" if model_instance.pipeline is not None else "calibrated_baseline",
        "model_type": metadata.get("model_type", "Scikit-Learn GradientBoostingRegressor Pipeline"),
        "algorithm": metadata.get("algorithm", "Gradient Boosted Decision Trees (180 Estimators, Depth 4)"),
        "r2_score": metadata.get("r2_score"),
        "cv_5fold_r2": metadata.get("cv_5fold_r2"),
        "mae": metadata.get("mae"),
        "rmse": metadata.get("rmse"),
        "sample_count": metadata.get("sample_count"),
        "trained_at": metadata.get("trained_at"),
        "feature_ranking": metadata.get("feature_ranking", []),
        "features": FEATURE_NAMES,
        "cvss_calibration": "CVSS v4.0 Mapped (0-10 Scale)"
    }


@app.post("/api/model/train")
async def train_model_pipeline(req: ModelTrainRequest = ModelTrainRequest()):
    """Retrain the synthetic-data model; keep training off the event loop."""
    if _training_lock.locked():
        raise HTTPException(status_code=409, detail="Model training is already in progress")
    async with _training_lock:
        try:
            results = await asyncio.to_thread(train_pipeline, samples=req.samples)
            model_instance.load_model()
            return {"success": True, "message": f"Trained model on {req.samples} synthetic samples", "metrics": results}
        except Exception as exc:
            raise HTTPException(status_code=500, detail="Model training failed") from exc


@app.post("/api/model/predict")
async def predict_model_posture(req: ModelPredictRequest):
    """Direct inference against the trained model pipeline with explainability breakdown."""
    if req.features is not None:
        if len(req.features) != len(FEATURE_NAMES):
            raise HTTPException(
                status_code=400, 
                detail=f"Expected {len(FEATURE_NAMES)} features: {FEATURE_NAMES}"
            )
        if not np.isfinite(req.features).all():
            raise HTTPException(status_code=400, detail="Features must be finite numbers")
        x = np.array([req.features], dtype=np.float32)
        if model_instance.pipeline is not None:
            raw_score = float(model_instance.pipeline.predict(x)[0])
            score = max(5, min(99, int(round(raw_score))))
        else:
            score, _, _ = model_instance._rule_based_score(x[0])
            
        return {
            "score": score,
            "grade": model_instance.score_to_grade(score),
            "cvss_vector": model_instance.map_to_cvss(score),
            "feature_breakdown": model_instance.get_feature_breakdown(x[0])
        }

    checks = req.checks or {}
    tls_details = req.tls_details or {}
    res = model_instance.predict_score(checks, tls_details)
    return res

