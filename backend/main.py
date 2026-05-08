from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.config import settings

from core.database import engine, Base
from modules.auth.router import router as auth_router
from modules.market.router import router as market_router
from modules.market.analytics_router import router as analytics_router
from modules.strategy.router import router as strategy_router
from core.logger import app_logger
from scheduler import start_scheduler, shutdown_scheduler, scheduled_fetch_job

@asynccontextmanager
async def lifespan(app: FastAPI):
    # On app startup:
    app_logger.info("Application startup: executing initial market data fetch...")
    try:
        await scheduled_fetch_job()
    except Exception as e:
        app_logger.error(f"Failed to execute initial startup fetch: {e}")

    # Start background scheduler
    start_scheduler()

    yield

    # On app shutdown:
    app_logger.info("Application shutdown: stopping scheduler...")
    shutdown_scheduler()

app = FastAPI(title=settings.APP_NAME, lifespan=lifespan)
app_logger.info(f"Starting {settings.APP_NAME}...")

# ── CORS — allow React dev server (and production origin) ─────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",   # Vite dev server
        "http://127.0.0.1:5173",
        "http://localhost:5174",   # Vite alternative dev server
        "http://127.0.0.1:5174",
        "http://localhost:3000",   # fallback
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(market_router)
app.include_router(analytics_router)
app.include_router(strategy_router)

@app.get("/health")
async def health_check():
    return {"status": "healthy", "app": settings.APP_NAME}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
