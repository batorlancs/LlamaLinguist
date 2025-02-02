from typing import Annotated
from fastapi import APIRouter, Depends, status
from pydantic import BaseModel
from app_logging.app_logging import Logger
from auth import get_current_active_user
from core.exception import APIException
from core.response import APIResponse
from database.database import DatabaseSessionManager, get_dsm
from database.schema.schema import Conversation, ConversationPublic, ConversationPublicWithMessages, User


router = APIRouter(
    tags=["Conversation"]
)


@router.get("/conversations", response_model=APIResponse[list[ConversationPublic]])
async def conversations(
    current_user: Annotated[User, Depends(get_current_active_user)],
    dsm: Annotated[DatabaseSessionManager, Depends(get_dsm)],
):
    return APIResponse(
        data=dsm.utils.conversation.get_all_by_user(current_user),
        message="Conversations fetched successfully",
    )


@router.get("/conversation/{conversation_id}", response_model=APIResponse[ConversationPublicWithMessages])
async def get_conversation(
    conversation_id: int,
    current_user: Annotated[User, Depends(get_current_active_user)],
    dsm: Annotated[DatabaseSessionManager, Depends(get_dsm)],
):
    conversation = dsm.utils.conversation.get_by_id(conversation_id)
    if not conversation:
        raise APIException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found",
        )
        
    if conversation.user_id != current_user.id:
        raise APIException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not allowed to access this conversation",
        )

    return APIResponse(
        data=conversation,
        message="Conversation fetched successfully",
    )


class CreateConversationRequest(BaseModel):
    title: str
    assistant_id: int


@router.post("/conversation", response_model=APIResponse[Conversation])
async def create_conversation(
    request: CreateConversationRequest,
    current_user: Annotated[User, Depends(get_current_active_user)],
    dsm: Annotated[DatabaseSessionManager, Depends(get_dsm)],
):
    Logger.debug(
        router, f"Create conversation request from user {current_user.name}: {request}"
    )
    conversation = Conversation(
        title=request.title,
        user_id=current_user.id,
        assistant_id=request.assistant_id,
    )
    return APIResponse(
        data=dsm.utils.conversation.create(conversation),
        message="Conversation created successfully",
    )


@router.delete("/conversation/{conversation_id}", response_model=APIResponse[None])
async def delete_conversation(
    conversation_id: int,
    current_user: Annotated[User, Depends(get_current_active_user)],
    dsm: Annotated[DatabaseSessionManager, Depends(get_dsm)],
):
    conversation = dsm.utils.conversation.get_by_id(conversation_id)
    if not conversation:
        raise APIException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found",
        )
    
    if conversation.user_id != current_user.id:
        raise APIException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not allowed to delete this conversation",
        )
    
    dsm.utils.conversation.delete(conversation)
    return APIResponse(message="Conversation deleted successfully")