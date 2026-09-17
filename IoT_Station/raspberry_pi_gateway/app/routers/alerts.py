from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import List, Optional

from ..models.alert_models import (
    DisasterAlertItem, 
    AlertResolutionRequest, 
    CreateDisasterAlertRequest
)
from ..auth import verify_api_key
from ..services.supabase_service import get_supabase_client, SupabaseService

router = APIRouter(prefix="/api/v1/alerts", tags=["Disaster Alerts"])

@router.get(
    "",
    response_model=List[DisasterAlertItem],
    summary="Get Active Disaster Alerts",
    description="Returns current unresolved disaster warnings (High Water Level, Dangerous PM2.5, Earthquake/Vibration)."
)
async def get_active_alerts(
    station_id: Optional[str] = Query(None, description="Optional Station ID filter (e.g. ESP32_STATION_01)"),
    limit: int = Query(50, ge=1, le=100, description="Max number of alerts"),
    key_info: dict = Depends(verify_api_key),
    db: SupabaseService = Depends(get_supabase_client)
):
    alerts = db.get_active_disaster_alerts(limit=limit, station_id=station_id)
    return alerts

@router.post(
    "",
    response_model=DisasterAlertItem,
    status_code=status.HTTP_201_CREATED,
    summary="Trigger / Create Disaster Alert",
    description="Allows manual or external triggering of disaster warnings."
)
async def create_alert(
    payload: CreateDisasterAlertRequest,
    key_info: dict = Depends(verify_api_key),
    db: SupabaseService = Depends(get_supabase_client)
):
    inserted = db.insert_disaster_alert(payload.model_dump(exclude_none=True))
    if not inserted:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to persist disaster alert to database."
        )
    return inserted

@router.post(
    "/{alert_id}/resolve",
    summary="Resolve Disaster Alert",
    description="Marks a disaster alert as acknowledged/resolved with resolver identity."
)
async def resolve_alert(
    alert_id: int,
    payload: Optional[AlertResolutionRequest] = None,
    key_info: dict = Depends(verify_api_key),
    db: SupabaseService = Depends(get_supabase_client)
):
    resolved_by = payload.resolved_by if payload else "OPERATOR"
    resolved_note = payload.resolved_note if payload else None
    success = db.resolve_alert(alert_id, resolved_by=resolved_by, resolved_note=resolved_note)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Alert {alert_id} not found."
        )
    return {
        "message": f"Alert {alert_id} resolved successfully.",
        "is_resolved": True,
        "resolved_by": resolved_by
    }
