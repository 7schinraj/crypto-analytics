import httpx
from decimal import Decimal
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from core.logger import app_logger
from modules.market.models.crypto_asset import CryptoAsset
from modules.market.models.market_snapshot import MarketSnapshot

BINANCE_TICKER_URL = "https://api.binance.com/api/v3/ticker/24hr"

async def fetch_and_store_market_data(db: AsyncSession):
    """
    Fetches the latest market snapshots, prioritizing CoinGecko and falling back
    to Binance if CoinGecko fails (or is rate-limited) to ensure high resilience.
    """
    try:
        from modules.market.services.coingecko_service import fetch_and_store_coingecko_data
        cg_success = await fetch_and_store_coingecko_data(db)
        if cg_success:
            return
    except Exception as cg_err:
        app_logger.warning(f"Error executing CoinGecko primary fetch: {cg_err}")

    app_logger.info("CoinGecko fetch failed or was rate-limited. Falling back to Binance API...")
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.get(BINANCE_TICKER_URL)
            response.raise_for_status()
            tickers = response.json()
    except Exception as e:
        app_logger.error(f"Error fetching data from Binance API: {e}")
        return

    if not isinstance(tickers, list):
        app_logger.error(f"Unexpected response format from Binance API (expected list): {type(tickers)}")
        return

    # Filter to get only USDT pairs (e.g., BTCUSDT, ETHUSDT)
    usdt_tickers = [t for t in tickers if isinstance(t, dict) and t.get("symbol", "").endswith("USDT")]

    # Sort in descending order of quoteVolume and select top 10
    def get_quote_volume(t):
        try:
            return float(t.get("quoteVolume", 0.0))
        except (ValueError, TypeError):
            return 0.0

    top_usdt_tickers = sorted(usdt_tickers, key=get_quote_volume, reverse=True)[:10]
    app_logger.info(f"Top 10 USDT pairs found: {[t.get('symbol') for t in top_usdt_tickers]}")

    try:
        for ticker in top_usdt_tickers:
            symbol = ticker.get("symbol")
            if not symbol:
                continue

            # Check if CryptoAsset already exists
            stmt = select(CryptoAsset).where(CryptoAsset.symbol == symbol)
            result = await db.execute(stmt)
            asset = result.scalars().first()

            if not asset:
                # Deduce display name (e.g., BTC for BTCUSDT)
                name = symbol.replace("USDT", "")
                asset = CryptoAsset(symbol=symbol, name=name)
                db.add(asset)
                # Flush to generate the database auto-increment ID for asset_id mapping
                await db.flush()
                app_logger.info(f"Registered new CryptoAsset: {symbol} ({name})")

            # Parse numeric fields safely
            try:
                price = Decimal(ticker.get("lastPrice", "0.0"))
                volume_24h = Decimal(ticker.get("volume", "0.0"))
                price_change_percent_24h = Decimal(ticker.get("priceChangePercent", "0.0"))
                high_24h = Decimal(ticker.get("highPrice", "0.0"))
                low_24h = Decimal(ticker.get("lowPrice", "0.0"))
                quote_volume = Decimal(ticker.get("quoteVolume", "0.0"))
            except Exception as parse_err:
                app_logger.warning(f"Failed to parse numeric data for {symbol}: {parse_err}")
                continue

            # Create market snapshot record
            snapshot = MarketSnapshot(
                asset_id=asset.id,
                symbol=symbol,
                price=price,
                volume_24h=volume_24h,
                price_change_percent_24h=price_change_percent_24h,
                high_24h=high_24h,
                low_24h=low_24h,
                quote_volume=quote_volume
            )
            db.add(snapshot)

        # Commit all stored data at once
        await db.commit()
        app_logger.info("Successfully fetched and stored top 10 USDT market snapshots.")

    except Exception as db_err:
        await db.rollback()
        app_logger.error(f"Database error while storing market snapshots: {db_err}")
        raise db_err
