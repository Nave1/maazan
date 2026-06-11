# מאזן – Security Architecture

## Security Philosophy

> Financial data is among the most sensitive personal information. Our security posture must be equivalent to a bank, while our UX remains consumer-friendly.

---

## Security Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                          USERS                                    │
├─────────────────────────────────────────────────────────────────┤
│                     CDN / WAF (Cloudflare)                        │
│              DDoS Protection · Bot Detection · SSL               │
├─────────────────────────────────────────────────────────────────┤
│                     NGINX Reverse Proxy                           │
│           Rate Limiting · Request Filtering · TLS 1.3            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────┐          ┌──────────────────────────────┐  │
│  │    FRONTEND     │          │         BACKEND               │  │
│  │   (Next.js)     │  HTTPS   │        (FastAPI)              │  │
│  │                 │ ◄──────► │                               │  │
│  │ • CSP Headers   │          │ • JWT Validation              │  │
│  │ • XSS Prevention│          │ • RBAC Enforcement            │  │
│  │ • CSRF Tokens   │          │ • Input Validation            │  │
│  │ • Secure Cookies│          │ • Rate Limiting               │  │
│  └─────────────────┘          │ • Audit Logging               │  │
│                                │ • Data Encryption             │  │
│                                └──────────────────────────────┘  │
│                                           │                       │
│                    ┌──────────────────────┼────────────────────┐  │
│                    │                      │                    │  │
│              ┌─────┴─────┐    ┌──────────┴──────┐   ┌───────┐│  │
│              │ PostgreSQL │    │     Redis        │   │ MinIO ││  │
│              │            │    │                  │   │       ││  │
│              │ • TDE      │    │ • Auth Required  │   │ • Enc ││  │
│              │ • Row-Level│    │ • TLS Connection │   │ • ACL ││  │
│              │ • Encrypted│    │ • No Persist PII │   │       ││  │
│              └────────────┘    └──────────────────┘   └───────┘│  │
│                                                                   │
├─────────────────────────────────────────────────────────────────┤
│              SECRETS MANAGEMENT (HashiCorp Vault / AWS KMS)       │
├─────────────────────────────────────────────────────────────────┤
│              MONITORING (Grafana · Prometheus · Sentry)           │
└─────────────────────────────────────────────────────────────────┘
```

---

## Authentication & Authorization

### Authentication Flow

```
┌──────┐         ┌─────────┐        ┌─────────┐
│Client│         │ Backend │        │   DB    │
└──┬───┘         └────┬────┘        └────┬────┘
   │                   │                   │
   │  POST /auth/login │                   │
   │  {email, password}│                   │
   │──────────────────►│                   │
   │                   │  Verify password   │
   │                   │──────────────────►│
   │                   │   User record     │
   │                   │◄──────────────────│
   │                   │                   │
   │                   │  Check MFA        │
   │                   │  (if enabled)     │
   │                   │                   │
   │  {access_token,   │                   │
   │   refresh_token}  │                   │
   │◄──────────────────│                   │
   │                   │                   │
   │  GET /api/v1/...  │                   │
   │  Authorization:   │                   │
   │  Bearer <token>   │                   │
   │──────────────────►│                   │
   │                   │  Validate JWT     │
   │                   │  Check permissions│
   │                   │──────────────────►│
   │   Response        │                   │
   │◄──────────────────│                   │
```

### JWT Token Structure

```json
{
  "header": {
    "alg": "RS256",
    "typ": "JWT",
    "kid": "key-2026-06"
  },
  "payload": {
    "sub": "user-uuid",
    "email": "user@example.com",
    "household_id": "household-uuid",
    "roles": ["user", "household_owner"],
    "tier": "premium",
    "iat": 1718100000,
    "exp": 1718103600,
    "jti": "unique-token-id"
  }
}
```

### Token Security

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| Access Token TTL | 1 hour | Short-lived, limits exposure |
| Refresh Token TTL | 30 days | Convenience with rotation |
| Algorithm | RS256 | Asymmetric, backend verifies only |
| Key Rotation | Every 90 days | Limits key compromise impact |
| Refresh Token Rotation | On every use | Detects token theft |
| Blacklist | Redis-backed | Immediate revocation capability |

### Multi-Factor Authentication (MFA)

- **Method**: TOTP (Time-based One-Time Password)
- **Apps**: Google Authenticator, Microsoft Authenticator, Authy
- **Backup Codes**: 10 single-use recovery codes
- **Enforcement**: Optional for free, recommended for premium, required for family accounts

### OAuth 2.0 Integration

| Provider | Scopes | Data Retrieved |
|----------|--------|---------------|
| Google | `openid email profile` | Name, email, avatar |
| Microsoft | `openid email profile` | Name, email, avatar |

---

## Role-Based Access Control (RBAC)

### Roles

| Role | Permissions |
|------|-------------|
| User | Full access to own data, read shared household data |
| Household Owner | Manage household, invite/remove members, manage shared |
| Household Member | View shared data, contribute to shared goals |
| Admin (internal) | System management, no access to user financial data |
| Support (internal) | View metadata only, no financial data access |

### Permission Matrix

| Resource | Owner | Member | Partner (Couple) |
|----------|-------|--------|------------------|
| Own transactions | CRUD | — | Read (if shared) |
| Own accounts | CRUD | — | Read (if shared) |
| Shared goals | CRUD | Read + Contribute | CRUD |
| Household budget | CRUD | Read | CRUD |
| Partner's private | — | — | — (hidden) |
| AI conversations | Own only | Own only | Own only |
| Reports | Generate own | Generate own | Generate joint |

---

## Data Encryption

### Encryption at Rest

| Data | Method | Key Management |
|------|--------|---------------|
| Database (PostgreSQL) | TDE (Transparent Data Encryption) | AWS KMS / Vault |
| Sensitive fields (tokens, etc.) | AES-256-GCM column encryption | Application-level keys |
| File storage (receipts, reports) | AES-256 server-side encryption | Storage-level keys |
| Redis cache | No PII stored; session data only | — |
| Backups | Encrypted with separate key | Offline key stored securely |

### Encryption in Transit

| Connection | Protocol | Minimum Version |
|-----------|----------|-----------------|
| Client ↔ CDN | TLS | 1.3 |
| CDN ↔ Origin | TLS | 1.2 |
| Backend ↔ Database | TLS | 1.2 |
| Backend ↔ Redis | TLS | 1.2 |
| Backend ↔ OpenAI API | TLS | 1.2 |
| Internal services | mTLS | 1.3 |

### Sensitive Data Handling

```python
# Fields that are encrypted at application level:
ENCRYPTED_FIELDS = [
    'oauth_accounts.access_token',
    'oauth_accounts.refresh_token',
    'users.mfa_secret',
    'accounts.account_number_masked',  # Even masked, encrypted
]

# Fields that are hashed (one-way):
HASHED_FIELDS = [
    'users.password_hash',         # Argon2id
    'refresh_tokens.token_hash',   # SHA-256
]

# Password hashing config:
ARGON2_CONFIG = {
    'time_cost': 3,
    'memory_cost': 65536,  # 64MB
    'parallelism': 4,
    'hash_len': 32,
}
```

---

## Input Validation & Sanitization

### API Input Validation (Pydantic)

```python
class TransactionCreate(BaseModel):
    account_id: UUID
    type: Literal['income', 'expense', 'transfer']
    amount: Decimal = Field(gt=0, max_digits=12, decimal_places=2)
    date: date = Field(le=date.today())  # Cannot be in future
    description: str = Field(max_length=500)
    category_id: Optional[UUID] = None
    
    @validator('description')
    def sanitize_description(cls, v):
        """Remove potential XSS/injection content."""
        return bleach.clean(v, tags=[], strip=True)
```

### SQL Injection Prevention

- **ORM-only queries**: All database access through SQLAlchemy ORM
- **Parameterized queries**: No raw string concatenation
- **Input type validation**: Pydantic enforces types before DB layer

### XSS Prevention

- **Content Security Policy** headers
- **Output encoding** for all rendered content
- **Sanitization** of user-generated content (notes, descriptions)
- **React's built-in escaping** for frontend rendering

---

## Audit Logging

### What is Logged

| Event Category | Events |
|---------------|--------|
| Authentication | Login, logout, failed login, MFA attempt, password change |
| Data Access | Sensitive data viewed (transactions, balances) |
| Data Modification | Create, update, delete of any financial data |
| Admin Actions | User management, configuration changes |
| Security Events | Rate limit hit, suspicious activity, token revocation |
| AI Interactions | Queries made, data accessed by AI |

### Audit Log Entry Structure

```json
{
  "id": "uuid",
  "timestamp": "2026-06-11T10:30:00Z",
  "user_id": "uuid",
  "action": "transaction.create",
  "resource_type": "transaction",
  "resource_id": "uuid",
  "ip_address": "192.168.1.1",
  "user_agent": "Mozilla/5.0...",
  "details": {
    "amount": 350.00,
    "category": "food"
  },
  "result": "success"
}
```

### Log Security

- Logs are **append-only** (no modification/deletion)
- Stored separately from application database
- Retained for **7 years** (Israeli legal requirement)
- Encrypted at rest
- Access restricted to security team only

---

## Rate Limiting

| Endpoint Group | Limit | Window | Scope |
|---------------|-------|--------|-------|
| Authentication | 5 attempts | 15 minutes | Per IP |
| General API | 100 requests | 1 minute | Per user |
| AI Chat | 20 queries | 1 hour | Per user |
| Import | 5 imports | 1 hour | Per user |
| Report Generation | 10 reports | 1 hour | Per user |
| Password Reset | 3 attempts | 1 hour | Per email |

### Rate Limit Response

```json
{
  "error": {
    "code": "RATE_LIMITED",
    "message": "חרגת ממגבלת הבקשות. נסה שוב בעוד 45 שניות.",
    "retry_after": 45
  }
}
```

---

## Privacy & Compliance

### GDPR Compliance

| Right | Implementation |
|-------|---------------|
| Right to Access | Export all data via settings → PDF/JSON |
| Right to Erasure | Account deletion → 30 day soft delete → permanent purge |
| Right to Portability | Export in machine-readable format (JSON) |
| Right to Rectification | Edit all personal data via settings |
| Right to Object | Opt-out of AI processing, analytics |
| Data Minimization | Only collect what's needed for features |
| Purpose Limitation | Data used only for stated purposes |

### Israeli Privacy Protection Law (חוק הגנת הפרטיות)

| Requirement | Implementation |
|-------------|---------------|
| Database Registration | Register with Privacy Protection Authority |
| Purpose Declaration | Clear privacy policy in Hebrew |
| Consent | Explicit opt-in for data processing |
| Data Transfer | No transfer outside Israel without consent |
| Security Measures | "Reasonable" security (we exceed this) |
| Breach Notification | Within 72 hours to authority and users |

### Data Processing Consent

```
Required consents (checkboxes during registration):
☐ I agree to the Terms of Service and Privacy Policy
☐ I consent to AI analysis of my financial data for insights
☐ I understand my data is encrypted and stored in Israel

Optional consents:
☐ I agree to receive proactive financial insights via push notifications
☐ I agree to anonymous aggregate data use for product improvement
```

---

## Security Headers

```nginx
# Nginx security headers
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "DENY" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.maazan.co.il wss://api.maazan.co.il; font-src 'self'" always;
```

---

## Secrets Management

| Secret | Storage | Rotation |
|--------|---------|----------|
| Database credentials | Vault / AWS Secrets Manager | 90 days |
| JWT signing keys | Vault | 90 days |
| OpenAI API key | Vault | On demand |
| OAuth client secrets | Vault | Annual |
| Encryption keys | AWS KMS | Annual |
| Redis password | Vault | 90 days |

### Environment Variables (Never in Code)

```env
# .env.example (values are placeholders)
DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/maazan
REDIS_URL=redis://:pass@host:6379/0
JWT_PRIVATE_KEY_PATH=/run/secrets/jwt_private.pem
JWT_PUBLIC_KEY_PATH=/run/secrets/jwt_public.pem
OPENAI_API_KEY=sk-...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
ENCRYPTION_KEY=... # AES-256 key for field encryption
SENTRY_DSN=...
```

---

## Incident Response Plan

### Severity Levels

| Level | Definition | Response Time | Examples |
|-------|-----------|---------------|----------|
| P1 (Critical) | Data breach, system down | 15 minutes | Unauthorized data access |
| P2 (High) | Security vulnerability, partial outage | 1 hour | XSS found, auth bypass |
| P3 (Medium) | Suspicious activity, performance issue | 4 hours | Brute force attempt |
| P4 (Low) | Minor security improvement needed | 24 hours | Dependency update |

### Response Steps

1. **Detect** → Automated monitoring alerts
2. **Contain** → Isolate affected systems
3. **Assess** → Determine scope and impact
4. **Notify** → Alert users if data affected (within 72h per law)
5. **Remediate** → Fix vulnerability
6. **Review** → Post-mortem, update procedures

---

## Security Testing

| Type | Frequency | Tool/Method |
|------|-----------|-------------|
| SAST (Static Analysis) | Every PR | Semgrep, Bandit |
| DAST (Dynamic Testing) | Weekly | OWASP ZAP |
| Dependency Scanning | Daily | Dependabot, Safety |
| Penetration Testing | Quarterly | External firm |
| Secret Scanning | Every commit | GitLeaks |
| Container Scanning | Every build | Trivy |
| Infrastructure as Code | Every change | Checkov |
