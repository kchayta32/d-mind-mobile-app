from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import List

from ..models.alert_models import DisasterAlertItem, AlertResolutionRequest
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
    limit: int = Query(50, ge=1, le=100, description="Max number of alerts"),
    key_info: dict = Depends(verify_api_key),
    db: SupabaseService = Depends(get_supabase_client)
):
    alerts = db.get_active_disaster_alerts(limit=limit)
    return alerts

@router.post(
    "/{alert_id}/resolve",
    summary="Resolve Disaster Alert",
    description="Marks a disaster alert as acknowledged/resolved."
)
async def resolve_alert(
    alert_id: int,
    payload: AlertResolutionRequest = None,
    key_info: dict = Depends(verify_api_key),
    db: SupabaseService = Depends(get_supabase_client)
):
    success = db.resolve_alert(alert_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Alert {alert_id} not found."
        )
    return {"message": f"Alert {alert_id} resolved successfully.", "is_resolved": True}
