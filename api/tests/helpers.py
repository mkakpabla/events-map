"""Helpers partagés entre les tests unit et fonctionnels."""


class AsyncIter:
    """Simule un curseur Motor (async for doc in cursor)."""

    def __init__(self, items: list):
        self._items = iter(items)

    def __aiter__(self):
        return self

    async def __anext__(self):
        try:
            return next(self._items)
        except StopIteration:
            raise StopAsyncIteration

    # Chaînage .skip().limit().sort() — chaque méthode retourne self
    def skip(self, n):
        return self

    def limit(self, n):
        return self

    def sort(self, *args):
        return self
