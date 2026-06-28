from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional
from uuid import UUID
from datetime import datetime
import re


class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    first_name: str = Field(min_length=1, max_length=100)
    last_name: str = Field(min_length=1, max_length=100)
    preferred_language: str = Field(default="he", pattern="^(he|en)$")

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if not re.search(r"[A-Z]", v):
            raise ValueError("הסיסמה חייבת להכיל לפחות אות גדולה באנגלית")
        if not re.search(r"[a-z]", v):
            raise ValueError("הסיסמה חייבת להכיל לפחות אות קטנה באנגלית")
        if not re.search(r"[0-9]", v):
            raise ValueError("הסיסמה חייבת להכיל לפחות ספרה אחת")
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
            raise ValueError("הסיסמה חייבת להכיל לפחות תו מיוחד אחד")
        return v

    @field_validator("first_name", "last_name")
    @classmethod
    def sanitize_name(cls, v: str) -> str:
        # Strip HTML tags to prevent stored XSS
        return re.sub(r"<[^>]+>", "", v).strip()


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class UserResponse(BaseModel):
    id: UUID
    email: str
    first_name: str
    last_name: str
    preferred_language: str
    subscription_tier: str
    onboarding_completed: bool
    created_at: datetime

    class Config:
        from_attributes = True


class AuthResponse(BaseModel):
    user: UserResponse
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
