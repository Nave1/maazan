from pydantic_settings import BaseSettings
from typing import List
import os
from dotenv import load_dotenv

load_dotenv()


class Settings(BaseSettings):
    # App
    app_name: str = "מאזן"
    app_env: str = "development"
    app_debug: bool = True
    frontend_url: str = "http://localhost:3000"
    backend_url: str = "http://localhost:8000"

    # Database
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/maazan"
    database_url_sync: str = "postgresql://postgres:postgres@localhost:5432/maazan"

    # Redis
    redis_url: str = ""

    # JWT
    jwt_secret_key: str = "change-this-to-a-random-secret-key-at-least-32-chars"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    refresh_token_expire_days: int = 30

    # OpenAI
    openai_api_key: str = ""

    # OAuth
    google_client_id: str = ""
    google_client_secret: str = ""
    microsoft_client_id: str = ""
    microsoft_client_secret: str = ""

    # CORS
    cors_origins: List[str] = ["http://localhost:3000"]

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "extra": "ignore",
    }


settings = Settings()
