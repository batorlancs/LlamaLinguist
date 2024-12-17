from dataclasses import dataclass
import os


@dataclass
class Environment:
    DEVELOPMENT = "development"
    PRODUCTION = "production"

    @staticmethod
    def is_development():
        return os.getenv("ENVIRONMENT") == Environment.DEVELOPMENT

    @staticmethod
    def is_production():
        return os.getenv("ENVIRONMENT") == Environment.PRODUCTION
