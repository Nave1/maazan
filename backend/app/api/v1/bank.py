from fastapi import APIRouter, Depends, HTTPException, Request, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from datetime import datetime, timezone
import csv
import io

from app.core.database import get_db
from app.core.security import decode_token
from app.models.transaction import Account, Transaction
from app.models.ai import BankConnection, ImportBatch

router = APIRouter(prefix="/bank", tags=["Bank Connections"])

# Israeli banks registry
ISRAELI_BANKS = [
    {"code": "hapoalim", "name": "בנק הפועלים", "name_en": "Bank Hapoalim", "icon": "🏦"},
    {"code": "leumi", "name": "בנק לאומי", "name_en": "Bank Leumi", "icon": "🏦"},
    {"code": "discount", "name": "בנק דיסקונט", "name_en": "Discount Bank", "icon": "🏦"},
    {"code": "mizrahi", "name": "מזרחי טפחות", "name_en": "Mizrahi Tefahot", "icon": "🏦"},
    {"code": "fibi", "name": "הבינלאומי הראשון", "name_en": "First International", "icon": "🏦"},
    {"code": "jerusalem", "name": "בנק ירושלים", "name_en": "Bank of Jerusalem", "icon": "🏦"},
    {"code": "isracard", "name": "ישראכרט", "name_en": "Isracard", "icon": "💳"},
    {"code": "cal", "name": "כאל", "name_en": "Cal", "icon": "💳"},
    {"code": "max", "name": "מקס", "name_en": "Max", "icon": "💳"},
    {"code": "amex", "name": "אמריקן אקספרס", "name_en": "American Express", "icon": "💳"},
]


async def get_current_user_id(request: Request) -> str:
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="לא מחובר")
    token = auth_header.split(" ")[1]
    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        raise HTTPException(status_code=401, detail="טוקן לא תקין")
    return payload["sub"]


@router.get("/banks")
async def list_banks():
    """List supported Israeli banks and credit card companies."""
    return ISRAELI_BANKS


@router.post("/connect")
async def connect_bank(
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    user_id = await get_current_user_id(request)
    body = await request.json()
    bank_code = body.get("bank_code")
    account_id = body.get("account_id")

    bank = next((b for b in ISRAELI_BANKS if b["code"] == bank_code), None)
    if not bank:
        raise HTTPException(status_code=400, detail="בנק לא נתמך")

    # Verify account belongs to user if provided
    if account_id:
        result = await db.execute(
            select(Account).where(Account.id == account_id, Account.user_id == user_id)
        )
        if not result.scalar_one_or_none():
            raise HTTPException(status_code=404, detail="חשבון לא נמצא")

    connection = BankConnection(
        user_id=user_id,
        bank_name=bank["name"],
        bank_code=bank_code,
        account_id=account_id,
        status="connected",
    )
    db.add(connection)
    await db.commit()
    await db.refresh(connection)

    return {
        "id": str(connection.id),
        "bank_name": connection.bank_name,
        "bank_code": connection.bank_code,
        "status": connection.status,
        "message": f"חשבון {bank['name']} חובר בהצלחה. כעת תוכל לייבא תנועות.",
    }


@router.get("/connections")
async def list_connections(
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    user_id = await get_current_user_id(request)
    result = await db.execute(
        select(BankConnection).where(BankConnection.user_id == user_id).order_by(BankConnection.created_at.desc())
    )
    connections = result.scalars().all()
    return [
        {
            "id": str(c.id),
            "bank_name": c.bank_name,
            "bank_code": c.bank_code,
            "account_id": str(c.account_id) if c.account_id else None,
            "status": c.status,
            "last_sync_at": c.last_sync_at.isoformat() if c.last_sync_at else None,
            "created_at": c.created_at.isoformat(),
        }
        for c in connections
    ]


@router.post("/import")
async def import_transactions(
    request: Request,
    file: UploadFile = File(...),
    account_id: str = Form(...),
    source: str = Form(default="csv"),
    db: AsyncSession = Depends(get_db),
):
    """Import transactions from CSV file (bank/credit card statement)."""
    user_id = await get_current_user_id(request)

    # Verify account
    result = await db.execute(
        select(Account).where(Account.id == account_id, Account.user_id == user_id)
    )
    account = result.scalar_one_or_none()
    if not account:
        raise HTTPException(status_code=404, detail="חשבון לא נמצא")

    # Read file
    content = await file.read()
    try:
        text = content.decode("utf-8-sig")  # Handle BOM from Excel exports
    except UnicodeDecodeError:
        try:
            text = content.decode("windows-1255")  # Hebrew encoding
        except UnicodeDecodeError:
            text = content.decode("latin-1")

    # Create import batch
    batch = ImportBatch(
        user_id=user_id,
        account_id=account_id,
        source=source,
        file_name=file.filename,
        status="processing",
    )
    db.add(batch)
    await db.flush()

    # Parse CSV
    reader = csv.DictReader(io.StringIO(text))
    total = 0
    imported = 0
    failed = 0
    errors = []

    for row in reader:
        total += 1
        try:
            # Try to detect columns (support Hebrew and English headers)
            amount = _extract_amount(row)
            date = _extract_date(row)
            description = _extract_description(row)
            tx_type = "expense" if amount < 0 else "income"

            transaction = Transaction(
                user_id=user_id,
                account_id=account_id,
                type=tx_type,
                amount=abs(amount),
                date=date,
                description=description,
                source="csv",
                import_batch_id=batch.id,
            )
            db.add(transaction)

            # Update balance
            if tx_type == "income":
                account.current_balance += abs(amount)
            else:
                account.current_balance -= abs(amount)

            imported += 1
        except Exception as e:
            failed += 1
            if len(errors) < 5:
                errors.append({"row": total, "error": str(e)})

    batch.total_rows = total
    batch.imported_rows = imported
    batch.failed_rows = failed
    batch.status = "completed" if failed == 0 else "partial" if imported > 0 else "failed"
    batch.error_details = {"errors": errors} if errors else {}
    batch.completed_at = datetime.now(timezone.utc)

    await db.commit()

    return {
        "import_batch_id": str(batch.id),
        "status": batch.status,
        "total_rows": total,
        "imported_rows": imported,
        "failed_rows": failed,
        "errors": errors,
        "message": f"יובאו {imported} מתוך {total} תנועות בהצלחה",
    }


def _extract_amount(row: dict) -> float:
    """Extract amount from a CSV row, trying common column names."""
    for key in ["amount", "Amount", "סכום", "סכום חיוב", "סכום עסקה", "חובה", "זכות", "סכום (ש\"ח)"]:
        if key in row and row[key]:
            val = row[key].replace(",", "").replace("₪", "").replace(" ", "").strip()
            if val:
                return float(val)

    # Try debit/credit columns
    for dkey in ["חובה", "debit", "Debit"]:
        if dkey in row and row[dkey] and row[dkey].strip():
            val = row[dkey].replace(",", "").strip()
            return -abs(float(val))
    for ckey in ["זכות", "credit", "Credit"]:
        if ckey in row and row[ckey] and row[ckey].strip():
            val = row[ckey].replace(",", "").strip()
            return abs(float(val))

    raise ValueError("לא נמצאה עמודת סכום")


def _extract_date(row: dict) -> str:
    """Extract date from a CSV row."""
    from datetime import datetime as dt
    for key in ["date", "Date", "תאריך", "תאריך עסקה", "תאריך חיוב"]:
        if key in row and row[key]:
            val = row[key].strip()
            # Try common date formats
            for fmt in ["%d/%m/%Y", "%Y-%m-%d", "%d-%m-%Y", "%d.%m.%Y", "%d/%m/%y"]:
                try:
                    return dt.strptime(val, fmt).date().isoformat()
                except ValueError:
                    continue
            raise ValueError(f"פורמט תאריך לא מזוהה: {val}")
    raise ValueError("לא נמצאה עמודת תאריך")


def _extract_description(row: dict) -> str:
    """Extract description from a CSV row."""
    for key in ["description", "Description", "תיאור", "שם בית העסק", "פרטים", "הערות"]:
        if key in row and row[key]:
            return row[key].strip()
    return "ייבוא"
