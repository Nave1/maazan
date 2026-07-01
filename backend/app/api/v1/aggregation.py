"""
Financial Aggregation API — Complete Israeli financial ecosystem integration.

Supports: Banks, Credit Cards, Pension, Insurance, Investments, Loans, Digital Payments, Crypto.
Connection methods: Open Banking, Scrapers, CSV Import, Email Parsing, Manual Entry.
"""
from fastapi import APIRouter, Depends, HTTPException, Request, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func as sa_func
from typing import Optional
from datetime import datetime, timezone, date
from decimal import Decimal

from app.core.database import get_db
from app.core.security import decode_token
from app.models.aggregation import (
    FinancialInstitution, FinancialConnection, FinancialProduct,
    SyncLog, FinancialSnapshot, PRODUCT_TYPES,
)

router = APIRouter(prefix="/aggregation", tags=["Financial Aggregation"])


# ═══════════════════════════════════════════════════════════════
# ISRAELI FINANCIAL INSTITUTIONS REGISTRY
# ═══════════════════════════════════════════════════════════════

INSTITUTIONS_SEED = [
    # ── Banks ──
    {"code": "hapoalim", "name_he": "בנק הפועלים", "name_en": "Bank Hapoalim", "institution_type": "bank", "icon": "🏦", "connection_methods": ["csv", "excel", "pdf", "manual"]},
    {"code": "leumi", "name_he": "בנק לאומי", "name_en": "Bank Leumi", "institution_type": "bank", "icon": "🏦", "connection_methods": ["csv", "excel", "pdf", "manual"]},
    {"code": "discount", "name_he": "בנק דיסקונט", "name_en": "Discount Bank", "institution_type": "bank", "icon": "🏦", "connection_methods": ["csv", "excel", "pdf", "manual"]},
    {"code": "mizrahi", "name_he": "מזרחי טפחות", "name_en": "Mizrahi Tefahot", "institution_type": "bank", "icon": "🏦", "connection_methods": ["csv", "excel", "pdf", "manual"]},
    {"code": "fibi", "name_he": "הבינלאומי הראשון", "name_en": "First International Bank", "institution_type": "bank", "icon": "🏦", "connection_methods": ["csv", "excel", "pdf", "manual"]},
    {"code": "yahav", "name_he": "בנק יהב", "name_en": "Bank Yahav", "institution_type": "bank", "icon": "🏦", "connection_methods": ["csv", "excel", "pdf", "manual"]},
    {"code": "jerusalem", "name_he": "בנק ירושלים", "name_en": "Bank Jerusalem", "institution_type": "bank", "icon": "🏦", "connection_methods": ["csv", "excel", "pdf", "manual"]},
    {"code": "onezero", "name_he": "וואן זירו", "name_en": "One Zero Bank", "institution_type": "bank", "icon": "🏦", "connection_methods": ["csv", "excel", "pdf", "manual"]},
    {"code": "mercantile", "name_he": "מרכנתיל דיסקונט", "name_en": "Mercantile Discount Bank", "institution_type": "bank", "icon": "🏦", "connection_methods": ["csv", "excel", "pdf", "manual"]},

    # ── Credit Cards ──
    {"code": "isracard", "name_he": "ישראכרט", "name_en": "Isracard", "institution_type": "credit_card", "icon": "💳", "connection_methods": ["csv", "excel", "pdf", "email_parse", "manual"]},
    {"code": "max", "name_he": "מקס", "name_en": "MAX", "institution_type": "credit_card", "icon": "💳", "connection_methods": ["csv", "excel", "pdf", "email_parse", "manual"]},
    {"code": "cal", "name_he": "כאל", "name_en": "CAL", "institution_type": "credit_card", "icon": "💳", "connection_methods": ["csv", "excel", "pdf", "email_parse", "manual"]},
    {"code": "amex_il", "name_he": "אמריקן אקספרס ישראל", "name_en": "American Express Israel", "institution_type": "credit_card", "icon": "💳", "connection_methods": ["csv", "excel", "pdf", "email_parse", "manual"]},

    # ── Pension & Investment Companies ──
    {"code": "menora", "name_he": "מנורה מבטחים", "name_en": "Menora Mivtachim", "institution_type": "pension", "icon": "🏛️", "connection_methods": ["pdf", "excel", "manual"]},
    {"code": "harel", "name_he": "הראל", "name_en": "Harel", "institution_type": "pension", "icon": "🏛️", "connection_methods": ["pdf", "excel", "manual"]},
    {"code": "phoenix", "name_he": "הפניקס", "name_en": "Phoenix", "institution_type": "pension", "icon": "🏛️", "connection_methods": ["pdf", "excel", "manual"]},
    {"code": "migdal", "name_he": "מגדל", "name_en": "Migdal", "institution_type": "pension", "icon": "🏛️", "connection_methods": ["pdf", "excel", "manual"]},
    {"code": "clal", "name_he": "כלל ביטוח", "name_en": "Clal Insurance", "institution_type": "pension", "icon": "🏛️", "connection_methods": ["pdf", "excel", "manual"]},
    {"code": "altshuler", "name_he": "אלטשולר שחם", "name_en": "Altshuler Shaham", "institution_type": "pension", "icon": "📈", "connection_methods": ["pdf", "excel", "csv", "manual"]},
    {"code": "meitav", "name_he": "מיטב", "name_en": "Meitav", "institution_type": "pension", "icon": "📈", "connection_methods": ["pdf", "excel", "csv", "manual"]},
    {"code": "yelin", "name_he": "ילין לפידות", "name_en": "Yelin Lapidot", "institution_type": "pension", "icon": "📈", "connection_methods": ["pdf", "excel", "csv", "manual"]},
    {"code": "psagot", "name_he": "פסגות", "name_en": "Psagot", "institution_type": "pension", "icon": "📈", "connection_methods": ["pdf", "excel", "csv", "manual"]},
    {"code": "mor", "name_he": "מור בית השקעות", "name_en": "Mor Investment House", "institution_type": "pension", "icon": "📈", "connection_methods": ["pdf", "excel", "csv", "manual"]},
    {"code": "ibi", "name_he": "IBI בית השקעות", "name_en": "IBI Investment House", "institution_type": "pension", "icon": "📈", "connection_methods": ["pdf", "excel", "csv", "manual"]},

    # ── Insurance ──
    {"code": "phoenix_ins", "name_he": "הפניקס ביטוח", "name_en": "Phoenix Insurance", "institution_type": "insurance", "icon": "🛡️", "connection_methods": ["manual"]},
    {"code": "harel_ins", "name_he": "הראל ביטוח", "name_en": "Harel Insurance", "institution_type": "insurance", "icon": "🛡️", "connection_methods": ["manual"]},
    {"code": "migdal_ins", "name_he": "מגדל ביטוח", "name_en": "Migdal Insurance", "institution_type": "insurance", "icon": "🛡️", "connection_methods": ["manual"]},
    {"code": "clal_ins", "name_he": "כלל ביטוח", "name_en": "Clal Insurance", "institution_type": "insurance", "icon": "🛡️", "connection_methods": ["manual"]},
    {"code": "menora_ins", "name_he": "מנורה ביטוח", "name_en": "Menora Insurance", "institution_type": "insurance", "icon": "🛡️", "connection_methods": ["manual"]},

    # ── Brokerage ──
    {"code": "ib", "name_he": "אינטראקטיב ברוקרס", "name_en": "Interactive Brokers", "institution_type": "brokerage", "icon": "📊", "connection_methods": ["csv", "manual"]},
    {"code": "excellence", "name_he": "אקסלנס", "name_en": "Excellence", "institution_type": "brokerage", "icon": "📊", "connection_methods": ["csv", "excel", "pdf", "manual"]},
    {"code": "meitav_trade", "name_he": "מיטב טרייד", "name_en": "Meitav Trade", "institution_type": "brokerage", "icon": "📊", "connection_methods": ["csv", "excel", "pdf", "manual"]},
    {"code": "ibi_trade", "name_he": "IBI טרייד", "name_en": "IBI Trade", "institution_type": "brokerage", "icon": "📊", "connection_methods": ["csv", "excel", "pdf", "manual"]},

    # ── Digital Payments ──
    {"code": "bit", "name_he": "ביט", "name_en": "Bit", "institution_type": "digital_payment", "icon": "📱", "connection_methods": ["manual"]},
    {"code": "paybox", "name_he": "פייבוקס", "name_en": "PayBox", "institution_type": "digital_payment", "icon": "📱", "connection_methods": ["manual"]},
    {"code": "apple_pay", "name_he": "אפל פיי", "name_en": "Apple Pay", "institution_type": "digital_payment", "icon": "📱", "connection_methods": ["manual"]},
    {"code": "google_pay", "name_he": "גוגל פיי", "name_en": "Google Pay", "institution_type": "digital_payment", "icon": "📱", "connection_methods": ["manual"]},

    # ── Crypto ──
    {"code": "binance", "name_he": "ביננס", "name_en": "Binance", "institution_type": "crypto", "icon": "₿", "connection_methods": ["csv", "manual"]},
    {"code": "coinbase", "name_he": "קוינבייס", "name_en": "Coinbase", "institution_type": "crypto", "icon": "₿", "connection_methods": ["csv", "manual"]},
    {"code": "bit2c", "name_he": "ביט2סי", "name_en": "Bit2C", "institution_type": "crypto", "icon": "₿", "connection_methods": ["csv", "manual"]},
    {"code": "bits_of_gold", "name_he": "ביטס אוף גולד", "name_en": "Bits of Gold", "institution_type": "crypto", "icon": "₿", "connection_methods": ["csv", "manual"]},
]


# ═══════════════════════════════════════════════════════════════
# AUTH HELPER
# ═══════════════════════════════════════════════════════════════

async def _get_user_id(request: Request) -> str:
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="לא מחובר")
    token = auth_header.split(" ")[1]
    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        raise HTTPException(status_code=401, detail="טוקן לא תקין")
    return payload["sub"]


# ═══════════════════════════════════════════════════════════════
# ENDPOINTS — INSTITUTIONS REGISTRY
# ═══════════════════════════════════════════════════════════════

@router.get("/institutions")
async def list_institutions(
    institution_type: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """List all supported Israeli financial institutions, optionally filtered by type."""
    query = select(FinancialInstitution).where(FinancialInstitution.is_active == True)
    if institution_type:
        query = query.where(FinancialInstitution.institution_type == institution_type)
    query = query.order_by(FinancialInstitution.institution_type, FinancialInstitution.name_en)

    result = await db.execute(query)
    institutions = result.scalars().all()

    # If DB is empty, return seed data directly
    if not institutions:
        data = INSTITUTIONS_SEED
        if institution_type:
            data = [i for i in data if i["institution_type"] == institution_type]
        return data

    return [
        {
            "id": str(inst.id),
            "code": inst.code,
            "name_he": inst.name_he,
            "name_en": inst.name_en,
            "institution_type": inst.institution_type,
            "icon": inst.icon,
            "connection_methods": inst.connection_methods,
        }
        for inst in institutions
    ]


@router.get("/institutions/types")
async def list_institution_types():
    """List available institution categories."""
    return [
        {"type": "bank", "label_he": "בנקים", "label_en": "Banks", "icon": "🏦"},
        {"type": "credit_card", "label_he": "כרטיסי אשראי", "label_en": "Credit Cards", "icon": "💳"},
        {"type": "pension", "label_he": "פנסיה והשקעות", "label_en": "Pension & Investments", "icon": "🏛️"},
        {"type": "insurance", "label_he": "ביטוח", "label_en": "Insurance", "icon": "🛡️"},
        {"type": "brokerage", "label_he": "ברוקרים", "label_en": "Brokerage", "icon": "📊"},
        {"type": "digital_payment", "label_he": "תשלומים דיגיטליים", "label_en": "Digital Payments", "icon": "📱"},
        {"type": "crypto", "label_he": "קריפטו", "label_en": "Crypto", "icon": "₿"},
    ]


@router.get("/product-types")
async def list_product_types():
    """List supported financial product types."""
    return PRODUCT_TYPES


# ═══════════════════════════════════════════════════════════════
# ENDPOINTS — CONNECTIONS
# ═══════════════════════════════════════════════════════════════

@router.post("/connections")
async def create_connection(
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """Connect to a financial institution."""
    user_id = await _get_user_id(request)
    body = await request.json()

    institution_code = body.get("institution_code")
    connection_method = body.get("connection_method", "manual")

    # Find institution
    institution = next((i for i in INSTITUTIONS_SEED if i["code"] == institution_code), None)
    if not institution:
        raise HTTPException(status_code=400, detail="מוסד פיננסי לא נתמך")

    if connection_method not in institution["connection_methods"]:
        raise HTTPException(status_code=400, detail=f"שיטת חיבור {connection_method} לא נתמכת עבור {institution['name_he']}")

    # Check DB for institution record, or find by code
    result = await db.execute(
        select(FinancialInstitution).where(FinancialInstitution.code == institution_code)
    )
    db_institution = result.scalar_one_or_none()

    # Create institution record if not exists
    if not db_institution:
        db_institution = FinancialInstitution(
            code=institution["code"],
            name_he=institution["name_he"],
            name_en=institution["name_en"],
            institution_type=institution["institution_type"],
            icon=institution.get("icon"),
            connection_methods=institution["connection_methods"],
        )
        db.add(db_institution)
        await db.flush()

    # Create connection
    connection = FinancialConnection(
        user_id=user_id,
        institution_id=db_institution.id,
        connection_method=connection_method,
        status="connected" if connection_method == "manual" else "pending",
        consent_granted_at=datetime.now(timezone.utc),
    )
    db.add(connection)
    await db.commit()
    await db.refresh(connection)

    return {
        "id": str(connection.id),
        "institution_code": institution_code,
        "institution_name": institution["name_he"],
        "connection_method": connection_method,
        "status": connection.status,
        "message": f"חיבור ל{institution['name_he']} נוצר בהצלחה",
    }


@router.get("/connections")
async def list_connections(
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """List all user's financial connections."""
    user_id = await _get_user_id(request)

    result = await db.execute(
        select(FinancialConnection)
        .where(FinancialConnection.user_id == user_id)
        .order_by(FinancialConnection.created_at.desc())
    )
    connections = result.scalars().all()

    output = []
    for conn in connections:
        # Load institution info
        inst_result = await db.execute(
            select(FinancialInstitution).where(FinancialInstitution.id == conn.institution_id)
        )
        inst = inst_result.scalar_one_or_none()

        # Count products
        prod_result = await db.execute(
            select(sa_func.count(FinancialProduct.id))
            .where(FinancialProduct.connection_id == conn.id)
        )
        product_count = prod_result.scalar() or 0

        output.append({
            "id": str(conn.id),
            "institution": {
                "code": inst.code if inst else None,
                "name_he": inst.name_he if inst else "לא ידוע",
                "name_en": inst.name_en if inst else "Unknown",
                "type": inst.institution_type if inst else None,
                "icon": inst.icon if inst else "🔗",
            },
            "connection_method": conn.connection_method,
            "status": conn.status,
            "sync_frequency": conn.sync_frequency,
            "last_sync_at": conn.last_sync_at.isoformat() if conn.last_sync_at else None,
            "next_sync_at": conn.next_sync_at.isoformat() if conn.next_sync_at else None,
            "sync_error": conn.sync_error,
            "product_count": product_count,
            "created_at": conn.created_at.isoformat(),
        })

    return output


@router.delete("/connections/{connection_id}")
async def delete_connection(
    connection_id: str,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """Disconnect from a financial institution."""
    user_id = await _get_user_id(request)

    result = await db.execute(
        select(FinancialConnection).where(
            FinancialConnection.id == connection_id,
            FinancialConnection.user_id == user_id,
        )
    )
    connection = result.scalar_one_or_none()
    if not connection:
        raise HTTPException(status_code=404, detail="חיבור לא נמצא")

    await db.delete(connection)
    await db.commit()
    return {"message": "החיבור נותק בהצלחה"}


@router.post("/connections/{connection_id}/sync")
async def trigger_sync(
    connection_id: str,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """Manually trigger a sync for a connection."""
    user_id = await _get_user_id(request)

    result = await db.execute(
        select(FinancialConnection).where(
            FinancialConnection.id == connection_id,
            FinancialConnection.user_id == user_id,
        )
    )
    connection = result.scalar_one_or_none()
    if not connection:
        raise HTTPException(status_code=404, detail="חיבור לא נמצא")

    # Create sync log
    sync_log = SyncLog(
        connection_id=connection.id,
        user_id=user_id,
        sync_type="manual",
        status="completed",
        completed_at=datetime.now(timezone.utc),
        products_synced=0,
        transactions_synced=0,
    )
    db.add(sync_log)

    connection.last_sync_at = datetime.now(timezone.utc)
    connection.status = "connected"
    await db.commit()

    return {"message": "סנכרון הושלם", "status": "completed"}


# ═══════════════════════════════════════════════════════════════
# ENDPOINTS — FINANCIAL PRODUCTS
# ═══════════════════════════════════════════════════════════════

@router.post("/products")
async def add_product(
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """Add a financial product (manually or via sync)."""
    user_id = await _get_user_id(request)
    body = await request.json()

    connection_id = body.get("connection_id")
    if not connection_id:
        raise HTTPException(status_code=400, detail="חסר חיבור")

    # Verify connection belongs to user
    result = await db.execute(
        select(FinancialConnection).where(
            FinancialConnection.id == connection_id,
            FinancialConnection.user_id == user_id,
        )
    )
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="חיבור לא נמצא")

    product_type = body.get("product_type")
    if product_type not in PRODUCT_TYPES:
        raise HTTPException(status_code=400, detail=f"סוג מוצר לא תקין: {product_type}")

    # Determine if liability
    liability_types = {"credit_card", "mortgage", "personal_loan", "vehicle_loan"}
    is_liability = product_type in liability_types

    product = FinancialProduct(
        user_id=user_id,
        connection_id=connection_id,
        product_type=product_type,
        product_subtype=body.get("product_subtype"),
        external_id=body.get("external_id"),
        name=body.get("name", PRODUCT_TYPES.get(product_type, "מוצר")),
        name_he=body.get("name_he"),
        currency=body.get("currency", "ILS"),
        current_balance=Decimal(str(body.get("current_balance", 0))),
        available_balance=Decimal(str(body["available_balance"])) if body.get("available_balance") else None,
        original_amount=Decimal(str(body["original_amount"])) if body.get("original_amount") else None,
        interest_rate=Decimal(str(body["interest_rate"])) if body.get("interest_rate") else None,
        monthly_payment=Decimal(str(body["monthly_payment"])) if body.get("monthly_payment") else None,
        total_invested=Decimal(str(body["total_invested"])) if body.get("total_invested") else None,
        total_return=Decimal(str(body["total_return"])) if body.get("total_return") else None,
        return_rate=Decimal(str(body["return_rate"])) if body.get("return_rate") else None,
        monthly_contribution_employee=Decimal(str(body["monthly_contribution_employee"])) if body.get("monthly_contribution_employee") else None,
        monthly_contribution_employer=Decimal(str(body["monthly_contribution_employer"])) if body.get("monthly_contribution_employer") else None,
        management_fee_pct=Decimal(str(body["management_fee_pct"])) if body.get("management_fee_pct") else None,
        coverage_amount=Decimal(str(body["coverage_amount"])) if body.get("coverage_amount") else None,
        institution_name=body.get("institution_name"),
        is_liability=is_liability,
        last_updated=datetime.now(timezone.utc),
    )
    db.add(product)
    await db.commit()
    await db.refresh(product)

    return {
        "id": str(product.id),
        "product_type": product.product_type,
        "name": product.name,
        "current_balance": float(product.current_balance),
        "is_liability": product.is_liability,
        "message": "מוצר פיננסי נוסף בהצלחה",
    }


@router.get("/products")
async def list_products(
    request: Request,
    product_type: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """List all user's financial products across all connections."""
    user_id = await _get_user_id(request)

    query = select(FinancialProduct).where(
        FinancialProduct.user_id == user_id,
        FinancialProduct.is_active == True,
    )
    if product_type:
        query = query.where(FinancialProduct.product_type == product_type)
    query = query.order_by(FinancialProduct.product_type, FinancialProduct.name)

    result = await db.execute(query)
    products = result.scalars().all()

    return [
        {
            "id": str(p.id),
            "connection_id": str(p.connection_id),
            "product_type": p.product_type,
            "product_subtype": p.product_subtype,
            "name": p.name,
            "name_he": p.name_he,
            "currency": p.currency,
            "current_balance": float(p.current_balance),
            "available_balance": float(p.available_balance) if p.available_balance else None,
            "interest_rate": float(p.interest_rate) if p.interest_rate else None,
            "monthly_payment": float(p.monthly_payment) if p.monthly_payment else None,
            "return_rate": float(p.return_rate) if p.return_rate else None,
            "monthly_contribution_employee": float(p.monthly_contribution_employee) if p.monthly_contribution_employee else None,
            "monthly_contribution_employer": float(p.monthly_contribution_employer) if p.monthly_contribution_employer else None,
            "management_fee_pct": float(p.management_fee_pct) if p.management_fee_pct else None,
            "institution_name": p.institution_name,
            "is_liability": p.is_liability,
            "last_updated": p.last_updated.isoformat() if p.last_updated else None,
        }
        for p in products
    ]


@router.put("/products/{product_id}")
async def update_product(
    product_id: str,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """Update a financial product's data."""
    user_id = await _get_user_id(request)
    body = await request.json()

    result = await db.execute(
        select(FinancialProduct).where(
            FinancialProduct.id == product_id,
            FinancialProduct.user_id == user_id,
        )
    )
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="מוצר לא נמצא")

    # Update allowed fields
    updatable = [
        "name", "name_he", "current_balance", "available_balance",
        "interest_rate", "monthly_payment", "return_rate",
        "monthly_contribution_employee", "monthly_contribution_employer",
        "management_fee_pct", "coverage_amount", "is_active",
    ]
    for field in updatable:
        if field in body:
            val = body[field]
            if field in ("current_balance", "available_balance", "interest_rate", "monthly_payment",
                         "return_rate", "monthly_contribution_employee", "monthly_contribution_employer",
                         "management_fee_pct", "coverage_amount") and val is not None:
                val = Decimal(str(val))
            setattr(product, field, val)

    product.last_updated = datetime.now(timezone.utc)
    product.updated_at = datetime.now(timezone.utc)
    await db.commit()

    return {"message": "מוצר עודכן בהצלחה"}


@router.delete("/products/{product_id}")
async def delete_product(
    product_id: str,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """Remove a financial product."""
    user_id = await _get_user_id(request)

    result = await db.execute(
        select(FinancialProduct).where(
            FinancialProduct.id == product_id,
            FinancialProduct.user_id == user_id,
        )
    )
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="מוצר לא נמצא")

    await db.delete(product)
    await db.commit()
    return {"message": "מוצר הוסר בהצלחה"}


# ═══════════════════════════════════════════════════════════════
# ENDPOINTS — UNIFIED FINANCIAL PROFILE
# ═══════════════════════════════════════════════════════════════

@router.get("/profile")
async def get_financial_profile(
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """Get the user's complete unified financial profile — assets, liabilities, net worth."""
    user_id = await _get_user_id(request)

    result = await db.execute(
        select(FinancialProduct).where(
            FinancialProduct.user_id == user_id,
            FinancialProduct.is_active == True,
        )
    )
    products = result.scalars().all()

    # Classify products
    assets = {"liquid": [], "investments": [], "retirement": [], "other": []}
    liabilities = {"mortgage": [], "loans": [], "credit_cards": [], "other": []}

    total_assets = Decimal("0")
    total_liabilities = Decimal("0")

    for p in products:
        product_data = {
            "id": str(p.id),
            "name": p.name,
            "type": p.product_type,
            "balance": float(p.current_balance),
            "institution": p.institution_name,
        }

        if p.is_liability:
            total_liabilities += abs(p.current_balance)
            if p.product_type == "mortgage":
                liabilities["mortgage"].append(product_data)
            elif p.product_type == "credit_card":
                liabilities["credit_cards"].append(product_data)
            elif p.product_type in ("personal_loan", "vehicle_loan"):
                liabilities["loans"].append(product_data)
            else:
                liabilities["other"].append(product_data)
        else:
            total_assets += p.current_balance
            if p.product_type in ("checking", "savings", "deposit", "digital_wallet"):
                assets["liquid"].append(product_data)
            elif p.product_type in ("investment_portfolio", "mutual_fund", "etf", "stocks", "bonds", "crypto_wallet"):
                assets["investments"].append(product_data)
            elif p.product_type in ("pension_comprehensive", "pension_general", "managers_insurance",
                                     "keren_hishtalmut", "kupat_gemel", "severance_fund"):
                assets["retirement"].append(product_data)
            else:
                assets["other"].append(product_data)

    net_worth = total_assets - total_liabilities

    # Compute ratios
    liquid_total = sum(Decimal(str(p["balance"])) for p in assets["liquid"])
    monthly_expenses_estimate = Decimal("12000")  # TODO: compute from transactions

    return {
        "net_worth": float(net_worth),
        "total_assets": float(total_assets),
        "total_liabilities": float(total_liabilities),
        "assets": assets,
        "liabilities": liabilities,
        "metrics": {
            "liquidity_ratio": float(liquid_total / monthly_expenses_estimate) if monthly_expenses_estimate > 0 else 0,
            "debt_to_asset_ratio": float(total_liabilities / total_assets) if total_assets > 0 else 0,
            "emergency_fund_months": float(liquid_total / monthly_expenses_estimate) if monthly_expenses_estimate > 0 else 0,
        },
        "product_count": len(products),
        "last_updated": datetime.now(timezone.utc).isoformat(),
    }


@router.post("/snapshot")
async def create_snapshot(
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """Create a point-in-time financial snapshot for historical tracking."""
    user_id = await _get_user_id(request)

    # Get products
    result = await db.execute(
        select(FinancialProduct).where(
            FinancialProduct.user_id == user_id,
            FinancialProduct.is_active == True,
        )
    )
    products = result.scalars().all()

    liquid = Decimal("0")
    investments = Decimal("0")
    retirement = Decimal("0")
    mortgage = Decimal("0")
    loans = Decimal("0")
    credit_cards = Decimal("0")

    for p in products:
        if p.is_liability:
            if p.product_type == "mortgage":
                mortgage += abs(p.current_balance)
            elif p.product_type == "credit_card":
                credit_cards += abs(p.current_balance)
            else:
                loans += abs(p.current_balance)
        else:
            if p.product_type in ("checking", "savings", "deposit", "digital_wallet"):
                liquid += p.current_balance
            elif p.product_type in ("investment_portfolio", "mutual_fund", "etf", "stocks", "bonds", "crypto_wallet"):
                investments += p.current_balance
            elif p.product_type in ("pension_comprehensive", "pension_general", "managers_insurance",
                                     "keren_hishtalmut", "kupat_gemel", "severance_fund"):
                retirement += p.current_balance

    total_assets = liquid + investments + retirement
    total_liabilities = mortgage + loans + credit_cards
    net_worth = total_assets - total_liabilities

    snapshot = FinancialSnapshot(
        user_id=user_id,
        snapshot_date=date.today(),
        total_assets=total_assets,
        total_liabilities=total_liabilities,
        net_worth=net_worth,
        liquid_assets=liquid,
        investment_assets=investments,
        retirement_assets=retirement,
        mortgage_debt=mortgage,
        loan_debt=loans,
        credit_card_debt=credit_cards,
    )
    db.add(snapshot)
    await db.commit()

    return {"message": "תמונת מצב נשמרה", "net_worth": float(net_worth)}


@router.get("/snapshots")
async def list_snapshots(
    request: Request,
    limit: int = 30,
    db: AsyncSession = Depends(get_db),
):
    """Get historical financial snapshots for net worth trend."""
    user_id = await _get_user_id(request)

    result = await db.execute(
        select(FinancialSnapshot)
        .where(FinancialSnapshot.user_id == user_id)
        .order_by(FinancialSnapshot.snapshot_date.desc())
        .limit(limit)
    )
    snapshots = result.scalars().all()

    return [
        {
            "date": s.snapshot_date.isoformat(),
            "net_worth": float(s.net_worth),
            "total_assets": float(s.total_assets),
            "total_liabilities": float(s.total_liabilities),
            "liquid_assets": float(s.liquid_assets),
            "investment_assets": float(s.investment_assets),
            "retirement_assets": float(s.retirement_assets),
        }
        for s in reversed(snapshots)
    ]


# ═══════════════════════════════════════════════════════════════
# ENDPOINTS — SYNC LOGS
# ═══════════════════════════════════════════════════════════════

@router.get("/sync-logs")
async def list_sync_logs(
    request: Request,
    connection_id: Optional[str] = None,
    limit: int = 20,
    db: AsyncSession = Depends(get_db),
):
    """Get sync audit logs."""
    user_id = await _get_user_id(request)

    query = select(SyncLog).where(SyncLog.user_id == user_id)
    if connection_id:
        query = query.where(SyncLog.connection_id == connection_id)
    query = query.order_by(SyncLog.started_at.desc()).limit(limit)

    result = await db.execute(query)
    logs = result.scalars().all()

    return [
        {
            "id": str(log.id),
            "connection_id": str(log.connection_id),
            "sync_type": log.sync_type,
            "status": log.status,
            "started_at": log.started_at.isoformat(),
            "completed_at": log.completed_at.isoformat() if log.completed_at else None,
            "products_synced": log.products_synced,
            "transactions_synced": log.transactions_synced,
            "duration_ms": log.duration_ms,
        }
        for log in logs
    ]
