from functools import wraps
from typing import Callable, ParamSpec, Tuple, TypeVar


T = TypeVar("T")
P = ParamSpec("P")


Result = Tuple[bool, T | None, Exception | None]
"""
A Result tuple is a tuple of three elements:
- A boolean indicating success or failure
- The value returned by the function (is always None if the function failed, but it can be None if the function succeeded too)
- An exception (or None if the function succeeded)
"""


class Rf:
    """Result Factory (Rf)

    This class provides methods to create successful and failed Result tuples.
    """

    @staticmethod
    def success(value: T) -> Result[T]:
        """Creates a successful Result tuple with the given value.

        Args:
            value: The value to wrap in a successful Result

        Returns:
            A Result tuple indicating success with the provided value
        """
        return (True, value, None)

    @staticmethod
    def error(err: Exception | str) -> Result[T]:
        """Creates a failed Result tuple with the given error.

        Args:
            err: The exception or error message to wrap in a failed Result

        Returns:
            A Result tuple indicating failure with the provided error
        """
        if isinstance(err, Exception):
            return (False, None, err)
        else:
            return (False, None, Exception(err))


def handle_uncaught_errors(func: Callable[P, Result[T]]) -> Callable[P, Result[T]]:
    """Handle uncaught errors in a function and return a type Result tuple."""

    @wraps(func)
    def wrapper(*args: P.args, **kwargs: P.kwargs) -> Result[T]:
        try:
            return func(*args, **kwargs)
        except Exception as e:
            return Rf.error(e)

    return wrapper
