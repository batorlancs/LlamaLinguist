# Load environment variables before anything else
from typing import Annotated
from dotenv import load_dotenv
load_dotenv()

from utils.ollama import Ollama, OllamaMessage
from app_logging.app_logging import Logger
from auth import get_current_active_user, setup_auth, get_password_hash
import os
from pydantic import BaseModel
import sys
from fastapi import Depends, FastAPI, HTTPException
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

class GenerateRequest(BaseModel):
    model: str
    message: str

@app.post("/generate")
async def generate(
    request: GenerateRequest,
    current_user: Annotated[User, Depends(get_current_active_user)],
):
    Logger.debug(app, f"Generate request from user {current_user.name}: {request}")
    response = Ollama.generate(request.model, request.message)
    return {"response": response, "status": "success"}

class ChatRequest(BaseModel):
    model: str
    message: str
    conversation_id: int

@app.post("/chat")
async def chat(
    request: ChatRequest,
    current_user: Annotated[User, Depends(get_current_active_user)],
):
    Logger.debug(app, f"Chat request from user {current_user.name}: {request}")
    with Database() as db:
        conversation = db.get_conversation_by_id(request.conversation_id)
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
        
        if conversation.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="User does not have access to this conversation")
        
        conversation.messages.append(ChatMessage(role="user", content=request.message))
        
        # Convert conversation messages to Ollama format
        messages = [
            OllamaMessage(
                role="assistant" if msg.role == "assistant" else "user",
                content=msg.content
            )
            for msg in conversation.messages
        ]
        
        messages.append(OllamaMessage(role="user", content=request.message))
        response = Ollama.chat(request.model, messages)
        
        # Add response to conversation
        conversation.messages.append(ChatMessage(role="assistant", content=response))
        db.session.commit()
         
        return {"response": response, "status": "success"}


########################################################
# Conversation Routes
########################################################

@app.get("/conversations")
async def conversations(
    current_user: Annotated[User, Depends(get_current_active_user)],
):
    with Database() as db:
        conversations = db.get_conversations(current_user)
        return conversations
    
@app.get("/conversation/{conversation_id}")
async def get_conversation(
    conversation_id: int,
    current_user: Annotated[User, Depends(get_current_active_user)],
):
    with Database() as db:
        conversation = db.get_conversation_by_id(conversation_id)
        return {
            **conversation.model_dump(exclude={"user_id", "assistant_id"}),
            "messages": [message.model_dump(exclude={"conversation_id"}) for message in conversation.messages],
            "assistant": conversation.assistant.model_dump()
        }


class CreateConversationRequest(BaseModel):
    title: str
    assistant_id: int
    model: str

@app.post("/conversation")
async def create_conversation(
    request: CreateConversationRequest,
    current_user: Annotated[User, Depends(get_current_active_user)],
):
    Logger.debug(app, f"Create conversation request from user {current_user.name}: {request}")
    with Database() as db:
        conversation = Conversation(
            title=request.title,
            user_id=current_user.id,
            assistant_id=request.assistant_id
        )
        conversation = db.create_conversation(conversation)
        return conversation
    
@app.delete("/conversation/{conversation_id}")
async def delete_conversation(
    conversation_id: int,
    current_user: Annotated[User, Depends(get_current_active_user)],
):
    with Database() as db:
        db.delete_conversation(conversation_id)
        return {"status": "success"}


########################################################
# Assistant Routes
########################################################

@app.get("/assistants")
async def get_assistants(
    current_user: Annotated[User, Depends(get_current_active_user)],
):
    """Get all assistants for the current user"""
    with Database() as db:
        assistants = db.get_assistants(current_user)
        return assistants


class CreateAssistantRequest(BaseModel):
    name: str
    model: str

@app.post("/assistant")
async def create_assistant(
    request: CreateAssistantRequest,
    current_user: Annotated[User, Depends(get_current_active_user)],
):
    """Create a new assistant"""
    Logger.debug(app, f"Create assistant request from user {current_user.name}: {request}")
    with Database() as db:
        assistant = Assistant(
            name=request.name,
            model=request.model,
            user_id=current_user.id
        )
        assistant = db.create_assistant(assistant)
        return assistant


@app.delete("/assistant/{assistant_id}")
async def delete_assistant(
    assistant_id: int,
    current_user: Annotated[User, Depends(get_current_active_user)],
):
    """Delete an assistant"""
    Logger.debug(app, f"Delete assistant request from user {current_user.name}: {assistant_id}")
    with Database() as db:
        assistant = db.get_assistant_by_id(assistant_id)
        if not assistant:
            raise HTTPException(status_code=404, detail="Assistant not found")
        
        if assistant.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="User does not have access to this assistant")
        
        db.delete_assistant(assistant)
        return {"status": "success"}


class UpdateAssistantRequest(BaseModel):
    name: str
    model: str

@app.put("/assistant/{assistant_id}")
async def update_assistant(
    assistant_id: int,
    request: UpdateAssistantRequest,
    current_user: Annotated[User, Depends(get_current_active_user)],
):
    """Update an assistant"""
    Logger.debug(app, f"Update assistant request from user {current_user.name}: {request}")
    with Database() as db:
        assistant = db.get_assistant_by_id(assistant_id)
        if not assistant:
            raise HTTPException(status_code=404, detail="Assistant not found")
        
        if assistant.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="User does not have access to this assistant")
        
        assistant.name = request.name
        assistant.model = request.model
        db.session.commit()
        db.session.refresh(assistant)
        return assistant.model_dump()


# @app.get("/user")
# async def user():
#     with Database() as db:
#         user = db.get_user(email="user@example.com")
#         if not user:
#             return {"user": None}
            
#         response = {
#             **user.model_dump(),
#             "conversations": [
#                 {
#                     **conversation.model_dump(exclude={"user_id", "assistant_id"}),
#                     "messages": [message.model_dump(exclude={"conversation_id"}) for message in conversation.messages],
#                     "assistant": conversation.assistant.model_dump()
#                 }
#                 for conversation in user.conversations
#             ]
#         }
#         return response

########################################################
# Events
########################################################

@app.on_event("startup")
async def startup_event():
    if not IS_DEV:
        return
    
    Logger.warning(app, "Running in dev mode!")
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
                    content="If x = 2, what is x^2?"
                ),
                ChatMessage(
                    role="assistant",
                    content="It is 4"
                ),
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
