import math
import logging
from typing import Dict, Any, List
from ..config import get_settings
from .supabase_service import SupabaseService

logger = logging.getLogger("dmind_gateway.alert_engine")

class AlertEngine:
    def __init__(self, db: SupabaseService):
        self.db = db
        self.settings = get_settings()

    def evaluate_telemetry(self, data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Evaluates real-time sensor metrics and logs disaster alerts to Supabase
        as shown in System Architecture Diagram 3.1:
        - Water Level High (ระดับน้ำสูงกว่าปกติ)
        - PM Level High (ค่าฝุ่น PM-2.5 / PM-10 สูงเกินมาตรฐาน)
        - GY-521 Abnormal Vibration (การสั่นไหวผิดปกติ / แผ่นดินไหว)
        """
        generated_alerts = []
        station_id = data.get("station_id") or "ESP32_STATION_01"

        # 1. Check Water Level (AJ-SR04M)
        water_level = data.get("water_level")
        if water_level is not None:
            if water_level >= self.settings.WATER_LEVEL_CRITICAL_THRESHOLD:
                alert = {
                    "alert_type": "WATER_LEVEL_HIGH",
                    "severity": "CRITICAL",
                    "title": "🚨 แจ้งเตือนระดับน้ำวิกฤต (Critical Flood Warning)",
                    "message": f"ระดับน้ำตรวจวัดได้ {water_level:.1f} cm สูงเกินเกณฑ์วิกฤต ({self.settings.WATER_LEVEL_CRITICAL_THRESHOLD:.1f} cm) เสี่ยงต่อน้ำท่วมฉับพลัน",
                    "sensor_name": "AJ-SR04M",
                    "current_value": float(water_level),
                    "threshold_value": float(self.settings.WATER_LEVEL_CRITICAL_THRESHOLD),
                    "unit": "cm"
                }
                generated_alerts.append(alert)
            elif water_level >= self.settings.WATER_LEVEL_WARNING_THRESHOLD:
                alert = {
                    "alert_type": "WATER_LEVEL_HIGH",
                    "severity": "WARNING",
                    "title": "⚠️ แจ้งเตือนเฝ้าระวังระดับน้ำสูง (High Water Level)",
                    "message": f"ระดับน้ำตรวจวัดได้ {water_level:.1f} cm เกินเกณฑ์เฝ้าระวัง ({self.settings.WATER_LEVEL_WARNING_THRESHOLD:.1f} cm)",
                    "sensor_name": "AJ-SR04M",
                    "current_value": float(water_level),
                    "threshold_value": float(self.settings.WATER_LEVEL_WARNING_THRESHOLD),
                    "unit": "cm"
                }
                generated_alerts.append(alert)

        # 2. Check Particulate Matter (PMS5003)
        pm25 = data.get("pm25")
        if pm25 is not None:
            if pm25 >= self.settings.PM25_CRITICAL_THRESHOLD:
                alert = {
                    "alert_type": "PM25_HIGH",
                    "severity": "CRITICAL",
                    "title": "🚨 ค่าฝุ่น PM 2.5 อยู่ในระดับอันตราย (Hazardous Air Quality)",
                    "message": f"ตรวจพบฝุ่นละออง PM 2.5 อยู่ที่ {pm25:.1f} µg/m³ เกินเกณฑ์อันตราย ({self.settings.PM25_CRITICAL_THRESHOLD:.1f} µg/m³) ควรหลีกเลี่ยงกิจกรรมกลางแจ้ง",
                    "sensor_name": "PMS5003",
                    "current_value": float(pm25),
                    "threshold_value": float(self.settings.PM25_CRITICAL_THRESHOLD),
                    "unit": "µg/m³"
                }
                generated_alerts.append(alert)
            elif pm25 >= self.settings.PM25_WARNING_THRESHOLD:
                alert = {
                    "alert_type": "PM25_HIGH",
                    "severity": "WARNING",
                    "title": "⚠️ แจ้งเตือนค่าฝุ่น PM 2.5 เกินมาตรฐาน (Unhealthy Air Quality)",
                    "message": f"ตรวจพบฝุ่น PM 2.5 อยู่ที่ {pm25:.1f} µg/m³ เกินเกณฑ์มาตรฐาน ({self.settings.PM25_WARNING_THRESHOLD:.1f} µg/m³)",
                    "sensor_name": "PMS5003",
                    "current_value": float(pm25),
                    "threshold_value": float(self.settings.PM25_WARNING_THRESHOLD),
                    "unit": "µg/m³"
                }
                generated_alerts.append(alert)

        pm10 = data.get("pm10")
        if pm10 is not None and pm10 >= self.settings.PM10_WARNING_THRESHOLD:
            alert = {
                "alert_type": "PM10_HIGH",
                "severity": "WARNING",
                "title": "⚠️ ตรวจพบค่าฝุ่น PM 10 เกินมาตรฐาน",
                "message": f"ตรวจพบฝุ่นละออง PM 10 อยู่ที่ {pm10:.1f} µg/m³ เกินเกณฑ์มาตรฐาน ({self.settings.PM10_WARNING_THRESHOLD:.1f} µg/m³)",
                "sensor_name": "PMS5003",
                "current_value": float(pm10),
                "threshold_value": float(self.settings.PM10_WARNING_THRESHOLD),
                "unit": "µg/m³"
            }
            generated_alerts.append(alert)

        # 3. Check Motion, Vibration & Tilt (GY-521 / MPU6050)
        ax = data.get("acc_x")
        ay = data.get("acc_y")
        az = data.get("acc_z")
        if ax is not None and ay is not None and az is not None:
            # Total G magnitude
            total_g = math.sqrt(ax * ax + ay * ay + az * az)
            vibration_delta = abs(total_g - 1.0)

            if vibration_delta >= self.settings.VIBRATION_THRESHOLD_G:
                alert = {
                    "alert_type": "ABNORMAL_VIBRATION",
                    "severity": "CRITICAL" if vibration_delta > 0.8 else "WARNING",
                    "title": "🚨 ตรวจพบแรงสั่นสะเทือนผิดปกติ (Earthquake / Landslide Shock)",
                    "message": f"เซนเซอร์ GY-521 ตรวจพบแรงสั่นสะเทือนสูงผิดปกติ Delta G = {vibration_delta:.2f}g (Total: {total_g:.2f}g)",
                    "sensor_name": "GY-521",
                    "current_value": float(round(vibration_delta, 3)),
                    "threshold_value": float(self.settings.VIBRATION_THRESHOLD_G),
                    "unit": "g"
                }
                generated_alerts.append(alert)

        pitch = data.get("pitch")
        roll = data.get("roll")
        if pitch is not None and roll is not None:
            if abs(pitch) >= self.settings.TILT_THRESHOLD_DEG or abs(roll) >= self.settings.TILT_THRESHOLD_DEG:
                max_tilt = max(abs(pitch), abs(roll))
                alert = {
                    "alert_type": "SEVERE_TILT",
                    "severity": "CRITICAL",
                    "title": "🚨 แจ้งเตือนเสาตรวจวัดเอียงผิดปกติ (Structural Tilt Hazard)",
                    "message": f"โครงสร้างสถานีเอียงผิดปกติ Pitch={pitch:.1f}°, Roll={roll:.1f}° เสี่ยงต่อดินสไลด์หรือโครงสร้างพังทลาย",
                    "sensor_name": "GY-521",
                    "current_value": float(round(max_tilt, 2)),
                    "threshold_value": float(self.settings.TILT_THRESHOLD_DEG),
                    "unit": "deg"
                }
                generated_alerts.append(alert)

        # Ingest alerts into Supabase
        for alert in generated_alerts:
            alert["station_id"] = station_id
            alert["device_id"] = station_id
            logger.warning(f"[DISASTER ALERT TRIGGERED] [{station_id}] {alert['title']} - {alert['message']}")
            self.db.insert_disaster_alert(alert)

        return generated_alerts
