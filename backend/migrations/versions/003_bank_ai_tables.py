"""Add bank connections, import batches, AI conversations tables

Revision ID: 003
Revises: 002
Create Date: 2026-06-28
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, JSONB


revision: str = "003"
down_revision: Union[str, None] = "002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Bank connections
    op.create_table(
        "bank_connections",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("user_id", UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("bank_name", sa.String(100), nullable=False),
        sa.Column("bank_code", sa.String(20), nullable=False),
        sa.Column("account_id", UUID(as_uuid=True), sa.ForeignKey("accounts.id", ondelete="SET NULL"), nullable=True),
        sa.Column("status", sa.String(20), server_default="pending"),
        sa.Column("last_sync_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("sync_error", sa.Text(), nullable=True),
        sa.Column("metadata", JSONB, server_default="{}"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("idx_bank_connections_user", "bank_connections", ["user_id"])

    # Import batches
    op.create_table(
        "import_batches",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("user_id", UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("account_id", UUID(as_uuid=True), sa.ForeignKey("accounts.id", ondelete="SET NULL"), nullable=True),
        sa.Column("source", sa.String(30), nullable=False),
        sa.Column("file_name", sa.String(200), nullable=True),
        sa.Column("total_rows", sa.Integer(), server_default="0"),
        sa.Column("imported_rows", sa.Integer(), server_default="0"),
        sa.Column("failed_rows", sa.Integer(), server_default="0"),
        sa.Column("status", sa.String(20), server_default="processing"),
        sa.Column("error_details", JSONB, server_default="{}"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
    )

    # Add import_batch_id to transactions
    op.add_column("transactions", sa.Column("import_batch_id", UUID(as_uuid=True), sa.ForeignKey("import_batches.id"), nullable=True))

    # AI conversations
    op.create_table(
        "ai_conversations",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("user_id", UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("title", sa.String(200), nullable=True),
        sa.Column("context", JSONB, server_default="{}"),
        sa.Column("started_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("last_message_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("is_archived", sa.Boolean(), server_default="false"),
    )
    op.create_index("idx_ai_conversations_user", "ai_conversations", ["user_id"])

    # AI messages
    op.create_table(
        "ai_messages",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("conversation_id", UUID(as_uuid=True), sa.ForeignKey("ai_conversations.id", ondelete="CASCADE"), nullable=False),
        sa.Column("role", sa.String(10), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("tokens_used", sa.Integer(), nullable=True),
        sa.Column("model_used", sa.String(50), nullable=True),
        sa.Column("metadata", JSONB, server_default="{}"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("idx_ai_messages_conversation", "ai_messages", ["conversation_id"])

    # AI memory
    op.create_table(
        "ai_memory",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("user_id", UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("category", sa.String(50), nullable=False),
        sa.Column("key", sa.String(200), nullable=False),
        sa.Column("value", sa.Text(), nullable=False),
        sa.Column("importance", sa.Integer(), server_default="5"),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.UniqueConstraint("user_id", "category", "key", name="uq_ai_memory_user_cat_key"),
    )
    op.create_index("idx_ai_memory_user", "ai_memory", ["user_id"])


def downgrade() -> None:
    op.drop_index("idx_ai_memory_user")
    op.drop_table("ai_memory")
    op.drop_index("idx_ai_messages_conversation")
    op.drop_table("ai_messages")
    op.drop_index("idx_ai_conversations_user")
    op.drop_table("ai_conversations")
    op.drop_column("transactions", "import_batch_id")
    op.drop_table("import_batches")
    op.drop_index("idx_bank_connections_user")
    op.drop_table("bank_connections")
