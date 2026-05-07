# EventMap

Application full-stack de localisation d'événements — recherche géospatiale par proximité, filtres dynamiques et visualisation cartographique.

---

## Table des matières

- [Aperçu](#aperçu)
- [Stack technique](#stack-technique)
- [Structure du projet](#structure-du-projet)
- [Prérequis](#prérequis)
- [Installation](#installation)
  - [Backend — API FastAPI](#backend--api-fastapi)
  - [Frontend — React / Vite](#frontend--react--vite)
- [Configuration](#configuration)
- [Base de données](#base-de-données)
  - [Index géospatiaux](#index-géospatiaux)
  - [Peupler la base](#peupler-la-base)
- [Lancement](#lancement)
- [API Reference](#api-reference)
  - [GET /api/v1/events](#get-apiv1events)
  - [GET /api/v1/events/nearby](#get-apiv1eventsnearby)
  - [GET /api/v1/events/:id](#get-apiv1eventsid)
  - [POST /api/v1/events](#post-apiv1events)
  - [PATCH /api/v1/events/:id](#patch-apiv1eventsid)
  - [DELETE /api/v1/events/:id](#delete-apiv1eventsid)
- [Types d'événements](#types-dévénements)
- [Frontend](#frontend)
- [Captures d'écran](#captures-décran)

---

## Aperçu

EventMap permet de :

- **Stocker** des événements avec nom, description, date, type et coordonnées GPS dans MongoDB
- **Rechercher** des événements par proximité géographique (rayon configurable)
- **Filtrer** dynamiquement par type d'événement et plage de dates
- **Visualiser** les événements sur une carte interactive (Leaflet.js)

---

## Stack technique

| Couche | Technologie |
|---|---|
| **API** | Python 3.11+, FastAPI 0.111, Uvicorn |
| **Base de données** | MongoDB 6+ avec index `2dsphere` |
| **ODM async** | Motor 3 (driver MongoDB asynchrone) |
| **Validation** | Pydantic v2 |
| **Frontend** | React 18, Vite 5 |
| **Carte** | Leaflet.js 1.9 |
| **Icônes** | Font Awesome 6 |

---

## Structure du projet

```
event-map/
├── api/                        ← Backend FastAPI
│   ├── main.py                 ← Application FastAPI (CORS, lifespan)
│   ├── config.py               ← Variables d'environnement (pydantic-settings)
│   ├── database.py             ← Connexion Motor + création des index
│   ├── models.py               ← Modèles Pydantic + helpers Mongo ↔ API
│   ├── seed.py                 ← Script de population (20 événements)
│   ├── routes/
│   │   └── events.py           ← CRUD + recherche géospatiale
│   ├── requirements.txt
│   └── .env                    ← Configuration locale (non versionné)
│
└── front/                      ← Frontend React
    ├── index.html
    ├── vite.config.js
    ├── package.json
    └── src/
        ├── App.jsx
        ├── main.jsx
        ├── components/
        │   ├── EventCard.jsx
        │   ├── Icon.jsx
        │   ├── MapView.jsx      ← Carte Leaflet
        │   ├── TweaksPanel.jsx
        │   └── EventDetail/
        │       ├── index.jsx
        │       ├── PopupP1.jsx
        │       ├── PopupP2.jsx
        │       └── PopupP3.jsx
        ├── data/
        │   └── constants.js     ← Types d'événements, thèmes, données mock
        ├── styles/
        │   └── index.css
        ├── utils/
        │   └── helpers.js       ← formatDate, haversine
        └── variants/
            ├── VariantA.jsx
            ├── VariantB.jsx
            └── VariantC.jsx
```

---

## Prérequis

- **Python** 3.11+
- **Node.js** 18+
- **MongoDB** 6+ en cours d'exécution localement (ou URI de connexion distant)

Démarrer MongoDB localement :

```bash
# macOS avec Homebrew
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

---

## Installation

### Backend — API FastAPI

```bash
cd api

# Créer et activer l'environnement virtuel
python3 -m venv .venv
source .venv/bin/activate        # macOS / Linux
# .venv\Scripts\activate         # Windows

# Installer les dépendances
pip install -r requirements.txt
```

### Frontend — React / Vite

```bash
cd front
npm install
```

---

## Configuration

Créer ou modifier le fichier `api/.env` :

```env
MONGO_URI=mongodb://localhost:27017
MONGO_DB=eventmap
```

| Variable | Valeur par défaut | Description |
|---|---|---|
| `MONGO_URI` | `mongodb://localhost:27017` | URI de connexion MongoDB |
| `MONGO_DB` | `eventmap` | Nom de la base de données |

---

## Base de données

### Index géospatiaux

Les index sont créés **automatiquement** au démarrage de l'API (via `database.py`) :

```
db.events.createIndex({ "location": "2dsphere" })   ← recherche géospatiale
db.events.createIndex({ "date": 1 })                ← filtres par date
db.events.createIndex({ "type": 1 })                ← filtres par type
```

Chaque document événement stocke les coordonnées au format **GeoJSON Point** :

```json
{
  "name": "Festival Jazz en Seine",
  "description": "3 jours de jazz live...",
  "date": "2026-05-10",
  "type": "concert",
  "venue": "Parc Rives de Seine, Paris",
  "location": {
    "type": "Point",
    "coordinates": [2.347, 48.853]
  }
}
```

> ⚠️ GeoJSON suit l'ordre **[longitude, latitude]**, contrairement à Leaflet qui attend **[latitude, longitude]**. La conversion est gérée dans `models.py`.

### Peupler la base

```bash
cd api
source .venv/bin/activate

# Insérer les 20 événements de démonstration
python seed.py

# Réinitialiser et réinsérer
python seed.py --clear
```

Les données couvrent Paris, Lyon, Marseille, Bordeaux et Toulouse.

---

## Lancement

Démarrer le backend et le frontend dans deux terminaux séparés :

**Terminal 1 — API**

```bash
cd api
source .venv/bin/activate
uvicorn main:app --reload --port 8000
```

**Terminal 2 — Frontend**

```bash
cd front
npm run dev
```

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| API | http://localhost:8000 |
| Documentation interactive (Swagger) | http://localhost:8000/docs |
| Documentation alternative (ReDoc) | http://localhost:8000/redoc |

---

## API Reference

### GET /api/v1/events

Retourne la liste des événements avec filtres optionnels.

**Paramètres de requête**

| Paramètre | Type | Description |
|---|---|---|
| `type` | `string` | Filtrer par type (voir [Types d'événements](#types-dévénements)) |
| `dateFrom` | `YYYY-MM-DD` | Date de début |
| `dateTo` | `YYYY-MM-DD` | Date de fin |
| `limit` | `int` | Nombre max de résultats (défaut : 100) |
| `skip` | `int` | Pagination (défaut : 0) |

**Exemple**

```
GET /api/v1/events?type=concert&dateFrom=2026-05-01&dateTo=2026-06-01
```

---

### GET /api/v1/events/nearby

Recherche les événements dans un rayon géographique.

**Paramètres de requête**

| Paramètre | Type | Requis | Description |
|---|---|---|---|
| `lat` | `float` | ✅ | Latitude du centre |
| `lng` | `float` | ✅ | Longitude du centre |
| `radius` | `float` | — | Rayon en **kilomètres** (défaut : 5) |
| `type` | `string` | — | Filtrer par type |
| `dateFrom` | `YYYY-MM-DD` | — | Date de début |
| `dateTo` | `YYYY-MM-DD` | — | Date de fin |
| `limit` | `int` | — | Nombre max de résultats (défaut : 50) |

**Exemple**

```
GET /api/v1/events/nearby?lat=48.857&lng=2.347&radius=10&type=festival
```

> Utilise l'opérateur MongoDB `$nearSphere` avec `$maxDistance` en mètres.

---

### GET /api/v1/events/:id

Retourne un événement par son identifiant MongoDB.

```
GET /api/v1/events/664a1f2b3c8d9e0f1a2b3c4d
```

---

### POST /api/v1/events

Crée un nouvel événement.

**Corps (JSON)**

```json
{
  "name": "Mon événement",
  "desc": "Description de l'événement",
  "date": "2026-07-15",
  "type": "concert",
  "lat": 48.857,
  "lng": 2.347,
  "venue": "Salle Pleyel, Paris 8e"
}
```

---

### PATCH /api/v1/events/:id

Met à jour partiellement un événement (tous les champs sont optionnels).

```json
{
  "date": "2026-08-01",
  "venue": "Nouveau lieu"
}
```

---

### DELETE /api/v1/events/:id

Supprime un événement. Retourne `204 No Content`.

---

## Types d'événements

| Valeur | Label | Couleur |
|---|---|---|
| `concert` | Concert | `#ec4899` |
| `sport` | Sport | `#f97316` |
| `conference` | Conférence | `#6366f1` |
| `expo` | Exposition | `#10b981` |
| `soiree` | Soirée | `#8b5cf6` |
| `festival` | Festival | `#f59e0b` |

---

## Frontend

L'interface React propose :

- **Carte interactive** Leaflet avec marqueurs colorés par type d'événement
- **Panneau latéral** avec liste des événements et filtres (type, date, rayon)
- **Détail popup** en 3 designs au choix (P1, P2, P3)
- **3 variantes d'interface** (A, B, C) avec thèmes couleur (Indigo, Rose, Emerald)
- **Panneau de personnalisation** (TweaksPanel) pour switcher entre variantes et thèmes en live
