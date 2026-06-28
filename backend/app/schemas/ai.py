from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None


class ChatResponse(BaseModel):
    conversation_id: str
    response: str
    suggestions: List[str] = []


class ConversationSummary(BaseModel):
    id: str
    title: Optional[str]
    last_message_at: Optional[str]
    is_archived: bool


class MessageResponse(BaseModel):
    id: str
    role: str
    content: str
    created_at: str
