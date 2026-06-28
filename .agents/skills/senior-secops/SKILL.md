# Senior SecOps Engineer

Complete toolkit for Security Operations including vulnerability management, compliance verification, secure coding practices, and security automation.

---

## Table of Contents

- [Core Capabilities](#core-capabilities)
- [Workflows](#workflows)
- [Tool Reference](#tool-reference)
- [Security Standards](#security-standards)
- [Compliance Frameworks](#compliance-frameworks)
- [Best Practices](#best-practices)

---

## Core Capabilities

### 1. Security Scanner

Scan source code for security vulnerabilities including hardcoded secrets, SQL injection, XSS, command injection, and path traversal.

**Detects:**
- Hardcoded secrets (API keys, passwords, AWS credentials, GitHub tokens, private keys)
- SQL injection patterns (string concatenation, f-strings, template literals)
- XSS vulnerabilities (innerHTML assignment, unsafe DOM manipulation, React unsafe patterns)
- Command injection (shell=True, exec, eval with user input)
- Path traversal (file operations with user input)

### 2. Vulnerability Assessor

Scan dependencies for known CVEs across npm, Python, and Go ecosystems.

**Scans:**
- `package.json` and `package-lock.json` (npm)
- `requirements.txt` and `pyproject.toml` (Python)
- `go.mod` (Go)

**Output:**
- CVE IDs with CVSS scores
- Affected package versions
- Fixed versions for remediation
- Overall risk score (0-100)

### 3. Compliance Checker

Verify security compliance against SOC 2, PCI-DSS, HIPAA, and GDPR frameworks.

**Verifies:**
- Access control implementation
- Encryption at rest and in transit
- Audit logging
- Authentication strength (MFA, password hashing)
- Security documentation
- CI/CD security controls

---

## Workflows

### Workflow 1: Security Audit

Complete security assessment of a codebase.

1. Scan for code vulnerabilities (severity: medium+)
2. Check dependency vulnerabilities (severity: high+)
3. Verify compliance controls (all frameworks)
4. Generate combined reports

### Workflow 2: CI/CD Security Gate

Integrate security checks into deployment pipeline — security scanner, vulnerability assessment, and compliance checks run on every PR.

### Workflow 3: CVE Triage

1. ASSESS (0-2 hours) — Identify affected systems, check active exploitation, determine CVSS score
2. PRIORITIZE — Critical (24h), High (7d), Medium (30d), Low (90d)
3. REMEDIATE — Update dependency, verify fix, test for regressions, deploy with monitoring
4. VERIFY — Rerun assessor, confirm CVE resolved, document actions

### Workflow 4: Incident Response

- PHASE 1: DETECT & IDENTIFY (0-15 min)
- PHASE 2: CONTAIN (15-60 min)
- PHASE 3: ERADICATE (1-4 hours)
- PHASE 4: RECOVER (4-24 hours)
- PHASE 5: POST-INCIDENT (24-72 hours)

---

## Security Standards

### Secure Coding Checklist

#### Input Validation
- [ ] Validate all input on server side
- [ ] Use allowlists over denylists
- [ ] Sanitize for specific context (HTML, SQL, shell)

#### Output Encoding
- [ ] HTML encode for browser output
- [ ] URL encode for URLs
- [ ] JavaScript encode for script contexts

#### Authentication
- [ ] Use bcrypt/argon2 for passwords
- [ ] Implement MFA for sensitive operations
- [ ] Enforce strong password policy

#### Session Management
- [ ] Generate secure random session IDs
- [ ] Set HttpOnly, Secure, SameSite flags
- [ ] Implement session timeout (15 min idle)

#### Error Handling
- [ ] Log errors with context (no secrets)
- [ ] Return generic messages to users
- [ ] Never expose stack traces in production

#### Secrets Management
- [ ] Use environment variables or secrets manager
- [ ] Never commit secrets to version control
- [ ] Rotate credentials regularly

---

## Compliance Frameworks

### SOC 2 Type II
- **CC6** Logical Access: authentication, authorization, MFA
- **CC7** System Operations: monitoring, logging, incident response
- **CC8** Change Management: CI/CD, code review, deployment controls

### PCI-DSS v4.0
- **Req 3/4**: Encryption at rest and in transit (TLS 1.2+)
- **Req 6**: Secure development (input validation, secure coding)
- **Req 8**: Strong authentication (MFA, password policy)
- **Req 10/11**: Audit logging, SAST/DAST/penetration testing

### GDPR
- **Art 25/32**: Privacy by design, encryption, pseudonymization
- **Art 33**: Breach notification within 72 hours
- **Art 17/20**: Right to erasure and data portability

---

## Best Practices

### Secrets Management

```python
# BAD: Hardcoded secret
API_KEY = "sk-1234567890abcdef"

# GOOD: Environment variable
import os
API_KEY = os.environ.get("API_KEY")
```

### SQL Injection Prevention

```python
# BAD: String concatenation
query = f"SELECT * FROM users WHERE id = {user_id}"

# GOOD: Parameterized query
cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
```

### XSS Prevention

```javascript
// BAD: Direct innerHTML assignment
// GOOD: Use textContent (auto-escaped)
element.textContent = userInput;

// GOOD: Use sanitization library for HTML
import DOMPurify from 'dompurify';
const safeHTML = DOMPurify.sanitize(userInput);
```

### Security Headers

```python
# FastAPI security headers middleware
@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Content-Security-Policy"] = "default-src 'self'"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response
```

---

## OWASP Top 10 Quick-Check

| # | Category | One-Line Check |
|---|----------|----------------|
| A01 | Broken Access Control | Verify role checks on every endpoint; test horizontal privilege escalation |
| A02 | Cryptographic Failures | Confirm TLS 1.2+ everywhere; no secrets in logs or source |
| A03 | Injection | Run parameterized query audit; check ORM raw-query usage |
| A04 | Insecure Design | Review threat model exists for critical flows |
| A05 | Security Misconfiguration | Check default credentials removed; error pages generic |
| A06 | Vulnerable Components | Zero critical/high CVEs in dependencies |
| A07 | Auth Failures | Verify brute-force protection active |
| A08 | Software & Data Integrity | Confirm CI/CD pipeline signs artifacts; no unsigned deps |
| A09 | Logging & Monitoring | Validate audit logs capture auth events; alerts configured |
| A10 | SSRF | Test internal URL filters; block metadata endpoints |

---

## Secret Scanning Tools

| Tool | Best For | Pre-commit | CI/CD |
|------|----------|:----------:|:-----:|
| **gitleaks** | CI pipelines, full-repo scans | Yes | Yes |
| **detect-secrets** | Pre-commit hooks, incremental | Yes | Partial |
| **truffleHog** | Deep history scans, entropy | No | Yes |

**Recommended:** Use `detect-secrets` as pre-commit hook + `gitleaks` in CI.
