from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from uuid import UUID

class CreateAPIKeyRequest(BaseModel):
    key_name: str = Field(..., example="D-Mind Mobile App - Production", description="Human-readable label for key")
    description: Optional[str] = Field(None, example="Main API key for mobile application telemetry feed")
    expires_in_days: Optional[int] = Field(None, example=365, description="Expiry duration in days (null for never expires)")
    rate_limit_rpm: Optional[int] = Field(120, example=120, description="Rate limit in requests per minute")

class APIKeyResponse(BaseModel):
    id: UUID
    key_name: str
    key_prefix: str
    raw_api_key: str = Field(..., description="The complete secret API key. Store this securely as it cannot be retrieved again.")
    created_at: datetime
    expires_at: Optional[datetime]
    is_active: bool
    rate_limit_rpm: int
    message: str = "API Key successfully created. Please save this key now."

class APIKeyInfo(BaseModel):
    id: UUID
    key_name: str
    key_prefix: str
    created_at: datetime
    expires_at: Optional[datetime]
    is_active: bool
    rate_limit_rpm: int
    description: Optional[str]
    last_used_at: Optional[datetime]
    total_requests: int
