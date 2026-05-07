from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from database import close_db, connect_db
from routes.events import router as events_router

# Dossier des images téléchargées par le scraper
STATIC_DIR = Path(__file__).parent / "static"
STATIC_DIR.mkdir(parents=True, exist_ok=True)
(STATIC_DIR / "images").mkdir(exist_ok=True)


# ---------------------------------------------------------------------------
# Lifespan (démarrage / arrêt)
# ---------------------------------------------------------------------------


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    yield
    await close_db()


# ---------------------------------------------------------------------------
# Application
# ---------------------------------------------------------------------------

app = FastAPI(
    title="EventMap API",
    description="API géospatiale pour la recherche d'événements par localisation et date.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — autorise le frontend Vite (port 5173) et tout origine en dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

app.include_router(events_router, prefix="/api/v1")

# Fichiers statiques (images des événements)
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


@app.get("/", tags=["health"])
async def root():
    return {"status": "ok", "message": "EventMap API v1.0.0"}


@app.get("/health", tags=["health"])
async def health():
    return {"status": "ok"}
