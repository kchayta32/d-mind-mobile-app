from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class SensorTelemetryInput(BaseModel):
    station_id: Optional[str] = Field("ESP32_STATION_01", description="Station Identifier (Foreign key to iot_stations)")
    water_level: Optional[float] = Field(None, description="Water level in cm or percentage (AJ-SR04M)")
    pm1: Optional[float] = Field(None, description="Particulate Matter PM1.0 in ug/m3 (PMS5003)")
    pm25: Optional[float] = Field(None, description="Particulate Matter PM2.5 in ug/m3 (PMS5003)")
    pm10: Optional[float] = Field(None, description="Particulate Matter PM10 in ug/m3 (PMS5003)")
    pitch: Optional[float] = Field(None, description="Tilt Pitch angle in degrees (GY-521)")
    roll: Optional[float] = Field(None, description="Tilt Roll angle in degrees (GY-521)")
    yaw: Optional[float] = Field(None, description="Orientation Yaw angle in degrees (GY-521)")
    acc_x: Optional[float] = Field(None, description="X-axis acceleration in g (GY-521)")
    acc_y: Optional[float] = Field(None, description="Y-axis acceleration in g (GY-521)")
    acc_z: Optional[float] = Field(None, description="Z-axis acceleration in g (GY-521)")
    gyro_x: Optional[float] = Field(None, description="X-axis angular velocity in deg/s (GY-521)")
    gyro_y: Optional[float] = Field(None, description="Y-axis angular velocity in deg/s (GY-521)")
    gyro_z: Optional[float] = Field(None, description="Z-axis angular velocity in deg/s (GY-521)")
    temperature: Optional[float] = Field(None, description="Ambient temperature in Celsius (BME280)")
    humidity: Optional[float] = Field(None, description="Relative humidity in percentage (BME280)")
    pressure: Optional[float] = Field(None, description="Atmospheric pressure in hPa (BME280)")

class SensorTelemetryResponse(SensorTelemetryInput):
    id: int = Field(..., description="Unique record ID")
    timestamp: Optional[datetime] = Field(None, description="Timestamp of telemetry record")

    class Config:
        from_attributes = True

class MetricMinMaxAvg(BaseModel):
    min: Optional[float] = None
    max: Optional[float] = None
    avg: Optional[float] = None
    current: Optional[float] = None

class SensorSummaryStats(BaseModel):
    timestamp_start: datetime
    timestamp_end: datetime
    total_records: int
    water_level: MetricMinMaxAvg
    pm25: MetricMinMaxAvg
    pm10: MetricMinMaxAvg
    temperature: MetricMinMaxAvg
    humidity: MetricMinMaxAvg
    pressure: MetricMinMaxAvg

class IoTStationItem(BaseModel):
    station_id: str = Field(..., description="Unique Station ID (e.g. ESP32_STATION_01)")
    station_name: str = Field(..., description="Human readable station name")
    location_name: Optional[str] = Field(None, description="Location / District name")
    latitude: Optional[float] = Field(None, description="GPS Latitude")
    longitude: Optional[float] = Field(None, description="GPS Longitude")
    elevation_m: Optional[float] = Field(None, description="Elevation in meters")
    status: Optional[str] = Field("ONLINE", description="Station health status (ONLINE, OFFLINE, MAINTENANCE)")
    installed_at: Optional[datetime] = None
    last_seen_at: Optional[datetime] = None
    firmware_version: Optional[str] = None
    description: Optional[str] = None

    class Config:
        from_attributes = True
