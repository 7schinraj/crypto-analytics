from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from core.database import get_db
from modules.auth.schemas.user import UserSignup, UserLogin, Token
from modules.auth.services.auth_service import auth_service

from modules.auth.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/signup", status_code=status.HTTP_201_CREATED)
def signup(user_data: UserSignup, db: Session = Depends(get_db)):
    return auth_service.signup(db, user_data)

@router.post("/login", response_model=Token)
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    return auth_service.login(db, user_data)

@router.post("/logout")
def logout(current_user: str = Depends(get_current_user)):
    """
    Logout endpoint. Since JWT is stateless, the server simply acknowledges
    the logout request. Token invalidation is handled client-side.
    """
    return {"message": "Logged out successfully"}
