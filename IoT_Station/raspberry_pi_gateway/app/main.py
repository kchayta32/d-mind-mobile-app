import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .config import get_settings
from .routers import api_keys_router, sensors_router, alerts_router
from .mqtt_subscriber import get_mqtt_subscriber
from .services.supabase_service import get_supabase_client

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("dmind_gateway")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # --- Startup ---
    logger.info("Initializing D-MIND Raspberry Pi Gateway...")
    settings = get_settings()
    logger.info(f"Supabase Target URL: {settings.SUPABASE_URL}")
    
    # Start MQTT background subscriber
    mqtt_subscriber = get_mqtt_subscriber()
    mqtt_subscriber.start()
    logger.info(f"MQTT Subscriber daemon active (Broker: {settings.MQTT_BROKER_HOST}:{settings.MQTT_BROKER_PORT})")

    yield

    # --- Shutdown ---
    logger.info("Shutting down D-MIND Raspberry Pi Gateway...")
    mqtt_subscriber.stop()

app = FastAPI(
    title="D-MIND IoT Gateway & Disaster Alert API",
    description="""
    ## D-MIND Smart IoT Station & Raspberry Pi Gateway API
    
    This backend service manages real-time telemetry from the **ESP32 Multi-Sensor Station**:
    - **AJ-SR04M**: Ultrasonic Water Level Monitoring
    - **PMS5003**: Laser PM1.0, PM2.5, PM10 Dust Monitoring
    - **BME280**: Temperature, Relative Humidity, Barometric Pressure
    - **GY-521 (MPU-6050)**: 6-Axis Motion, Orientation (Pitch/Roll/Yaw), Vibration & Shock Detection
    
    ### Key Features:
    1. **MQTT Telemetry Ingest**: Real-time subscriber storing high-frequency sensor readings into Supabase `sensor_logs`.
    2. **Disaster Alert Engine**: Automated real-time anomaly detection for Floods, Toxic Air Quality, and Earthquakes.
    3. **API Key Security**: Cryptographically secure API Key creation and verification for mobile applications.
    """,
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for Mobile Apps and Web Dashboards
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(api_keys_router)
app.include_router(sensors_router)
app.include_router(alerts_router)

@app.get("/", tags=["Health"])
async def root():
    return {
        "project": "D-MIND IoT Station & Raspberry Pi Gateway",
        "status": "ONLINE",
        "version": "1.0.0",
        "docs_url": "/docs",
        "endpoints": {
            "api_keys": "/api/v1/auth/keys",
            "latest_sensor": "/api/v1/sensors/latest",
            "sensor_history": "/api/v1/sensors/history",
            "sensor_summary": "/api/v1/sensors/summary",
            "disaster_alerts": "/api/v1/alerts"
        }
    }

@app.get("/api/v1/health", tags=["Health"])
async def health_check():
    settings = get_settings()
    return {
        "status": "healthy",
        "mqtt_broker": f"{settings.MQTT_BROKER_HOST}:{settings.MQTT_BROKER_PORT}",
        "supabase_url": settings.SUPABASE_URL,
        "mode": "Gateway & API Server"
    }

if __name__ == "__main__":
    import uvicorn
    settings = get_settings()
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)
