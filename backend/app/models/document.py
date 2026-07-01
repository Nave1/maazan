"""
Document Ingestion Models — Upload tracking and AI extraction state.

Supports: CSV, Excel, PDF, Email statement parsing, Manual entry.
Every financial data point flows through document upload → AI extraction → normalized product/transaction.
"""
from sqlalchemy import Column, String, Integer, Text, DateTime, ForeignKey, func, Boolean
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from app.core.database import Base
import uuid


class DocumentUpload(Base):
    """Tracks every uploaded financial document and its AI extraction state."""
    __tablename__ = "document_uploads"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    connection_id = Column(UUID(as_uuid=True), ForeignKey("financial_connections.id", ondelete="SET NULL"), nullable=True)

    # File info
    file_name = Column(String(500), nullable=False)
    file_type = Column(String(20), nullable=False)  # csv, excel, pdf, email, manual_entry
    file_size = Column(Integer, nullable=True)  # bytes
    mime_type = Column(String(100), nullable=True)
    storage_path = Column(String(1000), nullable=True)  # local path or object store key

    # Source detection
    detected_institution = Column(String(30), nullable=True)  # auto-detected institution code
    detected_product_type = Column(String(30), nullable=True)  # auto-detected product type
    document_period_start = Column(DateTime(timezone=True), nullable=True)
    document_period_end = Column(DateTime(timezone=True), nullable=True)

    # AI extraction state
    extraction_status = Column(String(20), server_default="pending")  # pending, processing, completed, failed, review
    extraction_engine = Column(String(30), server_default="rules")  # rules, ai, hybrid
    extraction_confidence = Column(Integer, nullable=True)  # 0-100

    # Extracted raw content (before normalization)
    raw_text = Column(Text, nullable=True)  # OCR/parsed text from PDF
    raw_rows = Column(JSONB, server_default="[]")  # parsed rows from CSV/Excel
    extracted_data = Column(JSONB, server_default="{}")  # structured AI extraction output

    # Results
    transactions_extracted = Column(Integer, server_default="0")
    products_extracted = Column(Integer, server_default="0")
    extraction_errors = Column(JSONB, server_default="[]")
    ai_insights = Column(JSONB, server_default="[]")  # AI-generated insights from this document

    # Audit
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
    processed_at = Column(DateTime(timezone=True), nullable=True)
    reviewed_at = Column(DateTime(timezone=True), nullable=True)
    is_deleted = Column(Boolean, server_default="false")


# Supported file types and their processing pipelines
SUPPORTED_FILE_TYPES = {
    "csv": {
        "extensions": [".csv", ".tsv"],
        "mime_types": ["text/csv", "text/tab-separated-values"],
        "max_size_mb": 50,
        "pipeline": "tabular",
    },
    "excel": {
        "extensions": [".xlsx", ".xls"],
        "mime_types": [
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/vnd.ms-excel",
        ],
        "max_size_mb": 50,
        "pipeline": "tabular",
    },
    "pdf": {
        "extensions": [".pdf"],
        "mime_types": ["application/pdf"],
        "max_size_mb": 25,
        "pipeline": "document_ai",
    },
    "email": {
        "extensions": [".eml", ".msg"],
        "mime_types": ["message/rfc822", "application/vnd.ms-outlook"],
        "max_size_mb": 15,
        "pipeline": "email_parse",
    },
}
