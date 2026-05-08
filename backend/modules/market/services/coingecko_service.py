import httpx
from decimal import Decimal
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from core.logger import app_logger
from modules.market.models.crypto_asset import CryptoAsset
from modules.market.models.market_snapshot import MarketSnapshot

COINGECKO_MARKETS_URL = "https://api.coingecko.com/api/v3/coins/markets"

async def fetch_and_store_coingecko_data(db: AsyncSession) -> bool:
    """
    Fetches the latest market statistics from CoinGecko, converts symbols to match
    our 'USDT' pairs convention (e.g. BTC -> BTCUSDT), registers new assets, and persists snapshots.
    Returns True on success, False otherwise.
    """
    app_logger.info("Attempting to fetch market data from CoinGecko API...")
    
    params = {
        "vs_currency": "usd",
        "order": "market_cap_desc",
        "per_page": 10,
        "page": 1,
        "sparkline": "false"
    }

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.get(COINGECKO_MARKETS_URL, params=params)
            response.raise_for_status()
            coins = response.json()
    except Exception as e:
        app_logger.warning(f"Failed to fetch data from CoinGecko API: {e}")
        return False

    if not isinstance(coins, list):
        app_logger.warning(f"Unexpected response format from CoinGecko API: {type(coins)}")
        return False

    try:
        for coin in coins:
            cg_symbol = coin.get("symbol")
            if not cg_symbol:
                continue
                
            # Normalize symbol to USDT pairs convention to maintain database schema integrity
            symbol = f"{cg_symbol.upper()}USDT"

            # Check if CryptoAsset already exists in DB
            stmt = select(CryptoAsset).where(CryptoAsset.symbol == symbol)
            result = await db.execute(stmt)
            asset = result.scalars().first()

            if not asset:
                name = symbol.replace("USDT", "")
                asset = CryptoAsset(symbol=symbol, name=name)
                db.add(asset)
                # Flush to generate the database auto-increment ID for asset_id mapping
                await db.flush()
                app_logger.info(f"Registered new CryptoAsset (via CoinGecko): {symbol}")

            # Safely extract and parse numerical fields
            try:
                price = Decimal(str(coin.get("current_price") or "0.0"))
                volume_24h = Decimal(str(coin.get("total_volume") or "0.0"))
                price_change_percent_24h = Decimal(str(coin.get("price_change_percentage_24h") or "0.0"))
                high_24h = Decimal(str(coin.get("high_24h") or "0.0"))
                low_24h = Decimal(str(coin.get("low_24h") or "0.0"))
                
                # Compute approximate quote volume (price * base_volume) as CoinGecko doesn't have direct USDT quoteVolume
                quote_volume = price * volume_24h
            except Exception as parse_err:
                app_logger.warning(f"Failed to parse CoinGecko numeric data for {symbol}: {parse_err}")
                continue

            # Add market snapshot record
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

        await db.commit()
        app_logger.info("Successfully fetched and stored top 10 market snapshots from CoinGecko.")
        return True

    except Exception as db_err:
        await db.rollback()
        app_logger.error(f"Database error while storing CoinGecko snapshots: {db_err}")
        return False
