from fastapi import APIRouter
from app.api.v1.auth import router as auth_router
from app.api.v1.finance import router as finance_router
from app.api.v1.bank import router as bank_router
from app.api.v1.ai import router as ai_router

api_router = APIRouter()
api_router.include_router(auth_router)
api_router.include_router(finance_router)
api_router.include_router(bank_router)
api_router.include_router(ai_router)


@api_router.get("/")
async def api_root():
    return {
        "name": "מאזן API",
        "version": "0.1.0",
        "status": "operational",
    }
