from typing import Annotated
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app_logging.app_logging import Logger
from auth import get_current_active_user
from core.exception import APIException
from database.database import DatabaseSessionManager
from database.schema.schema import Conversation, User


router = APIRouter()


@router.get("/conversations")
async def conversations(
    current_user: Annotated[User, Depends(get_current_active_user)],
):
    with DatabaseSessionManager() as dsm:
        conversations = dsm.utils.conversation.get_all(current_user)
        return conversations


@router.get("/conversation/{conversation_id}")
async def get_conversation(
    conversation_id: int,
    current_user: Annotated[User, Depends(get_current_active_user)],
):
    with DatabaseSessionManager() as dsm:
        conversation = dsm.utils.conversation.get_by_id(conversation_id)
        if not conversation:
            raise APIException(
                status_code=APIException.HTTP_404_NOT_FOUND,
                detail="Conversation not found",
            )

        return {
            **conversation.model_dump(exclude={"user_id", "assistant_id"}),
            "messages": [
                message.model_dump(exclude={"conversation_id"})
                for message in conversation.messages
            ],
            "assistant": conversation.assistant.model_dump(),
        }


class CreateConversationRequest(BaseModel):
    title: str
    assistant_id: int


@router.post("/conversation")
async def create_conversation(
    request: CreateConversationRequest,
    current_user: Annotated[User, Depends(get_current_active_user)],
):
    Logger.debug(
        router, f"Create conversation request from user {current_user.name}: {request}"
    )
    with DatabaseSessionManager() as dsm:
        conversation = Conversation(
            title=request.title,
            user_id=current_user.id,
            assistant_id=request.assistant_id,
        )
        conversation = dsm.utils.conversation.create(conversation)
        return conversation


@router.delete("/conversation/{conversation_id}")
async def delete_conversation(
    conversation_id: int,
    current_user: Annotated[User, Depends(get_current_active_user)],
):
    with DatabaseSessionManager() as dsm:
        dsm.utils.conversation.delete_by_id(conversation_id)
        return {"status": "success"}