from enum import Enum
from typing import Generic, TypeVar

from pydantic import BaseModel

T = TypeVar("T")


class Status(str, Enum):
    SUCCESS = "success"
    ERROR = "error"


class APIResponse(BaseModel, Generic[T]):
    status: Status = Status.SUCCESS
    message: str | None = None
    data: T = None  # type: ignore


class APIErrorResponse(BaseModel):
    status: Status = Status.ERROR
    status_code: int
    detail: str
