import datetime
from sqlalchemy import Column, Integer, String, DateTime, UniqueConstraint
from core.database import Base

class Watchlist(Base):
    __tablename__ = "watchlist"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_email = Column(String, nullable=False, index=True)
    symbol = Column(String, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    __table_args__ = (
        UniqueConstraint("user_email", "symbol", name="uq_user_email_symbol"),
    )
