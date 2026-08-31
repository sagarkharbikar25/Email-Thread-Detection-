from datetime import datetime, timedelta, timezone
from typing import Optional, Union, Any
import hashlib
import hmac
import base64
import json
from app.core.config import settings

# Lightweight robust JWT & hashing utility with optional passlib/jose integration
try:
    from passlib.context import CryptContext
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        try:
            return pwd_context.verify(plain_password, hashed_password)
        except Exception:
            return verify_password_fallback(plain_password, hashed_password)

    def get_password_hash(password: str) -> str:
        try:
            return pwd_context.hash(password)
        except Exception:
            return get_password_hash_fallback(password)
            
except Exception:
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        return verify_password_fallback(plain_password, hashed_password)

    def get_password_hash(password: str) -> str:
        return get_password_hash_fallback(password)

def get_password_hash_fallback(password: str) -> str:
    salt = "sih2026_trace_salt"
    return "sha256$" + hashlib.sha256(f"{salt}{password}".encode()).hexdigest()

def verify_password_fallback(plain_password: str, hashed_password: str) -> bool:
    if hashed_password.startswith("sha256$"):
        return get_password_hash_fallback(plain_password) == hashed_password
    return False

try:
    from jose import jwt, JWTError
    def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.now(timezone.utc) + expires_delta
        else:
            expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        to_encode.update({"exp": expire})
        return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)

    def decode_access_token(token: str) -> Optional[dict]:
        try:
            payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
            return payload
        except JWTError:
            return None
except Exception:
    def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.now(timezone.utc) + expires_delta
        else:
            expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        to_encode.update({"exp": int(expire.timestamp())})
        
        header = base64.urlsafe_b64encode(json.dumps({"alg": "HS256", "typ": "JWT"}).encode()).decode().rstrip("=")
        payload = base64.urlsafe_b64encode(json.dumps(to_encode).encode()).decode().rstrip("=")
        signature = hmac.new(settings.JWT_SECRET_KEY.encode(), f"{header}.{payload}".encode(), hashlib.sha256).digest()
        sig_str = base64.urlsafe_b64encode(signature).decode().rstrip("=")
        return f"{header}.{payload}.{sig_str}"

    def decode_access_token(token: str) -> Optional[dict]:
        try:
            parts = token.split(".")
            if len(parts) != 3:
                return None
            header, payload, sig = parts
            expected_sig = hmac.new(settings.JWT_SECRET_KEY.encode(), f"{header}.{payload}".encode(), hashlib.sha256).digest()
            sig_calc = base64.urlsafe_b64encode(expected_sig).decode().rstrip("=")
            if not hmac.compare_digest(sig, sig_calc):
                return None
            padded_payload = payload + "=" * (-len(payload) % 4)
            data = json.loads(base64.urlsafe_b64decode(padded_payload).decode())
            if "exp" in data and datetime.now(timezone.utc).timestamp() > data["exp"]:
                return None
            return data
        except Exception:
            return None
