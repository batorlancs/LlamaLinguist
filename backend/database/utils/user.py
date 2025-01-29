from typing import TYPE_CHECKING
from sqlmodel import select
from database.schema.schema import User

if TYPE_CHECKING:
    from database.database import DatabaseSessionManager


class DatabaseSessionManagerUserUtils:
    def __init__(self, dsm: "DatabaseSessionManager"):
        self.dsm = dsm
        
    def get(self, name: str) -> User | None:
        """Retrieve a user by their username."""
        statement = select(User).where(User.name == name)
        return self.dsm.session.exec(statement).first()

    def get_by_email(self, email: str) -> User | None:
        """Retrieve a user by their email address."""
        statement = select(User).where(User.email == email)
        return self.dsm.session.exec(statement).first()

    def create(self, user: User) -> User:
        """Create a new user record."""
        self.dsm.session.add(user)
        self.dsm.session.commit()
        self.dsm.session.refresh(user)
        return user
    
    def delete(self, user: User) -> None:
        """Delete a user record."""
        self.dsm.session.delete(user)
        self.dsm.session.commit()