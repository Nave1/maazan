"""Add document uploads table for file-based financial ingestion

Revision ID: 005
Revises: 004
Create Date: 2026-06-29
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, JSONB


revision: str = "005"
down_revision: Union[str, None] = "004"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "document_uploads",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("user_id", UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("connection_id", UUID(as_uuid=True), sa.ForeignKey("financial_connections.id", ondelete="SET NULL"), nullable=True),

        # File info
        sa.Column("file_name", sa.String(500), nullable=False),
        sa.Column("file_type", sa.String(20), nullable=False),
        sa.Column("file_size", sa.Integer(), nullable=True),
        sa.Column("mime_type", sa.String(100), nullable=True),
        sa.Column("storage_path", sa.String(1000), nullable=True),

        # Source detection
        sa.Column("detected_institution", sa.String(30), nullable=True),
        sa.Column("detected_product_type", sa.String(30), nullable=True),
        sa.Column("document_period_start", sa.DateTime(timezone=True), nullable=True),
        sa.Column("document_period_end", sa.DateTime(timezone=True), nullable=True),

        # AI extraction
        sa.Column("extraction_status", sa.String(20), server_default="pending"),
        sa.Column("extraction_engine", sa.String(30), server_default="rules"),
        sa.Column("extraction_confidence", sa.Integer(), nullable=True),

        # Content
        sa.Column("raw_text", sa.Text(), nullable=True),
        sa.Column("raw_rows", JSONB, server_default="[]"),
        sa.Column("extracted_data", JSONB, server_default="{}"),

        # Results
        sa.Column("transactions_extracted", sa.Integer(), server_default="0"),
        sa.Column("products_extracted", sa.Integer(), server_default="0"),
        sa.Column("extraction_errors", JSONB, server_default="[]"),
        sa.Column("ai_insights", JSONB, server_default="[]"),

        # Audit
        sa.Column("uploaded_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("processed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("reviewed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("is_deleted", sa.Boolean(), server_default="false"),
    )

    op.create_index("ix_document_uploads_status", "document_uploads", ["user_id", "extraction_status"])


def downgrade() -> None:
    op.drop_table("document_uploads")
