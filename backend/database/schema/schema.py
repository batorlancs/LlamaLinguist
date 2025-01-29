from datetime import datetime
from sqlmodel import Field, Relationship, SQLModel, func # type: ignore


class User(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    name: str
    email: str = Field(unique=True)
    hashed_password: str = Field()
    created_at: datetime = Field(default=func.now())
    last_login: datetime = Field(default=func.now())
    disabled: bool = Field(default=False)
    # Relationships
    conversations: list["Conversation"] = Relationship(back_populates="user")

class Assistant(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    name: str
    model: str
    created_at: datetime = Field(default=func.now())
    # Relationships
    conversations: list["Conversation"] = Relationship(back_populates="assistant")

class Conversation(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    assistant_id: int = Field(foreign_key="assistant.id")
    title: str
    created_at: datetime = Field(default=func.now())
    updated_at: datetime = Field(default=func.now())
    # Relationships
    user: User = Relationship(back_populates="conversations")
    assistant: Assistant = Relationship(back_populates="conversations")
    messages: list["Message"] = Relationship(back_populates="conversation")
    
class Message(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    conversation_id: int = Field(foreign_key="conversation.id")
    role: str  # "user" or "assistant"
    content: str
    created_at: datetime = Field(default=func.now())
    # Relationshipts
    conversation: Conversation = Relationship(back_populates="messages")