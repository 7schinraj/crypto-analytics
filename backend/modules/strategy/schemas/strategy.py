from pydantic import BaseModel
from decimal import Decimal
from datetime import datetime

class StrategyRunResponse(BaseModel):
    status: str
    symbols_processed: int
    run_at: datetime

class StrategyResultSchema(BaseModel):
    symbol: str
    signal: str
    short_ma: Decimal
    long_ma: Decimal
    confidence_score: Decimal
    run_at: datetime

    model_config = {
        "from_attributes": True
    }
