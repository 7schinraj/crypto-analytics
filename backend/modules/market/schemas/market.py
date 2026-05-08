from pydantic import BaseModel
from decimal import Decimal
from datetime import datetime

class MarketSnapshotSchema(BaseModel):
    symbol: str
    price: Decimal
    volume_24h: Decimal
    price_change_percent_24h: Decimal
    high_24h: Decimal
    low_24h: Decimal
    timestamp: datetime

    model_config = {
        "from_attributes": True
    }

class PriceResponseSchema(BaseModel):
    symbol: str
    price: Decimal
    timestamp: datetime

    model_config = {
        "from_attributes": True
    }

class HistoryResponseSchema(BaseModel):
    symbol: str
    price: Decimal
    volume_24h: Decimal
    timestamp: datetime

    model_config = {
        "from_attributes": True
    }

class AnalyticsResponseSchema(BaseModel):
    symbol: str
    current_price: Decimal
    price_change_pct: float
    volume_change_pct: float
    momentum_score: float
    rank: int
    window_minutes: int

    model_config = {
        "from_attributes": True
    }


class WatchlistToggleSchema(BaseModel):
    symbol: str

