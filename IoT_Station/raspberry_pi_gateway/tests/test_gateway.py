import unittest
import math
from uuid import UUID, uuid4
from unittest.mock import MagicMock
from app.auth import hash_api_key, generate_new_api_key
from app.services.alert_engine import AlertEngine
from app.models.sensor_models import SensorTelemetryInput, IoTStationItem
from app.models.api_key_models import CreateAPIKeyRequest, APIKeyResponse, ClientApplicationItem

class TestGatewayEngine(unittest.TestCase):
    def test_api_key_generation(self):
        raw_key, prefix, hashed = generate_new_api_key()
        self.assertTrue(raw_key.startswith("dmind_live_"))
        self.assertEqual(prefix, raw_key[:14])
        self.assertEqual(hashed, hash_api_key(raw_key))
        self.assertEqual(len(hashed), 64) # SHA-256 hex length

    def test_alert_engine_water_level_critical(self):
        mock_db = MagicMock()
        engine = AlertEngine(mock_db)
        
        # Critical water level: 150 cm (> 140 cm)
        telemetry = {"water_level": 150.0}
        alerts = engine.evaluate_telemetry(telemetry)
        
        self.assertEqual(len(alerts), 1)
        self.assertEqual(alerts[0]["alert_type"], "WATER_LEVEL_HIGH")
        self.assertEqual(alerts[0]["severity"], "CRITICAL")
        self.assertEqual(alerts[0]["station_id"], "ESP32_STATION_01")
        self.assertEqual(alerts[0]["device_id"], "ESP32_STATION_01")
        mock_db.insert_disaster_alert.assert_called_once()

    def test_alert_engine_custom_station_id(self):
        mock_db = MagicMock()
        engine = AlertEngine(mock_db)
        
        telemetry = {"station_id": "ESP32_STATION_02", "water_level": 155.0}
        alerts = engine.evaluate_telemetry(telemetry)
        
        self.assertEqual(len(alerts), 1)
        self.assertEqual(alerts[0]["station_id"], "ESP32_STATION_02")
        self.assertEqual(alerts[0]["device_id"], "ESP32_STATION_02")

    def test_alert_engine_pm25_warning(self):
        mock_db = MagicMock()
        engine = AlertEngine(mock_db)
        
        # PM2.5 warning: 45 ug/m3 (between 37.5 and 75)
        telemetry = {"pm25": 45.0}
        alerts = engine.evaluate_telemetry(telemetry)
        
        self.assertEqual(len(alerts), 1)
        self.assertEqual(alerts[0]["alert_type"], "PM25_HIGH")
        self.assertEqual(alerts[0]["severity"], "WARNING")
        self.assertEqual(alerts[0]["station_id"], "ESP32_STATION_01")

    def test_alert_engine_abnormal_vibration(self):
        mock_db = MagicMock()
        engine = AlertEngine(mock_db)
        
        # Heavy vibration: acc_x = 0.8, acc_y = 0.6, acc_z = 1.2
        # total_g = sqrt(0.64 + 0.36 + 1.44) = sqrt(2.44) = 1.56g -> delta = 0.56g (> 0.45g)
        telemetry = {"acc_x": 0.8, "acc_y": 0.6, "acc_z": 1.2}
        alerts = engine.evaluate_telemetry(telemetry)
        
        self.assertEqual(len(alerts), 1)
        self.assertEqual(alerts[0]["alert_type"], "ABNORMAL_VIBRATION")
        self.assertEqual(alerts[0]["station_id"], "ESP32_STATION_01")

    def test_sensor_telemetry_model_station_id(self):
        # Default station_id
        input_default = SensorTelemetryInput(water_level=50.0)
        self.assertEqual(input_default.station_id, "ESP32_STATION_01")

        # Custom station_id
        input_custom = SensorTelemetryInput(station_id="ESP32_CHIANGMAI_01", water_level=80.0)
        self.assertEqual(input_custom.station_id, "ESP32_CHIANGMAI_01")
        self.assertEqual(input_custom.model_dump()["station_id"], "ESP32_CHIANGMAI_01")

    def test_create_api_key_request_with_client_id(self):
        test_client_id = uuid4()
        req = CreateAPIKeyRequest(
            client_id=test_client_id,
            key_name="Flutter Mobile App Client"
        )
        self.assertEqual(req.client_id, test_client_id)
        self.assertEqual(req.key_name, "Flutter Mobile App Client")

    def test_iot_station_model(self):
        st = IoTStationItem(
            station_id="ESP32_STATION_01",
            station_name="Main River Basin Station",
            location_name="Chiang Mai"
        )
        self.assertEqual(st.station_id, "ESP32_STATION_01")
        self.assertEqual(st.status, "ONLINE")

if __name__ == "__main__":
    unittest.main()
