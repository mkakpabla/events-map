"""Tests fonctionnels — routes/events.py."""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from bson import ObjectId

from tests.helpers import AsyncIter

SAMPLE_OID = "507f1f77bcf86cd799439011"
OTHER_OID = "617f1f77bcf86cd799439022"

SAMPLE_DOC = {
    "_id": ObjectId(SAMPLE_OID),
    "name": "Rock Festival",
    "description": "Un super concert en plein air",
    "date": "2026-08-15",
    "type": "festival",
    "location": {"type": "Point", "coordinates": [2.3522, 48.8566]},
    "venue": "Stade de France",
    "source_url": "https://example.com",
    "image_url": "",
}

CONCERT_DOC = {
    "_id": ObjectId(OTHER_OID),
    "name": "Jazz Night",
    "description": "Soirée jazz",
    "date": "2026-09-01",
    "type": "concert",
    "location": {"type": "Point", "coordinates": [2.35, 48.85]},
    "venue": "Olympia",
    "source_url": "",
    "image_url": "",
}

BASE_PAYLOAD = {
    "name": "Rock Festival",
    "desc": "Un super concert en plein air",
    "date": "2026-08-15",
    "type": "festival",
    "lat": 48.8566,
    "lng": 2.3522,
    "venue": "Stade de France",
}


# ---------------------------------------------------------------------------
# GET /api/v1/events/
# ---------------------------------------------------------------------------


class TestListEvents:
    @pytest.mark.anyio
    async def test_empty_collection(self, client):
        with patch("routes.events.get_database") as m:
            m.return_value["events"].find.return_value = AsyncIter([])
            r = await client.get("/api/v1/events/")
        assert r.status_code == 200
        assert r.json() == []

    @pytest.mark.anyio
    async def test_returns_all_events(self, client):
        with patch("routes.events.get_database") as m:
            m.return_value["events"].find.return_value = AsyncIter([SAMPLE_DOC, CONCERT_DOC])
            r = await client.get("/api/v1/events/")
        assert r.status_code == 200
        assert len(r.json()) == 2

    @pytest.mark.anyio
    async def test_event_fields_present(self, client):
        with patch("routes.events.get_database") as m:
            m.return_value["events"].find.return_value = AsyncIter([SAMPLE_DOC])
            r = await client.get("/api/v1/events/")
        data = r.json()[0]
        assert data["_id"] == SAMPLE_OID
        assert data["name"] == "Rock Festival"
        assert data["type"] == "festival"
        assert "lat" in data and "lng" in data

    @pytest.mark.anyio
    async def test_filter_by_type_passes_query(self, client):
        with patch("routes.events.get_database") as m:
            m.return_value["events"].find.return_value = AsyncIter([CONCERT_DOC])
            r = await client.get("/api/v1/events/?type=concert")
        assert r.status_code == 200
        call_args = m.return_value["events"].find.call_args[0][0]
        assert call_args.get("type") == "concert"

    @pytest.mark.anyio
    async def test_filter_by_date_from(self, client):
        with patch("routes.events.get_database") as m:
            m.return_value["events"].find.return_value = AsyncIter([SAMPLE_DOC])
            r = await client.get("/api/v1/events/?dateFrom=2026-08-01")
        assert r.status_code == 200
        call_args = m.return_value["events"].find.call_args[0][0]
        assert "$gte" in call_args["date"]

    @pytest.mark.anyio
    async def test_filter_by_date_to(self, client):
        with patch("routes.events.get_database") as m:
            m.return_value["events"].find.return_value = AsyncIter([SAMPLE_DOC])
            r = await client.get("/api/v1/events/?dateTo=2026-12-31")
        assert r.status_code == 200
        call_args = m.return_value["events"].find.call_args[0][0]
        assert "$lte" in call_args["date"]

    @pytest.mark.anyio
    async def test_filter_date_range(self, client):
        with patch("routes.events.get_database") as m:
            m.return_value["events"].find.return_value = AsyncIter([SAMPLE_DOC])
            r = await client.get("/api/v1/events/?dateFrom=2026-01-01&dateTo=2026-12-31")
        assert r.status_code == 200
        call_args = m.return_value["events"].find.call_args[0][0]
        assert "$gte" in call_args["date"]
        assert "$lte" in call_args["date"]

    @pytest.mark.anyio
    async def test_invalid_type_returns_422(self, client):
        r = await client.get("/api/v1/events/?type=invalid_type")
        assert r.status_code == 422

    @pytest.mark.anyio
    async def test_limit_too_high_returns_422(self, client):
        r = await client.get("/api/v1/events/?limit=501")
        assert r.status_code == 422

    @pytest.mark.anyio
    async def test_negative_skip_returns_422(self, client):
        r = await client.get("/api/v1/events/?skip=-1")
        assert r.status_code == 422


# ---------------------------------------------------------------------------
# GET /api/v1/events/nearby
# ---------------------------------------------------------------------------


class TestNearbyEvents:
    @pytest.mark.anyio
    async def test_requires_lat(self, client):
        r = await client.get("/api/v1/events/nearby?lng=2.35")
        assert r.status_code == 422

    @pytest.mark.anyio
    async def test_requires_lng(self, client):
        r = await client.get("/api/v1/events/nearby?lat=48.85")
        assert r.status_code == 422

    @pytest.mark.anyio
    async def test_valid_returns_list(self, client):
        with patch("routes.events.get_database") as m:
            m.return_value["events"].find.return_value = AsyncIter([SAMPLE_DOC])
            r = await client.get("/api/v1/events/nearby?lat=48.85&lng=2.35")
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    @pytest.mark.anyio
    async def test_empty_result(self, client):
        with patch("routes.events.get_database") as m:
            m.return_value["events"].find.return_value = AsyncIter([])
            r = await client.get("/api/v1/events/nearby?lat=48.85&lng=2.35")
        assert r.status_code == 200
        assert r.json() == []

    @pytest.mark.anyio
    async def test_with_type_filter(self, client):
        with patch("routes.events.get_database") as m:
            m.return_value["events"].find.return_value = AsyncIter([CONCERT_DOC])
            r = await client.get("/api/v1/events/nearby?lat=48.85&lng=2.35&type=concert")
        assert r.status_code == 200
        call_args = m.return_value["events"].find.call_args[0][0]
        assert call_args.get("type") == "concert"

    @pytest.mark.anyio
    async def test_lat_out_of_range(self, client):
        r = await client.get("/api/v1/events/nearby?lat=91&lng=2.35")
        assert r.status_code == 422

    @pytest.mark.anyio
    async def test_radius_converts_to_meters(self, client):
        with patch("routes.events.get_database") as m:
            m.return_value["events"].find.return_value = AsyncIter([])
            await client.get("/api/v1/events/nearby?lat=48.85&lng=2.35&radius=10")
        call_args = m.return_value["events"].find.call_args[0][0]
        max_dist = call_args["location"]["$nearSphere"]["$maxDistance"]
        assert max_dist == 10_000


# ---------------------------------------------------------------------------
# GET /api/v1/events/{id}
# ---------------------------------------------------------------------------


class TestGetEventById:
    @pytest.mark.anyio
    async def test_invalid_id_returns_400(self, client):
        r = await client.get("/api/v1/events/not-an-id")
        assert r.status_code == 400

    @pytest.mark.anyio
    async def test_not_found_returns_404(self, client):
        with patch("routes.events.get_database") as m:
            m.return_value["events"].find_one = AsyncMock(return_value=None)
            r = await client.get(f"/api/v1/events/{SAMPLE_OID}")
        assert r.status_code == 404

    @pytest.mark.anyio
    async def test_found_returns_event(self, client):
        with patch("routes.events.get_database") as m:
            m.return_value["events"].find_one = AsyncMock(return_value=SAMPLE_DOC)
            r = await client.get(f"/api/v1/events/{SAMPLE_OID}")
        assert r.status_code == 200
        assert r.json()["_id"] == SAMPLE_OID
        assert r.json()["name"] == "Rock Festival"

    @pytest.mark.anyio
    async def test_found_returns_correct_type(self, client):
        with patch("routes.events.get_database") as m:
            m.return_value["events"].find_one = AsyncMock(return_value=SAMPLE_DOC)
            r = await client.get(f"/api/v1/events/{SAMPLE_OID}")
        assert r.json()["type"] == "festival"

    @pytest.mark.anyio
    async def test_found_returns_coordinates(self, client):
        with patch("routes.events.get_database") as m:
            m.return_value["events"].find_one = AsyncMock(return_value=SAMPLE_DOC)
            r = await client.get(f"/api/v1/events/{SAMPLE_OID}")
        data = r.json()
        assert data["lat"] == 48.8566
        assert data["lng"] == 2.3522


# ---------------------------------------------------------------------------
# POST /api/v1/events/
# ---------------------------------------------------------------------------


class TestCreateEvent:
    @pytest.mark.anyio
    async def test_returns_201(self, client):
        with patch("routes.events.get_database") as m:
            m.return_value["events"].insert_one = AsyncMock(
                return_value=MagicMock(inserted_id=ObjectId(SAMPLE_OID))
            )
            m.return_value["events"].find_one = AsyncMock(return_value=SAMPLE_DOC)
            r = await client.post("/api/v1/events/", json=BASE_PAYLOAD)
        assert r.status_code == 201

    @pytest.mark.anyio
    async def test_returns_created_event(self, client):
        with patch("routes.events.get_database") as m:
            m.return_value["events"].insert_one = AsyncMock(
                return_value=MagicMock(inserted_id=ObjectId(SAMPLE_OID))
            )
            m.return_value["events"].find_one = AsyncMock(return_value=SAMPLE_DOC)
            r = await client.post("/api/v1/events/", json=BASE_PAYLOAD)
        assert r.json()["name"] == "Rock Festival"

    @pytest.mark.anyio
    async def test_missing_venue_returns_422(self, client):
        payload = {**BASE_PAYLOAD}
        del payload["venue"]
        r = await client.post("/api/v1/events/", json=payload)
        assert r.status_code == 422

    @pytest.mark.anyio
    async def test_name_too_short_returns_422(self, client):
        r = await client.post("/api/v1/events/", json={**BASE_PAYLOAD, "name": "X"})
        assert r.status_code == 422

    @pytest.mark.anyio
    async def test_invalid_event_type_returns_422(self, client):
        r = await client.post("/api/v1/events/", json={**BASE_PAYLOAD, "type": "rave"})
        assert r.status_code == 422

    @pytest.mark.anyio
    async def test_lat_out_of_range_returns_422(self, client):
        r = await client.post("/api/v1/events/", json={**BASE_PAYLOAD, "lat": 91.0})
        assert r.status_code == 422

    @pytest.mark.anyio
    async def test_empty_body_returns_422(self, client):
        r = await client.post("/api/v1/events/", json={})
        assert r.status_code == 422


# ---------------------------------------------------------------------------
# PATCH /api/v1/events/{id}
# ---------------------------------------------------------------------------


class TestUpdateEvent:
    @pytest.mark.anyio
    async def test_invalid_id_returns_400(self, client):
        r = await client.patch("/api/v1/events/bad-id", json={"name": "Test"})
        assert r.status_code == 400

    @pytest.mark.anyio
    async def test_empty_payload_returns_400(self, client):
        r = await client.patch(f"/api/v1/events/{SAMPLE_OID}", json={})
        assert r.status_code == 400

    @pytest.mark.anyio
    async def test_not_found_returns_404(self, client):
        with patch("routes.events.get_database") as m:
            m.return_value["events"].update_one = AsyncMock(return_value=MagicMock(matched_count=0))
            r = await client.patch(f"/api/v1/events/{SAMPLE_OID}", json={"name": "Nouveau nom"})
        assert r.status_code == 404

    @pytest.mark.anyio
    async def test_successful_update_returns_200(self, client):
        updated_doc = {**SAMPLE_DOC, "name": "Nouveau nom"}
        with patch("routes.events.get_database") as m:
            m.return_value["events"].update_one = AsyncMock(return_value=MagicMock(matched_count=1))
            m.return_value["events"].find_one = AsyncMock(return_value=updated_doc)
            r = await client.patch(f"/api/v1/events/{SAMPLE_OID}", json={"name": "Nouveau nom"})
        assert r.status_code == 200
        assert r.json()["name"] == "Nouveau nom"

    @pytest.mark.anyio
    async def test_name_too_short_returns_422(self, client):
        r = await client.patch(f"/api/v1/events/{SAMPLE_OID}", json={"name": "X"})
        assert r.status_code == 422


# ---------------------------------------------------------------------------
# DELETE /api/v1/events/{id}
# ---------------------------------------------------------------------------


class TestDeleteEvent:
    @pytest.mark.anyio
    async def test_invalid_id_returns_400(self, client):
        r = await client.delete("/api/v1/events/bad-id")
        assert r.status_code == 400

    @pytest.mark.anyio
    async def test_not_found_returns_404(self, client):
        with patch("routes.events.get_database") as m:
            m.return_value["events"].delete_one = AsyncMock(return_value=MagicMock(deleted_count=0))
            r = await client.delete(f"/api/v1/events/{SAMPLE_OID}")
        assert r.status_code == 404

    @pytest.mark.anyio
    async def test_successful_delete_returns_204(self, client):
        with patch("routes.events.get_database") as m:
            m.return_value["events"].delete_one = AsyncMock(return_value=MagicMock(deleted_count=1))
            r = await client.delete(f"/api/v1/events/{SAMPLE_OID}")
        assert r.status_code == 204

    @pytest.mark.anyio
    async def test_successful_delete_has_no_body(self, client):
        with patch("routes.events.get_database") as m:
            m.return_value["events"].delete_one = AsyncMock(return_value=MagicMock(deleted_count=1))
            r = await client.delete(f"/api/v1/events/{SAMPLE_OID}")
        assert r.content == b""
