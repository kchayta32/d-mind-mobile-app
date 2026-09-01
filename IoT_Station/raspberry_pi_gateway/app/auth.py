import os
import hashlib
import secrets
import base64
from datetime import datetime, timezone, timedelta
from typing import Optional, Tuple, Dict, Any
from fastapi import Header, HTTPException, Security, status, Depends
from fastapi.security import APIKeyHeader
from .config import get_settings
from .services.supabase_service import get_supabase_client, SupabaseService

# Header schemes
API_KEY_HEADER = APIKeyHeader(name="X-API-Key", auto_error=False)
ADMIN_KEY_HEADER = APIKeyHeader(name="X-Admin-Secret", auto_error=False)

def hash_api_key(raw_key: str) -> str:
    """Computes SHA-256 hash of API key for safe database storage"""
    return hashlib.sha256(raw_key.encode("utf-8")).hexdigest()

def generate_new_api_key() -> Tuple[str, str, str]:
    """
    Generates a secure API key.
    Returns: (raw_api_key, key_prefix, hashed_key)
    """
    # 32 random bytes encoded to base64url
    random_bytes = secrets.token_urlsafe(32)
    raw_key = f"dmind_live_{random_bytes}"
    key_prefix = raw_key[:14] # e.g. "dmind_live_a1B"
    hashed = hash_api_key(raw_key)
    return raw_key, key_prefix, hashed

async def verify_admin_secret(
    x_admin_secret: Optional[str] = Security(ADMIN_KEY_HEADER)
) -> bool:
    """Protects admin endpoints such as creating/revoking API keys"""
    settings = get_settings()
    if not x_admin_secret or not secrets.compare_digest(x_admin_secret, settings.ADMIN_SECRET_KEY):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing X-Admin-Secret header. Admin authorization required."
        )
    return True

async def verify_api_key(
    x_api_key: Optional[str] = Security(API_KEY_HEADER),
    authorization: Optional[str] = Header(None)
) -> Dict[str, Any]:
    """
    FastAPI dependency that validates incoming requests from Mobile Application.
    Supports either:
    1. Header `X-API-Key: dmind_live_xxxx...`
    2. Header `Authorization: Bearer dmind_live_xxxx...`
    """
    api_key = x_api_key
    if not api_key and authorization and authorization.startswith("Bearer "):
        api_key = authorization.replace("Bearer ", "").strip()

    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing API Key. Please provide 'X-API-Key' header or 'Authorization: Bearer <key>'."
        )

    # Hash incoming key and query database
    hashed = hash_api_key(api_key)
    db: SupabaseService = get_supabase_client()
    key_record = db.get_api_key_by_hash(hashed)

    if not key_record:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API Key or key has been revoked."
        )

    if not key_record.get("is_active", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="API Key is disabled / revoked."
        )

    # Check expiration
    expires_at_str = key_record.get("expires_at")
    if expires_at_str:
        try:
            expires_at = datetime.fromisoformat(expires_at_str.replace("Z", "+00:00"))
            if datetime.now(timezone.utc) > expires_at:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="API Key has expired."
                )
        except Exception:
            pass

    # Touch usage timestamp in background
    db.touch_api_key_usage(str(key_record["id"]))

    return key_record
