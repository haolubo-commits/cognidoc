"""
Pytest fixtures and in-memory mock database setup for CogniDoc API tests.
"""

import pytest
from unittest.mock import MagicMock
from fastapi.testclient import TestClient
from app.main import app
from app.db.session import get_db


@pytest.fixture
def mock_db_session():
    """Provides a mocked SQLAlchemy database session."""
    session = MagicMock()
    return session


@pytest.fixture
def client(mock_db_session):
    """Provides FastAPI TestClient with overridden get_db dependency."""
    app.dependency_overrides[get_db] = lambda: mock_db_session
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
