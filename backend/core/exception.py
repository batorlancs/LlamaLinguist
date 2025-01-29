from typing import Any, Dict, Optional
from fastapi import HTTPException, status


class APIException(HTTPException):
    HTTP_400_BAD_REQUEST = status.HTTP_400_BAD_REQUEST
    HTTP_401_UNAUTHORIZED = status.HTTP_401_UNAUTHORIZED
    HTTP_403_FORBIDDEN = status.HTTP_403_FORBIDDEN
    HTTP_404_NOT_FOUND = status.HTTP_404_NOT_FOUND
    HTTP_405_METHOD_NOT_ALLOWED = status.HTTP_405_METHOD_NOT_ALLOWED
    HTTP_406_NOT_ACCEPTABLE = status.HTTP_406_NOT_ACCEPTABLE
    HTTP_408_REQUEST_TIMEOUT = status.HTTP_408_REQUEST_TIMEOUT
    HTTP_409_CONFLICT = status.HTTP_409_CONFLICT
    HTTP_410_GONE = status.HTTP_410_GONE
    HTTP_411_LENGTH_REQUIRED = status.HTTP_411_LENGTH_REQUIRED
    HTTP_412_PRECONDITION_FAILED = status.HTTP_412_PRECONDITION_FAILED
    HTTP_413_REQUEST_ENTITY_TOO_LARGE = status.HTTP_413_REQUEST_ENTITY_TOO_LARGE
    HTTP_414_REQUEST_URI_TOO_LONG = status.HTTP_414_REQUEST_URI_TOO_LONG
    HTTP_415_UNSUPPORTED_MEDIA_TYPE = status.HTTP_415_UNSUPPORTED_MEDIA_TYPE
    HTTP_422_UNPROCESSABLE_ENTITY = status.HTTP_422_UNPROCESSABLE_ENTITY
    HTTP_429_TOO_MANY_REQUESTS = status.HTTP_429_TOO_MANY_REQUESTS
    HTTP_500_INTERNAL_SERVER_ERROR = status.HTTP_500_INTERNAL_SERVER_ERROR
    HTTP_501_NOT_IMPLEMENTED = status.HTTP_501_NOT_IMPLEMENTED
    HTTP_502_BAD_GATEWAY = status.HTTP_502_BAD_GATEWAY
    HTTP_503_SERVICE_UNAVAILABLE = status.HTTP_503_SERVICE_UNAVAILABLE
    HTTP_504_GATEWAY_TIMEOUT = status.HTTP_504_GATEWAY_TIMEOUT

    def __init__(
        self,
        status_code: int,
        detail: Optional[Any] = None,
        headers: Optional[Dict[str, str]] = None,
    ) -> None:
        """Initialize the API exception.

        Args:
            status_code: HTTP status code
            detail: Detail message or exception
            headers: Optional HTTP headers
        """
        detail = (
            self._format_detail(detail)
            if detail and isinstance(detail, Exception)
            else detail
        )
        super().__init__(status_code=status_code, detail=detail, headers=headers)

    def _format_detail(self, err: Exception) -> str:
        """Format the error detail message from an exception.

        Args:
            err: The exception to format

        Returns:
            Formatted error message
        """
        return f"({err.__class__.__name__}) An error occurred: {str(err)}"
