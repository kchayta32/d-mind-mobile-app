from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from uuid import UUID

class CreateAPIKeyRequest(BaseModel):
    client_id: Optional[UUID] = Field(None, example="d1111111-1111-1111-1111-111111111111", description="Associated Client Application ID (Public client_applications table)")
    key_name: str = Field(..., example="D-Mind Mobile App - Production", description="Human-readable label for key")
    description: Optional[str] = Field(None, example="Main API key for mobile application telemetry feed")
    expires_in_days: Optional[int] = Field(None, example=365, description="Expiry duration in days (null for never expires)")
    rate_limit_rpm: Optional[int] = Field(120, example=120, description="Rate limit in requests per minute")

class APIKeyResponse(BaseModel):
    id: UUID
    client_id: Optional[UUID] = None
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
    client_id: Optional[UUID] = None
    key_name: str
    key_prefix: str
    created_at: datetime
    expires_at: Optional[datetime]
    is_active: bool
    rate_limit_rpm: int
    description: Optional[str]
    last_used_at: Optional[datetime]
    total_requests: int

    class Config:
        from_attributes = True

class ClientApplicationItem(BaseModel):
    id: UUID
    client_name: str
    client_type: str = Field(..., example="MOBILE_APP", description="MOBILE_APP, WEB_DASHBOARD, 3RD_PARTY_SERVICE, RESEARCH_ANALYTICS")
    app_bundle_id: Optional[str] = None
    contact_email: Optional[str] = None
    organization: Optional[str] = None
    is_active: bool = True
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class APIRequestLogItem(BaseModel):
    id: int
    api_key_id: Optional[UUID] = None
    endpoint: str
    http_method: str
    status_code: int
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    latency_ms: Optional[float] = None
    request_at: Optional[datetime] = None

    class Config:
        from_attributes = True
