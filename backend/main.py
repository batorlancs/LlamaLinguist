import requests
from typing import Union
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()
# ollama_host = "http://localhost:11434"
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

@app.get("/generate")
async def generate():
    print(f"Generating response from {ollama_host}")
    fetched_response = requests.post(f"{ollama_host}/api/generate", json={"model": "llama3.2:1b", "prompt": "Hello, how are you?", "stream": False})
    response_text = fetched_response.json()["response"]
    print(f"Response from {ollama_host}: {response_text}")
    return {"response": response_text, "status": "success"}

@app.get("/items/{item_id}")
async def read_item(item_id: int, q: Union[str, None] = None):
    return {"item_id": item_id, "q": q}