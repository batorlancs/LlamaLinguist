from sqlmodel import select
from database.schema.schema import Assistant, User
from typing import TYPE_CHECKING, List

if TYPE_CHECKING:
    from database.database import DatabaseSessionManager


class DatabaseSessionManagerAssistantUtils:
    def __init__(self, dsm: "DatabaseSessionManager"):
        self.dsm = dsm

    def get_by_id(self, assistant_id: int) -> Assistant | None:
        """Retrieve a specific assistant by its ID."""
        statement = select(Assistant).where(Assistant.id == assistant_id)
        return self.dsm.session.exec(statement).first()

    def get_all(self, user: User) -> List[Assistant]:
        """Retrieve all assistants for a given user."""
        statement = select(Assistant).where(Assistant.user_id == user.id)
        return list(self.dsm.session.exec(statement))

    def create(self, assistant: Assistant) -> Assistant:
        """Create a new assistant record."""
        self.dsm.session.add(assistant)
        self.dsm.session.commit()
        self.dsm.session.refresh(assistant)
        return assistant

    def delete(self, assistant: Assistant) -> None:
        """Delete an assistant record."""
        self.dsm.session.delete(assistant)
        self.dsm.session.commit()
