"""Add accounts, categories, transactions tables

Revision ID: 002
Revises: 001
Create Date: 2026-06-28
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID


revision: str = "002"
down_revision: Union[str, None] = "001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Accounts
    op.create_table(
        "accounts",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("user_id", UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("type", sa.String(30), nullable=False),
        sa.Column("institution", sa.String(100), nullable=True),
        sa.Column("currency", sa.String(3), server_default="ILS"),
        sa.Column("current_balance", sa.Numeric(14, 2), server_default="0"),
        sa.Column("is_active", sa.Boolean(), server_default="true"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("idx_accounts_user", "accounts", ["user_id"])

    # Categories
    op.create_table(
        "categories",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("name_he", sa.String(100), nullable=False),
        sa.Column("name_en", sa.String(100), nullable=False),
        sa.Column("icon", sa.String(50), nullable=True),
        sa.Column("type", sa.String(10), nullable=False),
        sa.Column("is_system", sa.Boolean(), server_default="true"),
        sa.Column("sort_order", sa.Integer(), server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # Seed default categories
    op.execute("""
        INSERT INTO categories (id, name_he, name_en, icon, type, is_system, sort_order) VALUES
        (gen_random_uuid(), 'משכורת', 'Salary', '💰', 'income', true, 1),
        (gen_random_uuid(), 'פרילנס', 'Freelance', '💻', 'income', true, 2),
        (gen_random_uuid(), 'השקעות', 'Investments', '📈', 'income', true, 3),
        (gen_random_uuid(), 'מתנות', 'Gifts', '🎁', 'income', true, 4),
        (gen_random_uuid(), 'אחר - הכנסה', 'Other Income', '📥', 'income', true, 5),
        (gen_random_uuid(), 'סופר', 'Groceries', '🛒', 'expense', true, 10),
        (gen_random_uuid(), 'מסעדות', 'Restaurants', '🍽️', 'expense', true, 11),
        (gen_random_uuid(), 'דלק', 'Fuel', '⛽', 'expense', true, 12),
        (gen_random_uuid(), 'תחבורה', 'Transportation', '🚌', 'expense', true, 13),
        (gen_random_uuid(), 'חשבונות', 'Bills', '📄', 'expense', true, 14),
        (gen_random_uuid(), 'שכירות', 'Rent', '🏠', 'expense', true, 15),
        (gen_random_uuid(), 'משכנתא', 'Mortgage', '🏦', 'expense', true, 16),
        (gen_random_uuid(), 'ביטוח', 'Insurance', '🛡️', 'expense', true, 17),
        (gen_random_uuid(), 'בריאות', 'Health', '🏥', 'expense', true, 18),
        (gen_random_uuid(), 'חינוך', 'Education', '📚', 'expense', true, 19),
        (gen_random_uuid(), 'בילויים', 'Entertainment', '🎬', 'expense', true, 20),
        (gen_random_uuid(), 'ביגוד', 'Clothing', '👕', 'expense', true, 21),
        (gen_random_uuid(), 'מתנות', 'Gifts', '🎁', 'expense', true, 22),
        (gen_random_uuid(), 'חיסכון', 'Savings', '🏦', 'expense', true, 23),
        (gen_random_uuid(), 'אחר - הוצאה', 'Other Expense', '📤', 'expense', true, 24),
        (gen_random_uuid(), 'העברה', 'Transfer', '🔄', 'transfer', true, 30)
    """)

    # Transactions
    op.create_table(
        "transactions",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("user_id", UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("account_id", UUID(as_uuid=True), sa.ForeignKey("accounts.id", ondelete="CASCADE"), nullable=False),
        sa.Column("category_id", UUID(as_uuid=True), sa.ForeignKey("categories.id"), nullable=True),
        sa.Column("type", sa.String(10), nullable=False),
        sa.Column("amount", sa.Numeric(12, 2), nullable=False),
        sa.Column("currency", sa.String(3), server_default="ILS"),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("description", sa.String(500), nullable=True),
        sa.Column("merchant_name", sa.String(200), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("is_recurring", sa.Boolean(), server_default="false"),
        sa.Column("source", sa.String(20), server_default="manual"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("idx_transactions_user_date", "transactions", ["user_id", sa.text("date DESC")])
    op.create_index("idx_transactions_account", "transactions", ["account_id"])


def downgrade() -> None:
    op.drop_index("idx_transactions_account")
    op.drop_index("idx_transactions_user_date")
    op.drop_table("transactions")
    op.drop_table("categories")
    op.drop_index("idx_accounts_user")
    op.drop_table("accounts")
