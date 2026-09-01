#!/usr/bin/env bash
# ============================================================================
#  D-MIND Raspberry Pi Gateway: 1-Click Setup Script
#  Target OS: Raspberry Pi OS / Debian / Ubuntu (Linux ARM/x86)
# ============================================================================

set -e

echo "=========================================================="
echo "      🚀 D-MIND Raspberry Pi Gateway Installation         "
echo "=========================================================="

# 1. Update APT and install prerequisites
echo "[1/5] Updating package repositories and installing tools..."
sudo apt-get update
sudo apt-get install -y mosquitto mosquitto-clients python3 python3-pip python3-venv git curl

# 2. Configure Mosquitto MQTT Broker
echo "[2/5] Configuring Mosquitto MQTT Broker..."
sudo tee /etc/mosquitto/conf.d/dmind.conf > /dev/null <<EOF
listener 1883 0.0.0.0
allow_anonymous true
EOF

sudo systemctl enable mosquitto
sudo systemctl restart mosquitto
echo "Mosquitto MQTT Broker is active on port 1883."

# 3. Create Python Virtual Environment
echo "[3/5] Setting up Python virtual environment..."
cd "$(dirname "$0")"
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# 4. Configure .env file
if [ ! -f .env ]; then
  echo "[4/5] Creating .env from .env.example..."
  cp .env.example .env
  echo "⚠️ Please edit .env with your specific settings if necessary."
else
  echo "[4/5] .env configuration found."
fi

# 5. Setup Systemd Service
echo "[5/5] Registering systemd background service..."
CURRENT_USER=$(whoami)
CURRENT_DIR=$(pwd)

sed -i "s|User=pi|User=${CURRENT_USER}|g" gateway_service.service
sed -i "s|/home/pi/IoT_Station/raspberry_pi_gateway|${CURRENT_DIR}|g" gateway_service.service

sudo cp gateway_service.service /etc/systemd/system/dmind-gateway.service
sudo systemctl daemon-reload
sudo systemctl enable dmind-gateway
sudo systemctl restart dmind-gateway

echo "=========================================================="
echo "✅ D-MIND Gateway Installation Complete!"
echo "----------------------------------------------------------"
echo "• FastAPI Server   : http://$(hostname -I | awk '{print $1}'):8000"
echo "• Swagger API Docs : http://$(hostname -I | awk '{print $1}'):8000/docs"
echo "• MQTT Broker      : $(hostname -I | awk '{print $1}'):1883"
echo "• Check status     : sudo systemctl status dmind-gateway"
echo "• View live logs   : journalctl -u dmind-gateway -f"
echo "=========================================================="
