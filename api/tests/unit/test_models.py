"""Tests unitaires — modèles Pydantic, enums et helpers de conversion."""
from datetime import date

import pytest
from bson import ObjectId

from models import (
    EventCreate,
    EventOut,
    EventType,
    EventUpdate,
    GeoPoint,
    PyObjectId,
    doc_to_event,
    event_to_doc,
)

# ---------------------------------------------------------------------------
# Fixtures partagées
# ---------------------------------------------------------------------------

VALID_OID = "507f1f77bcf86cd799439011"


def sample_doc(**kwargs) -> dict:
    base = {
        "_id": ObjectId(VALID_OID),
        "name": "Jazz Night",
        "description": "Soirée jazz au club",
        "date": "2026-09-01",
        "type": "concert",
        "location": {"type": "Point", "coordinates": [2.35, 48.85]},
        "venue": "Olympia",
        "source_url": "https://example.com/jazz",
        "image_url": "https://example.com/img.jpg",
    }
    base.update(kwargs)
    return base


def valid_event_payload(**kwargs) -> dict:
    base = {
        "name": "Rock Festival",
        "desc": "Un super concert en plein air",
        "date": date(2026, 8, 15),
        "type": EventType.festival,
        "lat": 48.8566,
        "lng": 2.3522,
        "venue": "Stade de France",
    }
    base.update(kwargs)
    return base


# ---------------------------------------------------------------------------
# PyObjectId
# ---------------------------------------------------------------------------

class TestPyObjectId:
    def test_valid_string(self):
        assert PyObjectId.validate(VALID_OID) == VALID_OID

    def test_from_objectid_instance(self):
        oid = ObjectId(VALID_OID)
        assert PyObjectId.validate(oid) == VALID_OID

    def test_invalid_string_raises(self):
        with pytest.raises(ValueError):
            PyObjectId.validate("not-an-objectid")

    def test_empty_string_raises(self):
        with pytest.raises(ValueError):
            PyObjectId.validate("")

    def test_wrong_type_int_raises(self):
        with pytest.raises(ValueError):
            PyObjectId.validate(12345)

    def test_wrong_type_none_raises(self):
        with pytest.raises(ValueError):
            PyObjectId.validate(None)

    def test_too_short_hex_raises(self):
        with pytest.raises(ValueError):
            PyObjectId.validate("507f1f77bcf86cd79943901")  # 23 chars


# ---------------------------------------------------------------------------
# GeoPoint
# ---------------------------------------------------------------------------

class TestGeoPoint:
    def test_valid_coordinates(self):
        gp = GeoPoint(coordinates=[2.3522, 48.8566])
        assert gp.type == "Point"
        assert gp.coordinates == [2.3522, 48.8566]

    def test_default_type_is_point(self):
        gp = GeoPoint(coordinates=[0.0, 0.0])
        assert gp.type == "Point"

    def test_boundary_longitude_plus_180(self):
        gp = GeoPoint(coordinates=[180.0, 0.0])
        assert gp.coordinates[0] == 180.0

    def test_boundary_longitude_minus_180(self):
        gp = GeoPoint(coordinates=[-180.0, 0.0])
        assert gp.coordinates[0] == -180.0

    def test_boundary_latitude_plus_90(self):
        gp = GeoPoint(coordinates=[0.0, 90.0])
        assert gp.coordinates[1] == 90.0

    def test_boundary_latitude_minus_90(self):
        gp = GeoPoint(coordinates=[0.0, -90.0])
        assert gp.coordinates[1] == -90.0

    def test_longitude_too_high_raises(self):
        with pytest.raises(ValueError):
            GeoPoint(coordinates=[180.1, 0.0])

    def test_longitude_too_low_raises(self):
        with pytest.raises(ValueError):
            GeoPoint(coordinates=[-180.1, 0.0])

    def test_latitude_too_high_raises(self):
        with pytest.raises(ValueError):
            GeoPoint(coordinates=[0.0, 90.1])

    def test_latitude_too_low_raises(self):
        with pytest.raises(ValueError):
            GeoPoint(coordinates=[0.0, -90.1])

    def test_too_few_coordinates_raises(self):
        with pytest.raises(ValueError):
            GeoPoint(coordinates=[2.0])

    def test_too_many_coordinates_raises(self):
        with pytest.raises(ValueError):
            GeoPoint(coordinates=[2.0, 48.0, 100.0])


# ---------------------------------------------------------------------------
# EventType
# ---------------------------------------------------------------------------

class TestEventType:
    @pytest.mark.parametrize("value", [
        "concert", "sport", "conference", "expo", "soiree", "festival",
    ])
    def test_all_valid_types(self, value):
        et = EventType(value)
        assert et.value == value

    def test_invalid_type_raises(self):
        with pytest.raises(ValueError):
            EventType("unknown")

    def test_is_string_enum(self):
        assert isinstance(EventType.concert, str)
        assert EventType.concert == "concert"


# ---------------------------------------------------------------------------
# EventCreate
# ---------------------------------------------------------------------------

class TestEventCreate:
    def test_valid_event(self):
        ev = EventCreate(**valid_event_payload())
        assert ev.name == "Rock Festival"
        assert ev.type == EventType.festival
        assert ev.lat == 48.8566

    def test_description_accessible_via_alias(self):
        ev = EventCreate(**valid_event_payload())
        assert ev.description == "Un super concert en plein air"

    def test_name_too_short_raises(self):
        with pytest.raises(ValueError):
            EventCreate(**valid_event_payload(name="A"))

    def test_name_too_long_raises(self):
        with pytest.raises(ValueError):
            EventCreate(**valid_event_payload(name="A" * 201))

    def test_description_too_short_raises(self):
        with pytest.raises(ValueError):
            EventCreate(**valid_event_payload(desc="X"))

    def test_description_too_long_raises(self):
        with pytest.raises(ValueError):
            EventCreate(**valid_event_payload(desc="X" * 2001))

    def test_lat_too_high_raises(self):
        with pytest.raises(ValueError):
            EventCreate(**valid_event_payload(lat=90.1))

    def test_lat_too_low_raises(self):
        with pytest.raises(ValueError):
            EventCreate(**valid_event_payload(lat=-90.1))

    def test_lng_too_high_raises(self):
        with pytest.raises(ValueError):
            EventCreate(**valid_event_payload(lng=180.1))

    def test_lng_too_low_raises(self):
        with pytest.raises(ValueError):
            EventCreate(**valid_event_payload(lng=-180.1))

    def test_venue_too_short_raises(self):
        with pytest.raises(ValueError):
            EventCreate(**valid_event_payload(venue="X"))

    def test_boundary_lat_90(self):
        ev = EventCreate(**valid_event_payload(lat=90.0))
        assert ev.lat == 90.0

    def test_boundary_lng_minus_180(self):
        ev = EventCreate(**valid_event_payload(lng=-180.0))
        assert ev.lng == -180.0

    def test_date_is_preserved(self):
        d = date(2026, 12, 31)
        ev = EventCreate(**valid_event_payload(date=d))
        assert ev.date == d


# ---------------------------------------------------------------------------
# EventUpdate
# ---------------------------------------------------------------------------

class TestEventUpdate:
    def test_empty_update_all_none(self):
        ev = EventUpdate()
        assert ev.name is None
        assert ev.date is None
        assert ev.type is None
        assert ev.lat is None
        assert ev.lng is None
        assert ev.venue is None

    def test_partial_name_only(self):
        ev = EventUpdate(name="Nouveau nom")
        assert ev.name == "Nouveau nom"
        assert ev.lat is None

    def test_partial_lat_lng(self):
        ev = EventUpdate(lat=45.0, lng=3.0)
        assert ev.lat == 45.0
        assert ev.lng == 3.0
        assert ev.name is None

    def test_model_dump_excludes_none(self):
        ev = EventUpdate(name="Test")
        data = ev.model_dump(exclude_none=True)
        assert "name" in data
        assert "lat" not in data

    def test_name_too_short_raises(self):
        with pytest.raises(ValueError):
            EventUpdate(name="X")

    def test_lat_out_of_range_raises(self):
        with pytest.raises(ValueError):
            EventUpdate(lat=91.0)


# ---------------------------------------------------------------------------
# EventOut
# ---------------------------------------------------------------------------

class TestEventOut:
    def test_construct_from_doc(self):
        data = doc_to_event(sample_doc())
        ev = EventOut(**data)
        assert ev.id == VALID_OID
        assert ev.name == "Jazz Night"

    def test_defaults_source_and_image(self):
        data = doc_to_event(sample_doc(source_url="", image_url=""))
        ev = EventOut(**data)
        assert ev.source_url == ""
        assert ev.image_url == ""


# ---------------------------------------------------------------------------
# doc_to_event
# ---------------------------------------------------------------------------

class TestDocToEvent:
    def test_id_converted_to_string(self):
        result = doc_to_event(sample_doc())
        assert result["_id"] == VALID_OID
        assert isinstance(result["_id"], str)

    def test_coordinates_mapped(self):
        result = doc_to_event(sample_doc())
        assert result["lng"] == 2.35
        assert result["lat"] == 48.85

    def test_source_url_preserved(self):
        result = doc_to_event(sample_doc(source_url="https://test.com"))
        assert result["source_url"] == "https://test.com"

    def test_missing_source_url_defaults_empty(self):
        doc = sample_doc()
        doc.pop("source_url")
        result = doc_to_event(doc)
        assert result["source_url"] == ""

    def test_missing_image_url_defaults_empty(self):
        doc = sample_doc()
        doc.pop("image_url")
        result = doc_to_event(doc)
        assert result["image_url"] == ""

    def test_missing_venue_defaults_empty(self):
        doc = sample_doc()
        doc.pop("venue")
        result = doc_to_event(doc)
        assert result["venue"] == ""

    def test_description_preserved(self):
        result = doc_to_event(sample_doc())
        assert result["description"] == "Soirée jazz au club"

    def test_missing_location_defaults_zero(self):
        doc = sample_doc()
        doc.pop("location")
        result = doc_to_event(doc)
        assert result["lng"] == 0.0
        assert result["lat"] == 0.0


# ---------------------------------------------------------------------------
# event_to_doc
# ---------------------------------------------------------------------------

class TestEventToDoc:
    def _make_event(self, **kwargs):
        return EventCreate(**valid_event_payload(**kwargs))

    def test_geojson_structure(self):
        doc = event_to_doc(self._make_event())
        assert doc["location"]["type"] == "Point"
        assert len(doc["location"]["coordinates"]) == 2

    def test_geojson_lng_lat_order(self):
        doc = event_to_doc(self._make_event(lat=48.85, lng=2.35))
        # GeoJSON : [longitude, latitude]
        assert doc["location"]["coordinates"] == [2.35, 48.85]

    def test_date_as_isoformat(self):
        doc = event_to_doc(self._make_event(date=date(2026, 8, 15)))
        assert doc["date"] == "2026-08-15"

    def test_type_as_string_value(self):
        doc = event_to_doc(self._make_event(type=EventType.concert))
        assert doc["type"] == "concert"
        assert isinstance(doc["type"], str)

    def test_no_id_in_doc(self):
        doc = event_to_doc(self._make_event())
        assert "_id" not in doc

    def test_description_stored(self):
        doc = event_to_doc(self._make_event(desc="Description test"))
        assert doc["description"] == "Description test"
