# API Security Hardening

Protect REST APIs against common vulnerabilities with multiple security layers.

## Security Middleware Stack (FastAPI / Python)

```python
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
import time

app = FastAPI()

# CORS — restrict to allowed origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://yourdomain.com"],  # Never use ["*"] in production
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)

# Security headers middleware
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Content-Security-Policy"] = "default-src 'self'"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
        return response

app.add_middleware(SecurityHeadersMiddleware)

# Rate limiting middleware
class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, max_requests: int = 100, window_seconds: int = 900):
        super().__init__(app)
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.requests: dict = {}

    async def dispatch(self, request: Request, call_next):
        client_ip = request.client.host if request.client else "unknown"
        now = time.time()
        # Clean old entries
        self.requests = {
            k: v for k, v in self.requests.items()
            if now - v["start"] < self.window_seconds
        }
        if client_ip in self.requests:
            if self.requests[client_ip]["count"] >= self.max_requests:
                return Response(status_code=429, content="Too Many Requests")
            self.requests[client_ip]["count"] += 1
        else:
            self.requests[client_ip] = {"count": 1, "start": now}
        return await call_next(request)

app.add_middleware(RateLimitMiddleware, max_requests=100, window_seconds=900)
```

## Input Validation (Pydantic)

```python
from pydantic import BaseModel, EmailStr, Field, validator
import re

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    name: str = Field(min_length=1, max_length=100)

    @validator("password")
    def password_strength(cls, v):
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain uppercase letter")
        if not re.search(r"[0-9]", v):
            raise ValueError("Password must contain digit")
        if not re.search(r"[!@#$%^&*]", v):
            raise ValueError("Password must contain special character")
        return v

    @validator("name")
    def sanitize_name(cls, v):
        # Strip HTML tags
        return re.sub(r"<[^>]+>", "", v).strip()
```

## Security Headers

```
Content-Security-Policy: default-src 'self'
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

## Security Checklist

- [ ] HTTPS everywhere
- [ ] Authentication on all protected routes
- [ ] Input validation and sanitization on all endpoints
- [ ] Rate limiting enabled (especially auth endpoints)
- [ ] Security headers configured
- [ ] CORS restricted to allowed origins only
- [ ] No stack traces in production errors
- [ ] Audit logging enabled for auth events
- [ ] Dependencies regularly updated
- [ ] JWT tokens have short expiry (15-30 min)
- [ ] Refresh tokens are rotatable and revocable
- [ ] File uploads validated (type, size, content)
- [ ] Database queries use parameterized statements (ORM)
- [ ] Sensitive data encrypted at rest
- [ ] API versioning enforced
- [ ] Error responses are generic (no internal details)

## Nginx SSL/TLS Configuration

```nginx
server {
    listen 443 ssl http2;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;
    add_header Strict-Transport-Security "max-age=63072000" always;
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
}
```

## Never Do

- Trust user input without validation
- Return detailed errors in production
- Store secrets in code
- Use GET for state-changing operations
- Disable security for convenience
- Use wildcard CORS (`*`) with credentials
- Store passwords in plain text or reversible encryption
- Log sensitive data (passwords, tokens, PII)
