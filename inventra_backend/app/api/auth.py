from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse, AuthResponse
from app.auth.password_handler import hash_password, verify_password
from app.auth.jwt_handler import create_access_token
from app.auth.dependencies import get_current_user
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(user: UserCreate, db: Session = Depends(get_db)):
    logger.info(f"Register request received for email: {user.email}, role: {user.role}")
    
    # Normalize email to lowercase
    normalized_email = user.email.lower()
    logger.info(f"Normalized email: {normalized_email}")
    
    existing_user = db.query(User).filter(User.email == normalized_email).first()
    if existing_user:
        logger.warning(f"Registration failed: Email already registered - {normalized_email}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    hashed_password = hash_password(user.password)
    logger.info(f"Password hashed successfully for {normalized_email}")
    
    db_user = User(
        full_name=user.full_name,
        email=normalized_email,
        password_hash=hashed_password,
        role=user.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    logger.info(f"User created successfully: id={db_user.id}, email={db_user.email}, role={db_user.role.value}")

    access_token = create_access_token(data={"sub": db_user.email, "role": db_user.role.value})
    logger.info(f"JWT token created for user: {db_user.email}")
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": db_user,
    }


@router.post("/login", response_model=AuthResponse)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Login endpoint - uses OAuth2 form data for Swagger compatibility.
    
    Note: form_data.username contains the email, form_data.password contains the password.
    """
    logger.info(f"Login request received for username: {form_data.username}")
    
    # Normalize email to lowercase
    normalized_email = form_data.username.lower()
    logger.info(f"Normalized email: {normalized_email}")
    
    user = db.query(User).filter(User.email == normalized_email).first()
    logger.info(f"User lookup result: {'Found' if user else 'Not found'} for email: {normalized_email}")
    
    if not user:
        logger.warning(f"Login failed: User not found for email: {normalized_email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    password_valid = verify_password(form_data.password, user.password_hash)
    logger.info(f"Password verification result: {password_valid} for email: {normalized_email}")
    
    if not password_valid:
        logger.warning(f"Login failed: Invalid password for email: {normalized_email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": user.email, "role": user.role.value})
    logger.info(f"Login successful for user: {user.email}, role: {user.role.value}")
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user,
    }


@router.get("/profile", response_model=UserResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    logger.info(f"Profile request for user: {current_user.email}")
    return current_user
