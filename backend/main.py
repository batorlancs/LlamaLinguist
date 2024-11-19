from pydantic import BaseModel
import requests
import sys
from typing import List, Union
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()
# ollama_host = "http://localhost:11434"

IS_DEV = "dev" in sys.argv

if IS_DEV:
    ollama_host = "http://localhost:11434"
else:
    ollama_host = "http://host.docker.internal:11434"

# Add CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3005", "http://0.0.0.0:3005"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def read_root():
    return {"message": "Hello World"}

class GenerateRequest(BaseModel):
    prompt: str
    model: str

@app.post("/generate")
async def generate(request: GenerateRequest):
    print(f"Generating response from {ollama_host}, prompt: {request.prompt}")
    fetched_response = requests.post(
        f"{ollama_host}/api/generate",
        json={"model": request.model, "prompt": request.prompt, "stream": False}
    )
    response_text = fetched_response.json()["response"]
    print(f"Response from {ollama_host}: {response_text}")
    return {"response": response_text, "status": "success"}

class Message(BaseModel):
    role: str
    content: str
    
    def to_dict(self):
        return {
            "role": self.role,
            "content": self.content
        }

class ChatRequest(BaseModel):
    messages: List[Message]
    model: str
    
    def to_dict(self):
        return {
            "model": self.model,
            "messages": [{"role": "system", "content": "You are a helpful assistant."}] + [message.to_dict() for message in self.messages],
            "stream": False
        }

@app.post("/chat")
async def chat(request: ChatRequest):
    print(f"Generating response from {ollama_host}, messages length: {len(request.messages)}")
    print(request.to_dict())
    fetched_response = requests.post(
        f"{ollama_host}/api/chat",
        json=request.to_dict()
    )
    response_text = fetched_response.json()["message"]["content"]
    print(f"Response from {ollama_host}: {response_text}")
    return {"response": response_text, "status": "success"}

