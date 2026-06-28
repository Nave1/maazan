# Ship Gate — Pre-Production Security Audit

Pre-production audit that scans a codebase for security, database, deployment, code quality, AI/LLM, dependency, frontend, and observability issues. Intercepts deploy commands and blocks until critical items pass. Stack-agnostic.

---

## Gate Categories

### 1. Security Gate

| Check | What It Verifies | Severity |
|-------|-----------------|----------|
| Hardcoded secrets | No API keys, passwords, tokens in source | CRITICAL |
| SQL injection | All queries parameterized | CRITICAL |
| XSS vulnerabilities | Output encoding on user-generated content | HIGH |
| CORS configuration | No wildcard origins with credentials | HIGH |
| Authentication | All protected routes require auth | CRITICAL |
| Security headers | HSTS, CSP, X-Frame-Options configured | MEDIUM |
| HTTPS enforcement | No HTTP in production URLs | HIGH |
| Rate limiting | Auth endpoints rate-limited | HIGH |
| Error exposure | No stack traces in production responses | MEDIUM |
| Session security | Secure cookie flags set | MEDIUM |

### 2. Database Gate

| Check | What It Verifies | Severity |
|-------|-----------------|----------|
| Migrations | All migrations applied and reversible | HIGH |
| Connection pooling | Pool size configured for production load | MEDIUM |
| Backup verification | Backup/restore tested | HIGH |
| Index coverage | Queries have appropriate indexes | MEDIUM |
| PII handling | Sensitive columns encrypted or masked | HIGH |

### 3. Dependency Gate

| Check | What It Verifies | Severity |
|-------|-----------------|----------|
| Known CVEs | No critical/high CVEs in dependencies | CRITICAL |
| Outdated packages | No EOL or abandoned packages | MEDIUM |
| License compliance | No copyleft licenses in commercial app | LOW |
| Lock file present | package-lock.json / requirements.txt committed | HIGH |

### 4. Frontend Gate

| Check | What It Verifies | Severity |
|-------|-----------------|----------|
| CSP headers | Content Security Policy configured | HIGH |
| XSS prevention | No dangerouslySetInnerHTML with user data | CRITICAL |
| CSRF protection | Anti-CSRF tokens on state-changing forms | HIGH |
| Sensitive data | No tokens/secrets in localStorage (use httpOnly cookies) | HIGH |
| Error boundaries | React error boundaries in place | MEDIUM |

### 5. API Gate

| Check | What It Verifies | Severity |
|-------|-----------------|----------|
| Input validation | All endpoints validate input (Pydantic/Zod) | HIGH |
| Auth middleware | Authentication on all non-public endpoints | CRITICAL |
| Rate limiting | Rate limits on all endpoints | HIGH |
| Versioning | API versioned (v1, v2) | LOW |
| Error format | Consistent error response format | MEDIUM |

### 6. Observability Gate

| Check | What It Verifies | Severity |
|-------|-----------------|----------|
| Logging | Structured logging in place | MEDIUM |
| Health checks | /health endpoint returns status | HIGH |
| Audit trail | Auth events logged (login, logout, failed) | HIGH |
| Error tracking | Error reporting configured (Sentry, etc.) | MEDIUM |

---

## Gate Policy

### Blocking Rules
- **CRITICAL**: Any critical finding blocks deployment. No exceptions.
- **HIGH**: 3+ high findings blocks deployment. Individual highs generate warnings.
- **MEDIUM**: Logged as warnings. Does not block.
- **LOW**: Informational only.

### Gate Verdict

```
PASS    — Zero critical, fewer than 3 high findings
WARN    — Zero critical, 1-2 high findings (deploy with caution)
BLOCK   — Any critical finding OR 3+ high findings
```

---

## Usage

Run before every deployment:
```
/ship-gate
```

The gate produces a checklist with PASS/WARN/BLOCK per category, a summary verdict, and remediation steps for every finding.

---

## Remediation Priority

1. Fix all CRITICAL findings immediately
2. Fix HIGH findings before next deployment
3. Schedule MEDIUM findings in the next sprint
4. Track LOW findings in backlog
