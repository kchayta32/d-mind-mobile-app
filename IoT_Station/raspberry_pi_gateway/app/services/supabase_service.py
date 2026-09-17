import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from supabase import create_client, Client
from ..config import get_settings

logger = logging.getLogger("dmind_gateway.supabase")

class SupabaseService:
    def __init__(self):
        settings = get_settings()
        # Use service role key if available for administrative/gateway writes
        key = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_KEY
        self.client: Client = create_client(settings.SUPABASE_URL, key)

    def insert_sensor_log(self, payload: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Inserts telemetry data into public.sensor_logs"""
        try:
            # Clean None / empty values
            cleaned_data = {k: v for k, v in payload.items() if v is not None}
            if "station_id" not in cleaned_data or not cleaned_data["station_id"]:
                cleaned_data["station_id"] = "ESP32_STATION_01"
            res = self.client.table("sensor_logs").insert(cleaned_data).execute()
            if res.data and len(res.data) > 0:
                return res.data[0]
            return None
        except Exception as e:
            logger.error(f"Error inserting sensor log to Supabase: {e}")
            return None

    def get_latest_sensor_log(self, station_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """Retrieves the most recent sensor reading, optionally filtered by station_id"""
        try:
            query = self.client.table("sensor_logs").select("*")
            if station_id:
                query = query.eq("station_id", station_id)
            res = query.order("id", desc=True).limit(1).execute()
            if res.data and len(res.data) > 0:
                return res.data[0]
            return None
        except Exception as e:
            logger.error(f"Error fetching latest sensor log: {e}")
            return None

    def get_sensor_history(
        self, 
        limit: int = 50, 
        offset: int = 0, 
        from_time: Optional[datetime] = None, 
        to_time: Optional[datetime] = None,
        station_id: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Fetches historical sensor logs with optional date range and station_id filter"""
        try:
            query = self.client.table("sensor_logs").select("*")
            if station_id:
                query = query.eq("station_id", station_id)
            if from_time:
                query = query.gte("timestamp", from_time.isoformat())
            if to_time:
                query = query.lte("timestamp", to_time.isoformat())
            
            res = query.order("id", desc=True).range(offset, offset + limit - 1).execute()
            return res.data or []
        except Exception as e:
            logger.error(f"Error fetching sensor history: {e}")
            return []

    def get_sensor_stats(self, hours: int = 24) -> Dict[str, Any]:
        """Calculates min, max, avg across recent hours"""
        try:
            # Fetch recent logs
            res = self.client.table("sensor_logs") \
                .select("water_level, pm25, pm10, temperature, humidity, pressure, timestamp") \
                .order("id", desc=True) \
                .limit(500) \
                .execute()
            
            records = res.data or []
            if not records:
                return {}

            def calc_metric(key: str):
                vals = [r[key] for r in records if r.get(key) is not None]
                if not vals:
                    return {"min": None, "max": None, "avg": None, "current": None}
                return {
                    "min": round(min(vals), 2),
                    "max": round(max(vals), 2),
                    "avg": round(sum(vals) / len(vals), 2),
                    "current": round(vals[0], 2)
                }

            return {
                "total_records": len(records),
                "timestamp_start": records[-1].get("timestamp"),
                "timestamp_end": records[0].get("timestamp"),
                "water_level": calc_metric("water_level"),
                "pm25": calc_metric("pm25"),
                "pm10": calc_metric("pm10"),
                "temperature": calc_metric("temperature"),
                "humidity": calc_metric("humidity"),
                "pressure": calc_metric("pressure")
            }
        except Exception as e:
            logger.error(f"Error calculating stats: {e}")
            return {}

    # --- API Key Management ---

    def create_api_key_record(self, key_record: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Stores a newly generated hashed API key"""
        try:
            res = self.client.table("api_keys").insert(key_record).execute()
            if res.data and len(res.data) > 0:
                return res.data[0]
            return None
        except Exception as e:
            logger.error(f"Error inserting API key record: {e}")
            return None

    def get_api_key_by_hash(self, hashed_key: str) -> Optional[Dict[str, Any]]:
        """Finds an API key by SHA-256 hash"""
        try:
            res = self.client.table("api_keys") \
                .select("*") \
                .eq("hashed_key", hashed_key) \
                .eq("is_active", True) \
                .limit(1) \
                .execute()
            if res.data and len(res.data) > 0:
                return res.data[0]
            return None
        except Exception as e:
            logger.error(f"Error fetching API key by hash: {e}")
            return None

    def list_api_keys(self) -> List[Dict[str, Any]]:
        """Lists all API keys (excluding secret hash)"""
        try:
            res = self.client.table("api_keys") \
                .select("id, client_id, key_name, key_prefix, created_at, expires_at, is_active, rate_limit_rpm, description, last_used_at, total_requests") \
                .order("created_at", desc=True) \
                .execute()
            return res.data or []
        except Exception as e:
            logger.error(f"Error listing API keys: {e}")
            return []

    def revoke_api_key(self, key_id: str) -> bool:
        """Deactivates an API key"""
        try:
            res = self.client.table("api_keys") \
                .update({"is_active": False}) \
                .eq("id", key_id) \
                .execute()
            return bool(res.data)
        except Exception as e:
            logger.error(f"Error revoking API key: {e}")
            return False

    def touch_api_key_usage(self, key_id: str):
        """Updates last_used_at timestamp and request count"""
        try:
            self.client.table("api_keys") \
                .update({
                    "last_used_at": datetime.now(timezone.utc).isoformat()
                }) \
                .eq("id", key_id) \
                .execute()
        except Exception:
            pass

    # --- Client Applications ---

    def get_client_applications(self) -> List[Dict[str, Any]]:
        """Fetches registered client applications"""
        try:
            res = self.client.table("client_applications") \
                .select("*") \
                .order("created_at", desc=True) \
                .execute()
            return res.data or []
        except Exception as e:
            logger.error(f"Error fetching client applications: {e}")
            return []

    # --- IoT Stations ---

    def get_stations(self) -> List[Dict[str, Any]]:
        """Fetches all registered IoT stations"""
        try:
            res = self.client.table("iot_stations") \
                .select("*") \
                .order("station_id") \
                .execute()
            return res.data or []
        except Exception as e:
            logger.error(f"Error fetching IoT stations: {e}")
            return []

    # --- API Request Logging ---

    def log_api_request(
        self,
        endpoint: str,
        http_method: str,
        status_code: int,
        api_key_id: Optional[str] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        latency_ms: Optional[float] = None
    ) -> None:
        """Logs an incoming API request to public.api_request_logs (non-blocking / error-tolerant)"""
        try:
            record = {
                "endpoint": endpoint,
                "http_method": http_method,
                "status_code": status_code,
                "api_key_id": api_key_id,
                "ip_address": ip_address,
                "user_agent": user_agent,
                "latency_ms": latency_ms
            }
            clean_record = {k: v for k, v in record.items() if v is not None}
            self.client.table("api_request_logs").insert(clean_record).execute()
        except Exception as e:
            logger.debug(f"Non-critical error logging API request: {e}")

    # --- Disaster Alerts ---

    def insert_disaster_alert(self, alert_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Logs a disaster event alert to public.disaster_alerts"""
        try:
            clean_data = {k: v for k, v in alert_data.items() if v is not None}
            if "station_id" not in clean_data or not clean_data["station_id"]:
                clean_data["station_id"] = clean_data.get("device_id") or "ESP32_STATION_01"
            if "device_id" not in clean_data or not clean_data["device_id"]:
                clean_data["device_id"] = clean_data["station_id"]
            res = self.client.table("disaster_alerts").insert(clean_data).execute()
            if res.data and len(res.data) > 0:
                return res.data[0]
            return None
        except Exception as e:
            logger.error(f"Error inserting disaster alert: {e}")
            return None

    def get_active_disaster_alerts(self, limit: int = 50, station_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Fetches unresolved alerts, optionally filtered by station_id"""
        try:
            query = self.client.table("disaster_alerts").select("*").eq("is_resolved", False)
            if station_id:
                query = query.eq("station_id", station_id)
            res = query.order("timestamp", desc=True).limit(limit).execute()
            return res.data or []
        except Exception as e:
            logger.error(f"Error fetching active disaster alerts: {e}")
            return []

    def resolve_alert(
        self, 
        alert_id: int, 
        resolved_by: Optional[str] = "OPERATOR", 
        resolved_note: Optional[str] = None
    ) -> bool:
        """Marks an alert as resolved with audit note and resolver identity"""
        try:
            update_payload = {
                "is_resolved": True,
                "resolved_at": datetime.now(timezone.utc).isoformat()
            }
            if resolved_by:
                update_payload["resolved_by"] = resolved_by
            if resolved_note:
                update_payload["resolved_note"] = resolved_note

            res = self.client.table("disaster_alerts") \
                .update(update_payload) \
                .eq("id", alert_id) \
                .execute()
            return bool(res.data)
        except Exception as e:
            logger.error(f"Error resolving alert: {e}")
            return False

_supabase_service_instance: Optional[SupabaseService] = None

def get_supabase_client() -> SupabaseService:
    global _supabase_service_instance
    if _supabase_service_instance is None:
        _supabase_service_instance = SupabaseService()
    return _supabase_service_instance
