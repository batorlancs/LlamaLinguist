# Load environment variables before anything else
from dotenv import load_dotenv
load_dotenv()


from auth import setup_auth, get_password_hash
import os
from pydantic import BaseModel
import requests
import sys
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, select
from sqlmodel import SQLModel, Session
from database.database import Database
from database.schema.schema import Assistant, Message as ChatMessage, Conversation, User


app = FastAPI()
setup_auth(app)


# Check if running in dev mode or with localhost/IP host
IS_DEV = "dev" in sys.argv or any(arg in ["localhost", "127.0.0.1"] for arg in sys.argv)
ollama_url = os.getenv("OLLAMA_URL")
frontend_url = os.getenv("FRONTEND_URL")

# Add CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*" if IS_DEV else frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class GenerateRequest(BaseModel):
    prompt: str
    model: str

@app.post("/generate")
async def generate(request: GenerateRequest):
    print(f"Generating response from {ollama_url}, prompt: {request.prompt}")
    fetched_response = requests.post(
        f"{ollama_url}/api/generate",
        json={"model": request.model, "prompt": request.prompt, "stream": False}
    )
    response_text = fetched_response.json()["response"]
    print(f"Response from {ollama_url}: {response_text}")
    return {"response": response_text, "status": "success"}

########################################################
# Base Routes
########################################################

@app.get("/")
async def read_root():
    return {"message": "Hello World"}

@app.get("/ping")
async def ping():
    return {"message": "pong"}


########################################################
# User Routes
########################################################

# @app.post("/chat")
# async def chat(request: ChatRequest):
#     print(f"Generating response from {ollama_url}, messages length: {len(request.messages)}")
#     print(request.to_dict())
#     fetched_response = requests.post(
#         f"{ollama_url}/api/chat",
#         json=request.to_dict()
#     )
#     response_text = fetched_response.json()["message"]["content"]
#     print(f"Response from {ollama_url}: {response_text}")
#     return {"response": response_text, "status": "success"}

@app.get("/convo")
async def convo():
    with Database() as db:
        user = db.get_user(email="user@example.com")
        if not user:
            return {"conversations": []}
            
        response = {"conversations": db.get_conversations(user)}
        return response

@app.get("/user")
async def user():
    with Database() as db:
        user = db.get_user(email="user@example.com")
        if not user:
            return {"user": None}
            
        response = {
            **user.model_dump(),
            "conversations": [
                {
                    **conversation.model_dump(exclude={"user_id", "assistant_id"}),
                    "messages": [message.model_dump(exclude={"conversation_id"}) for message in conversation.messages],
                    "assistant": conversation.assistant.model_dump()
                }
                for conversation in user.conversations
            ]
        }
        return response

########################################################
# Events
########################################################

@app.on_event("startup")
async def startup_event():
    with Database() as db:
        # Drop all tables first to ensure clean state
        SQLModel.metadata.drop_all(db.engine)
        # Create all tables fresh
        SQLModel.metadata.create_all(db.engine)
        
        # create user
        user = User(
            name="user",
            email="user@example.com",
            hashed_password=get_password_hash("password"),
        )
        db.create_user(user)
        db.session.refresh(user)
        
        # create assistant
        assistant = Assistant(
            name="Gerald",
            model="llama3.2:1b",
            user_id=user.id
        )
        db.create_assistant(assistant)
        db.session.refresh(assistant)
        
        # create conversation
        conversation = Conversation(
            user_id=user.id,
            assistant_id=assistant.id,
            title="First Conversation",
            messages=[
                ChatMessage(
                    role="user",
                    content="Hello! How are you?"
                ),
                ChatMessage(
                    role="assistant",
                    content="I'm doing well, thank you! How can I help you today?"
                )
            ]
        )
        db.create_conversation(conversation)
        
        conversation2 = Conversation(
            user_id=user.id,
            assistant_id=assistant.id,
            title="Second Conversation",
            messages=[
                ChatMessage(
                    role="user",
                    content="What is the weather in Tokyo?"
                ),
                ChatMessage(
                    role="assistant",
                    content="The weather in Tokyo is currently sunny with a temperature of 75 degrees Fahrenheit."
                ),
                ChatMessage(
                    role="user",
                    content="Oh, that's great! Thank you!"
                ),
                ChatMessage(
                    role="assistant",
                    content="You're welcome! If you have any other questions, feel free to ask."
                )
            ]
        )
        db.create_conversation(conversation2)
