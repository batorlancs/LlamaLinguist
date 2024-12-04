import os
from dataclasses import dataclass
from typing import List
from sqlalchemy import create_engine, Subquery
from sqlmodel import Session, select
from database.schema.schema import Assistant, Conversation, Message as ChatMessage, User

@dataclass
class Config:
    url: str = os.getenv("DATABASE_URL")

class Database:
    """Database access layer providing CRUD operations for users, conversations, messages and assistants."""
    
    def __init__(self):
        """Initialize database connection engine."""
        self.engine = create_engine(Config.url)
        self.session = None

    def __enter__(self) -> 'Database':
        """Context manager entry point that creates a new database session."""
        self.session = Session(self.engine)
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit point that ensures proper session cleanup."""
        if self.session:
            self.session.close()

    ###########################################################################
    # User operations
    ###########################################################################
    def get_user_by_email(self, email: str) -> User | None:
        """Retrieve a user by their email address."""
        statement = select(User).where(User.email == email)
        return self.session.exec(statement).first()

    def get_user(self, name: str) -> User | None:
        """Retrieve a user by their username."""
        statement = select(User).where(User.name == name)
        return self.session.exec(statement).first()

    def create_user(self, user: User) -> User:
        """Create a new user record."""
        self.session.add(user)
        self.session.commit()
        return user

    ###########################################################################
    # Conversation operations
    ###########################################################################
    def create_conversation(self, conversation: Conversation) -> Conversation:
        """Create a new conversation record."""
        self.session.add(conversation)
        self.session.commit()
        self.session.refresh(conversation)
        return conversation

    def get_conversation_by_id(self, conversation_id: int) -> Conversation | None:
        """Retrieve a specific conversation by its ID."""
        statement = select(Conversation).where(Conversation.id == conversation_id)
        return self.session.exec(statement).first()

    def get_conversations(self, user: User) -> List[Conversation]:
        """Retrieve all conversations for a given user."""
        statement = select(Conversation).where(Conversation.user_id == user.id)
        return self.session.exec(statement).all()

    ###########################################################################
    # Assistant operations
    ###########################################################################
    def create_assistant(self, assistant: Assistant) -> Assistant:
        """Create a new assistant record."""
        self.session.add(assistant)
        self.session.commit()
        self.session.refresh(assistant)
        return assistant

    ###########################################################################
    # Message operations
    ###########################################################################
    def create_messages(self, messages: List[ChatMessage]) -> List[ChatMessage]:
        """Create multiple message records in bulk."""
        self.session.add_all(messages)
        self.session.commit()
        self.session.refresh(messages)
        return messages

    def get_messages(self, conversation: Conversation) -> List[ChatMessage]:
        """Retrieve all messages for a given conversation."""
        statement = select(ChatMessage).where(ChatMessage.conversation_id == conversation.id)
        return self.session.exec(statement).all()
