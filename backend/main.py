from typing import Any

from fastapi.responses import JSONResponse
from app_logging.app_logging import Logger
from config.secrets import Secrets
from config.environment import Environment
from core.response import APIErrorResponse, APIResponse
from startup import create_tables_for_dev
from fastapi import FastAPI, HTTPException, Request, status
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

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content=APIErrorResponse(
            status_code=exc.status_code,
            detail=exc.detail,
        ).model_dump(exclude_none=True),
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    Logger.critical("app.py", f"Uncaught exception: {str(exc)}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=APIErrorResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal Server Error ({exc.__class__.__name__}): {str(exc)}",
        ).model_dump(exclude_none=True),
    )


@app.get("/")
async def read_root():
    return APIResponse(message="API is running and is healthy")


@app.get("/ping")
async def ping():
    return APIResponse(message="pong")


app.include_router(base_router)
app.include_router(auth_router)
app.include_router(assistant_router)
app.include_router(conversation_router)

