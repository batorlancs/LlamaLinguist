from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app_logging.app_logging import Logger
from auth import get_current_active_user
from database.database import DatabaseSessionManager
from database.schema.schema import Assistant, User


router = APIRouter()


@router.get("/assistants")
async def get_assistants(
    current_user: Annotated[User, Depends(get_current_active_user)],
):
    """Get all assistants for the current user"""
    with DatabaseSessionManager() as dsm:
        assistants = dsm.utils.assistant.get_all(current_user)
        return assistants


class CreateAssistantRequest(BaseModel):
    name: str
    model: str


@router.post("/assistant")
async def create_assistant(
    request: CreateAssistantRequest,
    current_user: Annotated[User, Depends(get_current_active_user)],
):
    """Create a new assistant"""
    Logger.debug(
        router, f"Create assistant request from user {current_user.name}: {request}"
    )
    with DatabaseSessionManager() as dsm:
        assistant = Assistant(
            name=request.name, model=request.model, user_id=current_user.id
        )
        assistant = dsm.utils.assistant.create(assistant)
        return assistant


@router.delete("/assistant/{assistant_id}")
async def delete_assistant(
    assistant_id: int,
    current_user: Annotated[User, Depends(get_current_active_user)],
):
    """Delete an assistant"""
    Logger.debug(
        router,
        f"Delete assistant request from user {current_user.name}: {assistant_id}",
    )
    with DatabaseSessionManager() as dsm:
        assistant = dsm.utils.assistant.get_by_id(assistant_id)
        if not assistant:
            raise HTTPException(status_code=404, detail="Assistant not found")

        if assistant.user_id != current_user.id:
            raise HTTPException(
                status_code=403, detail="User does not have access to this assistant"
            )

        dsm.utils.assistant.delete(assistant)
        return {"status": "success"}


class UpdateAssistantRequest(BaseModel):
    name: str
    model: str


@router.put("/assistant/{assistant_id}")
async def update_assistant(
    assistant_id: int,
    request: UpdateAssistantRequest,
    current_user: Annotated[User, Depends(get_current_active_user)],
):
    """Update an assistant"""
    Logger.debug(
        router, f"Update assistant request from user {current_user.name}: {request}"
    )
    with DatabaseSessionManager() as dsm:
        assistant = dsm.utils.assistant.get_by_id(assistant_id)
        if not assistant:
            raise HTTPException(status_code=404, detail="Assistant not found")

        if assistant.user_id != current_user.id:
            raise HTTPException(
                status_code=403, detail="User does not have access to this assistant"
            )

        assistant.name = request.name
        assistant.model = request.model
        dsm.session.commit()
        dsm.session.refresh(assistant)
        return assistant.model_dump()
