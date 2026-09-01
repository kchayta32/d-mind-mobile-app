from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import List, Optional
from datetime import datetime

from ..models.sensor_models import (
    SensorTelemetryInput, 
    SensorTelemetryResponse, 
    SensorSummaryStats
)
from ..auth import verify_api_key
from ..services.supabase_service import get_supabase_client, SupabaseService
from ..services.alert_engine import AlertEngine

router = APIRouter(prefix="/api/v1/sensors", tags=["Sensors Telemetry"])

@router.get(
    "/latest",
    response_model=Optional[SensorTelemetryResponse],
    summary="Get Latest Sensor Telemetry",
    description="Returns the most recent reading across all 4 sensors for the mobile dashboard."
)
async def get_latest_sensor_data(
    key_info: dict = Depends(verify_api_key),
    db: SupabaseService = Depends(get_supabase_client)
):
    latest = db.get_latest_sensor_log()
    if not latest:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No sensor telemetry records found in database."
        )
    return latest

@router.get(
    "/history",
    response_model=List[SensorTelemetryResponse],
    summary="Get Historical Sensor Telemetry",
    description="Fetches time-series telemetry records with pagination and optional timestamp filtering."
)
async def get_sensor_history(
    limit: int = Query(50, ge=1, le=500, description="Max number of records"),
    offset: int = Query(0, ge=0, description="Offset index"),
    from_time: Optional[datetime] = Query(None, description="ISO timestamp start filter"),
    to_time: Optional[datetime] = Query(None, description="ISO timestamp end filter"),
    key_info: dict = Depends(verify_api_key),
    db: SupabaseService = Depends(get_supabase_client)
):
    history = db.get_sensor_history(
        limit=limit, 
        offset=offset, 
        from_time=from_time, 
        to_time=to_time
    )
    return history

@router.get(
    "/summary",
    response_model=dict,
    summary="Get Sensor Summary & 24h Statistics",
    description="Calculates min, max, avg and current values for key disaster monitoring metrics."
)
async def get_sensor_summary(
    hours: int = Query(24, ge=1, le=168, description="Time window in hours"),
    key_info: dict = Depends(verify_api_key),
    db: SupabaseService = Depends(get_supabase_client)
):
    stats = db.get_sensor_stats(hours=hours)
    if not stats:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Insufficient data to compute statistics."
        )
    return stats

@router.post(
    "/ingest",
    response_model=SensorTelemetryResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Direct HTTP Telemetry Ingest (Alternative to MQTT)",
    description="Accepts sensor payload via REST API and evaluates disaster alert rules."
)
async def ingest_sensor_telemetry(
    payload: SensorTelemetryInput,
    key_info: dict = Depends(verify_api_key),
    db: SupabaseService = Depends(get_supabase_client)
):
    data_dict = payload.model_dump(exclude_none=True)
    inserted = db.insert_sensor_log(data_dict)
    if not inserted:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to persist telemetry to Supabase."
        )

    # Evaluate alerts
    alert_engine = AlertEngine(db)
    alert_engine.evaluate_telemetry(data_dict)

    return inserted
