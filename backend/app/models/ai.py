from sqlalchemy import Column, String, Integer, Boolean, Text, DateTime, ForeignKey, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from app.core.database import Base
import uuid


class BankConnection(Base):
    __tablename__ = "bank_connections"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    bank_name = Column(String(100), nullable=False)
    bank_code = Column(String(20), nullable=False)
    account_id = Column(UUID(as_uuid=True), ForeignKey("accounts.id", ondelete="SET NULL"), nullable=True)
    status = Column(String(20), server_default="pending")
    last_sync_at = Column(DateTime(timezone=True), nullable=True)
    sync_error = Column(Text, nullable=True)
    metadata_ = Column("metadata", JSONB, server_default="{}")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now())


class ImportBatch(Base):
    __tablename__ = "import_batches"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    account_id = Column(UUID(as_uuid=True), ForeignKey("accounts.id", ondelete="SET NULL"), nullable=True)
    source = Column(String(30), nullable=False)
    file_name = Column(String(200), nullable=True)
    total_rows = Column(Integer, server_default="0")
    imported_rows = Column(Integer, server_default="0")
    failed_rows = Column(Integer, server_default="0")
    status = Column(String(20), server_default="processing")
    error_details = Column(JSONB, server_default="{}")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)


class AIConversation(Base):
    __tablename__ = "ai_conversations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(200), nullable=True)
    context = Column(JSONB, server_default="{}")
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    last_message_at = Column(DateTime(timezone=True), nullable=True)
    is_archived = Column(Boolean, server_default="false")

    messages = relationship("AIMessage", back_populates="conversation", order_by="AIMessage.created_at")


class AIMessage(Base):
    __tablename__ = "ai_messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    conversation_id = Column(UUID(as_uuid=True), ForeignKey("ai_conversations.id", ondelete="CASCADE"), nullable=False)
    role = Column(String(10), nullable=False)
    content = Column(Text, nullable=False)
    tokens_used = Column(Integer, nullable=True)
    model_used = Column(String(50), nullable=True)
    metadata_ = Column("metadata", JSONB, server_default="{}")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    conversation = relationship("AIConversation", back_populates="messages")


class AIMemory(Base):
    __tablename__ = "ai_memory"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    category = Column(String(50), nullable=False)
    key = Column(String(200), nullable=False)
    value = Column(Text, nullable=False)
    importance = Column(Integer, server_default="5")
    expires_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        UniqueConstraint("user_id", "category", "key", name="uq_ai_memory_user_cat_key"),
    )
