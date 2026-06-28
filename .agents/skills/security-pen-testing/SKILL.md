# Security Penetration Testing

Hands-on offensive security testing skill for finding vulnerabilities before attackers do. This is NOT compliance checking (see senior-secops) or security policy writing — this is about systematic vulnerability discovery through authorized testing.

---

## Overview

### What This Skill Does

This skill provides the methodology, checklists, and automation for **offensive security testing** — actively probing systems to discover exploitable vulnerabilities. It covers web applications, APIs, infrastructure, and supply chain security.

### Distinction from Other Security Skills

| Skill | Focus | Approach |
|-------|-------|----------|
| **security-pen-testing** (this) | Finding vulnerabilities | Offensive — simulate attacker techniques |
| senior-secops | Security operations | Defensive — monitoring, incident response, SIEM |
| security-audit | General audit | Automated — OWASP scan and dependency check |

---

## OWASP Top 10 Systematic Audit

### Quick Reference

| # | Category | Key Tests |
|---|----------|-----------|
| A01 | Broken Access Control | IDOR, vertical escalation, CORS, JWT claim manipulation, forced browsing |
| A02 | Cryptographic Failures | TLS version, password hashing, hardcoded keys, weak PRNG |
| A03 | Injection | SQLi, NoSQLi, command injection, template injection, XSS |
| A04 | Insecure Design | Rate limiting, business logic abuse, multi-step flow bypass |
| A05 | Security Misconfiguration | Default credentials, debug mode, security headers, directory listing |
| A06 | Vulnerable Components | Dependency audit (npm/pip), EOL checks, known CVEs |
| A07 | Auth Failures | Brute force, session cookie flags, session invalidation, MFA bypass |
| A08 | Integrity Failures | Unsafe deserialization, SRI checks, CI/CD pipeline integrity |
| A09 | Logging Failures | Auth event logging, sensitive data in logs, alerting thresholds |
| A10 | SSRF | Internal IP access, cloud metadata endpoints, DNS rebinding |

---

## Static Analysis

**Recommended tools:** CodeQL, Semgrep, ESLint security plugins.

Key patterns to detect: SQL injection via string concatenation, hardcoded JWT secrets, unsafe YAML/pickle deserialization, missing security middleware.

---

## Dependency Vulnerability Scanning

**Ecosystem commands:** `npm audit`, `pip audit`

**CVE Triage Workflow:**
1. **Collect** — Run ecosystem audit tools, aggregate findings
2. **Deduplicate** — Group by CVE ID across direct and transitive deps
3. **Prioritize** — Critical + exploitable + reachable = fix immediately
4. **Remediate** — Upgrade, patch, or mitigate with compensating controls
5. **Verify** — Rerun audit to confirm fix, update lock files

---

## Secret Scanning

**Tools:** TruffleHog (git history + filesystem), Gitleaks (regex-based with custom rules).

```bash
# Scan git history for verified secrets
trufflehog git file://. --only-verified --json

# Scan filesystem
trufflehog filesystem . --json
```

**Integration points:** Pre-commit hooks (gitleaks), CI/CD gates (GitHub Actions).

---

## API Security Testing

### Authentication Bypass

- **JWT manipulation:** Change `alg` to `none`, RS256-to-HS256 confusion, claim modification (`role: "admin"`, `exp: 9999999999`)
- **Session fixation:** Check if session ID changes after authentication

### Authorization Flaws

- **IDOR/BOLA:** Change resource IDs in every endpoint — test read, update, delete across users
- **BFLA:** Regular user tries admin endpoints (expect 403)
- **Mass assignment:** Add privileged fields (`role`, `is_admin`) to update requests

### Rate Limiting

- **Rate limiting:** Rapid-fire requests to auth endpoints; expect 429 after threshold

---

## Web Vulnerability Testing

| Vulnerability | Key Tests |
|--------------|-----------|
| **XSS** | Reflected (script/img/svg payloads), Stored (persistent fields), DOM-based (innerHTML + location.hash) |
| **CSRF** | Replay without token (expect 403), cross-session token replay, check SameSite cookie attribute |
| **SQL Injection** | Error-based (`' OR 1=1--`), union-based enumeration, time-based blind (`SLEEP(5)`), boolean-based blind |
| **SSRF** | Internal IPs, cloud metadata endpoints (AWS/GCP/Azure), IPv6/hex/decimal encoding bypasses |
| **Path Traversal** | `../../../etc/passwd`, URL encoding, double encoding bypasses |

---

## Infrastructure Security

**Key checks:**
- **HTTP security headers:** HSTS, CSP (no `unsafe-inline`/`unsafe-eval`), X-Content-Type-Options, X-Frame-Options, Referrer-Policy
- **TLS configuration:** Reject TLS 1.0/1.1, RC4, 3DES, export-grade ciphers
- **Port scanning:** Flag dangerous open ports (FTP/21, Telnet/23, Redis/6379, MongoDB/27017, PostgreSQL/5432)

---

## Pen Test Report Generation

### Findings Format

```json
[
  {
    "title": "SQL Injection in Login Endpoint",
    "severity": "critical",
    "cvss_score": 9.8,
    "category": "A03:2021 - Injection",
    "description": "The /api/login endpoint is vulnerable to SQL injection via the email parameter.",
    "evidence": "Request: POST /api/login {\"email\": \"' OR 1=1--\", \"password\": \"x\"}",
    "impact": "Full database access, authentication bypass",
    "remediation": "Use parameterized queries. Replace string concatenation with prepared statements."
  }
]
```

### Report Structure

1. **Executive Summary**: Business impact, overall risk level, top 3 findings
2. **Scope**: What was tested, what was excluded, testing dates
3. **Methodology**: Tools used, testing approach (black/gray/white box)
4. **Findings Table**: Sorted by severity with CVSS scores
5. **Detailed Findings**: Each with description, evidence, impact, remediation
6. **Remediation Priority Matrix**: Effort vs. impact for each fix

---

## Workflows

### Workflow 1: Quick Security Check (15 Minutes)

For pre-merge reviews or quick health checks:

1. Scan dependencies for high+ severity CVEs
2. Check for secrets in recent commits
3. Review HTTP security headers
4. **Decision**: If any critical or high findings, block the merge.

### Workflow 2: Full Penetration Test

**Day 1 — Reconnaissance:** Map attack surface, run automated scans, dependency audit, secret scan
**Day 2 — Manual Testing:** Auth/authz testing, injection points, business logic flaws, API-specific vulns
**Day 3 — Infrastructure and Reporting:** Cloud permissions, TLS, headers, port scan, compile findings, generate report

### Workflow 3: CI/CD Security Gate

Automated checks on every PR: secret scanning, dependency audit, SAST, security headers check.
**Gate Policy**: Block merge on critical/high findings. Warn on medium.

---

## Anti-Patterns

1. **Testing in production without authorization**
2. **Ignoring low-severity findings** — Low findings compound into critical exploit chains
3. **Relying solely on automated tools** — Tools miss business logic flaws
4. **One-time testing** — Security testing must be continuous
5. **Reporting without remediation guidance** — Every finding needs actionable fix steps
