from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func
from sqlalchemy.future import select

from core.database import get_async_db
from modules.strategy.models.strategy_result import StrategyResult
from modules.strategy.engine import strategy_engine
from modules.strategy.schemas.strategy import StrategyRunResponse, StrategyResultSchema
from modules.auth.dependencies import get_current_user

router = APIRouter(prefix="/strategy", tags=["Trading Strategy"])

@router.post("/run", response_model=StrategyRunResponse, status_code=status.HTTP_201_CREATED)
async def run_strategy(
    db: AsyncSession = Depends(get_async_db),
    current_user: str = Depends(get_current_user)
):
    """
    Triggers the Moving Average Crossover strategy calculations on all tracked crypto symbols.
    Calculates moving averages, evaluates trade signals (BUY/SELL/HOLD), and saves them to the DB.
    """
    try:
        results = await strategy_engine.run(db, strategy_key="ma_crossover")
        symbols_count = len(results)
        
        # If no assets exist in DB yet
        if symbols_count == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No historical market snapshots found in the database. Please ingest some ticker data first."
            )
            
        # Get run timestamp from the first record if available, else current UTC
        run_at = results[0].run_at if symbols_count > 0 else func.now()
        
        return {
            "status": "completed",
            "symbols_processed": symbols_count,
            "run_at": run_at
        }
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred while executing strategy engine: {e}"
        )

@router.get("/results", response_model=list[StrategyResultSchema])
async def get_strategy_results(
    symbol: str = Query(None, description="Optional crypto symbol to filter results, e.g., BTCUSDT"),
    db: AsyncSession = Depends(get_async_db),
    current_user: str = Depends(get_current_user)
):
    """
    Retrieves the latest strategy recommendation results.
    If 'symbol' is provided, returns the latest result for that specific token.
    Otherwise, returns the latest recommendation result for each of the tracked symbols.
    """
    # Create subquery for maximum run_at grouped by symbol
    subq = (
        select(
            StrategyResult.symbol,
            func.max(StrategyResult.run_at).label("max_run_at")
        )
        .group_by(StrategyResult.symbol)
        .subquery()
    )

    # Join the primary table with the subquery
    stmt = select(StrategyResult).join(
        subq,
        (StrategyResult.symbol == subq.c.symbol) &
        (StrategyResult.run_at == subq.c.max_run_at)
    )

    # Apply optional filter if symbol parameter is supplied
    if symbol:
        stmt = stmt.where(StrategyResult.symbol == symbol.upper())

    result = await db.execute(stmt)
    results = result.scalars().all()
    return results
