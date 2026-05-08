from apscheduler.schedulers.asyncio import AsyncIOScheduler
from core.database import AsyncSessionLocal
from modules.market.services.binance_service import fetch_and_store_market_data
from core.logger import app_logger

scheduler = AsyncIOScheduler()

async def scheduled_fetch_job():
    """
    Background job wrapper that instantiates an AsyncSession and triggers
    the Binance fetch and store service.
    """
    app_logger.info("Executing scheduled market data fetch and store job...")
    async with AsyncSessionLocal() as db:
        try:
            await fetch_and_store_market_data(db)
        except Exception as e:
            app_logger.error(f"Error in scheduled market data fetch job: {e}")

def start_scheduler():
    """
    Adds the interval job and starts the scheduler if not already running.
    """
    if not scheduler.running:
        scheduler.add_job(
            scheduled_fetch_job,
            "interval",
            minutes=5,
            id="binance_market_data_job",
            replace_existing=True
        )
        scheduler.start()
        app_logger.info("APScheduler background task runner started (interval: 5 minutes).")
    else:
        app_logger.warning("APScheduler is already running.")

def shutdown_scheduler():
    """
    Shuts down the scheduler if it is currently running.
    """
    if scheduler.running:
        scheduler.shutdown()
        app_logger.info("APScheduler background task runner stopped.")
    else:
        app_logger.warning("APScheduler was not running.")
