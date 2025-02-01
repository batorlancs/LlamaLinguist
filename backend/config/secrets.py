import os
from dotenv import load_dotenv


class Secrets:
    # Load environment variables on module import
    load_dotenv()

    @staticmethod
    def get(key: str, default: str | None = None) -> str:
        """
        Get an environment variable value by key.
        Returns the default value if the key doesn't exist.
        """
        value = os.getenv(key, default)
        if value is None:
            raise ValueError(f"Environment variable {key} is not set")
        return value

