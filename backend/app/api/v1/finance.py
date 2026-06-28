from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.core.database import get_db
from app.core.security import decode_token
from app.models.transaction import Account, Category, Transaction
from app.schemas.transaction import (
    AccountCreate,
    AccountResponse,
    CategoryResponse,
    TransactionCreate,
    TransactionResponse,
)

router = APIRouter(prefix="/finance", tags=["Finance"])


async def get_current_user_id(request: Request) -> str:
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="לא מחובר")
    token = auth_header.split(" ")[1]
    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        raise HTTPException(status_code=401, detail="טוקן לא תקין")
    return payload["sub"]


# --- Accounts ---

@router.post("/accounts", response_model=AccountResponse, status_code=201)
async def create_account(
    data: AccountCreate,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    user_id = await get_current_user_id(request)
    account = Account(
        user_id=user_id,
        name=data.name,
        type=data.type,
        institution=data.institution,
        currency=data.currency,
        current_balance=data.current_balance,
    )
    db.add(account)
    await db.commit()
    await db.refresh(account)
    return AccountResponse.model_validate(account)


@router.get("/accounts", response_model=List[AccountResponse])
async def list_accounts(
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    user_id = await get_current_user_id(request)
    result = await db.execute(
        select(Account).where(Account.user_id == user_id, Account.is_active == True).order_by(Account.created_at)
    )
    return [AccountResponse.model_validate(a) for a in result.scalars().all()]


# --- Categories ---

@router.get("/categories", response_model=List[CategoryResponse])
async def list_categories(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Category).order_by(Category.sort_order))
    return [CategoryResponse.model_validate(c) for c in result.scalars().all()]


# --- Transactions ---

@router.post("/transactions", response_model=TransactionResponse, status_code=201)
async def create_transaction(
    data: TransactionCreate,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    user_id = await get_current_user_id(request)

    # Verify account belongs to user
    result = await db.execute(
        select(Account).where(Account.id == data.account_id, Account.user_id == user_id)
    )
    account = result.scalar_one_or_none()
    if not account:
        raise HTTPException(status_code=404, detail="חשבון לא נמצא")

    transaction = Transaction(
        user_id=user_id,
        account_id=data.account_id,
        category_id=data.category_id,
        type=data.type,
        amount=data.amount,
        date=data.date,
        description=data.description,
        merchant_name=data.merchant_name,
        notes=data.notes,
        source="manual",
    )
    db.add(transaction)

    # Update account balance
    if data.type == "income":
        account.current_balance += data.amount
    elif data.type == "expense":
        account.current_balance -= data.amount

    await db.commit()
    await db.refresh(transaction)
    return TransactionResponse.model_validate(transaction)


@router.get("/transactions", response_model=List[TransactionResponse])
async def list_transactions(
    request: Request,
    db: AsyncSession = Depends(get_db),
    limit: int = 50,
    offset: int = 0,
):
    user_id = await get_current_user_id(request)
    result = await db.execute(
        select(Transaction)
        .where(Transaction.user_id == user_id)
        .order_by(Transaction.date.desc(), Transaction.created_at.desc())
        .limit(min(limit, 100))
        .offset(offset)
    )
    return [TransactionResponse.model_validate(t) for t in result.scalars().all()]


@router.delete("/transactions/{transaction_id}", status_code=204)
async def delete_transaction(
    transaction_id: str,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    user_id = await get_current_user_id(request)
    result = await db.execute(
        select(Transaction).where(Transaction.id == transaction_id, Transaction.user_id == user_id)
    )
    transaction = result.scalar_one_or_none()
    if not transaction:
        raise HTTPException(status_code=404, detail="תנועה לא נמצאה")

    # Reverse balance change
    result2 = await db.execute(select(Account).where(Account.id == transaction.account_id))
    account = result2.scalar_one_or_none()
    if account:
        if transaction.type == "income":
            account.current_balance -= transaction.amount
        elif transaction.type == "expense":
            account.current_balance += transaction.amount

    await db.delete(transaction)
    await db.commit()
