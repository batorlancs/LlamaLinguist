from dataclasses import dataclass
from typing import Any
from sqlalchemy import create_engine
from sqlmodel import Session
from config.secrets import Secrets
from database.utils.base import DatabaseSessionManagerUtils


@dataclass
class Config:
    url: str = Secrets.get("DATABASE_URL")


class DatabaseSessionManager:
    """Database access layer providing CRUD operations for users, conversations, messages and assistants."""

    def __init__(self):
        """Initialize database connection engine."""
        self.engine = create_engine(Config.url)
        self.session: Session = None # type: ignore
        self.utils = DatabaseSessionManagerUtils(self)

    def __enter__(self) -> "DatabaseSessionManager":
        """Context manager entry point that creates a new database session."""
        self.session = Session(self.engine)
        return self

    def __exit__(self, exc_type: Any, exc_val: Any, exc_tb: Any):
        """Context manager exit point that ensures proper session cleanup."""
        if self.session:
            self.session.close()
