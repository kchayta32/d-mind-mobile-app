from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class DisasterAlertItem(BaseModel):
    id: int
    station_id: Optional[str] = Field("ESP32_STATION_01", description="Station Identifier (Foreign Key to iot_stations)")
    device_id: Optional[str] = "ESP32_STATION_01"
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
    resolved_by: Optional[str] = None
    resolved_note: Optional[str] = None

    class Config:
        from_attributes = True

class AlertResolutionRequest(BaseModel):
    is_resolved: bool = True
    resolved_by: Optional[str] = Field("OPERATOR", description="Name or ID of resolving operator/system")
    resolved_note: Optional[str] = Field(None, description="Operator or automated resolution note")

class CreateDisasterAlertRequest(BaseModel):
    station_id: Optional[str] = Field("ESP32_STATION_01", description="Station Identifier")
    alert_type: str = Field(..., example="WATER_LEVEL_HIGH")
    severity: str = Field(..., example="WARNING")
    title: str
    message: str
    sensor_name: str
    current_value: Optional[float] = None
    threshold_value: Optional[float] = None
    unit: Optional[str] = None
