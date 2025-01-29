import logging
import sys
from typing import Any, Optional, List


class Logger:
    _instance: Optional["Logger"] = None
    _logger: Optional[logging.Logger] = None
    handlers: List[logging.Handler] = []

    COLORS = {
        "DEBUG": "\033[36m",  # Cyan
        "INFO": "\033[32m",  # Green
        "WARNING": "\033[33m",  # Yellow
        "ERROR": "\033[31m",  # Red
        "CRITICAL": "\033[31;1m",  # Bright Red
        "RESET": "\033[0m",  # Reset
        "GRAY": "\033[90m",  # Gray
    }

    @classmethod
    def _setup_logging(cls):
        # Clear the log file
        open("app.log", "w").close()

        # Create formatter for file logging (with timestamp)
        file_formatter = logging.Formatter("%(asctime)s - %(levelname)-9s %(message)s")

        class ColorFormatter(logging.Formatter):
            def format(self, record: logging.LogRecord) -> str:
                original_levelname = record.levelname
                color = Logger.COLORS.get(record.levelname, Logger.COLORS["RESET"])
                record.levelname = f"{color}{original_levelname}{Logger.COLORS['RESET']}:{' ' * (8 - len(original_levelname))}"
                # Add gray coloring to text within square brackets
                message = record.msg
                if "[" in message and "]" in message:
                    message = message.replace("[", f"{Logger.COLORS['GRAY']}[").replace(
                        "]", f"]{Logger.COLORS['RESET']}"
                    )
                record.msg = message
                return super().format(record)

        # Create formatter for stream logging (without timestamp)
        stream_formatter = ColorFormatter(
            "%(levelname)s %(message)s"
        )  # Removed -8s since padding is handled in formatter

        # Create file handler (INFO and above)
        file_handler = logging.FileHandler("app.log")
        file_handler.setLevel(logging.INFO)
        file_handler.setFormatter(file_formatter)

        # Create stream handler (all levels)
        stream_handler = logging.StreamHandler(sys.stdout)
        stream_handler.setLevel(logging.DEBUG)
        stream_handler.setFormatter(stream_formatter)

        # Setup main logger
        cls._logger = logging.getLogger("app")
        cls._logger.setLevel(logging.DEBUG)
        cls._logger.propagate = False

        # Clear existing handlers and add new ones
        cls.handlers = [file_handler, stream_handler]
        for handler in cls._logger.handlers[:]:
            cls._logger.removeHandler(handler)
        for handler in cls.handlers:
            cls._logger.addHandler(handler)

    @staticmethod
    def _get_caller_name(caller: Any) -> str:
        if isinstance(caller, str):
            return caller
        if isinstance(caller, type):
            return caller.__name__
        if hasattr(caller, "__class__"):
            return caller.__class__.__name__
        elif hasattr(caller, "__name__"):
            return caller.__name__
        return str(caller)

    @staticmethod
    def _format_message(caller: Any, message: str) -> str:
        caller_name = Logger._get_caller_name(caller)
        return f"[{caller_name}] {message}"

    @classmethod
    def _ensure_logger(cls):
        if cls._logger is None:
            cls._setup_logging()

    @classmethod
    def get_logger(cls):
        if cls._logger is None:
            raise ValueError("Logger not initialized")
        return cls._logger

    @classmethod
    def debug(cls, caller: Any, message: str):
        cls._ensure_logger()
        cls.get_logger().debug(Logger._format_message(caller, message))

    @classmethod
    def info(cls, caller: Any, message: str):
        cls._ensure_logger()
        cls.get_logger().info(Logger._format_message(caller, message))

    @classmethod
    def warning(cls, caller: Any, message: str):
        cls._ensure_logger()
        cls.get_logger().warning(Logger._format_message(caller, message))

    @classmethod
    def error(cls, caller: Any, message: str):
        cls._ensure_logger()
        cls.get_logger().error(Logger._format_message(caller, message))

    @classmethod
    def critical(cls, caller: Any, message: str):
        cls._ensure_logger()
        cls.get_logger().critical(Logger._format_message(caller, message))
