"""
Financial Aggregation Engine — Models

Comprehensive models for Israeli financial institution connections,
multi-product aggregation, and unified financial profiles.
"""
from sqlalchemy import Column, String, Integer, Numeric, Boolean, Date, Text, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from app.core.database import Base
import uuid


class FinancialInstitution(Base):
    """Registry of supported Israeli financial institutions."""
    __tablename__ = "financial_institutions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    code = Column(String(30), unique=True, nullable=False, index=True)
    name_he = Column(String(100), nullable=False)
    name_en = Column(String(100), nullable=False)
    institution_type = Column(String(30), nullable=False)  # bank, credit_card, pension, insurance, brokerage, digital_payment, crypto
    icon = Column(String(10), nullable=True)
    logo_url = Column(String(500), nullable=True)
    connection_methods = Column(JSONB, server_default="[]")  # ["csv", "excel", "pdf", "email_parse", "manual"]
    is_active = Column(Boolean, server_default="true")
    metadata_ = Column("metadata", JSONB, server_default="{}")
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class FinancialConnection(Base):
    """A user's connection to a financial institution."""
    __tablename__ = "financial_connections"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    institution_id = Column(UUID(as_uuid=True), ForeignKey("financial_institutions.id"), nullable=False)
    connection_method = Column(String(30), nullable=False)  # csv, excel, pdf, email_parse, manual
    status = Column(String(20), server_default="pending")  # pending, connected, syncing, error, disconnected
    credentials_vault_ref = Column(String(200), nullable=True)  # Reserved for future use
    oauth_token_ref = Column(String(200), nullable=True)  # Reserved for future use
    consent_granted_at = Column(DateTime(timezone=True), nullable=True)
    consent_expires_at = Column(DateTime(timezone=True), nullable=True)
    last_sync_at = Column(DateTime(timezone=True), nullable=True)
    next_sync_at = Column(DateTime(timezone=True), nullable=True)
    sync_frequency = Column(String(20), server_default="manual")  # manual, daily, weekly (future)
    sync_error = Column(Text, nullable=True)
    sync_error_count = Column(Integer, server_default="0")
    metadata_ = Column("metadata", JSONB, server_default="{}")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now())

    institution = relationship("FinancialInstitution")
    products = relationship("FinancialProduct", back_populates="connection", cascade="all, delete-orphan")
    sync_logs = relationship("SyncLog", back_populates="connection", cascade="all, delete-orphan")


class FinancialProduct(Base):
    """A specific financial product discovered via a connection (account, card, pension, etc.)."""
    __tablename__ = "financial_products"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    connection_id = Column(UUID(as_uuid=True), ForeignKey("financial_connections.id", ondelete="CASCADE"), nullable=False)
    account_id = Column(UUID(as_uuid=True), ForeignKey("accounts.id", ondelete="SET NULL"), nullable=True)  # Link to existing accounts table

    product_type = Column(String(30), nullable=False)  # See PRODUCT_TYPES below
    product_subtype = Column(String(50), nullable=True)  # e.g., "comprehensive_pension", "general_pension"
    external_id = Column(String(200), nullable=True)  # ID from the institution
    name = Column(String(200), nullable=False)
    name_he = Column(String(200), nullable=True)
    currency = Column(String(3), server_default="ILS")

    # Balances
    current_balance = Column(Numeric(16, 2), server_default="0")
    available_balance = Column(Numeric(16, 2), nullable=True)

    # For loans/debt
    original_amount = Column(Numeric(16, 2), nullable=True)
    interest_rate = Column(Numeric(6, 4), nullable=True)
    monthly_payment = Column(Numeric(12, 2), nullable=True)
    maturity_date = Column(Date, nullable=True)

    # For investments
    total_invested = Column(Numeric(16, 2), nullable=True)
    total_return = Column(Numeric(16, 2), nullable=True)
    return_rate = Column(Numeric(8, 4), nullable=True)  # Percentage

    # For pension/insurance
    monthly_contribution_employee = Column(Numeric(12, 2), nullable=True)
    monthly_contribution_employer = Column(Numeric(12, 2), nullable=True)
    management_fee_pct = Column(Numeric(6, 4), nullable=True)
    coverage_amount = Column(Numeric(16, 2), nullable=True)

    # Metadata
    institution_name = Column(String(100), nullable=True)
    last_updated = Column(DateTime(timezone=True), nullable=True)
    is_active = Column(Boolean, server_default="true")
    is_liability = Column(Boolean, server_default="false")
    raw_data = Column(JSONB, server_default="{}")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now())

    connection = relationship("FinancialConnection", back_populates="products")


class SyncLog(Base):
    """Audit log for synchronization events."""
    __tablename__ = "sync_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    connection_id = Column(UUID(as_uuid=True), ForeignKey("financial_connections.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    sync_type = Column(String(20), nullable=False)  # full, incremental, manual
    status = Column(String(20), nullable=False)  # started, completed, failed, partial
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
    products_synced = Column(Integer, server_default="0")
    transactions_synced = Column(Integer, server_default="0")
    errors = Column(JSONB, server_default="[]")
    duration_ms = Column(Integer, nullable=True)

    connection = relationship("FinancialConnection", back_populates="sync_logs")


class FinancialSnapshot(Base):
    """Point-in-time snapshot of user's complete financial picture."""
    __tablename__ = "financial_snapshots"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    snapshot_date = Column(Date, nullable=False)

    # Aggregated values
    total_assets = Column(Numeric(16, 2), server_default="0")
    total_liabilities = Column(Numeric(16, 2), server_default="0")
    net_worth = Column(Numeric(16, 2), server_default="0")

    # Breakdown
    liquid_assets = Column(Numeric(16, 2), server_default="0")  # Bank + savings
    investment_assets = Column(Numeric(16, 2), server_default="0")  # Stocks, funds, etc.
    retirement_assets = Column(Numeric(16, 2), server_default="0")  # Pension, hishtalmut
    real_estate_equity = Column(Numeric(16, 2), server_default="0")
    other_assets = Column(Numeric(16, 2), server_default="0")

    mortgage_debt = Column(Numeric(16, 2), server_default="0")
    loan_debt = Column(Numeric(16, 2), server_default="0")
    credit_card_debt = Column(Numeric(16, 2), server_default="0")
    other_debt = Column(Numeric(16, 2), server_default="0")

    # Calculated metrics
    liquidity_ratio = Column(Numeric(8, 4), nullable=True)
    debt_to_income_ratio = Column(Numeric(8, 4), nullable=True)
    savings_rate = Column(Numeric(8, 4), nullable=True)
    emergency_fund_months = Column(Numeric(6, 2), nullable=True)

    # Source details
    products_breakdown = Column(JSONB, server_default="{}")
    created_at = Column(DateTime(timezone=True), server_default=func.now())


# Product type constants
PRODUCT_TYPES = {
    # Bank accounts
    "checking": "עו\"ש",
    "savings": "חיסכון",
    "deposit": "פיקדון",
    # Credit
    "credit_card": "כרטיס אשראי",
    # Pension
    "pension_comprehensive": "פנסיה מקיפה",
    "pension_general": "פנסיה כללית",
    "managers_insurance": "ביטוח מנהלים",
    "severance_fund": "קופת פיצויים",
    # Investment
    "keren_hishtalmut": "קרן השתלמות",
    "kupat_gemel": "קופת גמל",
    "investment_portfolio": "תיק השקעות",
    "mutual_fund": "קרן נאמנות",
    "etf": "קרן סל",
    "stocks": "מניות",
    "bonds": "אגרות חוב",
    # Insurance
    "health_insurance": "ביטוח בריאות",
    "life_insurance": "ביטוח חיים",
    "disability_insurance": "ביטוח אובדן כושר",
    # Loans
    "mortgage": "משכנתא",
    "personal_loan": "הלוואה אישית",
    "vehicle_loan": "הלוואת רכב",
    # Digital
    "digital_wallet": "ארנק דיגיטלי",
    # Crypto
    "crypto_wallet": "ארנק קריפטו",
}
