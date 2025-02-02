from datetime import timedelta
from typing import Annotated
from fastapi import APIRouter, Depends,  status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel
from sqlmodel import select
from app_logging.app_logging import Logger
from auth import Token, get_current_active_user, authenticate_user, create_access_token, get_password_hash
from config.guest import GuestUserConfig
from config.secrets import Secrets
from core.exception import APIException
from core.response import APIResponse
from database.database import DatabaseSessionManager, get_dsm
from database.schema.schema import User, UserPublic

ACCESS_TOKEN_EXPIRE_MINUTES = int(Secrets.get("ACCESS_TOKEN_EXPIRE_MINUTES"))

router = APIRouter(
    prefix="/auth",
    tags=["Auth"],
)


@router.post("/token", response_model=APIResponse[Token])
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
):
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        Logger.error("Auth", f"User {form_data.username}, password {form_data.password} not found")
        raise APIException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.name}, expires_delta=access_token_expires
    )
    return APIResponse(
        data=Token(access_token=access_token, token_type="bearer"),
        message="Token created successfully",
    )


class RegisterRequest(BaseModel):
    username: str
    password: str
    email: str | None = None

@router.post("/register", response_model=APIResponse[UserPublic])
async def register(
    request: RegisterRequest,
    dsm: Annotated[DatabaseSessionManager, Depends(get_dsm)],
):
    # Check if user with same username already exists
    existing_user = dsm.utils.user.get_by_name(request.username)
    if existing_user:
        raise APIException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already exists"
        )
    
    user = User(
        name=request.username,
        hashed_password=get_password_hash(request.password),
        email=request.email,
    )
    created_user = dsm.utils.user.create(user)
    return APIResponse(data=created_user, message="User created successfully")


@router.get("/users/me", response_model=APIResponse[UserPublic])
async def read_users_me(
    current_user: Annotated[User, Depends(get_current_active_user)],
):
    return APIResponse(
        data=current_user,
        message="User fetched successfully",
    )
    
@router.get("/users", response_model=APIResponse[list[UserPublic]])
async def get_users(
    current_user: Annotated[User, Depends(get_current_active_user)],
):
    return APIResponse(data=current_user, message="User fetched successfully")


@router.get("/public/users", response_model=APIResponse[list[str]])
async def get_public_users(
    dsm: Annotated[DatabaseSessionManager, Depends(get_dsm)],
):
    """Get all public users except the guest user. (This api is available to anyone)

    Args:
        dsm (Annotated[DatabaseSessionManager, Depends]): Database session manager

    Returns:
        APIResponse[list[str]]: List of public users
    """
    users = dsm.session.exec(select(User).where(User.name != GuestUserConfig.name)).all()
    usernames = [user.name for user in users]
    return APIResponse(data=usernames, message="Public users fetched successfully")
