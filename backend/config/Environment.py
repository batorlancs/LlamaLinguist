from config.secrets import Secrets
from dataclasses import dataclass



@dataclass
class Environment:
    DEVELOPMENT = "development"
    PRODUCTION = "production"

    @staticmethod
    def is_development():
        return Secrets.get("ENVIRONMENT") == Environment.DEVELOPMENT

    @staticmethod
    def is_production():
        return Secrets.get("ENVIRONMENT") == Environment.PRODUCTION
