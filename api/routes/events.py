from datetime import date as Date

from bson import ObjectId
from fastapi import APIRouter, HTTPException, Query, status
from database import get_database
from models import EventCreate, EventOut, EventUpdate, EventType, doc_to_event, event_to_doc

router = APIRouter(prefix="/events", tags=["events"])


# ---------------------------------------------------------------------------
# GET /events — liste avec filtres dynamiques
# ---------------------------------------------------------------------------

@router.get("/", response_model=list[EventOut])
async def list_events(
    type:       EventType | None = Query(None,  description="Filtrer par type"),
    date_from:  Date      | None = Query(None,  alias="dateFrom", description="Date de début (YYYY-MM-DD)"),
    date_to:    Date      | None = Query(None,  alias="dateTo",   description="Date de fin  (YYYY-MM-DD)"),
    limit:      int             = Query(100, ge=1, le=500),
    skip:       int             = Query(0,   ge=0),
):
    db = get_database()
    query: dict = {}

    if type:
        query["type"] = type.value

    if date_from or date_to:
        date_filter: dict = {}
        if date_from:
            date_filter["$gte"] = date_from.isoformat()
        if date_to:
            date_filter["$lte"] = date_to.isoformat()
        query["date"] = date_filter

    cursor = db["events"].find(query).skip(skip).limit(limit).sort("date", 1)
    return [EventOut(**doc_to_event(doc)) async for doc in cursor]


# ---------------------------------------------------------------------------
# GET /events/nearby — recherche par proximité
# ---------------------------------------------------------------------------

@router.get("/nearby", response_model=list[dict])
async def get_nearby(
    lat:    float       = Query(..., ge=-90,   le=90,   description="Latitude du centre"),
    lng:    float       = Query(..., ge=-180,  le=180,  description="Longitude du centre"),
    radius: float       = Query(5.0, gt=0,    le=20000, description="Rayon en kilomètres"),
    type:   EventType | None = Query(None,  description="Filtrer par type"),
    date_from: Date   | None = Query(None,  alias="dateFrom"),
    date_to:   Date   | None = Query(None,  alias="dateTo"),
    limit:  int             = Query(50, ge=1, le=500),
):
    db = get_database()

    query: dict = {
        "location": {
            "$nearSphere": {
                "$geometry": {"type": "Point", "coordinates": [lng, lat]},
                "$maxDistance": int(radius * 1000),   # mètres
            }
        }
    }

    if type:
        query["type"] = type.value

    if date_from or date_to:
        date_filter: dict = {}
        if date_from:
            date_filter["$gte"] = date_from.isoformat()
        if date_to:
            date_filter["$lte"] = date_to.isoformat()
        query["date"] = date_filter

    cursor = db["events"].find(query).limit(limit)
    results = []
    async for doc in cursor:
        event = doc_to_event(doc)
        # Calcul de la distance approximative (côté serveur via MongoDB)
        results.append(event)

    return results


# ---------------------------------------------------------------------------
# GET /events/{id}
# ---------------------------------------------------------------------------

@router.get("/{event_id}", response_model=EventOut)
async def get_event(event_id: str):
    if not ObjectId.is_valid(event_id):
        raise HTTPException(status_code=400, detail="ID invalide")

    db = get_database()
    doc = await db["events"].find_one({"_id": ObjectId(event_id)})

    if not doc:
        raise HTTPException(status_code=404, detail="Événement introuvable")

    return EventOut(**doc_to_event(doc))


# ---------------------------------------------------------------------------
# POST /events
# ---------------------------------------------------------------------------

@router.post("/", response_model=EventOut, status_code=status.HTTP_201_CREATED)
async def create_event(event: EventCreate):
    db = get_database()
    doc = event_to_doc(event)
    result = await db["events"].insert_one(doc)
    created = await db["events"].find_one({"_id": result.inserted_id})
    return EventOut(**doc_to_event(created))


# ---------------------------------------------------------------------------
# PATCH /events/{id}
# ---------------------------------------------------------------------------

@router.patch("/{event_id}", response_model=EventOut)
async def update_event(event_id: str, payload: EventUpdate):
    if not ObjectId.is_valid(event_id):
        raise HTTPException(status_code=400, detail="ID invalide")

    db = get_database()
    update_fields: dict = {}

    data = payload.model_dump(exclude_none=True, by_alias=False)

    for field, value in data.items():
        if field == "lat":
            # Mise à jour de la coordonnée latitude dans le GeoJSON
            doc = await db["events"].find_one({"_id": ObjectId(event_id)})
            if doc:
                coords = doc["location"]["coordinates"]
                coords[1] = value
                update_fields["location.coordinates"] = coords
        elif field == "lng":
            doc = await db["events"].find_one({"_id": ObjectId(event_id)})
            if doc:
                coords = doc["location"]["coordinates"]
                coords[0] = value
                update_fields["location.coordinates"] = coords
        elif field == "description":
            update_fields["description"] = value
        elif field == "date":
            update_fields["date"] = value.isoformat() if isinstance(value, Date) else value
        elif field == "type":
            update_fields["type"] = value.value if isinstance(value, EventType) else value
        else:
            update_fields[field] = value

    if not update_fields:
        raise HTTPException(status_code=400, detail="Aucun champ à mettre à jour")

    result = await db["events"].update_one(
        {"_id": ObjectId(event_id)},
        {"$set": update_fields},
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Événement introuvable")

    updated = await db["events"].find_one({"_id": ObjectId(event_id)})
    return EventOut(**doc_to_event(updated))


# ---------------------------------------------------------------------------
# DELETE /events/{id}
# ---------------------------------------------------------------------------

@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_event(event_id: str):
    if not ObjectId.is_valid(event_id):
        raise HTTPException(status_code=400, detail="ID invalide")

    db = get_database()
    result = await db["events"].delete_one({"_id": ObjectId(event_id)})

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Événement introuvable")
