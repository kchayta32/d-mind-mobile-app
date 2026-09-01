import os
from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    # Supabase Credentials
    SUPABASE_URL: str = "https://evxjnivabxdlgfvncdcu.supabase.co"
    SUPABASE_KEY: str = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2eGpuaXZhYnhkbGdmdm5jZGN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwNTUyODgsImV4cCI6MjA2MjYzMTI4OH0.bKRopkNDOTQJETMRhpKVemdnaIass0HOnlTRoAaYCeU"
    SUPABASE_SERVICE_ROLE_KEY: str = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2eGpuaXZhYnhkbGdmdm5jZGN1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzA1NTI4OCwiZXhwIjoyMDYyNjMxMjg4fQ.gM1qt4q5r6zi9SKyrB2LPOV2COlBI1n_Vz3lf0MpH18"

    # Master Admin Key
    ADMIN_SECRET_KEY: str = "dmind_admin_secret_super_secure_key_2026"

    # MQTT Settings
    MQTT_BROKER_HOST: str = "localhost"
    MQTT_BROKER_PORT: int = 1883
    MQTT_USERNAME: str = ""
    MQTT_PASSWORD: str = ""
    MQTT_TOPIC_DATA: str = "iot/dmind/telemetry"
    MQTT_TOPIC_STATUS: str = "iot/dmind/status"

    # Disaster Alert Thresholds
    WATER_LEVEL_WARNING_THRESHOLD: float = 100.0   # cm
    WATER_LEVEL_CRITICAL_THRESHOLD: float = 140.0  # cm
    PM25_WARNING_THRESHOLD: float = 37.5           # ug/m3
    PM25_CRITICAL_THRESHOLD: float = 75.0          # ug/m3
    PM10_WARNING_THRESHOLD: float = 120.0          # ug/m3
    VIBRATION_THRESHOLD_G: float = 0.45            # Delta G
    TILT_THRESHOLD_DEG: float = 35.0               # Degrees

    # Server Settings
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = False

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"

@lru_cache()
def get_settings() -> Settings:
    return Settings()
