import logging
import os
from datetime import datetime
from typing import Any

class AppLogger:
    
    # Add these color codes at the start of the class
    COLORS = {
        'DEBUG': '\033[90m',      # Gray
        'INFO': '\033[34m',       # Blue
        'WARNING': '\033[33m',    # Yellow
        'ERROR': '\033[1;31m',      # Red
        'CRITICAL': '\033[1;31m\033[4m', # Bold Red + Underline (to distinguish from ERROR)
        'RESET': '\033[0m'        # Reset color
    }
    
    def __init__(self):
        # Create logs directory if it doesn't exist
        os.makedirs('logs', exist_ok=True)

        # Configure root logger
        self.logger = logging.getLogger('app')
        self.logger.setLevel(logging.DEBUG)

        # File handler with detailed format including date
        file_handler = logging.FileHandler(f'logs/app_{datetime.now().strftime("%Y%m%d")}.log')
        file_handler.setLevel(logging.DEBUG)
        file_format = logging.Formatter('%(asctime)s - %(levelname)-8s - %(message)s')
        file_handler.setFormatter(file_format)

        # Modified stream handler with colored format
        stream_handler = logging.StreamHandler()
        stream_handler.setLevel(logging.DEBUG)
        stream_format = logging.Formatter(
            '%(color)s%(levelname)-9s %(message)s%(reset)s',
            defaults={'color': '', 'reset': ''}
        )
        stream_handler.setFormatter(stream_format)

        # Custom filter to add color
        class ColorFilter(logging.Filter):
            def filter(self, record):
                record.color = AppLogger.COLORS.get(record.levelname, '')
                record.reset = AppLogger.COLORS['RESET']
                return True

        stream_handler.addFilter(ColorFilter())

        # Add handlers to logger
        self.logger.addHandler(file_handler)
        self.logger.addHandler(stream_handler)

    def _get_name(self, source: Any) -> str:
        """Extract name from the source object/class/string"""
        if isinstance(source, type):
            return source.__name__
        elif hasattr(source, '__class__'):
            return source.__class__.__name__
        elif hasattr(source, '__name__'):
            return source.__name__
        return str(source)
    
    def _format_message(self, source: Any, message: str) -> str:
        name = self._get_name(source)
        return f"[{name}]: {message}"

    def debug(self, source: Any, message: str):
        """Log a debug message"""
        formatted_message = self._format_message(source, message)
        self.logger.debug(formatted_message)

    def info(self, source: Any, message: str):
        """Log an info message"""
        formatted_message = self._format_message(source, message)
        self.logger.info(formatted_message)

    def warning(self, source: Any, message: str):
        """Log a warning message"""
        formatted_message = self._format_message(source, message)
        self.logger.warning(formatted_message)

    def error(self, source: Any, message: str):
        """Log an error message"""
        formatted_message = self._format_message(source, message)
        self.logger.error(formatted_message)

    def critical(self, source: Any, message: str):
        """Log a critical message"""
        formatted_message = self._format_message(source, message)
        self.logger.critical(formatted_message)

Logger = AppLogger()
