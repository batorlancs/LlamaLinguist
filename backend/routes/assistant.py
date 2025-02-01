from typing import Annotated
from fastapi import APIRouter, Depends, status
from pydantic import BaseModel
from app_logging.app_logging import Logger
from auth import get_current_active_user
from core.exception import APIException
from core.response import APIResponse
from database.database import DatabaseSessionManager, get_dsm
from database.schema.schema import Assistant, AssistantPublic, User


router = APIRouter(
    tags=["Assistant"]
)


@router.get("/assistants", response_model=APIResponse[list[AssistantPublic]])
async def get_assistants(
    current_user: Annotated[User, Depends(get_current_active_user)],
    dsm: Annotated[DatabaseSessionManager, Depends(get_dsm)],
):  
    """Get all assistants for the current user"""
    assistants = dsm.utils.assistant.get_all_by_user(current_user)
    return APIResponse(data=assistants, message="Assistants fetched successfully")


class CreateAssistantRequest(BaseModel):
    name: str
    model: str


@router.post("/assistant", response_model=APIResponse[AssistantPublic])
async def create_assistant(
    request: CreateAssistantRequest,
    current_user: Annotated[User, Depends(get_current_active_user)],
    dsm: Annotated[DatabaseSessionManager, Depends(get_dsm)],
):
    """Create a new assistant"""
    Logger.debug(
        router, f"Create assistant request from user {current_user.name}: {request}"
    )
    assistant = Assistant(
        name=request.name, model=request.model, user_id=current_user.id
    )
    assistant = dsm.utils.assistant.create(assistant)
    return APIResponse(data=assistant, message="Assistant created successfully")


@router.delete("/assistant/{assistant_id}", response_model=APIResponse[None])
async def delete_assistant(
    assistant_id: int,
    current_user: Annotated[User, Depends(get_current_active_user)],
    dsm: Annotated[DatabaseSessionManager, Depends(get_dsm)],
):
    """Delete an assistant"""
    Logger.debug(
        router,
        f"Delete assistant request from user {current_user.name}: {assistant_id}",
    )
    assistant = dsm.utils.assistant.get_by_id(assistant_id)
    if not assistant:
        raise APIException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assistant not found",
        )

    if assistant.user_id != current_user.id:
        raise APIException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User does not have access to this assistant",
        )

    dsm.utils.assistant.delete(assistant)
    return APIResponse(message="Assistant deleted successfully")


class UpdateAssistantRequest(BaseModel):
    name: str
    model: str


@router.put("/assistant/{assistant_id}", response_model=APIResponse[AssistantPublic])
async def update_assistant(
    assistant_id: int,
    request: UpdateAssistantRequest,
    current_user: Annotated[User, Depends(get_current_active_user)],
    dsm: Annotated[DatabaseSessionManager, Depends(get_dsm)],
):
    """Update an assistant"""
    Logger.debug(
        router, f"Update assistant request from user {current_user.name}: {request}"
    )
    assistant = dsm.utils.assistant.get_by_id(assistant_id)
    if not assistant:
        raise APIException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assistant not found",
        )

    if assistant.user_id != current_user.id:
        raise APIException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User does not have access to this assistant",
        )

    assistant.name = request.name
    assistant.model = request.model
    updated_assistant = dsm.utils.assistant.update(assistant)
    return APIResponse(data=updated_assistant, message="Assistant updated successfully")

