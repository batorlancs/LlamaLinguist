from typing import Any, Dict, Optional
from fastapi import HTTPException


class APIException(HTTPException):
    def __init__(
        self,
        status_code: int = 500,
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
