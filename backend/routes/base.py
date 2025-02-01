from typing import Annotated
from fastapi import APIRouter, Depends, status
from pydantic import BaseModel
from app_logging.app_logging import Logger
from auth import get_current_active_user
from core.exception import APIException
from core.response import APIResponse
from database.database import DatabaseSessionManager, get_dsm
from database.schema.schema import User, Message as ChatMessage
from utils.ollama import Ollama, OllamaMessage


router = APIRouter(
    tags=["Base endpoints"]
)


class GenerateRequest(BaseModel):
    model: str
    message: str


@router.post("/generate", response_model=APIResponse[str])
async def generate(
    request: GenerateRequest,
    current_user: Annotated[User, Depends(get_current_active_user)],
):
    Logger.debug(router, f"Generate request from user {current_user.name}: {request}")
    response = Ollama.generate(request.model, request.message)
    return APIResponse(data=response, message="Response generated successfully")


class ChatRequest(BaseModel):
    model: str
    message: str
    conversation_id: int


@router.post("/chat", response_model=APIResponse[str])
async def chat(
    request: ChatRequest,
    current_user: Annotated[User, Depends(get_current_active_user)],
    dsm: Annotated[DatabaseSessionManager, Depends(get_dsm)],
):
    Logger.debug(router, f"Chat request from user {current_user.name}: {request}")
    conversation = dsm.utils.conversation.get_by_id(request.conversation_id)
    if not conversation:
        raise APIException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found",
        )

    if conversation.user_id != current_user.id:
        raise APIException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User does not have access to this conversation",
        )

    # Add user message to conversation
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

    # Add user message to Ollama format
    messages.append(OllamaMessage(role="user", content=request.message))
    response = Ollama.chat(request.model, messages)

    # Add response to conversation
    conversation.messages.append(
        ChatMessage(
            role="assistant", content=response, conversation_id=conversation.id
        )
    )
    dsm.session.commit()

    return APIResponse(data=response, message="Response generated successfully")