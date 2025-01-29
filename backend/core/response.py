from typing import Any
from fastapi import status
from fastapi.responses import JSONResponse, Response
from enum import Enum

from pydantic import BaseModel


class ResponseStatus(str, Enum):
    SUCCESS = "success"
    ERROR = "error"


class ResponseFactory:
    @staticmethod
    def success(
        message: str, data: Any = None, status_code: int = status.HTTP_200_OK
    ) -> Response:
        """
        Create a success response with standardized format.

        Args:
            message: A human-readable success message
            data: The response payload
            status_code: HTTP status code (default: 200)
        """
        if isinstance(data, BaseModel):
            data = data.model_dump()

        content = {
            "status": ResponseStatus.SUCCESS,
            "message": message,
            "data": data,
        }

        return JSONResponse(status_code=status_code, content=content)
