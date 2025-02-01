from datetime import timedelta
from typing import Annotated
from fastapi import APIRouter, Depends,  status
from fastapi.security import OAuth2PasswordRequestForm
from auth import Token, get_current_active_user, authenticate_user, create_access_token
from config.secrets import Secrets
from core.exception import APIException
from core.response import APIResponse
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
