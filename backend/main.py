from typing import Any
from app_logging.app_logging import Logger
from config.secrets import Secrets
from config.environment import Environment
from startup import create_tables_for_dev
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.base import router as base_router
from routes.auth import router as auth_router
from routes.assistant import router as assistant_router
from routes.conversation import router as conversation_router


def lifespan(app: FastAPI) -> Any:
    Logger.info("main", "Starting up...")
    create_tables_for_dev(app)
    yield
    Logger.info("main", "Shutting down...")


app = FastAPI(lifespan=lifespan)


frontend_url = Secrets.get("FRONTEND_URL")

# Add CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*" if Environment.is_development() else frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def read_root():
    return {"message": "Hello World"}


@app.get("/ping")
async def ping():
    return {"message": "pong"}


app.include_router(base_router, tags=["Base"])
app.include_router(auth_router, tags=["Auth"])
app.include_router(assistant_router, tags=["Assistant"])
app.include_router(conversation_router, tags=["Conversation"])

