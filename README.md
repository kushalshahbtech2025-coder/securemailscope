# 🔐 SecureMailScope

> **SIH 2026 · Problem ID: SIH26159**  
> AI-Assisted Cryptographic Security Posture Assessment for Secure Email Communications  
> Theme: **Blockchain & Cybersecurity**

---

## 🚀 Quick Start

### 1. Landing Page
Open directly in your browser — no server needed:
```
landing/index.html
```

### 2. React Dashboard (Frontend)
```powershell
cd frontend
npm install
npm run dev
```
Open → **http://localhost:5173**

### 3. FastAPI Backend
```powershell
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
- API → **http://localhost:8000**
- Swagger Docs → **http://localhost:8000/docs**

---

## 📁 Project Structure

```
26159/
├── landing/               ← Standalone HTML landing page
│   ├── index.html         ← Main landing page
│   ├── style.css          ← Dark cyberpunk theme CSS
│   ├── particles.js       ← Canvas particle mesh (no CDN)
│   └── script.js          ← Animations + live scanner demo
│
├── frontend/              ← React 18 + Vite dashboard
│   └── src/
│       ├── App.jsx        ← Layout: collapsible sidebar + topbar
│       ├── index.css      ← Global design system
│       ├── data/
│       │   ├── mockData.js   ← Mock scan data + utilities
│       │   └── api.js        ← API service (with mock fallback)
│       └── pages/
│           ├── Dashboard.jsx       ← Score gauge, charts, checks
│           ├── Scanner.jsx         ← 9-step animated domain scan
│           ├── HeaderAnalysis.jsx  ← Email header forensics
│           ├── AuditLog.jsx        ← Blockchain ledger table
│           └── Reports.jsx         ← PDF report templates
│
└── backend/               ← FastAPI Python backend
    ├── main.py            ← All API routes + DNS engines
    └── requirements.txt
```

---

## ⚡ Key Features

| Feature | Tech | Status |
|---------|------|--------|
| SPF / DKIM / DMARC Audit | dnspython | ✅ Live DNS |
| TLS/SMTP Inspector | sslyze / ssl | ✅ Live |
| AI Threat Scoring | Rule-based + XGBoost-ready | ✅ |
| Blockchain Audit Log | Solidity / Web3.py | ✅ Simulated |
| Email Header Forensics | RFC 2822 Parser | ✅ |
| PDF Compliance Report | ReportLab (planned) | 🔧 UI Ready |
| Breach Intelligence | HaveIBeenPwned API | 🔧 Integrated |
| Real-time WebSocket Scan | FastAPI WS | 🔧 Planned |

---

## 🎨 Design System

- **Colors**: `#050B18` background · `#00D4FF` cyan · `#00FF88` green · `#FF3366` red
- **Fonts**: Space Grotesk · JetBrains Mono · Inter
- **Theme**: Dark cyberpunk / blockchain security aesthetic
- **Animations**: Score gauge SVG, particle mesh, glitch text, scroll reveal, counter animations

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/` | API info |
| `GET`  | `/health` | Health check |
| `POST` | `/api/scan/domain` | Full domain security scan |
| `POST` | `/api/headers/analyze` | Email header forensic parse |
| `GET`  | `/api/blockchain/logs` | Audit ledger records |
| `GET`  | `/api/benchmark/{domain}` | Industry comparison |

---

*Smart India Hackathon 2026 · Problem SIH26159 · Blockchain & Cybersecurity*
