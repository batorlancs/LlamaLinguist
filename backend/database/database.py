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
    def __init__(self):
        self.engine = create_engine(Config.url)
        self.session = None
        
    def __enter__(self) -> 'Database':
        self.session = Session(self.engine)
        return self
        
    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            self.session.close()
            
    def get_user_by_email(self, email: str) -> User | None:
        statement = select(User).where(User.email == email)
        return self.session.exec(statement).first()
    
    def get_user(self, name: str) -> User | None:
        statement = select(User).where(User.name == name)
        return self.session.exec(statement).first()
    
    def create_user(self, user: User) -> User:
        self.session.add(user)
        self.session.commit()
        return user
    
    def create_conversation(self, conversation: Conversation) -> Conversation:
        self.session.add(conversation)
        self.session.commit()
        return conversation
    
    def create_assistant(self, assistant: Assistant) -> Assistant:
        self.session.add(assistant)
        self.session.commit()
        return assistant
    
    def create_messages(self, messages: List[ChatMessage]) -> List[ChatMessage]:
        self.session.add_all(messages)
        self.session.commit()
        return messages

    def get_conversations(self, user: User) -> List[Conversation]:
        statement = select(Conversation).where(Conversation.user_id == user.id)
        return self.session.exec(statement).all()
    
    def get_messages(self, conversation: Conversation) -> List[ChatMessage]:
        statement = select(ChatMessage).where(ChatMessage.conversation_id == conversation.id)
        return self.session.exec(statement).all()
