import datetime
from sqlalchemy import Column, Integer, String, DateTime, Numeric
from core.database import Base

class StrategyResult(Base):
    __tablename__ = "strategy_results"

    id = Column(Integer, primary_key=True, autoincrement=True)
    symbol = Column(String, index=True, nullable=False)
    signal = Column(String, nullable=False)  # "BUY", "SELL", "HOLD"
    short_ma = Column(Numeric(precision=20, scale=8), nullable=False)
    long_ma = Column(Numeric(precision=20, scale=8), nullable=False)
    confidence_score = Column(Numeric(precision=10, scale=4), nullable=False)
    run_at = Column(DateTime, default=datetime.datetime.utcnow, index=True, nullable=False)
