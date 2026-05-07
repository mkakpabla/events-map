"""Tests fonctionnels — main.py (routes de santé)."""
import pytest


class TestHealthEndpoints:
    @pytest.mark.anyio
    async def test_root_returns_ok(self, client):
        r = await client.get("/")
        assert r.status_code == 200
        assert r.json()["status"] == "ok"

    @pytest.mark.anyio
    async def test_root_contains_api_name(self, client):
        r = await client.get("/")
        assert "EventMap" in r.json()["message"]

    @pytest.mark.anyio
    async def test_health_returns_ok(self, client):
        r = await client.get("/health")
        assert r.status_code == 200
        assert r.json()["status"] == "ok"
