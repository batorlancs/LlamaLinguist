import os
from pydantic import BaseModel
import requests
import sys
from typing import List
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, select
from sqlmodel import SQLModel, Session
from dotenv import load_dotenv
from database.schema.schema import Assistant, Conversation, User, Message as MessageSchema

load_dotenv()
app = FastAPI()
# ollama_host = "http://localhost:11434"

IS_DEV = "dev" in sys.argv

ollama_host = os.getenv("OLLAMA_URL")

# Add CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def read_root():
    return {"message": "Hello World"}

class GenerateRequest(BaseModel):
    prompt: str
    model: str

@app.post("/generate")
async def generate(request: GenerateRequest):
    print(f"Generating response from {ollama_host}, prompt: {request.prompt}")
    fetched_response = requests.post(
        f"{ollama_host}/api/generate",
        json={"model": request.model, "prompt": request.prompt, "stream": False}
    )
    response_text = fetched_response.json()["response"]
    print(f"Response from {ollama_host}: {response_text}")
    return {"response": response_text, "status": "success"}

class Message(BaseModel):
    role: str
    content: str
    
    def to_dict(self):
        return {
            "role": self.role,
            "content": self.content
        }

class ChatRequest(BaseModel):
    messages: List[Message]
    model: str
    
    def to_dict(self):
        return {
            "model": self.model,
            "messages": [{"role": "system", "content": "You are a helpful assistant."}] + [message.to_dict() for message in self.messages],
            "stream": False
        }

@app.post("/chat")
async def chat(request: ChatRequest):
    print(f"Generating response from {ollama_host}, messages length: {len(request.messages)}")
    print(request.to_dict())
    fetched_response = requests.post(
        f"{ollama_host}/api/chat",
        json=request.to_dict()
    )
    response_text = fetched_response.json()["message"]["content"]
    print(f"Response from {ollama_host}: {response_text}")
    return {"response": response_text, "status": "success"}


@app.get("/convo")
async def convo():
    engine = create_engine(os.getenv("DATABASE_URL"))
    with Session(engine) as session:
        # For now, get conversations for the sample user
        user = session.exec(select(User).where(User.email == "user@example.com")).first()
        if not user:
            return {"conversations": []}
            
        # Get all conversations with related assistant info
        conversations = session.exec(
            select(Conversation, Assistant)
            .join(Assistant, Conversation.assistant_id == Assistant.id)
            .where(Conversation.user_id == user.id)
            .order_by(Conversation.updated_at.desc())
        ).all()
        
        return {
            "conversations": [
                {
                    "id": conv.id,
                    "title": conv.title,
                    "created_at": conv.created_at,
                    "updated_at": conv.updated_at,
                    "assistant": {
                        "id": asst.id,
                        "name": asst.name,
                        "model": asst.model
                    }
                }
                for conv, asst in conversations
            ]
        }

@app.on_event("startup")
async def startup_event():
    # Create database tables
    engine = create_engine(os.getenv("DATABASE_URL"))
    # Drop all tables first to ensure clean state
    SQLModel.metadata.drop_all(engine)
    # Create all tables fresh
    SQLModel.metadata.create_all(engine)

    # Create sample data
    with Session(engine) as session:
        # Check if we already have data
        if session.exec(select(User)).first() is None:
            # Create sample user
            user = User(
                name="Sample User",
                email="user@example.com"
            )
            session.add(user)
            session.commit()

            # Create sample assistant
            assistant = Assistant(
                name="Claude",
                model="claude-2"
            )
            session.add(assistant)
            session.commit()

            # Create sample conversation
            conversation = Conversation(
                user_id=user.id,
                assistant_id=assistant.id,
                title="First Conversation"
            )
            session.add(conversation)
            session.commit()

            # Add sample messages
            messages = [
                MessageSchema(
                    conversation_id=conversation.id,
                    role="user",
                    content="Hello! How are you?"
                ),
                MessageSchema(
                    conversation_id=conversation.id,
                    role="assistant", 
                    content="I'm doing well, thank you! How can I help you today?"
                )
            ]
            
            for message in messages:
                print(message)
                session.add(message)
            session.commit()
