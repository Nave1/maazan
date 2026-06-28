from pydantic_settings import BaseSettings
from typing import List
import os
import secrets
from dotenv import load_dotenv

load_dotenv()


class Settings(BaseSettings):
    # App
    app_name: str = "מאזן"
    app_env: str = "development"
    app_debug: bool = False
    frontend_url: str = "http://localhost:3000"
    backend_url: str = "http://localhost:8000"

    # Database
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/maazan"
    database_url_sync: str = "postgresql://postgres:postgres@localhost:5432/maazan"

    # Redis
    redis_url: str = ""

    # JWT
    jwt_secret_key: str = secrets.token_urlsafe(64)
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 15
    refresh_token_expire_days: int = 7

    # OpenAI
    openai_api_key: str = ""

    # OAuth
    google_client_id: str = ""
    google_client_secret: str = ""
    microsoft_client_id: str = ""
    microsoft_client_secret: str = ""

    # CORS
    cors_origins: List[str] = ["http://localhost:3000"]

    # Rate Limiting
    rate_limit_per_minute: int = 60
    auth_rate_limit_per_minute: int = 5

    # Security
    max_request_size: int = 10 * 1024 * 1024  # 10MB

    @property
    def is_production(self) -> bool:
        return self.app_env == "production"

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "extra": "ignore",
    }


settings = Settings()
