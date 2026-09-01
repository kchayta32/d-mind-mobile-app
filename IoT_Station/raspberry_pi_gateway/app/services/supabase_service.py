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
            res = self.client.table("sensor_logs").insert(cleaned_data).execute()
            if res.data and len(res.data) > 0:
                return res.data[0]
            return None
        except Exception as e:
            logger.error(f"Error inserting sensor log to Supabase: {e}")
            return None

    def get_latest_sensor_log(self) -> Optional[Dict[str, Any]]:
        """Retrieves the most recent sensor reading"""
        try:
            res = self.client.table("sensor_logs") \
                .select("*") \
                .order("id", desc=True) \
                .limit(1) \
                .execute()
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
        to_time: Optional[datetime] = None
    ) -> List[Dict[str, Any]]:
        """Fetches historical sensor logs with optional date range"""
        try:
            query = self.client.table("sensor_logs").select("*")
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
                .select("id, key_name, key_prefix, created_at, expires_at, is_active, rate_limit_rpm, description, last_used_at, total_requests") \
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

    # --- Disaster Alerts ---

    def insert_disaster_alert(self, alert_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Logs a disaster event alert to public.disaster_alerts"""
        try:
            res = self.client.table("disaster_alerts").insert(alert_data).execute()
            if res.data and len(res.data) > 0:
                return res.data[0]
            return None
        except Exception as e:
            logger.error(f"Error inserting disaster alert: {e}")
            return None

    def get_active_disaster_alerts(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Fetches unresolved alerts"""
        try:
            res = self.client.table("disaster_alerts") \
                .select("*") \
                .eq("is_resolved", False) \
                .order("timestamp", desc=True) \
                .limit(limit) \
                .execute()
            return res.data or []
        except Exception as e:
            logger.error(f"Error fetching active disaster alerts: {e}")
            return []

    def resolve_alert(self, alert_id: int) -> bool:
        """Marks an alert as resolved"""
        try:
            res = self.client.table("disaster_alerts") \
                .update({
                    "is_resolved": True,
                    "resolved_at": datetime.now(timezone.utc).isoformat()
                }) \
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
