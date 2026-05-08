import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Numeric
from sqlalchemy.orm import relationship
from core.database import Base

class MarketSnapshot(Base):
    __tablename__ = "market_snapshots"

    id = Column(Integer, primary_key=True, autoincrement=True)
    asset_id = Column(Integer, ForeignKey("crypto_assets.id", ondelete="CASCADE"), nullable=False)
    symbol = Column(String, index=True, nullable=False)
    price = Column(Numeric(precision=20, scale=8), nullable=False)
    volume_24h = Column(Numeric(precision=20, scale=8), nullable=False)
    price_change_percent_24h = Column(Numeric(precision=10, scale=4), nullable=False)
    high_24h = Column(Numeric(precision=20, scale=8), nullable=False)
    low_24h = Column(Numeric(precision=20, scale=8), nullable=False)
    quote_volume = Column(Numeric(precision=20, scale=8), nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True, nullable=False)

    asset = relationship("CryptoAsset", back_populates="snapshots")
