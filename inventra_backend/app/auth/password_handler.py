from passlib.context import CryptContext
import logging

logger = logging.getLogger(__name__)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    logger.info(f"Hashing password for user")
    if isinstance(password, str):
        password = password.encode('utf-8')
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    logger.info(f"Verifying password")
    if isinstance(plain_password, str):
        plain_password = plain_password.encode('utf-8')
    result = pwd_context.verify(plain_password, hashed_password)
    logger.info(f"Password verification result: {result}")
    return result
