# מאזן – API Design Document

## API Architecture

- **Framework**: FastAPI (Python 3.12+)
- **Protocol**: REST + WebSocket (for real-time AI chat)
- **Versioning**: URL-based (`/api/v1/`)
- **Authentication**: JWT Bearer tokens
- **Rate Limiting**: Token bucket (100 req/min standard, 20 req/min AI)
- **Documentation**: Auto-generated OpenAPI 3.1 (Swagger UI at `/docs`)

---

## Base URL

```
Production:  https://api.maazan.co.il/api/v1
Staging:     https://api-staging.maazan.co.il/api/v1
Development: http://localhost:8000/api/v1
```

---

## Authentication Endpoints

### POST /auth/register
Create a new user account.

```json
// Request
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "first_name": "נועם",
  "last_name": "כהן",
  "preferred_language": "he"
}

// Response 201
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "first_name": "נועם",
    "last_name": "כהן"
  },
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "token_type": "bearer",
  "expires_in": 3600
}
```

### POST /auth/login
```json
// Request
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

// Response 200
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "token_type": "bearer",
  "expires_in": 3600,
  "user": { ... }
}
```

### POST /auth/oauth/{provider}
OAuth login (Google/Microsoft).

### POST /auth/refresh
Refresh access token.

### POST /auth/logout
Revoke refresh token.

### POST /auth/mfa/enable
Enable MFA.

### POST /auth/mfa/verify
Verify MFA code.

### POST /auth/password/reset
Request password reset.

### POST /auth/password/reset/confirm
Confirm password reset with token.

---

## User Endpoints

### GET /users/me
Get current user profile.

### PATCH /users/me
Update user profile.

### GET /users/me/preferences
Get user preferences.

### PUT /users/me/preferences
Update user preferences.

### DELETE /users/me
Delete account (soft delete, GDPR compliance).

---

## Household Endpoints

### POST /households
Create household.

```json
// Request
{
  "name": "המשפחה שלנו",
  "type": "couple"
}
```

### GET /households/{id}
Get household details.

### POST /households/{id}/invite
Invite partner.

```json
// Request
{
  "email": "partner@example.com",
  "role": "member"
}
```

### GET /households/{id}/members
List household members.

### PUT /households/{id}/splitting-rules
Update splitting rules.

### GET /households/{id}/dashboard
Combined household dashboard.

---

## Account Endpoints

### GET /accounts
List all user accounts.

```json
// Response 200
{
  "accounts": [
    {
      "id": "uuid",
      "name": "עו\"ש לאומי",
      "type": "checking",
      "institution": "Bank Leumi",
      "current_balance": 15420.50,
      "currency": "ILS",
      "is_shared": true,
      "color": "#2563EB"
    }
  ],
  "total_balance": 45320.00
}
```

### POST /accounts
Create account.

### GET /accounts/{id}
Get account details.

### PATCH /accounts/{id}
Update account.

### DELETE /accounts/{id}
Deactivate account.

### GET /accounts/{id}/transactions
List transactions for account.

---

## Transaction Endpoints

### GET /transactions
List transactions with filters.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| page | int | Page number (default: 1) |
| per_page | int | Items per page (default: 50, max: 200) |
| start_date | date | Filter from date |
| end_date | date | Filter to date |
| category_id | uuid | Filter by category |
| type | string | 'income', 'expense', 'transfer' |
| min_amount | decimal | Minimum amount |
| max_amount | decimal | Maximum amount |
| search | string | Full-text search |
| tags | string[] | Filter by tags |
| account_id | uuid | Filter by account |
| is_recurring | bool | Filter recurring |

```json
// Response 200
{
  "transactions": [...],
  "pagination": {
    "page": 1,
    "per_page": 50,
    "total": 1234,
    "total_pages": 25
  },
  "summary": {
    "total_income": 22000.00,
    "total_expenses": 18500.00,
    "net": 3500.00
  }
}
```

### POST /transactions
Create transaction.

```json
// Request
{
  "account_id": "uuid",
  "type": "expense",
  "amount": 350.00,
  "date": "2026-06-10",
  "description": "שופרסל - קניות שבועיות",
  "category_id": "uuid",
  "tags": ["grocery"],
  "notes": "קניות לשבת"
}
```

### PATCH /transactions/{id}
Update transaction.

### DELETE /transactions/{id}
Delete transaction.

### POST /transactions/bulk
Bulk operations (categorize, tag, delete).

```json
// Request
{
  "transaction_ids": ["uuid1", "uuid2", "uuid3"],
  "action": "categorize",
  "category_id": "uuid"
}
```

### POST /transactions/import
Import transactions from file.

```
Content-Type: multipart/form-data
file: <CSV/Excel/PDF file>
source: "bank_statement"
account_id: "uuid"
```

```json
// Response 202
{
  "import_batch_id": "uuid",
  "status": "processing",
  "message": "מעבד 156 תנועות..."
}
```

### GET /transactions/import/{batch_id}
Check import status.

### GET /transactions/recurring
List detected recurring transactions.

### POST /transactions/{id}/split
Split transaction across categories.

---

## Category Endpoints

### GET /categories
List all categories (system + user-created).

### POST /categories
Create custom category.

### PATCH /categories/{id}
Update category.

### GET /categories/rules
List categorization rules.

### POST /categories/rules
Create categorization rule.

---

## Budget Endpoints

### GET /budgets
Get budget for current month.

```json
// Response 200
{
  "month": "2026-06",
  "total_budget": 18000.00,
  "total_spent": 12450.00,
  "remaining": 5550.00,
  "categories": [
    {
      "category_id": "uuid",
      "category_name": "מזון",
      "allocated": 3500.00,
      "spent": 2800.00,
      "remaining": 700.00,
      "percentage_used": 80
    }
  ]
}
```

### PUT /budgets/{month}
Set budget for month.

### GET /budgets/history
Budget history (past months).

---

## Goals Endpoints

### GET /goals
List all goals.

```json
// Response 200
{
  "goals": [
    {
      "id": "uuid",
      "name": "רכישת דירה",
      "type": "apartment",
      "target_amount": 400000.00,
      "current_amount": 125000.00,
      "progress_percentage": 31.25,
      "monthly_contribution_needed": 7639.00,
      "estimated_completion_date": "2029-08-15",
      "target_date": "2029-06-01",
      "days_behind": 75,
      "success_probability": 72,
      "status": "active"
    }
  ]
}
```

### POST /goals
Create goal.

### GET /goals/{id}
Get goal details with analysis.

### PATCH /goals/{id}
Update goal.

### POST /goals/{id}/contribute
Add contribution to goal.

### GET /goals/{id}/forecast
Get goal completion forecast.

---

## Investment Endpoints

### GET /investments
List all investments.

### POST /investments
Add investment.

### GET /investments/{id}
Get investment details.

### PATCH /investments/{id}
Update investment.

### GET /investments/portfolio
Portfolio summary and analytics.

```json
// Response 200
{
  "total_value": 285000.00,
  "total_cost": 245000.00,
  "total_return": 40000.00,
  "return_percentage": 16.33,
  "allocation": {
    "stocks": 45,
    "etfs": 30,
    "bonds": 15,
    "crypto": 5,
    "savings": 5
  },
  "risk_score": 6.5,
  "diversification_score": 72,
  "currency_exposure": {
    "ILS": 60,
    "USD": 35,
    "EUR": 5
  }
}
```

### POST /investments/{id}/transactions
Record buy/sell/dividend.

### GET /investments/performance
Historical performance data.

---

## Pension Endpoints

### GET /pension
List all pension funds.

### POST /pension
Add pension fund.

### GET /pension/{id}
Get fund details.

### PATCH /pension/{id}
Update fund.

### GET /pension/summary
Aggregated retirement summary.

```json
// Response 200
{
  "total_retirement_assets": 1585000.00,
  "monthly_contributions": {
    "employee": 2800.00,
    "employer": 3200.00,
    "severance": 1900.00
  },
  "projected_monthly_pension": 12400.00,
  "retirement_age": 67,
  "years_to_retirement": 32,
  "projected_total_at_retirement": 4250000.00,
  "gap_analysis": {
    "desired_monthly": 18000.00,
    "projected_monthly": 12400.00,
    "monthly_gap": 5600.00,
    "additional_savings_needed": 2100.00
  },
  "keren_hishtalmut": {
    "balance": 180000.00,
    "tax_free_date": "2027-03-15",
    "months_to_maturity": 9
  }
}
```

### GET /pension/{id}/contributions
Contribution history.

### GET /pension/projection
Retirement projection with scenarios.

---

## Mortgage Endpoints

### GET /mortgages
List mortgages.

### POST /mortgages
Add mortgage.

### GET /mortgages/{id}
Get mortgage details.

### GET /mortgages/{id}/amortization
Full amortization schedule.

### GET /mortgages/{id}/tracks
List mortgage tracks.

### POST /mortgages/{id}/simulate-refinance
Simulate refinancing.

```json
// Request
{
  "new_tracks": [
    {"type": "prime", "amount": 500000, "rate": 1.5, "term_months": 240},
    {"type": "fixed_unlinked", "amount": 300000, "rate": 4.2, "term_months": 180}
  ]
}

// Response 200
{
  "current_monthly_payment": 6800.00,
  "new_monthly_payment": 6200.00,
  "monthly_savings": 600.00,
  "total_interest_savings": 85000.00,
  "recommendation": "מומלץ למחזר. תחסכו ₪85,000 בריבית לאורך התקופה."
}
```

### POST /mortgages/{id}/simulate-extra-payment
Simulate extra payments.

---

## AI Endpoints

### POST /ai/chat
Send message to AI CFO.

```json
// Request
{
  "conversation_id": "uuid", // Optional, creates new if omitted
  "message": "כמה הוצאתי על מסעדות השנה?"
}

// Response 200
{
  "conversation_id": "uuid",
  "response": {
    "text": "השנה הוצאת ₪12,450 על מסעדות, שזה ממוצע של ₪2,075 בחודש. זה 11% מסך ההוצאות שלך. לעומת השנה שעברה, יש עלייה של 18%.",
    "data": {
      "type": "expense_summary",
      "total": 12450,
      "monthly_avg": 2075,
      "percentage_of_total": 11,
      "year_over_year_change": 18,
      "chart_data": [...]
    },
    "suggestions": [
      "רוצה שאראה לך פירוט חודשי?",
      "רוצה להגדיר תקציב למסעדות?"
    ]
  }
}
```

### WebSocket /ai/chat/stream
Real-time streaming AI responses.

### GET /ai/conversations
List conversations.

### GET /ai/conversations/{id}
Get conversation history.

### GET /ai/insights
Get current AI insights/alerts.

```json
// Response 200
{
  "insights": [
    {
      "id": "uuid",
      "type": "alert",
      "priority": "high",
      "title": "חריגה מתקציב",
      "body": "הוצאת 130% מתקציב הבילויים החודש. נשארו 8 ימים.",
      "action": "view_budget",
      "created_at": "2026-06-11T10:00:00Z"
    }
  ]
}
```

### POST /ai/simulate
Run what-if simulation via AI.

```json
// Request
{
  "scenario": "salary_increase",
  "parameters": {
    "new_salary": 18000,
    "start_date": "2026-09-01"
  }
}

// Response 200
{
  "summary": "העלאה ל-₪18,000 תאפשר לך להגדיל חיסכון ב-₪2,500/חודש...",
  "impact": {
    "monthly_savings_increase": 2500,
    "goal_acceleration_days": 120,
    "new_financial_score": 71,
    "timeline_changes": [...]
  },
  "forecast_chart": {...},
  "recommendation": "מומלץ להקצות 60% מההעלאה לחיסכון ו-40% לשיפור איכות חיים."
}
```

---

## Financial Score Endpoints

### GET /score
Get current financial health score.

```json
// Response 200
{
  "overall_score": 62,
  "breakdown": {
    "savings_rate": 55,
    "debt_management": 78,
    "emergency_fund": 40,
    "budget_discipline": 65,
    "goal_achievement": 70,
    "investment_health": 58,
    "cash_flow_stability": 72
  },
  "trend": "improving", // 'improving', 'stable', 'declining'
  "change_from_last_month": +3,
  "ai_explanation": "הציון שלך עלה ב-3 נקודות בזכות שיפור בחיסכון. כדי להמשיך לעלות, כדאי להגדיל את כרית הביטחון.",
  "top_improvements": [
    "הגדל את כרית הביטחון ל-3 חודשי הוצאות (חסרים ₪8,000)",
    "הקטן את יחס החוב ב-5% ע\"י הגדלת החזר המשכנתא",
    "פזר השקעות – 80% שלך בשוק הישראלי"
  ]
}
```

### GET /score/history
Score history over time.

---

## Timeline Endpoints

### GET /timeline
Get financial timeline.

```json
// Response 200
{
  "milestones": [
    {
      "id": "uuid",
      "type": "goal",
      "name": "כרית ביטחון",
      "projected_date": "2026-09-15",
      "probability": 89,
      "status": "on_track"
    },
    {
      "id": "uuid",
      "type": "life_event",
      "name": "חתונה",
      "projected_date": "2027-05-01",
      "probability": 75,
      "status": "needs_attention"
    }
  ]
}
```

### PATCH /timeline/reorder
Reorder priorities and recalculate.

---

## Report Endpoints

### GET /reports
List generated reports.

### POST /reports/generate
Generate a new report.

```json
// Request
{
  "type": "monthly",
  "period_start": "2026-05-01",
  "period_end": "2026-05-31",
  "format": "pdf",
  "include_ai_summary": true
}

// Response 202
{
  "report_id": "uuid",
  "status": "generating",
  "estimated_seconds": 30
}
```

### GET /reports/{id}
Get report details.

### GET /reports/{id}/download
Download report file.

---

## Dashboard Endpoints

### GET /dashboard
Get dashboard data (aggregated).

```json
// Response 200
{
  "net_worth": 450000.00,
  "net_worth_change": 12500.00,
  "total_assets": 850000.00,
  "total_liabilities": 400000.00,
  "monthly_income": 22000.00,
  "monthly_expenses": 18500.00,
  "cash_flow": 3500.00,
  "savings_rate": 15.9,
  "debt_ratio": 47.1,
  "financial_score": 62,
  "ai_summary": "חודש יציב. חסכת ₪3,500 וכל התשלומים בוצעו בזמן.",
  "upcoming_payments": [...],
  "active_goals_summary": [...],
  "recent_transactions": [...],
  "alerts": [...]
}
```

---

## Notification Endpoints

### GET /notifications
List notifications.

### PATCH /notifications/{id}/read
Mark as read.

### POST /notifications/read-all
Mark all as read.

### PUT /notifications/settings
Update notification preferences.

---

## Error Response Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "שדה חובה חסר",
    "details": [
      {
        "field": "amount",
        "message": "סכום חייב להיות חיובי"
      }
    ]
  }
}
```

### Error Codes

| HTTP Status | Code | Description |
|-------------|------|-------------|
| 400 | VALIDATION_ERROR | Invalid request data |
| 401 | UNAUTHORIZED | Missing or invalid token |
| 403 | FORBIDDEN | Insufficient permissions |
| 404 | NOT_FOUND | Resource not found |
| 409 | CONFLICT | Resource already exists |
| 422 | UNPROCESSABLE | Valid format, invalid logic |
| 429 | RATE_LIMITED | Too many requests |
| 500 | INTERNAL_ERROR | Server error |

---

## Rate Limiting Headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1686500000
```

---

## Pagination Format

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "per_page": 50,
    "total": 1234,
    "total_pages": 25,
    "has_next": true,
    "has_prev": false
  }
}
```

---

## WebSocket Events (AI Chat)

```typescript
// Client → Server
{ "type": "message", "content": "כמה כסף יש לי?" }
{ "type": "typing" }

// Server → Client
{ "type": "stream_start", "conversation_id": "uuid" }
{ "type": "stream_chunk", "content": "על בסיס..." }
{ "type": "stream_end", "metadata": { "tokens": 150 } }
{ "type": "insight", "data": { ... } }
{ "type": "error", "message": "..." }
```
