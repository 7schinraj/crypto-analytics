from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from modules.auth.schemas.user import UserSignup, UserLogin, Token
from modules.auth.models.user import User
from modules.auth.repositories.user_repo import UserRepository
from modules.auth.utils.security import get_password_hash, verify_password, create_access_token
from core.config import settings
from datetime import timedelta
from core.logger import app_logger

class AuthService:
    def __init__(self):
        self.repo = UserRepository()

    def signup(self, db: Session, user_data: UserSignup):
        db_user = self.repo.get_user_by_email(db, email=user_data.email)
        if db_user:
            app_logger.warning(f"Signup attempt failed: Email already registered ({user_data.email})")
            raise HTTPException(status_code=400, detail="Email already registered")
        
        hashed_password = get_password_hash(user_data.password)
        new_user = User(
            username=user_data.username,
            email=user_data.email,
            hashed_password=hashed_password
        )
        self.repo.create_user(db, new_user)
        app_logger.info(f"New user signed up successfully: {user_data.email}")
        return {"message": "User created successfully"}

    def login(self, db: Session, user_data: UserLogin) -> Token:
        user = self.repo.get_user_by_email(db, email=user_data.email)
        if not user:
            app_logger.warning(f"Login failed: Unregistered email attempt ({user_data.email})")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Account doesn't exist. Please register"
            )
        
        if not verify_password(user_data.password, user.hashed_password):
            app_logger.warning(f"Login failed: Invalid password attempt for user ({user_data.email})")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid Password. Please try again"
            )
        
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.email}, expires_delta=access_token_expires
        )
        app_logger.info(f"User logged in successfully: {user.email}")
        return Token(access_token=access_token, token_type="bearer")

auth_service = AuthService()
