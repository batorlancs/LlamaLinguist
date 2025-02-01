from sqlmodel import select
from database.schema.schema import Assistant, Conversation, User
from typing import TYPE_CHECKING, List

if TYPE_CHECKING:
    from database.database import DatabaseSessionManager


class DatabaseSessionManagerConversationUtils:
    def __init__(self, dsm: "DatabaseSessionManager"):
        self.dsm = dsm

    def get_by_id(self, conversation_id: int) -> Conversation | None:
        """Retrieve a specific conversation by its ID."""
        stmt = select(Conversation).where(Conversation.id == conversation_id)
        return self.dsm.session.exec(stmt).first()

    def get_all_by_user(self, user: User) -> List[Conversation]:
        """Retrieve all conversations for a given user."""
        statement = select(Conversation).where(Conversation.user_id == user.id)
        return list(self.dsm.session.exec(statement))
    
    def get_all_by_assistant(self, assistant: Assistant) -> List[Conversation]:
        """Retrieve all conversations for a given assistant."""
        statement = select(Conversation).where(Conversation.assistant_id == assistant.id)
        return list(self.dsm.session.exec(statement))
    
    def create(self, conversation: Conversation) -> Conversation:
        """Create a new conversation record."""
        self.dsm.session.add(conversation)
        self.dsm.session.commit()
        self.dsm.session.refresh(conversation)
        return conversation

    def delete(self, conversation: Conversation) -> None:
        """Delete a conversation record and all its messages by the conversation ID."""
        self.dsm.session.delete(conversation)
        self.dsm.session.commit()
        
    def update(self, conversation: Conversation) -> Conversation:
        """Update a conversation record."""
        self.dsm.session.add(conversation)
        self.dsm.session.commit()
        self.dsm.session.refresh(conversation)
        return conversation
