from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
import time
import logging
from collections import defaultdict
from app.config import settings
from app.api.v1.router import api_router

# Structured logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("maazan.security")

app = FastAPI(
    title=settings.app_name,
    description="AI-powered personal finance platform for Israeli households",
    version="0.1.0",
    # Disable docs in production
    docs_url="/docs" if not settings.is_production else None,
    redoc_url="/redoc" if not settings.is_production else None,
    openapi_url="/openapi.json" if not settings.is_production else None,
)


# ── 1. Security Headers Middleware ──
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "0"  # Modern CSP-based approach
        response.headers["Strict-Transport-Security"] = (
            "max-age=31536000; includeSubDomains; preload"
        )
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = (
            "camera=(), microphone=(), geolocation=(), payment=(self)"
        )
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; frame-ancestors 'none'"
        )
        # Remove server header
        if "server" in response.headers:
            del response.headers["server"]
        return response


# ── 2. Rate Limiting Middleware ──
class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app):
        super().__init__(app)
        self.requests: dict = defaultdict(list)

    async def dispatch(self, request: Request, call_next):
        client_ip = request.client.host if request.client else "unknown"
        path = request.url.path
        now = time.time()

        # Determine limit based on path
        is_auth = "/auth/" in path
        window = 60  # 1 minute
        max_requests = (
            settings.auth_rate_limit_per_minute
            if is_auth
            else settings.rate_limit_per_minute
        )

        # Clean old entries
        key = f"{client_ip}:{path}" if is_auth else client_ip
        self.requests[key] = [t for t in self.requests[key] if now - t < window]

        if len(self.requests[key]) >= max_requests:
            logger.warning(
                f"Rate limit exceeded: ip={client_ip} path={path} "
                f"count={len(self.requests[key])}"
            )
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={"detail": "יותר מדי בקשות. נסה שוב מאוחר יותר."},
                headers={"Retry-After": str(window)},
            )

        self.requests[key].append(now)
        response = await call_next(request)
        return response


# ── 3. Request Size Limit Middleware ──
class RequestSizeLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        content_length = request.headers.get("content-length")
        if content_length and int(content_length) > settings.max_request_size:
            return JSONResponse(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                content={"detail": "הבקשה גדולה מדי"},
            )
        return await call_next(request)


# ── 4. Audit Logging Middleware ──
class AuditLogMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        response = await call_next(request)
        duration = time.time() - start_time

        # Log auth-related requests
        path = request.url.path
        if "/auth/" in path or response.status_code >= 400:
            client_ip = request.client.host if request.client else "unknown"
            logger.info(
                f"audit: method={request.method} path={path} "
                f"status={response.status_code} ip={client_ip} "
                f"duration={duration:.3f}s"
            )

        return response


# ── 5. Catch-All Error Handler ──
class CatchAllMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        try:
            return await call_next(request)
        except Exception as e:
            logger.error(
                f"Unhandled error: {type(e).__name__}: {e}",
                exc_info=not settings.is_production,
            )
            return JSONResponse(
                status_code=500,
                content={"detail": "שגיאה פנימית בשרת"},
            )


# Register middleware (last added = outermost = processes first)
app.add_middleware(CatchAllMiddleware)
app.add_middleware(AuditLogMiddleware)
app.add_middleware(RequestSizeLimitMiddleware)
app.add_middleware(RateLimitMiddleware)
app.add_middleware(SecurityHeadersMiddleware)
# CORS must be LAST so it's the outermost wrapper — handles preflight
# and adds headers to ALL responses including errors from inner middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept"],
    max_age=600,
)

# API Router
app.include_router(api_router, prefix="/api/v1")


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global handler: {type(exc).__name__}", exc_info=not settings.is_production)
    return JSONResponse(
        status_code=500,
        content={"detail": "שגיאה פנימית בשרת"},
    )
