import abc
import datetime
import numpy as np
from decimal import Decimal
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from core.logger import app_logger
from modules.market.models.market_snapshot import MarketSnapshot
from modules.strategy.models.strategy_result import StrategyResult

class BaseStrategy(abc.ABC):
    """
    Abstract base class for trading strategies.
    Ensures easy extensibility for future analytic strategies.
    """
    @abc.abstractmethod
    def get_name(self) -> str:
        pass

    @abc.abstractmethod
    def analyze(self, symbol: str, prices: list[float]) -> dict:
        """
        Analyzes historical prices for a symbol.
        Prices are ordered chronologically (oldest at index 0, newest at index -1).
        Returns a dict with: 'signal' (BUY/SELL/HOLD), 'short_ma', 'long_ma', and 'confidence_score'.
        """
        pass

class MovingAverageCrossover(BaseStrategy):
    """
    Moving Average Crossover trading strategy implementation.
    """
    def get_name(self) -> str:
        return "Moving Average Crossover"

    def analyze(self, symbol: str, prices: list[float]) -> dict:
        n = len(prices)
        if n < 10:
            app_logger.warning(
                f"Fewer than 10 prices found for {symbol} (got {n}). "
                f"Returning neutral HOLD signal."
            )
            return {
                "signal": "HOLD",
                "short_ma": 0.0,
                "long_ma": 0.0,
                "confidence_score": 0.0
            }

        # Calculate long MA (up to 50 prices, representing all available)
        long_ma = float(np.mean(prices))

        # Calculate short MA (exactly last 10 prices)
        short_ma = float(np.mean(prices[-10:]))

        # Signal logic:
        # - short_ma > long_ma * 1.01 -> BUY
        # - short_ma < long_ma * 0.99 -> SELL
        # - else -> HOLD
        if short_ma > long_ma * 1.01:
            signal = "BUY"
        elif short_ma < long_ma * 0.99:
            signal = "SELL"
        else:
            signal = "HOLD"

        # Confidence score: percentage diff relative to long_ma
        confidence_score = 0.0
        if long_ma > 0:
            confidence_score = abs((short_ma - long_ma) / long_ma) * 100

        return {
            "signal": signal,
            "short_ma": short_ma,
            "long_ma": long_ma,
            "confidence_score": confidence_score
        }

class StrategyEngine:
    """
    Engine to orchestrate loading, evaluating, and storing strategy metrics.
    """
    def __init__(self):
        # Register strategy instances
        self._strategies = {
            "ma_crossover": MovingAverageCrossover()
        }

    async def run(self, db: AsyncSession, strategy_key: str = "ma_crossover") -> list[StrategyResult]:
        """
        Runs the registered strategy for all unique symbols.
        Fetches up to 50 snapshots for each, runs computations, and persists the results.
        """
        strategy = self._strategies.get(strategy_key)
        if not strategy:
            raise ValueError(f"Strategy with key '{strategy_key}' is not registered.")

        app_logger.info(f"Executing strategy: '{strategy.get_name()}'")

        # Get unique list of symbols we have snapshots for
        stmt_symbols = select(MarketSnapshot.symbol).distinct()
        res_symbols = await db.execute(stmt_symbols)
        symbols = res_symbols.scalars().all()

        results = []
        run_at = datetime.datetime.utcnow()

        for symbol in symbols:
            # Query last 50 snapshots (descending)
            stmt_prices = (
                select(MarketSnapshot.price)
                .where(MarketSnapshot.symbol == symbol)
                .order_by(MarketSnapshot.timestamp.desc())
                .limit(50)
            )
            res_prices = await db.execute(stmt_prices)
            # Reverse list to ensure chronological order (oldest first, newest last)
            prices = [float(p) for p in res_prices.scalars().all()]
            prices.reverse()

            if not prices:
                continue

            analysis = strategy.analyze(symbol, prices)

            # Create DB entity
            result_obj = StrategyResult(
                symbol=symbol,
                signal=analysis["signal"],
                short_ma=Decimal(str(analysis["short_ma"])),
                long_ma=Decimal(str(analysis["long_ma"])),
                confidence_score=Decimal(str(analysis["confidence_score"])),
                run_at=run_at
            )
            db.add(result_obj)
            results.append(result_obj)

        await db.commit()
        app_logger.info(f"Strategy evaluation completed. {len(results)} symbols processed.")
        return results

# Shared global strategy engine instance
strategy_engine = StrategyEngine()
