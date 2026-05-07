"""
seed.py — Peuple la base MongoDB eventmap avec des événements de démonstration.
Usage :  python seed.py [--clear]
"""

import asyncio
import sys

from motor.motor_asyncio import AsyncIOMotorClient

from config import settings

# ---------------------------------------------------------------------------
# Données de démonstration — Togo (Lomé et villes principales)
# Coordonnées GeoJSON : [longitude, latitude]
# ---------------------------------------------------------------------------

EVENTS = [
    # --- Lomé ---
    {
        "name": "Festival Afro-Fusion Lomé",
        "description": "Trois jours de concerts mêlant afrobeat, coupé-décalé et zouk avec des artistes d'Afrique de l'Ouest.",
        "date": "2026-05-10",
        "type": "festival",
        "venue": "Place de l'Indépendance, Lomé",
        "location": {"type": "Point", "coordinates": [1.2215, 6.1375]},
    },
    {
        "name": "Lomé International Marathon",
        "description": "Course sur 42 km le long du front de mer de Lomé, ouverte aux coureurs amateurs et professionnels.",
        "date": "2026-05-17",
        "type": "sport",
        "venue": "Boulevard du Mono, Lomé",
        "location": {"type": "Point", "coordinates": [1.2119, 6.1361]},
    },
    {
        "name": "Tech & Innovation Togo Summit",
        "description": "Conférence réunissant startups, investisseurs et acteurs du numérique pour accélérer la transformation digitale au Togo.",
        "date": "2026-05-20",
        "type": "conference",
        "venue": "Hôtel 2 Février, Lomé",
        "location": {"type": "Point", "coordinates": [1.2210, 6.1295]},
    },
    {
        "name": "Exposition Art Contemporain Togolais",
        "description": "Galerie réunissant une cinquantaine d'artistes plasticiens togolais autour du thème « Identités & Modernité ».",
        "date": "2026-05-08",
        "type": "expo",
        "venue": "Musée National du Togo, Lomé",
        "location": {"type": "Point", "coordinates": [1.2198, 6.1366]},
    },
    {
        "name": "Concert Fally Ipupa",
        "description": "Le roi de la rumba congolaise en tournée West Africa, une nuit inoubliable au bord de l'Atlantique.",
        "date": "2026-05-23",
        "type": "concert",
        "venue": "Palais des Congrès de Lomé",
        "location": {"type": "Point", "coordinates": [1.2155, 6.1408]},
    },
    {
        "name": "Soirée Beach Club Cococodji",
        "description": "DJ sets afrohouse et cocktails tropicaux les pieds dans le sable sur la plage de Cococodji.",
        "date": "2026-05-25",
        "type": "soiree",
        "venue": "Plage de Cococodji, Lomé",
        "location": {"type": "Point", "coordinates": [1.1952, 6.1489]},
    },
    {
        "name": "Championnat National de Football",
        "description": "Finale du championnat togolais entre les deux meilleures équipes de la saison 2025-2026.",
        "date": "2026-06-01",
        "type": "sport",
        "venue": "Stade de Kégué, Lomé",
        "location": {"type": "Point", "coordinates": [1.2450, 6.1500]},
    },
    {
        "name": "Forum Emploi & Entrepreneuriat",
        "description": "Rencontres entre recruteurs, mentors et jeunes diplômés pour booster l'employabilité au Togo.",
        "date": "2026-06-05",
        "type": "conference",
        "venue": "Université de Lomé, Campus",
        "location": {"type": "Point", "coordinates": [1.1878, 6.1755]},
    },
    {
        "name": "Festival de Danse Agbadja",
        "description": "Célébration des danses traditionnelles éwé et mina avec troupes de tout le pays.",
        "date": "2026-06-14",
        "type": "festival",
        "venue": "Place du Billet, Lomé",
        "location": {"type": "Point", "coordinates": [1.2230, 6.1320]},
    },
    {
        "name": "Expo Artisanat & Tissage Kente",
        "description": "Salon des artisans togolais mettant à l'honneur le tissage kente et les pagnes traditionnels.",
        "date": "2026-06-20",
        "type": "expo",
        "venue": "Grand Marché de Lomé",
        "location": {"type": "Point", "coordinates": [1.2233, 6.1371]},
    },
    # --- Kpalimé ---
    {
        "name": "Festival du Café & Cacao de Kpalimé",
        "description": "Découvrez les producteurs locaux, dégustations et balades dans les plantations des plateaux.",
        "date": "2026-06-07",
        "type": "expo",
        "venue": "Centre Culturel de Kpalimé",
        "location": {"type": "Point", "coordinates": [0.6257, 6.9007]},
    },
    {
        "name": "Trail des Monts Togo",
        "description": "Course nature de 25 km dans les collines verdoyantes autour de Kpalimé, pour tous niveaux.",
        "date": "2026-06-13",
        "type": "sport",
        "venue": "Kpalimé, Préfecture de Kloto",
        "location": {"type": "Point", "coordinates": [0.6263, 6.8994]},
    },
    # --- Sokodé ---
    {
        "name": "Fête de l'Adossa",
        "description": "Fête traditionnelle temba célébrée à Sokodé avec danses des couteaux et rituels ancestraux.",
        "date": "2026-06-21",
        "type": "festival",
        "venue": "Sokodé, Région Centrale",
        "location": {"type": "Point", "coordinates": [1.1362, 8.9833]},
    },
    # --- Kara ---
    {
        "name": "Tournoi de Basket-Ball Inter-Préfectures",
        "description": "Compétition inter-régionale de basket-ball réunissant les meilleures équipes du nord du Togo.",
        "date": "2026-05-30",
        "type": "sport",
        "venue": "Salle Omnisports de Kara",
        "location": {"type": "Point", "coordinates": [1.1866, 9.5511]},
    },
    {
        "name": "Conférence Agro-Pastorale du Nord",
        "description": "Échanges entre agriculteurs, chercheurs et ONG sur les pratiques durables dans la région de Kara.",
        "date": "2026-06-03",
        "type": "conference",
        "venue": "Maison des Jeunes de Kara",
        "location": {"type": "Point", "coordinates": [1.1910, 9.5489]},
    },
]

# ---------------------------------------------------------------------------


async def seed(clear: bool = False) -> None:
    client = AsyncIOMotorClient(settings.MONGO_URI)
    db = client[settings.MONGO_DB]
    collection = db["events"]

    if clear:
        deleted = await collection.delete_many({})
        print(f"🗑   {deleted.deleted_count} événement(s) supprimé(s).")

    # Index géospatial
    await collection.create_index([("location", "2dsphere")])
    await collection.create_index([("date", 1)])
    await collection.create_index([("type", 1)])

    result = await collection.insert_many(EVENTS)
    print(f"✅  {len(result.inserted_ids)} événement(s) insérés dans '{settings.MONGO_DB}.events'.")

    client.close()


if __name__ == "__main__":
    clear_flag = "--clear" in sys.argv
    asyncio.run(seed(clear=clear_flag))
