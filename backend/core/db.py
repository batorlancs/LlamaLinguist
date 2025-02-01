from functools import wraps
from typing import Any, TypeVar, Callable, overload
from pydantic import BaseModel, ValidationError

from core.result import Result, Rf
from database.database import DatabaseSessionManager
from app_logging.app_logging import Logger

T = TypeVar("T")
M = TypeVar("M", bound=BaseModel | None)
N = TypeVar("N", bound=BaseModel)


def with_database_session_manager(
    func: Callable[..., Result[T]],
) -> Callable[..., Result[T]]:
    """Wrap a function with a database session manager.

    This decorator automatically manages database session lifecycle by creating a session,
    passing it to the wrapped function, and ensuring proper cleanup afterwards.

    The wrapped function should accept a 'dsm' parameter of type DatabaseSessionManager.

    Example:

    ```python
    @with_database_session_manager
    def get_user(self, dsm: DatabaseSessionManager, job_id: int) -> Result[Job]:
        return dsm.utils.job.get(job_id)
    ```
    """

    @wraps(func)
    def wrapper(self: Any, *args: Any, **kwargs: Any) -> Result[T]:
        with DatabaseSessionManager() as dsm:
            return func(self, dsm, *args, **kwargs)

    return wrapper


@overload
def convert_model(source: None, target_cls: type[N]) -> None: ...


@overload
def convert_model(source: BaseModel, target_cls: type[N]) -> N: ...


def convert_model(source: BaseModel | None, target_cls: type[N]) -> N | None:
    """Convert a source model to a target model.

    Important:
        The source model must be a valid model of the target class, and both must be inherited from BaseModel.

    If the source model is None, return None.
    If the source model is not None, return the target model.
    If the source model is not valid, log a critical error and raise an exception.

    Raises:
        ValidationError: If the source model is not valid.
    """
    try:
        return target_cls.model_validate(source) if source is not None else None
    except ValidationError as e:
        Logger.critical(
            "core.db",
            f"Failed to convert model from {source.__class__.__name__} to {target_cls.__name__}, details: {e}",
        )
        raise e


def convert_result_model(source: Result[M], target_cls: type[N]) -> Result[N]:
    """Convert a result model to a target model.

    Important:
        The source result must be a valid result, and both must be inherited from BaseModel.

    If the source result is not successful, return the source result.
    If the source result is successful, convert the value to the target model and return the new result.

    Raises:
        ValidationError: If the source model is not valid.
    """
    success, value, error = source
    if not success and error is not None:
        return Rf.error(error)
    return Rf.success(convert_model(value, target_cls))
