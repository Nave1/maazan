from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID
from datetime import date, datetime
from decimal import Decimal


# --- Accounts ---

class AccountCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    type: str = Field(pattern="^(checking|savings|credit_card|cash|investment|loan)$")
    institution: Optional[str] = None
    currency: str = Field(default="ILS", max_length=3)
    current_balance: Decimal = Decimal("0")


class AccountResponse(BaseModel):
    id: UUID
    name: str
    type: str
    institution: Optional[str]
    currency: str
    current_balance: Decimal
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# --- Categories ---

class CategoryResponse(BaseModel):
    id: UUID
    name_he: str
    name_en: str
    icon: Optional[str]
    type: str

    class Config:
        from_attributes = True


# --- Transactions ---

class TransactionCreate(BaseModel):
    account_id: UUID
    category_id: Optional[UUID] = None
    type: str = Field(pattern="^(income|expense|transfer)$")
    amount: Decimal = Field(gt=0)
    date: date
    description: Optional[str] = Field(default=None, max_length=500)
    merchant_name: Optional[str] = Field(default=None, max_length=200)
    notes: Optional[str] = None


class TransactionResponse(BaseModel):
    id: UUID
    account_id: UUID
    category_id: Optional[UUID]
    type: str
    amount: Decimal
    currency: str
    date: date
    description: Optional[str]
    merchant_name: Optional[str]
    notes: Optional[str]
    source: str
    created_at: datetime

    class Config:
        from_attributes = True
