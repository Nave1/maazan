"""
Financial Document Extraction Service.

Extracts structured financial data from uploaded documents (CSV, Excel, PDF, email)
using a combination of rule-based parsing and AI-powered extraction.

This is the core intelligence layer — the platform works WITHOUT any bank API.
All financial data flows through: Upload → Parse → Extract → Normalize → Insights.
"""
import csv
import io
import json
import re
from datetime import datetime, timezone, date
from decimal import Decimal, InvalidOperation
from typing import Optional
from pathlib import Path


# ─── Column Detection Maps ───────────────────────────────────────────────

DATE_COLUMNS = [
    "תאריך", "תאריך עסקה", "תאריך חיוב", "תאריך ערך", "תאריך פעולה",
    "date", "Date", "Transaction Date", "Value Date", "Post Date",
]

AMOUNT_COLUMNS = [
    "סכום", "סכום חיוב", "סכום עסקה", "סכום (ש\"ח)", "סכום בש\"ח",
    "amount", "Amount", "Transaction Amount", "Sum", "Total",
]

DEBIT_COLUMNS = ["חובה", "debit", "Debit", "חיוב"]
CREDIT_COLUMNS = ["זכות", "credit", "Credit", "זיכוי"]

DESCRIPTION_COLUMNS = [
    "תיאור", "שם בית העסק", "פרטים", "הערות", "תיאור העסקה", "פירוט",
    "description", "Description", "Details", "Merchant", "Payee", "Memo",
]

BALANCE_COLUMNS = [
    "יתרה", "יתרה לאחר", "יתרה נוכחית",
    "balance", "Balance", "Running Balance",
]

CATEGORY_COLUMNS = [
    "קטגוריה", "סוג", "ענף",
    "category", "Category", "Type",
]


# ─── Israeli Institution Detection Patterns ──────────────────────────────

INSTITUTION_PATTERNS = {
    # Banks
    "hapoalim": [r"הפועלים", r"hapoalim", r"poalim"],
    "leumi": [r"לאומי", r"leumi"],
    "discount": [r"דיסקונט", r"discount"],
    "mizrahi": [r"מזרחי", r"טפחות", r"mizrahi", r"tefahot"],
    "fibi": [r"בינלאומי", r"fibi", r"international"],
    "yahav": [r"יהב", r"yahav"],
    "onezero": [r"וואן.?זירו", r"one.?zero"],
    "mercantile": [r"מרכנתיל", r"mercantile"],
    # Credit cards
    "isracard": [r"ישראכרט", r"isracard"],
    "max": [r"מקס\b", r"\bmax\b"],
    "cal": [r"כאל", r"\bcal\b", r"visa\s*cal"],
    "amex_il": [r"אמריקן\s*אקספרס", r"amex"],
    # Pension/Insurance
    "menora": [r"מנורה", r"menora"],
    "harel": [r"הראל", r"harel"],
    "phoenix": [r"פניקס", r"phoenix"],
    "migdal": [r"מגדל", r"migdal"],
    "clal": [r"כלל", r"clal"],
    "altshuler": [r"אלטשולר", r"altshuler"],
    "meitav": [r"מיטב", r"meitav"],
    "psagot": [r"פסגות", r"psagot"],
}


# ─── Date Parsing ─────────────────────────────────────────────────────────

DATE_FORMATS = [
    "%d/%m/%Y", "%d-%m-%Y", "%d.%m.%Y", "%d/%m/%y", "%d-%m-%y",
    "%Y-%m-%d", "%Y/%m/%d", "%m/%d/%Y",
]


def parse_date(value: str) -> Optional[str]:
    """Parse a date string trying Israeli and international formats."""
    value = value.strip()
    if not value:
        return None
    for fmt in DATE_FORMATS:
        try:
            return datetime.strptime(value, fmt).date().isoformat()
        except ValueError:
            continue
    return None


# ─── Amount Parsing ───────────────────────────────────────────────────────

def parse_amount(value: str) -> Optional[float]:
    """Parse a numeric amount, handling Israeli formatting quirks."""
    if not value or not value.strip():
        return None
    cleaned = value.strip().replace(",", "").replace("₪", "").replace("$", "").replace("€", "").replace(" ", "")
    # Handle parentheses for negatives: (500.00) → -500.00
    if cleaned.startswith("(") and cleaned.endswith(")"):
        cleaned = "-" + cleaned[1:-1]
    try:
        return float(cleaned)
    except ValueError:
        return None


# ─── CSV / Tabular Extraction ─────────────────────────────────────────────

def extract_from_csv(content: bytes, file_name: str = "") -> dict:
    """
    Extract transactions and metadata from a CSV file.
    Returns structured extraction result.
    """
    # Decode with fallback chain
    text = _decode_content(content)

    # Detect delimiter
    sample = text[:2000]
    delimiter = ","
    if sample.count("\t") > sample.count(","):
        delimiter = "\t"
    elif sample.count(";") > sample.count(","):
        delimiter = ";"

    # Parse
    reader = csv.DictReader(io.StringIO(text), delimiter=delimiter)
    if not reader.fieldnames:
        return {"error": "לא זוהו כותרות בקובץ", "transactions": [], "metadata": {}}

    columns = list(reader.fieldnames)

    # Map columns
    date_col = _find_column(columns, DATE_COLUMNS)
    amount_col = _find_column(columns, AMOUNT_COLUMNS)
    debit_col = _find_column(columns, DEBIT_COLUMNS)
    credit_col = _find_column(columns, CREDIT_COLUMNS)
    desc_col = _find_column(columns, DESCRIPTION_COLUMNS)
    balance_col = _find_column(columns, BALANCE_COLUMNS)
    category_col = _find_column(columns, CATEGORY_COLUMNS)

    has_amount = amount_col is not None
    has_debit_credit = debit_col is not None or credit_col is not None

    if not has_amount and not has_debit_credit:
        return {
            "error": "לא זוהתה עמודת סכום",
            "columns_found": columns,
            "transactions": [],
            "metadata": {},
        }

    transactions = []
    errors = []
    min_date = None
    max_date = None
    total_income = 0.0
    total_expense = 0.0

    for i, row in enumerate(reader):
        try:
            # Date
            date_val = None
            if date_col:
                date_val = parse_date(row.get(date_col, ""))
            if not date_val:
                date_val = date.today().isoformat()

            # Amount
            amount = None
            if has_amount and amount_col:
                amount = parse_amount(row.get(amount_col, ""))
            elif has_debit_credit:
                debit = parse_amount(row.get(debit_col, "")) if debit_col else None
                credit = parse_amount(row.get(credit_col, "")) if credit_col else None
                if debit and debit != 0:
                    amount = -abs(debit)
                elif credit and credit != 0:
                    amount = abs(credit)

            if amount is None or amount == 0:
                continue

            # Description
            description = row.get(desc_col, "").strip() if desc_col else ""
            if not description:
                description = "ייבוא"

            # Category
            category = row.get(category_col, "").strip() if category_col else None

            # Balance
            balance = parse_amount(row.get(balance_col, "")) if balance_col else None

            tx = {
                "row": i + 2,  # 1-indexed + header
                "date": date_val,
                "amount": amount,
                "type": "income" if amount > 0 else "expense",
                "description": description,
                "category": category,
                "balance_after": balance,
            }
            transactions.append(tx)

            # Stats
            if amount > 0:
                total_income += amount
            else:
                total_expense += abs(amount)

            if date_val:
                if min_date is None or date_val < min_date:
                    min_date = date_val
                if max_date is None or date_val > max_date:
                    max_date = date_val

        except Exception as e:
            if len(errors) < 10:
                errors.append({"row": i + 2, "error": str(e)})

    # Detect institution from filename or content
    institution = _detect_institution(file_name + " " + text[:500])

    return {
        "transactions": transactions,
        "metadata": {
            "columns_detected": {
                "date": date_col,
                "amount": amount_col,
                "debit": debit_col,
                "credit": credit_col,
                "description": desc_col,
                "balance": balance_col,
                "category": category_col,
            },
            "total_rows_parsed": len(transactions),
            "period_start": min_date,
            "period_end": max_date,
            "total_income": round(total_income, 2),
            "total_expense": round(total_expense, 2),
            "net_flow": round(total_income - total_expense, 2),
            "detected_institution": institution,
            "delimiter": delimiter,
        },
        "errors": errors,
        "insights": _generate_basic_insights(transactions, total_income, total_expense),
    }


def extract_from_excel(content: bytes, file_name: str = "") -> dict:
    """
    Extract transactions from an Excel file.
    Converts to CSV-like structure then delegates to tabular extraction.
    """
    try:
        import openpyxl
    except ImportError:
        return {"error": "חסרה ספריית openpyxl לקריאת Excel", "transactions": [], "metadata": {}}

    try:
        wb = openpyxl.load_workbook(io.BytesIO(content), read_only=True, data_only=True)
        ws = wb.active
        if ws is None:
            return {"error": "קובץ Excel ריק", "transactions": [], "metadata": {}}

        rows = list(ws.iter_rows(values_only=True))
        if len(rows) < 2:
            return {"error": "קובץ Excel ללא נתונים", "transactions": [], "metadata": {}}

        # Convert to CSV string
        output = io.StringIO()
        writer = csv.writer(output)
        for row in rows:
            writer.writerow([str(cell) if cell is not None else "" for cell in row])

        csv_content = output.getvalue().encode("utf-8")
        result = extract_from_csv(csv_content, file_name)
        result["metadata"]["original_format"] = "excel"
        result["metadata"]["sheet_name"] = ws.title
        return result

    except Exception as e:
        return {"error": f"שגיאה בקריאת Excel: {str(e)}", "transactions": [], "metadata": {}}


def extract_from_pdf(content: bytes, file_name: str = "") -> dict:
    """
    Extract financial data from a PDF document.
    Uses pdfplumber for text extraction, then applies pattern matching + AI.
    """
    try:
        import pdfplumber
    except ImportError:
        return {"error": "חסרה ספריית pdfplumber לקריאת PDF", "transactions": [], "metadata": {}}

    try:
        pdf = pdfplumber.open(io.BytesIO(content))
        all_text = ""
        all_tables = []

        for page in pdf.pages:
            text = page.extract_text() or ""
            all_text += text + "\n"

            tables = page.extract_tables()
            for table in tables:
                if table:
                    all_tables.append(table)

        pdf.close()

        institution = _detect_institution(file_name + " " + all_text[:1000])

        # Try to extract from tables first
        transactions = []
        if all_tables:
            for table in all_tables:
                txs = _extract_transactions_from_table(table)
                transactions.extend(txs)

        # Extract summary data from text (balances, totals, etc.)
        summary = _extract_summary_from_text(all_text)

        total_income = sum(t["amount"] for t in transactions if t["amount"] > 0)
        total_expense = sum(abs(t["amount"]) for t in transactions if t["amount"] < 0)

        return {
            "transactions": transactions,
            "raw_text": all_text[:10000],  # cap raw text size
            "tables_found": len(all_tables),
            "metadata": {
                "total_rows_parsed": len(transactions),
                "total_income": round(total_income, 2),
                "total_expense": round(total_expense, 2),
                "net_flow": round(total_income - total_expense, 2),
                "detected_institution": institution,
                "original_format": "pdf",
                "pages": len(pdf.pages) if hasattr(pdf, 'pages') else 0,
                "summary": summary,
            },
            "errors": [],
            "insights": _generate_basic_insights(transactions, total_income, total_expense),
        }

    except Exception as e:
        return {"error": f"שגיאה בקריאת PDF: {str(e)}", "transactions": [], "metadata": {}}


def build_ai_extraction_prompt(raw_text: str, file_name: str, file_type: str) -> str:
    """
    Build a prompt for the AI model to extract structured financial data
    from raw document text. Used when rule-based extraction isn't sufficient.
    """
    return f"""You are a financial document analyst specializing in Israeli financial documents.
Analyze the following {file_type} document and extract ALL financial information.

File name: {file_name}

Document content:
---
{raw_text[:8000]}
---

Extract and return a JSON object with this exact structure:
{{
  "institution": {{
    "name": "Institution name",
    "code": "institution_code or null",
    "type": "bank|credit_card|pension|insurance|brokerage|other"
  }},
  "document_type": "bank_statement|credit_card_statement|pension_report|investment_report|insurance_policy|loan_agreement|tax_form|other",
  "period": {{
    "start": "YYYY-MM-DD or null",
    "end": "YYYY-MM-DD or null"
  }},
  "accounts": [
    {{
      "name": "Account name/number",
      "type": "checking|savings|credit_card|investment|pension|loan|other",
      "currency": "ILS|USD|EUR",
      "balance": 0.00,
      "available_balance": null
    }}
  ],
  "transactions": [
    {{
      "date": "YYYY-MM-DD",
      "description": "Description",
      "amount": -500.00,
      "type": "expense|income|transfer",
      "category": "category or null",
      "balance_after": null
    }}
  ],
  "summary": {{
    "opening_balance": null,
    "closing_balance": null,
    "total_income": 0,
    "total_expenses": 0,
    "total_interest": null,
    "total_fees": null
  }},
  "insights": [
    "Insight about the financial data in Hebrew"
  ],
  "products_detected": [
    {{
      "product_type": "checking|savings|credit_card|mortgage|pension_comprehensive|keren_hishtalmut|investment_portfolio|etc",
      "name": "Product name",
      "current_balance": 0,
      "interest_rate": null,
      "monthly_payment": null
    }}
  ]
}}

Rules:
- All monetary values in the original currency
- Negative amounts = expenses/debits, positive = income/credits
- Detect Israeli institution names (בנק הפועלים, ישראכרט, מנורה, etc.)
- Provide insights in Hebrew
- If a field is unknown, use null
- Extract as many transactions as possible
- Identify financial products (accounts, loans, pensions, investments)

Return ONLY the JSON, no markdown formatting."""


# ─── Internal Helpers ─────────────────────────────────────────────────────

def _decode_content(content: bytes) -> str:
    """Decode file content with Hebrew encoding fallback chain."""
    for encoding in ["utf-8-sig", "utf-8", "windows-1255", "iso-8859-8", "latin-1"]:
        try:
            return content.decode(encoding)
        except (UnicodeDecodeError, LookupError):
            continue
    return content.decode("latin-1")  # last resort, never fails


def _find_column(columns: list[str], candidates: list[str]) -> Optional[str]:
    """Find the first matching column name from candidates."""
    col_lower = {c.strip().lower(): c for c in columns}
    for candidate in candidates:
        if candidate.lower() in col_lower:
            return col_lower[candidate.lower()]
        # Partial match
        for col_key, col_orig in col_lower.items():
            if candidate.lower() in col_key:
                return col_orig
    return None


def _detect_institution(text: str) -> Optional[str]:
    """Detect Israeli financial institution from text using regex patterns."""
    text_lower = text.lower()
    for code, patterns in INSTITUTION_PATTERNS.items():
        for pattern in patterns:
            if re.search(pattern, text, re.IGNORECASE):
                return code
    return None


def _extract_transactions_from_table(table: list[list]) -> list[dict]:
    """Extract transactions from a PDF table structure."""
    if len(table) < 2:
        return []

    # First row as headers
    headers = [str(cell).strip() if cell else "" for cell in table[0]]

    date_idx = _find_column_index(headers, DATE_COLUMNS)
    amount_idx = _find_column_index(headers, AMOUNT_COLUMNS)
    desc_idx = _find_column_index(headers, DESCRIPTION_COLUMNS)
    debit_idx = _find_column_index(headers, DEBIT_COLUMNS)
    credit_idx = _find_column_index(headers, CREDIT_COLUMNS)

    transactions = []
    for row in table[1:]:
        try:
            cells = [str(cell).strip() if cell else "" for cell in row]

            date_val = parse_date(cells[date_idx]) if date_idx is not None and date_idx < len(cells) else None
            if not date_val:
                continue

            amount = None
            if amount_idx is not None and amount_idx < len(cells):
                amount = parse_amount(cells[amount_idx])
            elif debit_idx is not None or credit_idx is not None:
                debit = parse_amount(cells[debit_idx]) if debit_idx is not None and debit_idx < len(cells) else None
                credit = parse_amount(cells[credit_idx]) if credit_idx is not None and credit_idx < len(cells) else None
                if debit:
                    amount = -abs(debit)
                elif credit:
                    amount = abs(credit)

            if amount is None or amount == 0:
                continue

            description = cells[desc_idx] if desc_idx is not None and desc_idx < len(cells) else "ייבוא PDF"

            transactions.append({
                "date": date_val,
                "amount": amount,
                "type": "income" if amount > 0 else "expense",
                "description": description,
                "category": None,
                "balance_after": None,
            })
        except (IndexError, ValueError):
            continue

    return transactions


def _find_column_index(headers: list[str], candidates: list[str]) -> Optional[int]:
    """Find column index by matching against candidate names."""
    for i, header in enumerate(headers):
        header_lower = header.lower().strip()
        for candidate in candidates:
            if candidate.lower() in header_lower or header_lower in candidate.lower():
                return i
    return None


def _extract_summary_from_text(text: str) -> dict:
    """Extract financial summary numbers from free text using regex."""
    summary = {}

    # Balance patterns (Hebrew)
    balance_patterns = [
        (r"יתרה\s*(?:סופית|נוכחית|לתאריך)?\s*:?\s*([\d,]+\.?\d*)", "closing_balance"),
        (r"יתרה\s*(?:פתיחה|התחלתית)\s*:?\s*([\d,]+\.?\d*)", "opening_balance"),
        (r"סה\"?כ\s*חיובים?\s*:?\s*([\d,]+\.?\d*)", "total_expenses"),
        (r"סה\"?כ\s*זיכויים?\s*:?\s*([\d,]+\.?\d*)", "total_income"),
        (r"ריבית\s*:?\s*([\d,]+\.?\d*)", "interest"),
        (r"עמלות?\s*:?\s*([\d,]+\.?\d*)", "fees"),
    ]

    for pattern, key in balance_patterns:
        match = re.search(pattern, text)
        if match:
            val = parse_amount(match.group(1))
            if val is not None:
                summary[key] = val

    return summary


def _generate_basic_insights(transactions: list[dict], total_income: float, total_expense: float) -> list[str]:
    """Generate basic financial insights from extracted transactions."""
    insights = []

    if not transactions:
        return insights

    count = len(transactions)
    insights.append(f"זוהו {count} תנועות בקובץ")

    if total_income > 0:
        insights.append(f"סה\"כ הכנסות: ₪{total_income:,.2f}")
    if total_expense > 0:
        insights.append(f"סה\"כ הוצאות: ₪{total_expense:,.2f}")

    net = total_income - total_expense
    if net > 0:
        insights.append(f"תזרים חיובי: +₪{net:,.2f}")
    elif net < 0:
        insights.append(f"תזרים שלילי: -₪{abs(net):,.2f}")

    # Top expenses
    expenses = [t for t in transactions if t["amount"] < 0]
    if expenses:
        top = sorted(expenses, key=lambda t: t["amount"])[:3]
        top_descs = [f"{t['description']} (₪{abs(t['amount']):,.0f})" for t in top]
        insights.append(f"הוצאות גדולות: {', '.join(top_descs)}")

    # Monthly average if we have dates
    dates = [t["date"] for t in transactions if t.get("date")]
    if len(dates) >= 2:
        from datetime import date as dt_date
        try:
            d_min = dt_date.fromisoformat(min(dates))
            d_max = dt_date.fromisoformat(max(dates))
            months = max(1, (d_max.year - d_min.year) * 12 + d_max.month - d_min.month)
            if months > 0 and total_expense > 0:
                avg = total_expense / months
                insights.append(f"ממוצע הוצאות חודשי: ₪{avg:,.0f}")
        except (ValueError, TypeError):
            pass

    return insights
