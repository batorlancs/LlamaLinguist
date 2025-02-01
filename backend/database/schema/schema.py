from datetime import datetime
from sqlmodel import Field, Relationship, SQLModel, func # type: ignore

# --------------------------------------------------------------------------
# User
# --------------------------------------------------------------------------

class UserBase(SQLModel):
    name: str
    email: str | None = Field(default=None)
    created_at: datetime = Field(default=func.now())
    last_login: datetime = Field(default=func.now())
    disabled: bool = Field(default=False)

class User(UserBase, table=True):
    id: int = Field(default=None, primary_key=True)
    hashed_password: str = Field()
    # Relationships
    conversations: list["Conversation"] = Relationship(back_populates="user")
    assistants: list["Assistant"] = Relationship(back_populates="user")
    
class UserPublic(UserBase):
    id: int
    
class UserPublicWithAssistants(UserPublic):
    assistants: list["AssistantPublic"]
    
class UserCreate(UserBase):
    pass

class UserUpdate(UserBase):
    pass


# --------------------------------------------------------------------------
# Assistant
# --------------------------------------------------------------------------

class AssistantBase(SQLModel):
    user_id: int = Field(foreign_key="user.id")
    name: str
    model: str
    created_at: datetime = Field(default=func.now())

class Assistant(AssistantBase, table=True):
    id: int = Field(default=None, primary_key=True)
    # Relationships
    user: User = Relationship(back_populates="assistants")
    conversations: list["Conversation"] = Relationship(back_populates="assistant", cascade_delete=True)

class AssistantPublic(AssistantBase):
    id: int
    
class AssistantPublicWithConversations(AssistantPublic):
    conversations: list["ConversationPublic"]

class AssistantCreate(AssistantBase):
    pass

class AssistantUpdate(AssistantBase):
    pass


# --------------------------------------------------------------------------
# Conversation
# --------------------------------------------------------------------------

class ConversationBase(SQLModel):
    user_id: int = Field(foreign_key="user.id")
    assistant_id: int = Field(foreign_key="assistant.id")
    title: str
    created_at: datetime = Field(default=func.now())
    updated_at: datetime = Field(default=func.now())

class Conversation(ConversationBase, table=True):
    id: int = Field(default=None, primary_key=True)
    # Relationships
    user: User = Relationship(back_populates="conversations")
    assistant: Assistant = Relationship(back_populates="conversations")
    messages: list["Message"] = Relationship(back_populates="conversation", cascade_delete=True)
    
class ConversationPublic(ConversationBase):
    id: int
    
class ConversationPublicWithMessages(ConversationPublic):
    messages: list["MessagePublic"]

class ConversationCreate(ConversationBase):
    pass

class ConversationUpdate(ConversationBase):
    pass


# --------------------------------------------------------------------------    
# Message
# --------------------------------------------------------------------------

class MessageBase(SQLModel):
    conversation_id: int = Field(foreign_key="conversation.id")
    role: str  # "user" or "assistant"
    content: str
    created_at: datetime = Field(default=func.now())

class Message(MessageBase, table=True):
    id: int = Field(default=None, primary_key=True)
    # Relationships
    conversation: Conversation = Relationship(back_populates="messages")

class MessagePublic(MessageBase):
    id: int

class MessageCreate(MessageBase):
    pass

class MessageUpdate(MessageBase):
    pass
