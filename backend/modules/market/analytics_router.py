import datetime
import numpy as np
import pandas as pd
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_async_db
from modules.market.models.market_snapshot import MarketSnapshot
from modules.market.schemas.market import AnalyticsResponseSchema

from modules.auth.dependencies import get_current_user

router = APIRouter(prefix="/analytics", tags=["Market Analytics"])

@router.get("", response_model=list[AnalyticsResponseSchema])
async def get_analytics(
    window_minutes: int = Query(default=60, description="Time window in minutes (options: 30, 60, 240, 1440)"),
    db: AsyncSession = Depends(get_async_db),
    current_user: str = Depends(get_current_user)
):
    """
    Computes pricing momentum analytics for all major crypto assets.
    Compares the latest market snapshot against a historical snapshot from 'window_minutes' ago.
    Uses pandas for high-performance data manipulation and ranking.
    """
    if window_minutes not in [30, 60, 240, 1440]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid window_minutes. Allowed options are: 30, 60, 240, 1440."
        )

    # Set up times with a 15-minute buffer to ensure we cover the target timestamp window
    now = datetime.datetime.utcnow()
    cutoff_time = now - datetime.timedelta(minutes=window_minutes + 15)

    # Step 1: Single async query to fetch snapshots in the window range
    stmt = (
        select(MarketSnapshot)
        .where(MarketSnapshot.timestamp >= cutoff_time)
        .order_by(MarketSnapshot.timestamp.asc())
    )
    result = await db.execute(stmt)
    snapshots = result.scalars().all()

    if not snapshots:
        return []

    # Step 2: Extract attributes to load into pandas DataFrame
    data = []
    for s in snapshots:
        data.append({
            "symbol": s.symbol,
            "price": float(s.price),
            "volume_24h": float(s.volume_24h),
            "timestamp": s.timestamp
        })

    df = pd.DataFrame(data)
    df["timestamp"] = pd.to_datetime(df["timestamp"])

    results = []
    target_time = now - datetime.timedelta(minutes=window_minutes)

    # Step 3: Compute momentum & changes per symbol group
    for symbol, group in df.groupby("symbol"):
        group = group.sort_values("timestamp")
        
        # Latest snapshot
        latest_row = group.iloc[-1]
        
        # Historical snapshot closest to target_time
        time_diffs = (group["timestamp"] - target_time).abs()
        old_row_idx = time_diffs.idxmin()
        old_row = group.loc[old_row_idx]

        price_change_pct = 0.0
        volume_change_pct = 0.0

        # Compute percentage modifications if multiple points are available
        if latest_row["timestamp"] != old_row["timestamp"]:
            current_price = latest_row["price"]
            old_price = old_row["price"]
            current_vol = latest_row["volume_24h"]
            old_vol = old_row["volume_24h"]

            if old_price > 0:
                price_change_pct = ((current_price - old_price) / old_price) * 100
            if old_vol > 0:
                volume_change_pct = ((current_vol - old_vol) / old_vol) * 100

        current_volume = latest_row["volume_24h"]
        log_volume = np.log(current_volume) if current_volume > 0 else 0.0
        momentum_score = price_change_pct * log_volume

        results.append({
            "symbol": symbol,
            "current_price": latest_row["price"],
            "price_change_pct": round(price_change_pct, 2),
            "volume_change_pct": round(volume_change_pct, 2),
            "momentum_score": round(momentum_score, 2),
            "window_minutes": window_minutes
        })

    if not results:
        return []

    # Step 4: Sort and Rank using pandas
    res_df = pd.DataFrame(results)
    # Sort by momentum score descending
    res_df = res_df.sort_values("momentum_score", ascending=False)
    # Assign Rank 1 to N
    res_df["rank"] = range(1, len(res_df) + 1)
    # Return sorted by rank ascending (default behavior)
    res_df = res_df.sort_values("rank", ascending=True)

    return res_df.to_dict(orient="records")
