from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class DisasterAlertItem(BaseModel):
    id: int
    timestamp: datetime
    alert_type: str = Field(..., example="WATER_LEVEL_HIGH", description="Type of disaster anomaly detected")
    severity: str = Field(..., example="CRITICAL", description="INFO, WARNING, or CRITICAL")
    title: str
    message: str
    sensor_name: str = Field(..., example="AJ-SR04M")
    current_value: Optional[float] = None
    threshold_value: Optional[float] = None
    unit: Optional[str] = None
    is_resolved: bool = False
    resolved_at: Optional[datetime] = None
    device_id: Optional[str] = "ESP32_STATION_01"

class AlertResolutionRequest(BaseModel):
    is_resolved: bool = True
    resolved_note: Optional[str] = Field(None, description="Operator or automated resolution note")
