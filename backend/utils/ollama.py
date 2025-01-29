import requests
from pydantic import BaseModel
from app_logging.app_logging import Logger
from config.secrets import Secrets


class OllamaMessage(BaseModel):
    role: str
    content: str


class Ollama:
    url = Secrets.get("OLLAMA_URL")
    
    @staticmethod
    def generate(model: str, prompt: str) -> str:
        Logger.debug(Ollama, f"Generating response: {prompt}")
        response = requests.post(
            f"{Ollama.url}/api/generate",
            json={"model": model, "prompt": prompt, "stream": False}
        )
        return response.json()["response"]
    
    @staticmethod
    def chat(model: str, messages: list[OllamaMessage]) -> str:
        Logger.debug(Ollama, f"Sending chat request, amount of messages: {len(messages)}")
        messages_dict = [message.model_dump() for message in messages]
        response = requests.post(
            f"{Ollama.url}/api/chat",
            json={
                "model": model,
                "messages": messages_dict,
                "stream": False
            }
        )
        return response.json()["message"]["content"]
