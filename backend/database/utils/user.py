from typing import TYPE_CHECKING

from sqlmodel import select
from database.schema.schema import User

if TYPE_CHECKING:
    from database.database import DatabaseSessionManager


class DatabaseSessionManagerUserUtils:
    def __init__(self, dsm: "DatabaseSessionManager"):
        self.dsm = dsm
        
    def get_by_id(self, user_id: int) -> User | None:
        """Retrieve a user by their ID."""
        return self.dsm.session.get(User, user_id)
    
    def get_by_name(self, name: str) -> User | None:
        """Retrieve a user by their username."""
        stmt = select(User).where(User.name == name)
        result = self.dsm.session.exec(stmt)
        return result.first()

    def get_by_email(self, email: str) -> User | None:
        """Retrieve a user by their email address."""
        return self.dsm.session.get(User, email)

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
    
    def update(self, user: User) -> User:
        """Update a user record."""
        self.dsm.session.add(user)
        self.dsm.session.commit()
        self.dsm.session.refresh(user)
        return user
