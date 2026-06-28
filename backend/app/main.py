from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from app.config import settings
from app.api.v1.router import api_router

app = FastAPI(
    title=settings.app_name,
    description="AI-powered personal finance platform for Israeli households",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)


# Catch-all middleware to ensure errors return JSON (before CORS wraps it)
class CatchAllMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        try:
            return await call_next(request)
        except Exception:
            return JSONResponse(
                status_code=500,
                content={"detail": "שגיאה פנימית בשרת"},
            )


app.add_middleware(CatchAllMiddleware)

# CORS (added after CatchAll so it wraps it — middleware executes in reverse order)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Router
app.include_router(api_router, prefix="/api/v1")


@app.get("/health")
async def health_check():
    return {"status": "healthy", "app": settings.app_name, "version": "0.1.0"}


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": "שגיאה פנימית בשרת"},
    )
