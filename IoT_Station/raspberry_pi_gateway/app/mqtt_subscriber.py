import json
import logging
import threading
import time
from typing import Optional
import paho.mqtt.client as mqtt
from .config import get_settings
from .services.supabase_service import get_supabase_client, SupabaseService
from .services.alert_engine import AlertEngine

logger = logging.getLogger("dmind_gateway.mqtt")

class MQTTTelemetrySubscriber:
    def __init__(self):
        self.settings = get_settings()
        self.db: SupabaseService = get_supabase_client()
        self.alert_engine = AlertEngine(self.db)
        
        # Paho MQTT Client setup
        self.client = mqtt.Client(
            mqtt.CallbackAPIVersion.VERSION2, 
            client_id="RPI_DMIND_GATEWAY_SUBSCRIBER"
        )
        
        if self.settings.MQTT_USERNAME:
            self.client.username_pw_set(
                self.settings.MQTT_USERNAME, 
                self.settings.MQTT_PASSWORD
            )

        self.client.on_connect = self.on_connect
        self.client.on_disconnect = self.on_disconnect
        self.client.on_message = self.on_message
        
        self._is_running = False
        self._thread: Optional[threading.Thread] = None

    def on_connect(self, client, userdata, flags, rc, properties=None):
        if rc == 0:
            logger.info(f"Connected to MQTT Broker at {self.settings.MQTT_BROKER_HOST}:{self.settings.MQTT_BROKER_PORT}")
            # Subscribe to telemetry & status topics
            client.subscribe(self.settings.MQTT_TOPIC_DATA, qos=1)
            client.subscribe(self.settings.MQTT_TOPIC_STATUS, qos=1)
            logger.info(f"Subscribed to topic: {self.settings.MQTT_TOPIC_DATA}")
        else:
            logger.error(f"MQTT Connection failed with return code {rc}")

    def on_disconnect(self, client, userdata, flags, rc, properties=None):
        logger.warning(f"Disconnected from MQTT Broker (rc={rc}). Reconnecting automatically...")

    def on_message(self, client, userdata, msg):
        try:
            topic = msg.topic
            payload_str = msg.payload.decode("utf-8")
            logger.debug(f"[MQTT INCOMING] [{topic}] {payload_str}")

            if topic == self.settings.MQTT_TOPIC_DATA:
                data = json.loads(payload_str)
                
                # 1. Ingest into Supabase sensor_logs table
                inserted = self.db.insert_sensor_log(data)
                if inserted:
                    logger.info(f"[DB INGEST] Sensor log saved (ID: {inserted.get('id')})")
                else:
                    logger.warning("[DB INGEST] Failed to insert sensor log")

                # 2. Evaluate for disaster alerts & anomalies
                self.alert_engine.evaluate_telemetry(data)

            elif topic == self.settings.MQTT_TOPIC_STATUS:
                logger.info(f"[STATION STATUS] {payload_str}")

        except json.JSONDecodeError as jde:
            logger.error(f"Failed to parse JSON payload from MQTT: {jde}")
        except Exception as e:
            logger.error(f"Error handling MQTT message: {e}", exc_info=True)

    def start(self):
        """Starts MQTT subscriber in a background daemon thread"""
        if self._is_running:
            return
        self._is_running = True
        
        def run_loop():
            while self._is_running:
                try:
                    logger.info(f"Connecting to MQTT Broker {self.settings.MQTT_BROKER_HOST}:{self.settings.MQTT_BROKER_PORT}...")
                    self.client.connect(
                        self.settings.MQTT_BROKER_HOST, 
                        self.settings.MQTT_BROKER_PORT, 
                        keepalive=60
                    )
                    self.client.loop_forever()
                except Exception as e:
                    logger.warning(f"MQTT Connection error: {e}. Retrying in 5 seconds...")
                    time.sleep(5)

        self._thread = threading.Thread(target=run_loop, daemon=True, name="MQTT_Subscriber_Thread")
        self._thread.start()
        logger.info("MQTT Telemetry Subscriber thread started.")

    def stop(self):
        """Gracefully stops the MQTT client"""
        self._is_running = False
        try:
            self.client.disconnect()
        except Exception:
            pass
        logger.info("MQTT Telemetry Subscriber stopped.")

_mqtt_subscriber_instance: Optional[MQTTTelemetrySubscriber] = None

def get_mqtt_subscriber() -> MQTTTelemetrySubscriber:
    global _mqtt_subscriber_instance
    if _mqtt_subscriber_instance is None:
        _mqtt_subscriber_instance = MQTTTelemetrySubscriber()
    return _mqtt_subscriber_instance
