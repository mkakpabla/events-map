from datetime import date as Date
from enum import Enum

from bson import ObjectId
from pydantic import BaseModel, Field, field_validator


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

class PyObjectId(str):
    """Sérialise un ObjectId MongoDB en str pour Pydantic v2."""

    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v, _info=None):
        if isinstance(v, ObjectId):
            return str(v)
        if isinstance(v, str) and ObjectId.is_valid(v):
            return v
        raise ValueError(f"ObjectId invalide : {v!r}")

    @classmethod
    def __get_pydantic_core_schema__(cls, source_type, handler):
        from pydantic_core import core_schema
        return core_schema.no_info_plain_validator_function(cls.validate)


# ---------------------------------------------------------------------------
# Enum des types d'événements (doit correspondre au frontend)
# ---------------------------------------------------------------------------

class EventType(str, Enum):
    concert    = "concert"
    sport      = "sport"
    conference = "conference"
    expo       = "expo"
    soiree     = "soiree"
    festival   = "festival"


# ---------------------------------------------------------------------------
# Modèle GeoJSON Point (stocké dans MongoDB)
# ---------------------------------------------------------------------------

class GeoPoint(BaseModel):
    type: str = Field(default="Point", frozen=True)
    # GeoJSON : [longitude, latitude]
    coordinates: list[float] = Field(..., min_length=2, max_length=2)

    @field_validator("coordinates")
    @classmethod
    def validate_coordinates(cls, v: list[float]) -> list[float]:
        lng, lat = v
        if not (-180 <= lng <= 180):
            raise ValueError("Longitude doit être entre -180 et 180")
        if not (-90 <= lat <= 90):
            raise ValueError("Latitude doit être entre -90 et 90")
        return v


# ---------------------------------------------------------------------------
# Schémas Pydantic
# ---------------------------------------------------------------------------

class EventCreate(BaseModel):
    name: str        = Field(..., min_length=2, max_length=200)
    description: str = Field(..., min_length=2, max_length=2000, alias="desc")
    date: Date
    type: EventType
    lat: float       = Field(..., ge=-90,  le=90)
    lng: float       = Field(..., ge=-180, le=180)
    venue: str       = Field(..., min_length=2, max_length=300)

    model_config = {"populate_by_name": True}


class EventUpdate(BaseModel):
    name: str        | None = Field(None, min_length=2, max_length=200)
    description: str | None = Field(None, alias="desc")
    date: Date       | None = None
    type: EventType  | None = None
    lat: float       | None = Field(None, ge=-90,  le=90)
    lng: float       | None = Field(None, ge=-180, le=180)
    venue: str       | None = Field(None, min_length=2, max_length=300)

    model_config = {"populate_by_name": True}


class EventOut(BaseModel):
    id: str               = Field(alias="_id")
    name: str
    desc: str             = Field(alias="description")
    date: Date
    type: EventType
    lat: float
    lng: float
    venue: str
    source_url: str       = ""
    image_url: str        = ""

    model_config = {"populate_by_name": True}


# ---------------------------------------------------------------------------
# Helpers de conversion document Mongo → dict API
# ---------------------------------------------------------------------------

def doc_to_event(doc: dict) -> dict:
    """Convertit un document MongoDB en dict compatible EventOut."""
    coords = doc.get("location", {}).get("coordinates", [0.0, 0.0])
    return {
        "_id":         str(doc["_id"]),
        "name":        doc["name"],
        "description": doc.get("description", ""),
        "date":        doc["date"],
        "type":        doc["type"],
        "lng":         coords[0],
        "lat":         coords[1],
        "venue":       doc.get("venue", ""),
        "source_url":  doc.get("source_url", ""),
        "image_url":   doc.get("image_url", ""),
    }


def event_to_doc(event: EventCreate) -> dict:
    """Convertit un EventCreate en document MongoDB (GeoJSON)."""
    return {
        "name":        event.name,
        "description": event.description,
        "date":        event.date.isoformat(),
        "type":        event.type.value,
        "venue":       event.venue,
        "location": {
            "type":        "Point",
            "coordinates": [event.lng, event.lat],   # GeoJSON : [lng, lat]
        },
    }
