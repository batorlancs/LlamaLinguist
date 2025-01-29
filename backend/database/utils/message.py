from sqlmodel import select
from database.schema.schema import Conversation, Message as ChatMessage
from typing import List, TYPE_CHECKING

if TYPE_CHECKING:
    from database.database import DatabaseSessionManager


class DatabaseSessionManagerMessageUtils:
    def __init__(self, dsm: "DatabaseSessionManager"):
        self.dsm = dsm

    def get_all(self, conversation: Conversation) -> List[ChatMessage]:
        """Retrieve all messages for a given conversation."""
        statement = select(ChatMessage).where(
            ChatMessage.conversation_id == conversation.id
        )
        return list(self.dsm.session.exec(statement))

    def create(self, messages: List[ChatMessage]) -> List[ChatMessage]:
        """Create multiple message records in bulk."""
        self.dsm.session.add_all(messages)
        self.dsm.session.commit()
        self.dsm.session.refresh(messages)
        return messages

    