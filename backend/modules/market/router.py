from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func, delete
from sqlalchemy.future import select

from core.database import get_async_db
from modules.market.models.market_snapshot import MarketSnapshot
from modules.market.models.watchlist import Watchlist
from modules.market.schemas.market import (
    MarketSnapshotSchema,
    PriceResponseSchema,
    HistoryResponseSchema,
    WatchlistToggleSchema
)
from modules.auth.dependencies import get_current_user

router = APIRouter(prefix="/markets", tags=["Markets & Prices"])

@router.get("", response_model=list[MarketSnapshotSchema])
async def get_markets(
    db: AsyncSession = Depends(get_async_db),
    current_user: str = Depends(get_current_user)
):
    """
    Get the latest market snapshot for each of the top 10 cryptocurrency symbols.
    Uses a subquery to resolve the latest snapshot by finding the maximum timestamp per symbol.
    """
    # Subquery: get max timestamp grouped by symbol
    subq = (
        select(
            MarketSnapshot.symbol,
            func.max(MarketSnapshot.timestamp).label("max_ts")
        )
        .group_by(MarketSnapshot.symbol)
        .subquery()
    )

    # Join with main table to filter only the rows matching the max timestamp per symbol
    stmt = (
        select(MarketSnapshot)
        .join(
            subq,
            (MarketSnapshot.symbol == subq.c.symbol) &
            (MarketSnapshot.timestamp == subq.c.max_ts)
        )
        .order_by(MarketSnapshot.quote_volume.desc())
        .limit(10)
    )

    result = await db.execute(stmt)
    snapshots = result.scalars().all()
    return snapshots

@router.get("/prices", response_model=PriceResponseSchema)
async def get_price(
    symbol: str = Query(..., description="The asset symbol, e.g., BTCUSDT"),
    db: AsyncSession = Depends(get_async_db),
    current_user: str = Depends(get_current_user)
):
    """
    Get the latest price and timestamp for a specific cryptocurrency symbol.
    """
    stmt = (
        select(MarketSnapshot)
        .where(MarketSnapshot.symbol == symbol.upper())
        .order_by(MarketSnapshot.timestamp.desc())
        .limit(1)
    )
    result = await db.execute(stmt)
    snapshot = result.scalars().first()

    if not snapshot:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Market data for symbol '{symbol}' was not found in the database."
        )
    return snapshot

@router.get("/history", response_model=list[HistoryResponseSchema])
async def get_history(
    symbol: str = Query(..., description="The asset symbol, e.g., BTCUSDT"),
    limit: int = Query(default=100, ge=1, le=500, description="The maximum number of historic rows to return (1-500)"),
    db: AsyncSession = Depends(get_async_db),
    current_user: str = Depends(get_current_user)
):
    """
    Get the historical market snapshots for a specific symbol, ordered by timestamp in descending order.
    """
    stmt = (
        select(MarketSnapshot)
        .where(MarketSnapshot.symbol == symbol.upper())
        .order_by(MarketSnapshot.timestamp.desc())
        .limit(limit)
    )
    result = await db.execute(stmt)
    snapshots = result.scalars().all()
    return snapshots

@router.post("/ingest", status_code=status.HTTP_200_OK)
async def trigger_manual_ingest(
    db: AsyncSession = Depends(get_async_db),
    current_user: str = Depends(get_current_user)
):
    """
    Triggers manual market data ingestion immediately from CoinGecko (with Binance fallback).
    Requires a valid JWT token.
    """
    try:
        from modules.market.services.binance_service import fetch_and_store_market_data
        await fetch_and_store_market_data(db)
        return {"status": "success", "message": "Market data ingestion completed successfully."}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to execute manual market data ingestion: {e}"
        )


@router.get("/watchlist", response_model=list[str])
async def get_watchlist(
    db: AsyncSession = Depends(get_async_db),
    current_user: str = Depends(get_current_user)
):
    """
    Get the list of all cryptocurrency symbols favorited/watched by the logged-in user.
    """
    stmt = select(Watchlist.symbol).where(Watchlist.user_email == current_user)
    result = await db.execute(stmt)
    symbols = result.scalars().all()
    return list(symbols)


@router.post("/watchlist/toggle", status_code=status.HTTP_200_OK)
async def toggle_watchlist(
    data: WatchlistToggleSchema,
    db: AsyncSession = Depends(get_async_db),
    current_user: str = Depends(get_current_user)
):
    """
    Add or remove a cryptocurrency symbol from the logged-in user's watchlist.
    """
    symbol_upper = data.symbol.upper()
    # Check if exists
    stmt = select(Watchlist).where(
        (Watchlist.user_email == current_user) &
        (Watchlist.symbol == symbol_upper)
    )
    result = await db.execute(stmt)
    existing = result.scalars().first()

    if existing:
        # Delete it
        delete_stmt = delete(Watchlist).where(
            (Watchlist.user_email == current_user) &
            (Watchlist.symbol == symbol_upper)
        )
        await db.execute(delete_stmt)
        await db.commit()
        return {"symbol": symbol_upper, "status": "removed"}
    else:
        # Add it
        new_item = Watchlist(user_email=current_user, symbol=symbol_upper)
        db.add(new_item)
        await db.commit()
        return {"symbol": symbol_upper, "status": "added"}
