from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app_logging.app_logging import Logger
from auth import get_current_active_user
from database.database import DatabaseSessionManager
from database.schema.schema import User, Message as ChatMessage
from utils.ollama import Ollama, OllamaMessage


router = APIRouter()


class GenerateRequest(BaseModel):
    model: str
    message: str


@router.post("/generate")
async def generate(
    request: GenerateRequest,
    current_user: Annotated[User, Depends(get_current_active_user)],
):
    Logger.debug(router, f"Generate request from user {current_user.name}: {request}")
    response = Ollama.generate(request.model, request.message)
    return {"response": response, "status": "success"}


class ChatRequest(BaseModel):
    model: str
    message: str
    conversation_id: int


@router.post("/chat")
async def chat(
    request: ChatRequest,
    current_user: Annotated[User, Depends(get_current_active_user)],
):
    Logger.debug(router, f"Chat request from user {current_user.name}: {request}")
    with DatabaseSessionManager() as dsm:
        conversation = dsm.utils.conversation.get_by_id(request.conversation_id)
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")

        if conversation.user_id != current_user.id:
            raise HTTPException(
                status_code=403, detail="User does not have access to this conversation"
            )

        conversation.messages.append(
            ChatMessage(
                role="user", content=request.message, conversation_id=conversation.id
            )
        )

        # Convert conversation messages to Ollama format
        messages = [
            OllamaMessage(
                role="assistant" if msg.role == "assistant" else "user",
                content=msg.content,
            )
            for msg in conversation.messages
        ]

        messages.append(OllamaMessage(role="user", content=request.message))
        response = Ollama.chat(request.model, messages)

        # Add response to conversation
        conversation.messages.append(
            ChatMessage(
                role="assistant", content=response, conversation_id=conversation.id
            )
        )
        dsm.session.commit()

        return {"response": response, "status": "success"}