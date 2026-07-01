"""
Document Ingestion API — Upload, parse, extract, and import financial data.

No bank APIs required. All data comes from user-uploaded documents:
CSV, Excel, PDF, email statements, or manual entry.

Flow: Upload → Parse → AI Extract → Review → Import into financial products/transactions.
"""
import os
import uuid
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, Request, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func as sa_func
from typing import Optional
from datetime import datetime, timezone
from decimal import Decimal

from app.core.database import get_db
from app.core.security import decode_token
from app.config import settings
from app.models.document import DocumentUpload, SUPPORTED_FILE_TYPES
from app.models.aggregation import (
    FinancialInstitution, FinancialConnection, FinancialProduct,
    SyncLog, PRODUCT_TYPES,
)
from app.models.transaction import Account, Transaction
from app.services.extractor import (
    extract_from_csv, extract_from_excel, extract_from_pdf,
    build_ai_extraction_prompt,
)

router = APIRouter(prefix="/ingest", tags=["Document Ingestion"])

# Upload directory (configurable, defaults to local storage)
UPLOAD_DIR = Path(os.environ.get("UPLOAD_DIR", "uploads"))
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


# ─── Auth ─────────────────────────────────────────────────────────────────

async def _get_user_id(request: Request) -> str:
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="לא מחובר")
    token = auth_header.split(" ")[1]
    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        raise HTTPException(status_code=401, detail="טוקן לא תקין")
    return payload["sub"]


# ─── File Type Detection ──────────────────────────────────────────────────

def _detect_file_type(filename: str, content_type: Optional[str] = None) -> Optional[str]:
    """Detect file type from extension and MIME type."""
    ext = Path(filename).suffix.lower()
    for file_type, info in SUPPORTED_FILE_TYPES.items():
        if ext in info["extensions"]:
            return file_type
        if content_type and content_type in info["mime_types"]:
            return file_type
    return None


def _validate_upload(filename: str, size: int, file_type: str) -> None:
    """Validate upload constraints."""
    info = SUPPORTED_FILE_TYPES.get(file_type)
    if not info:
        raise HTTPException(status_code=400, detail=f"סוג קובץ לא נתמך: {file_type}")
    max_bytes = info["max_size_mb"] * 1024 * 1024
    if size > max_bytes:
        raise HTTPException(
            status_code=400,
            detail=f"הקובץ גדול מדי. מקסימום {info['max_size_mb']}MB עבור {file_type}",
        )


# ═══════════════════════════════════════════════════════════════════════════
# UPLOAD ENDPOINTS
# ═══════════════════════════════════════════════════════════════════════════

@router.post("/upload")
async def upload_document(
    request: Request,
    file: UploadFile = File(...),
    institution_code: Optional[str] = Form(default=None),
    product_type: Optional[str] = Form(default=None),
    account_id: Optional[str] = Form(default=None),
    db: AsyncSession = Depends(get_db),
):
    """
    Upload a financial document for extraction.
    Supports: CSV, Excel (.xlsx), PDF, Email (.eml).

    The system will:
    1. Detect the file type and institution
    2. Parse and extract transactions/products
    3. Generate financial insights
    4. Return extracted data for review before import
    """
    user_id = await _get_user_id(request)

    # Validate file
    file_type = _detect_file_type(file.filename or "", file.content_type)
    if not file_type:
        supported = ", ".join(
            ext for info in SUPPORTED_FILE_TYPES.values() for ext in info["extensions"]
        )
        raise HTTPException(
            status_code=400,
            detail=f"סוג קובץ לא נתמך. הפורמטים הנתמכים: {supported}",
        )

    content = await file.read()
    _validate_upload(file.filename or "upload", len(content), file_type)

    # Save file to disk
    file_id = str(uuid.uuid4())
    safe_name = f"{file_id}_{Path(file.filename or 'upload').name}"
    storage_path = str(UPLOAD_DIR / safe_name)
    with open(storage_path, "wb") as f:
        f.write(content)

    # Create upload record
    doc = DocumentUpload(
        user_id=user_id,
        file_name=file.filename or "upload",
        file_type=file_type,
        file_size=len(content),
        mime_type=file.content_type,
        storage_path=storage_path,
        detected_institution=institution_code,
        detected_product_type=product_type,
        extraction_status="processing",
    )
    db.add(doc)
    await db.flush()

    # ── Extract ──
    extraction = {}
    try:
        if file_type == "csv":
            extraction = extract_from_csv(content, file.filename or "")
        elif file_type == "excel":
            extraction = extract_from_excel(content, file.filename or "")
        elif file_type == "pdf":
            extraction = extract_from_pdf(content, file.filename or "")
        elif file_type == "email":
            # Email parsing — extract attachments and text
            extraction = _extract_from_email(content, file.filename or "")

        if extraction.get("error"):
            doc.extraction_status = "failed"
            doc.extraction_errors = [{"error": extraction["error"]}]
        else:
            doc.extraction_status = "completed"
            doc.raw_rows = extraction.get("transactions", [])
            doc.extracted_data = extraction.get("metadata", {})
            doc.transactions_extracted = len(extraction.get("transactions", []))
            doc.ai_insights = extraction.get("insights", [])

            # Update detected institution from extraction
            detected_inst = extraction.get("metadata", {}).get("detected_institution")
            if detected_inst and not institution_code:
                doc.detected_institution = detected_inst

    except Exception as e:
        doc.extraction_status = "failed"
        doc.extraction_errors = [{"error": str(e)}]

    doc.processed_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(doc)

    return {
        "upload_id": str(doc.id),
        "file_name": doc.file_name,
        "file_type": doc.file_type,
        "status": doc.extraction_status,
        "transactions_found": doc.transactions_extracted,
        "detected_institution": doc.detected_institution,
        "insights": doc.ai_insights,
        "extraction": {
            "transactions": extraction.get("transactions", [])[:50],  # preview first 50
            "total_transactions": len(extraction.get("transactions", [])),
            "metadata": extraction.get("metadata", {}),
            "errors": extraction.get("errors", []),
        },
        "message": _upload_message(doc.extraction_status, doc.transactions_extracted),
    }


@router.post("/upload/manual")
async def manual_entry(
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """
    Manual data entry — add financial data without any file upload.
    Supports: transactions, account balances, product details.
    """
    user_id = await _get_user_id(request)
    body = await request.json()

    entry_type = body.get("entry_type", "transaction")  # transaction, balance, product

    doc = DocumentUpload(
        user_id=user_id,
        file_name="manual_entry",
        file_type="manual_entry",
        extraction_status="completed",
        extraction_engine="manual",
        extraction_confidence=100,
        extracted_data=body,
        processed_at=datetime.now(timezone.utc),
    )

    if entry_type == "transaction":
        transactions = body.get("transactions", [])
        if not transactions and body.get("amount"):
            # Single transaction shorthand
            transactions = [{
                "date": body.get("date", datetime.now(timezone.utc).date().isoformat()),
                "amount": body["amount"],
                "description": body.get("description", "הזנה ידנית"),
                "type": "expense" if body.get("amount", 0) < 0 else "income",
                "category": body.get("category"),
            }]
        doc.raw_rows = transactions
        doc.transactions_extracted = len(transactions)
    elif entry_type == "product":
        doc.products_extracted = 1
        doc.extracted_data = body
    elif entry_type == "balance":
        doc.extracted_data = body

    db.add(doc)
    await db.commit()
    await db.refresh(doc)

    return {
        "upload_id": str(doc.id),
        "status": "completed",
        "entry_type": entry_type,
        "message": "הנתונים נקלטו בהצלחה",
    }


# ═══════════════════════════════════════════════════════════════════════════
# IMPORT (commit extracted data into financial records)
# ═══════════════════════════════════════════════════════════════════════════

@router.post("/import/{upload_id}")
async def import_extracted_data(
    upload_id: str,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """
    Import extracted data from a document upload into the financial system.
    Call this AFTER reviewing the extraction preview from /upload.
    """
    user_id = await _get_user_id(request)
    body = await request.json()

    # Find upload
    result = await db.execute(
        select(DocumentUpload).where(
            DocumentUpload.id == upload_id,
            DocumentUpload.user_id == user_id,
        )
    )
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="מסמך לא נמצא")

    if doc.extraction_status not in ("completed", "review"):
        raise HTTPException(status_code=400, detail="המסמך לא עבר חילוץ בהצלחה")

    account_id = body.get("account_id")
    connection_id = body.get("connection_id")
    import_transactions = body.get("import_transactions", True)
    import_products = body.get("import_products", False)
    selected_rows = body.get("selected_rows")  # optional: list of row indices to import

    # Get transactions to import
    transactions = doc.raw_rows or []
    if selected_rows is not None:
        selected_set = set(selected_rows)
        transactions = [t for i, t in enumerate(transactions) if i in selected_set]

    imported_tx = 0
    imported_prod = 0
    errors = []

    # Import transactions
    if import_transactions and transactions and account_id:
        # Verify account belongs to user
        acct_result = await db.execute(
            select(Account).where(Account.id == account_id, Account.user_id == user_id)
        )
        account = acct_result.scalar_one_or_none()
        if not account:
            raise HTTPException(status_code=404, detail="חשבון לא נמצא")

        for i, tx in enumerate(transactions):
            try:
                amount = float(tx.get("amount", 0))
                if amount == 0:
                    continue

                transaction = Transaction(
                    user_id=user_id,
                    account_id=account_id,
                    type=tx.get("type", "expense" if amount < 0 else "income"),
                    amount=abs(amount),
                    date=tx.get("date", datetime.now(timezone.utc).date().isoformat()),
                    description=tx.get("description", "ייבוא"),
                    source=f"import_{doc.file_type}",
                )
                db.add(transaction)

                if amount > 0:
                    account.current_balance += Decimal(str(abs(amount)))
                else:
                    account.current_balance -= Decimal(str(abs(amount)))

                imported_tx += 1
            except Exception as e:
                if len(errors) < 10:
                    errors.append({"row": i, "error": str(e)})

    # Import products
    if import_products and connection_id:
        products_data = doc.extracted_data.get("products_detected", [])
        if doc.extracted_data.get("entry_type") == "product":
            products_data = [doc.extracted_data]

        for prod_data in products_data:
            try:
                product_type = prod_data.get("product_type", "checking")
                liability_types = {"credit_card", "mortgage", "personal_loan", "vehicle_loan"}

                product = FinancialProduct(
                    user_id=user_id,
                    connection_id=connection_id,
                    product_type=product_type,
                    name=prod_data.get("name", PRODUCT_TYPES.get(product_type, "מוצר")),
                    current_balance=Decimal(str(prod_data.get("current_balance", 0))),
                    interest_rate=Decimal(str(prod_data["interest_rate"])) if prod_data.get("interest_rate") else None,
                    monthly_payment=Decimal(str(prod_data["monthly_payment"])) if prod_data.get("monthly_payment") else None,
                    is_liability=product_type in liability_types,
                    institution_name=prod_data.get("institution_name"),
                    last_updated=datetime.now(timezone.utc),
                )
                db.add(product)
                imported_prod += 1
            except Exception as e:
                if len(errors) < 10:
                    errors.append({"product": prod_data.get("name"), "error": str(e)})

    doc.reviewed_at = datetime.now(timezone.utc)
    await db.commit()

    return {
        "upload_id": upload_id,
        "imported_transactions": imported_tx,
        "imported_products": imported_prod,
        "errors": errors,
        "message": f"יובאו {imported_tx} תנועות ו-{imported_prod} מוצרים פיננסיים",
    }


# ═══════════════════════════════════════════════════════════════════════════
# AI ANALYSIS ENDPOINT
# ═══════════════════════════════════════════════════════════════════════════

@router.post("/analyze/{upload_id}")
async def ai_analyze_document(
    upload_id: str,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """
    Run AI-powered deep analysis on an uploaded document.
    Extracts insights, detects patterns, identifies financial products,
    and generates recommendations — all from the document content alone.
    """
    user_id = await _get_user_id(request)

    result = await db.execute(
        select(DocumentUpload).where(
            DocumentUpload.id == upload_id,
            DocumentUpload.user_id == user_id,
        )
    )
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="מסמך לא נמצא")

    # Build AI prompt from document content
    raw_text = doc.raw_text or ""
    if not raw_text and doc.raw_rows:
        # Build text representation from parsed rows
        rows = doc.raw_rows[:100]  # limit for prompt size
        raw_text = "\n".join(
            f"{r.get('date', '')} | {r.get('description', '')} | {r.get('amount', '')}"
            for r in rows
        )

    if not raw_text:
        raise HTTPException(status_code=400, detail="אין תוכן לניתוח. יש להעלות קובץ עם נתונים")

    prompt = build_ai_extraction_prompt(raw_text, doc.file_name, doc.file_type)

    # Check if OpenAI is configured
    if not settings.openai_api_key:
        # Return rule-based analysis instead
        return {
            "upload_id": upload_id,
            "analysis_type": "rule_based",
            "insights": doc.ai_insights or [],
            "metadata": doc.extracted_data or {},
            "transactions_count": doc.transactions_extracted,
            "message": "ניתוח מבוסס חוקים. לניתוח AI מתקדם יש להגדיר מפתח OpenAI",
        }

    # AI extraction
    try:
        import openai
        client = openai.OpenAI(api_key=settings.openai_api_key)
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
            max_tokens=4000,
        )

        ai_output = response.choices[0].message.content or "{}"
        # Strip markdown fences if present
        if ai_output.startswith("```"):
            ai_output = ai_output.split("\n", 1)[1] if "\n" in ai_output else ai_output[3:]
        if ai_output.endswith("```"):
            ai_output = ai_output[:-3]

        import json
        try:
            ai_data = json.loads(ai_output.strip())
        except json.JSONDecodeError:
            ai_data = {"raw_response": ai_output, "parse_error": True}

        # Store AI results
        doc.extracted_data = {**(doc.extracted_data or {}), "ai_analysis": ai_data}
        doc.ai_insights = ai_data.get("insights", doc.ai_insights or [])
        doc.extraction_engine = "ai"
        doc.extraction_confidence = 85

        if ai_data.get("products_detected"):
            doc.products_extracted = len(ai_data["products_detected"])

        await db.commit()

        return {
            "upload_id": upload_id,
            "analysis_type": "ai",
            "institution": ai_data.get("institution"),
            "document_type": ai_data.get("document_type"),
            "period": ai_data.get("period"),
            "accounts": ai_data.get("accounts", []),
            "products_detected": ai_data.get("products_detected", []),
            "summary": ai_data.get("summary", {}),
            "insights": ai_data.get("insights", []),
            "transactions_from_ai": len(ai_data.get("transactions", [])),
            "message": "ניתוח AI הושלם בהצלחה",
        }

    except Exception as e:
        return {
            "upload_id": upload_id,
            "analysis_type": "error",
            "error": str(e),
            "insights": doc.ai_insights or [],
            "message": "שגיאה בניתוח AI. הנתונים שחולצו בשיטה הרגילה זמינים",
        }


# ═══════════════════════════════════════════════════════════════════════════
# DOCUMENT MANAGEMENT
# ═══════════════════════════════════════════════════════════════════════════

@router.get("/documents")
async def list_documents(
    request: Request,
    status: Optional[str] = None,
    file_type: Optional[str] = None,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
):
    """List user's uploaded documents."""
    user_id = await _get_user_id(request)

    query = select(DocumentUpload).where(
        DocumentUpload.user_id == user_id,
        DocumentUpload.is_deleted == False,
    )
    if status:
        query = query.where(DocumentUpload.extraction_status == status)
    if file_type:
        query = query.where(DocumentUpload.file_type == file_type)
    query = query.order_by(DocumentUpload.uploaded_at.desc()).limit(limit)

    result = await db.execute(query)
    docs = result.scalars().all()

    return [
        {
            "id": str(d.id),
            "file_name": d.file_name,
            "file_type": d.file_type,
            "file_size": d.file_size,
            "status": d.extraction_status,
            "detected_institution": d.detected_institution,
            "transactions_extracted": d.transactions_extracted,
            "products_extracted": d.products_extracted,
            "insights_count": len(d.ai_insights) if d.ai_insights else 0,
            "uploaded_at": d.uploaded_at.isoformat(),
            "processed_at": d.processed_at.isoformat() if d.processed_at else None,
        }
        for d in docs
    ]


@router.get("/documents/{upload_id}")
async def get_document(
    upload_id: str,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """Get full details of an uploaded document including extracted data."""
    user_id = await _get_user_id(request)

    result = await db.execute(
        select(DocumentUpload).where(
            DocumentUpload.id == upload_id,
            DocumentUpload.user_id == user_id,
        )
    )
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="מסמך לא נמצא")

    return {
        "id": str(doc.id),
        "file_name": doc.file_name,
        "file_type": doc.file_type,
        "file_size": doc.file_size,
        "status": doc.extraction_status,
        "extraction_engine": doc.extraction_engine,
        "extraction_confidence": doc.extraction_confidence,
        "detected_institution": doc.detected_institution,
        "detected_product_type": doc.detected_product_type,
        "period_start": doc.document_period_start.isoformat() if doc.document_period_start else None,
        "period_end": doc.document_period_end.isoformat() if doc.document_period_end else None,
        "transactions": doc.raw_rows or [],
        "transactions_count": doc.transactions_extracted,
        "products_extracted": doc.products_extracted,
        "metadata": doc.extracted_data or {},
        "insights": doc.ai_insights or [],
        "errors": doc.extraction_errors or [],
        "uploaded_at": doc.uploaded_at.isoformat(),
        "processed_at": doc.processed_at.isoformat() if doc.processed_at else None,
        "reviewed_at": doc.reviewed_at.isoformat() if doc.reviewed_at else None,
    }


@router.delete("/documents/{upload_id}")
async def delete_document(
    upload_id: str,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """Soft-delete an uploaded document."""
    user_id = await _get_user_id(request)

    result = await db.execute(
        select(DocumentUpload).where(
            DocumentUpload.id == upload_id,
            DocumentUpload.user_id == user_id,
        )
    )
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="מסמך לא נמצא")

    doc.is_deleted = True
    await db.commit()
    return {"message": "המסמך נמחק"}


@router.get("/supported-formats")
async def list_supported_formats():
    """List all supported file formats for upload."""
    return {
        "formats": [
            {
                "type": "csv",
                "label_he": "קובץ CSV",
                "label_en": "CSV File",
                "extensions": [".csv", ".tsv"],
                "icon": "📊",
                "description": "דוח תנועות מהבנק או חברת אשראי",
                "max_size_mb": 50,
            },
            {
                "type": "excel",
                "label_he": "קובץ Excel",
                "label_en": "Excel File",
                "extensions": [".xlsx", ".xls"],
                "icon": "📗",
                "description": "גיליון אלקטרוני עם נתונים פיננסיים",
                "max_size_mb": 50,
            },
            {
                "type": "pdf",
                "label_he": "מסמך PDF",
                "label_en": "PDF Document",
                "extensions": [".pdf"],
                "icon": "📄",
                "description": "דוח בנק, דוח פנסיה, פוליסת ביטוח, הסכם הלוואה",
                "max_size_mb": 25,
            },
            {
                "type": "email",
                "label_he": "הודעת מייל",
                "label_en": "Email Message",
                "extensions": [".eml", ".msg"],
                "icon": "📧",
                "description": "מייל עם דוח פיננסי מצורף",
                "max_size_mb": 15,
            },
            {
                "type": "manual_entry",
                "label_he": "הזנה ידנית",
                "label_en": "Manual Entry",
                "extensions": [],
                "icon": "✏️",
                "description": "הזנת נתונים ידנית — יתרות, תנועות, מוצרים",
                "max_size_mb": 0,
            },
        ],
        "ingestion_methods": [
            {"method": "csv", "label_he": "ייבוא CSV", "supported": True},
            {"method": "excel", "label_he": "ייבוא Excel", "supported": True},
            {"method": "pdf", "label_he": "סריקת PDF", "supported": True},
            {"method": "email", "label_he": "ניתוח מיילים", "supported": True},
            {"method": "manual", "label_he": "הזנה ידנית", "supported": True},
            {"method": "open_banking", "label_he": "Open Banking", "supported": False, "note": "בפיתוח"},
        ],
    }


@router.get("/stats")
async def ingestion_stats(
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """Get user's document ingestion statistics."""
    user_id = await _get_user_id(request)

    # Total uploads
    total_result = await db.execute(
        select(sa_func.count(DocumentUpload.id)).where(
            DocumentUpload.user_id == user_id,
            DocumentUpload.is_deleted == False,
        )
    )
    total = total_result.scalar() or 0

    # By status
    status_result = await db.execute(
        select(DocumentUpload.extraction_status, sa_func.count(DocumentUpload.id))
        .where(DocumentUpload.user_id == user_id, DocumentUpload.is_deleted == False)
        .group_by(DocumentUpload.extraction_status)
    )
    by_status = {row[0]: row[1] for row in status_result.all()}

    # By file type
    type_result = await db.execute(
        select(DocumentUpload.file_type, sa_func.count(DocumentUpload.id))
        .where(DocumentUpload.user_id == user_id, DocumentUpload.is_deleted == False)
        .group_by(DocumentUpload.file_type)
    )
    by_type = {row[0]: row[1] for row in type_result.all()}

    # Total extracted
    tx_result = await db.execute(
        select(sa_func.sum(DocumentUpload.transactions_extracted)).where(
            DocumentUpload.user_id == user_id,
            DocumentUpload.is_deleted == False,
        )
    )
    total_transactions = tx_result.scalar() or 0

    return {
        "total_uploads": total,
        "by_status": by_status,
        "by_file_type": by_type,
        "total_transactions_extracted": total_transactions,
    }


# ─── Helpers ──────────────────────────────────────────────────────────────

def _extract_from_email(content: bytes, file_name: str) -> dict:
    """Basic email parsing — extract text and look for financial data."""
    import email
    from email import policy

    try:
        msg = email.message_from_bytes(content, policy=policy.default)
        body_text = ""

        if msg.is_multipart():
            for part in msg.walk():
                ctype = part.get_content_type()
                if ctype == "text/plain":
                    payload = part.get_payload(decode=True)
                    if payload:
                        body_text += payload.decode("utf-8", errors="replace")
        else:
            payload = msg.get_payload(decode=True)
            if payload:
                body_text = payload.decode("utf-8", errors="replace")

        from app.services.extractor import _detect_institution, _generate_basic_insights
        institution = _detect_institution(body_text[:2000])

        return {
            "transactions": [],
            "raw_text": body_text[:10000],
            "metadata": {
                "subject": str(msg.get("subject", "")),
                "from": str(msg.get("from", "")),
                "date": str(msg.get("date", "")),
                "detected_institution": institution,
                "original_format": "email",
                "needs_ai_analysis": True,
            },
            "errors": [],
            "insights": ["מייל זוהה. מומלץ להפעיל ניתוח AI לחילוץ נתונים מתקדם"],
        }
    except Exception as e:
        return {"error": f"שגיאה בקריאת מייל: {str(e)}", "transactions": [], "metadata": {}}


def _upload_message(status: str, count: int) -> str:
    """Generate human-readable upload result message in Hebrew."""
    if status == "failed":
        return "לא הצלחנו לחלץ נתונים מהקובץ. נסה פורמט אחר"
    if count == 0:
        return "הקובץ נקרא אך לא זוהו תנועות. מומלץ להפעיל ניתוח AI"
    return f"זוהו {count} תנועות! בדוק את הנתונים ואשר ייבוא"
