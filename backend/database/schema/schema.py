from datetime import datetime
from sqlmodel import Field, SQLModel, func


class User(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    name: str
    email: str = Field(unique=True)
    created_at: datetime = Field(default=func.now())
    last_login: datetime = Field(default=func.now())

class Assistant(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    name: str
    model: str
    created_at: datetime = Field(default=func.now())

class Conversation(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    assistant_id: int = Field(foreign_key="assistant.id")
    title: str
    created_at: datetime = Field(default=func.now())
    updated_at: datetime = Field(default=func.now())

class Message(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    conversation_id: int = Field(foreign_key="conversation.id")
    role: str  # "user" or "assistant"
    content: str
    created_at: datetime = Field(default=func.now())