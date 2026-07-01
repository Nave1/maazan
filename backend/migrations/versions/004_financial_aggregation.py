"""Add financial aggregation engine tables

Revision ID: 004
Revises: 003
Create Date: 2026-06-29
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, JSONB


revision: str = "004"
down_revision: Union[str, None] = "003"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Financial institutions registry
    op.create_table(
        "financial_institutions",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("code", sa.String(30), unique=True, nullable=False, index=True),
        sa.Column("name_he", sa.String(100), nullable=False),
        sa.Column("name_en", sa.String(100), nullable=False),
        sa.Column("institution_type", sa.String(30), nullable=False),
        sa.Column("icon", sa.String(10), nullable=True),
        sa.Column("logo_url", sa.String(500), nullable=True),
        sa.Column("connection_methods", JSONB, server_default="[]"),
        sa.Column("is_active", sa.Boolean(), server_default="true"),
        sa.Column("metadata", JSONB, server_default="{}"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # Financial connections (replaces/extends bank_connections)
    op.create_table(
        "financial_connections",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("user_id", UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("institution_id", UUID(as_uuid=True), sa.ForeignKey("financial_institutions.id"), nullable=False),
        sa.Column("connection_method", sa.String(30), nullable=False),
        sa.Column("status", sa.String(20), server_default="pending"),
        sa.Column("credentials_vault_ref", sa.String(200), nullable=True),
        sa.Column("oauth_token_ref", sa.String(200), nullable=True),
        sa.Column("consent_granted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("consent_expires_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("last_sync_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("next_sync_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("sync_frequency", sa.String(20), server_default="daily"),
        sa.Column("sync_error", sa.Text(), nullable=True),
        sa.Column("sync_error_count", sa.Integer(), server_default="0"),
        sa.Column("metadata", JSONB, server_default="{}"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # Financial products (accounts, cards, pensions, investments, loans, etc.)
    op.create_table(
        "financial_products",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("user_id", UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("connection_id", UUID(as_uuid=True), sa.ForeignKey("financial_connections.id", ondelete="CASCADE"), nullable=False),
        sa.Column("account_id", UUID(as_uuid=True), sa.ForeignKey("accounts.id", ondelete="SET NULL"), nullable=True),
        sa.Column("product_type", sa.String(30), nullable=False),
        sa.Column("product_subtype", sa.String(50), nullable=True),
        sa.Column("external_id", sa.String(200), nullable=True),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("name_he", sa.String(200), nullable=True),
        sa.Column("currency", sa.String(3), server_default="ILS"),
        sa.Column("current_balance", sa.Numeric(16, 2), server_default="0"),
        sa.Column("available_balance", sa.Numeric(16, 2), nullable=True),
        sa.Column("original_amount", sa.Numeric(16, 2), nullable=True),
        sa.Column("interest_rate", sa.Numeric(6, 4), nullable=True),
        sa.Column("monthly_payment", sa.Numeric(12, 2), nullable=True),
        sa.Column("maturity_date", sa.Date(), nullable=True),
        sa.Column("total_invested", sa.Numeric(16, 2), nullable=True),
        sa.Column("total_return", sa.Numeric(16, 2), nullable=True),
        sa.Column("return_rate", sa.Numeric(8, 4), nullable=True),
        sa.Column("monthly_contribution_employee", sa.Numeric(12, 2), nullable=True),
        sa.Column("monthly_contribution_employer", sa.Numeric(12, 2), nullable=True),
        sa.Column("management_fee_pct", sa.Numeric(6, 4), nullable=True),
        sa.Column("coverage_amount", sa.Numeric(16, 2), nullable=True),
        sa.Column("institution_name", sa.String(100), nullable=True),
        sa.Column("last_updated", sa.DateTime(timezone=True), nullable=True),
        sa.Column("is_active", sa.Boolean(), server_default="true"),
        sa.Column("is_liability", sa.Boolean(), server_default="false"),
        sa.Column("raw_data", JSONB, server_default="{}"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # Sync audit log
    op.create_table(
        "sync_logs",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("connection_id", UUID(as_uuid=True), sa.ForeignKey("financial_connections.id", ondelete="CASCADE"), nullable=False),
        sa.Column("user_id", UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("sync_type", sa.String(20), nullable=False),
        sa.Column("status", sa.String(20), nullable=False),
        sa.Column("started_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("products_synced", sa.Integer(), server_default="0"),
        sa.Column("transactions_synced", sa.Integer(), server_default="0"),
        sa.Column("errors", JSONB, server_default="[]"),
        sa.Column("duration_ms", sa.Integer(), nullable=True),
    )

    # Financial snapshots (daily net worth tracking)
    op.create_table(
        "financial_snapshots",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("user_id", UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("snapshot_date", sa.Date(), nullable=False),
        sa.Column("total_assets", sa.Numeric(16, 2), server_default="0"),
        sa.Column("total_liabilities", sa.Numeric(16, 2), server_default="0"),
        sa.Column("net_worth", sa.Numeric(16, 2), server_default="0"),
        sa.Column("liquid_assets", sa.Numeric(16, 2), server_default="0"),
        sa.Column("investment_assets", sa.Numeric(16, 2), server_default="0"),
        sa.Column("retirement_assets", sa.Numeric(16, 2), server_default="0"),
        sa.Column("real_estate_equity", sa.Numeric(16, 2), server_default="0"),
        sa.Column("other_assets", sa.Numeric(16, 2), server_default="0"),
        sa.Column("mortgage_debt", sa.Numeric(16, 2), server_default="0"),
        sa.Column("loan_debt", sa.Numeric(16, 2), server_default="0"),
        sa.Column("credit_card_debt", sa.Numeric(16, 2), server_default="0"),
        sa.Column("other_debt", sa.Numeric(16, 2), server_default="0"),
        sa.Column("liquidity_ratio", sa.Numeric(8, 4), nullable=True),
        sa.Column("debt_to_income_ratio", sa.Numeric(8, 4), nullable=True),
        sa.Column("savings_rate", sa.Numeric(8, 4), nullable=True),
        sa.Column("emergency_fund_months", sa.Numeric(6, 2), nullable=True),
        sa.Column("products_breakdown", JSONB, server_default="{}"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # Indexes for performance
    op.create_index("ix_financial_products_type", "financial_products", ["product_type"])
    op.create_index("ix_financial_snapshots_date", "financial_snapshots", ["user_id", "snapshot_date"])
    op.create_index("ix_sync_logs_connection", "sync_logs", ["connection_id", "started_at"])


def downgrade() -> None:
    op.drop_table("financial_snapshots")
    op.drop_table("sync_logs")
    op.drop_table("financial_products")
    op.drop_table("financial_connections")
    op.drop_table("financial_institutions")
