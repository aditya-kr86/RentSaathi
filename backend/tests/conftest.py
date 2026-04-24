from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from database import Base, get_db
from main import (
    app,
    configure_login_rate_limit,
    configure_waitlist_rate_limit,
    reset_login_rate_limit_state,
    reset_waitlist_rate_limit_state,
)


@pytest.fixture()
def client() -> Generator[TestClient, None, None]:
    test_engine = create_engine(
        "sqlite+pysqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)
    Base.metadata.create_all(bind=test_engine)

    def override_get_db() -> Generator[Session, None, None]:
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db

    configure_waitlist_rate_limit(max_requests=5, window_seconds=60)
    reset_waitlist_rate_limit_state()
    configure_login_rate_limit(max_requests=10, window_seconds=60)
    reset_login_rate_limit_state()

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()
