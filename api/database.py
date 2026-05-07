from motor.motor_asyncio import AsyncIOMotorClient
from config import settings

client: AsyncIOMotorClient | None = None


def get_database():
    return client[settings.MONGO_DB]


async def connect_db():
    global client
    client = AsyncIOMotorClient(settings.MONGO_URI)
    db = get_database()

    # Créer l'index géospatial 2dsphere sur le champ "location"
    await db["events"].create_index([("location", "2dsphere")])
    # Index sur date et type pour les filtres dynamiques
    await db["events"].create_index([("date", 1)])
    await db["events"].create_index([("type", 1)])

    print("✅  Connecté à MongoDB — index géospatiaux créés.")


async def close_db():
    global client
    if client:
        client.close()
        print("🔌  Connexion MongoDB fermée.")
