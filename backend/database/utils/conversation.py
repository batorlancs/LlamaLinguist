from sqlmodel import select
from database.schema.schema import Conversation, User
from typing import TYPE_CHECKING, List

if TYPE_CHECKING:
    from database.database import DatabaseSessionManager


class DatabaseSessionManagerConversationUtils:
    def __init__(self, dsm: "DatabaseSessionManager"):
        self.dsm = dsm

    def get_by_id(self, conversation_id: int) -> Conversation | None:
        """Retrieve a specific conversation by its ID."""
        statement = select(Conversation).where(Conversation.id == conversation_id)
        return self.dsm.session.exec(statement).first()

    def get_all(self, user: User) -> List[Conversation]:
        """Retrieve all conversations for a given user."""
        statement = select(Conversation).where(Conversation.user_id == user.id)
        return list(self.dsm.session.exec(statement))
    
    def create(self, conversation: Conversation) -> Conversation:
        """Create a new conversation record."""
        self.dsm.session.add(conversation)
        self.dsm.session.commit()
        self.dsm.session.refresh(conversation)
        return conversation

    def delete_by_id(self, conversation_id: int) -> None:
        """Delete a conversation record and all its messages by the conversation ID."""
        statement = select(Conversation).where(Conversation.id == conversation_id)
        conversation = self.dsm.session.exec(statement).first()
        if conversation:
            for message in conversation.messages:
                self.dsm.session.delete(message)
            self.dsm.session.delete(conversation)
            self.dsm.session.commit()
