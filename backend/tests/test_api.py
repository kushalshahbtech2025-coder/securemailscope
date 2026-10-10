import asyncio
import os
import sys
from pathlib import Path
from unittest.mock import patch
from tempfile import TemporaryDirectory

import httpx
import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from backend import main


class APIClient:
    def __init__(self):
        self.client = httpx.AsyncClient(transport=httpx.ASGITransport(app=main.app), base_url="http://testserver")

    def __enter__(self):
        main.startup()
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        asyncio.run(self.client.aclose())

    def get(self, path):
        return asyncio.run(self.client.get(path))

    def post(self, path, **kwargs):
        return asyncio.run(self.client.post(path, **kwargs))


@pytest.fixture(autouse=True)
def configure_test_database(monkeypatch):
    with TemporaryDirectory() as test_dir:
        monkeypatch.setattr(main, "DATABASE_PATH", str(Path(test_dir) / "audit.sqlite3"))
        main.init_audit_db()
        yield


def test_health_and_root():
    with APIClient() as client:
        assert client.get("/health").json()["status"] == "healthy"
        assert client.get("/").json()["name"] == "SecureMailScope API"


def test_rejects_invalid_domain():
    with APIClient() as client:
        response = client.post("/api/scan/domain", json={"domain": "https://127.0.0.1"})
        assert response.status_code == 422


def test_scan_is_honest_and_audited():
    checks = [
        {"status": "pass", "value": "v=spf1 -all", "severity": "low", "detail": "SPF found"},
        {"status": "pass", "value": "selector", "severity": "low", "detail": "DKIM found"},
        {"status": "warn", "value": "p=quarantine", "severity": "medium", "detail": "DMARC quarantine"},
        {"status": "unknown", "value": "TLS unavailable", "severity": "medium", "detail": "Probe unavailable"},
    ]
    with patch.multiple(main, check_spf=lambda _: checks[0], check_dkim=lambda _: checks[1], check_dmarc=lambda _: checks[2], check_tls=lambda _: checks[3]), patch.object(main, "generate_gemini_analysis", return_value={"content": "fallback", "source": "rule_engine"}):
        with APIClient() as client:
            response = client.post("/api/scan/domain", json={"domain": "example.com"})
            assert response.status_code == 200
            result = response.json()
            assert result["score"] == 86
            assert result["tx_hash"] is None
            assert result["checks"][-1]["status"] == "unknown"
            logs = client.get("/api/blockchain/logs").json()
            assert logs["total"] == 1
            assert logs["storage"] == "sqlite"


def test_pagination_validation_and_benchmark_is_deterministic():
    with APIClient() as client:
        assert client.get("/api/blockchain/logs?limit=1000").status_code == 422
        first = client.get("/api/benchmark/example.com").json()
        second = client.get("/api/benchmark/example.com").json()
        assert first == second
        assert first["comparison_available"] is False


def test_header_unfolds_and_parses_ipv6():
    with APIClient() as client:
        response = client.post("/api/headers/analyze", json={"raw_header": "Authentication-Results: mx;\n dkim=pass; spf=fail\nReceived: from host [2001:db8::1]"})
        assert response.status_code == 200
        data = response.json()
        assert data["auth_results"]["dkim"] == "pass"
        assert data["auth_results"]["spf"] == "fail"
        assert data["hops"][0]["ip"] == "2001:db8::1"


def test_model_features_are_validated():
    with APIClient() as client:
        assert client.post("/api/model/predict", json={"features": [1, 2]}).status_code == 400
        bad_features = ",".join(["NaN"] * len(main.FEATURE_NAMES))
        response = client.post("/api/model/predict", content=f'{{"features":[{bad_features}]}}', headers={"Content-Type": "application/json"})
        assert response.status_code == 400
