from fastapi import APIRouter, Depends, HTTPException, status, Header
from typing import List, Optional
from datetime import datetime, timezone, timedelta
from uuid import UUID

from ..models.api_key_models import (
    CreateAPIKeyRequest, 
    APIKeyResponse, 
    APIKeyInfo,
    ClientApplicationItem
)
from ..auth import generate_new_api_key, verify_admin_secret, verify_api_key
from ..services.supabase_service import get_supabase_client, SupabaseService

router = APIRouter(prefix="/api/v1/auth", tags=["API Key Management"])

@router.get(
    "/clients",
    response_model=List[ClientApplicationItem],
    summary="List Registered Client Applications (Admin Protected)",
    description="Lists registered mobile apps and systems authorized to request API keys."
)
async def list_client_applications(
    is_admin: bool = Depends(verify_admin_secret),
    db: SupabaseService = Depends(get_supabase_client)
):
    return db.get_client_applications()

@router.post(
    "/keys",
    response_model=APIKeyResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Generate a New API Key (Admin Protected)",
    description="Generates a cryptographically secure API key for the Mobile Application or 3rd party clients. The raw key is returned only once."
)
async def create_api_key(
    payload: CreateAPIKeyRequest,
    is_admin: bool = Depends(verify_admin_secret),
    db: SupabaseService = Depends(get_supabase_client)
):
    raw_key, key_prefix, hashed_key = generate_new_api_key()

    expires_at = None
    if payload.expires_in_days:
        expires_at = datetime.now(timezone.utc) + timedelta(days=payload.expires_in_days)

    key_record = {
        "client_id": str(payload.client_id) if payload.client_id else None,
        "key_name": payload.key_name,
        "key_prefix": key_prefix,
        "hashed_key": hashed_key,
        "expires_at": expires_at.isoformat() if expires_at else None,
        "is_active": True,
        "rate_limit_rpm": payload.rate_limit_rpm or 120,
        "description": payload.description
    }

    created = db.create_api_key_record(key_record)
    if not created:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to persist API Key to Supabase."
        )

    return APIKeyResponse(
        id=UUID(created["id"]),
        client_id=UUID(created["client_id"]) if created.get("client_id") else None,
        key_name=created["key_name"],
        key_prefix=created["key_prefix"],
        raw_api_key=raw_key,
        created_at=created["created_at"],
        expires_at=created.get("expires_at"),
        is_active=created["is_active"],
        rate_limit_rpm=created["rate_limit_rpm"],
        message="API Key created successfully! Keep this key safe as it will not be displayed again."
    )

@router.get(
    "/keys",
    response_model=List[APIKeyInfo],
    summary="List All API Keys (Admin Protected)",
    description="Lists existing API keys with usage statistics, prefixes, and active statuses."
)
async def list_api_keys(
    is_admin: bool = Depends(verify_admin_secret),
    db: SupabaseService = Depends(get_supabase_client)
):
    keys = db.list_api_keys()
    return keys

@router.delete(
    "/keys/{key_id}",
    summary="Revoke / Deactivate API Key (Admin Protected)"
)
async def revoke_api_key(
    key_id: str,
    is_admin: bool = Depends(verify_admin_secret),
    db: SupabaseService = Depends(get_supabase_client)
):
    success = db.revoke_api_key(key_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"API key {key_id} not found or already deactivated."
        )
    return {"message": f"API key {key_id} has been revoked successfully.", "is_active": False}

@router.get(
    "/verify",
    summary="Verify Active API Key",
    description="Tests if the provided API Key is valid and active."
)
async def verify_key(
    key_info: dict = Depends(verify_api_key)
):
    return {
        "status": "valid",
        "key_name": key_info.get("key_name"),
        "key_prefix": key_info.get("key_prefix"),
        "expires_at": key_info.get("expires_at"),
        "rate_limit_rpm": key_info.get("rate_limit_rpm")
    }
