import sys
from pathlib import Path

# Ajoute api/ au sys.path pour que les tests trouvent les modules (models, database...)
sys.path.insert(0, str(Path(__file__).parent.parent))

from unittest.mock import MagicMock

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient

from tests.helpers import AsyncIter  # noqa: F401 — réexporté pour les sous-modules

# ---------------------------------------------------------------------------
# Fixture — client HTTP branché sur l'app FastAPI sans MongoDB réel
# ---------------------------------------------------------------------------

@pytest.fixture(scope="session")
def anyio_backend():
    return "asyncio"


@pytest_asyncio.fixture
async def client():
    import database

    mock_db = MagicMock()
    database.client = MagicMock()
    database.client.__getitem__ = MagicMock(return_value=mock_db)

    from main import app

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        yield ac

