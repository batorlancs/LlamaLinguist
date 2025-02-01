import jwt
import bcrypt
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import Annotated, Any
from fastapi import Depends, status
from fastapi.security import OAuth2PasswordBearer
from jwt.exceptions import InvalidTokenError
from passlib.context import CryptContext
from pydantic import BaseModel
from config.secrets import Secrets
from core.exception import APIException
from database.database import DatabaseSessionManager
from database.schema.schema import User

# to get a string like this run:
# openssl rand -hex 32
SECRET_KEY = Secrets.get("SECRET_KEY")
ALGORITHM = Secrets.get("ALGORITHM")


class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: str | None = None


@dataclass
class SolveBugBcryptWarning:
    __version__: str = getattr(bcrypt, "__version__")
    
setattr(bcrypt, "__about__", SolveBugBcryptWarning())
pwd_context = CryptContext(schemes=["bcrypt"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def get_user(name: str) -> User | None:
    with DatabaseSessionManager() as dsm:
        return dsm.utils.user.get_by_name(name)

def authenticate_user(name: str, password: str):
    user = get_user(name)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user


def create_access_token(data: dict[str, Any], expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt: str = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM) # type: ignore
    return encoded_jwt # type: ignore


async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]):
    credentials_exception = APIException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM]) # type: ignore
        username: str | None = payload.get("sub") # type: ignore
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username) # type: ignore
    except InvalidTokenError:
        raise credentials_exception
    
    user = get_user(token_data.username) # type: ignore
    if user is None:
        raise credentials_exception
    return user


async def get_current_active_user(
    current_user: Annotated[User, Depends(get_current_user)],
):
    if current_user.disabled:
        raise APIException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user",
        )
    return current_user
