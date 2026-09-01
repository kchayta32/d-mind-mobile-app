# ESP32 & Sensor Pinout Reference Tables

เอกสารตารางการต่อวงจรและจับคู่ขา (Pinout Mapping) สำหรับระบบ **D-MIND IoT Station** โดยใช้บอร์ด **ESP32 DevKit V1 (30-pin / 38-pin)** ร่วมกับ **ESP32 Expansion Board (Shield)**

---

## 1. ตารางการต่อรวมทุกเซนเซอร์ (Master Combined Pinout Table)

| เซนเซอร์ (Sensor) | ขาเซนเซอร์ (Pin) | ขา ESP32 (GPIO) | ช่องบนบอร์ด Expansion Board | ชนิดสัญญาณ (Signal Type) | แรงดันไฟ (Voltage) | หมายเหตุ / หน้าที่ |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **AJ-SR04M** (วัดระดับน้ำ) | **5V / VCC** | `VIN` / `5V` | รางไฟ 5V (สีแดง) | Power Supply | 5.0V | เซนเซอร์ใช้คลื่นอัลตราโซนิกต้องการไฟ 5V |
| | **GND** | `GND` | รางกราวด์ GND (สีดำ) | Ground | 0V | กราวด์ร่วม |
| | **TRIG** | `GPIO 5` | `G5` (Signal) | Digital Output | 3.3V | ส่งสัญญาณพัลส์สั่งยิงคลื่น (Pulse Trigger) |
| | **ECHO** | `GPIO 18` | `G18` (Signal) | Digital Input | 3.3V ~ 5V | รับสัญญาณสะท้อนกลับเพื่อคำนวณเวลาและระยะทาง |
| **PMS5003** (วัดฝุ่น PM) | **Pin 1 (VCC)** | `VIN` / `5V` | รางไฟ 5V (สีแดง) | Power Supply | 5.0V | เลเซอร์และพัดลมดูดอากาศต้องการไฟ 5V |
| | **Pin 2 (GND)** | `GND` | รางกราวด์ GND (สีดำ) | Ground | 0V | กราวด์ร่วม |
| | **Pin 4 (TXD)** | `GPIO 16` (RX2) | `RX2` / `G16` | UART Input (ESP32) | 3.3V Logic | ส่งข้อมูลค่าฝุ่น PM1.0, PM2.5, PM10 |
| | **Pin 5 (RXD)** | `GPIO 17` (TX2) | `TX2` / `G17` | UART Output (ESP32)| 3.3V Logic | คำสั่งตั้งค่าเซนเซอร์ (โหมด Active ไม่จำเป็นต้องต่อก็ได้) |
| **BME280** (อุณหภูมิ/ชื้น/ความกด) | **VCC** | `3V3` | รางไฟ 3.3V | Power Supply | 3.3V | ชิป Bosch รองรับ 3.3V |
| | **GND** | `GND` | รางกราวด์ GND | Ground | 0V | กราวด์ร่วม |
| | **SCL** | `GPIO 22` | `G22` / `SCL` | I2C Clock | 3.3V Logic | สัญญาณนาฬิกา I2C (แชร์บัสร่วมกับ GY-521) |
| | **SDA** | `GPIO 21` | `G21` / `SDA` | I2C Data | 3.3V Logic | สัญญาณข้อมูล I2C (แชร์บัสร่วมกับ GY-521) |
| **GY-521 (MPU6050)** (วัดการสั่นสะเทือน/ความเอียง) | **VCC** | `3V3` หรือ `5V` | รางไฟ 3.3V หรือ 5V | Power Supply | 3.3V / 5.0V | มี LDO Regulator 3.3V ออนบอร์ด |
| | **GND** | `GND` | รางกราวด์ GND | Ground | 0V | กราวด์ร่วม |
| | **SCL** | `GPIO 22` | `G22` / `SCL` | I2C Clock | 3.3V Logic | สัญญาณนาฬิกา I2C (แชร์บัสกับ BME280) |
| | **SDA** | `GPIO 21` | `G21` / `SDA` | I2C Data | 3.3V Logic | สัญญาณข้อมูล I2C (แชร์บัสกับ BME280) |
| | **AD0** | `GND` | รางกราวด์ GND | Address Select | 0V | กำหนด I2C Address เป็น `0x68` (ไม่ชนกับ BME280) |

---

## 2. ตารางการต่อแบบแยกเซนเซอร์ (Individual Sensor Pinout Tables)

### 2.1 เซนเซอร์วัดระดับน้ำ AJ-SR04M (Waterproof Ultrasonic)
- **ไฟล์โค้ดทดสอบ**: `esp32_firmware/test_sensors/test_aj_sr04m/test_aj_sr04m.ino`

| ขา AJ-SR04M | บอร์ด ESP32 / Shield | รายละเอียด |
| :--- | :--- | :--- |
| **5V / VCC** | 5V / VIN | แหล่งจ่ายไฟ 5V |
| **GND** | GND | กราวด์ |
| **TRIG** | GPIO 5 | ส่งพัลส์กระตุ้นคลื่นความถี่ 40kHz |
| **ECHO** | GPIO 18 | รับสัญญาณเสียงสะท้อนกลับ |

---

### 2.2 เซนเซอร์วัดฝุ่นละออง PMS5003 (Laser Dust Sensor)
- **ไฟล์โค้ดทดสอบ**: `esp32_firmware/test_sensors/test_pms5003/test_pms5003.ino`
- **หมายเหตุ**: สัญญาณเชื่อมต่อผ่าน Hardware Serial 2 (UART2) ความเร็ว 9600 bps

| ลำดับพิน PMS5003 | ชื่อขาบนโมดูล | ขา ESP32 / Shield | รายละเอียด |
| :--- | :--- | :--- | :--- |
| Pin 1 | **VCC** | 5V / VIN | แหล่งจ่ายไฟ 5V (สำหรับเลเซอร์และพัดลม) |
| Pin 2 | **GND** | GND | กราวด์ |
| Pin 3 | **SET** | 3.3V หรือ ปล่อยลอย | High = ทำงานปกติ, Low = โหมดประหยัดพลังงาน |
| Pin 4 | **TXD** | GPIO 16 (RX2) | ส่งข้อมูลค่าฝุ่นออกมาเป็นไบนารี 32 ไบต์ |
| Pin 5 | **RXD** | GPIO 17 (TX2) | รับคำสั่งเปลี่ยนโหมด (ไม่ต่อก็ได้) |
| Pin 6 | **RESET** | 3.3V หรือ ปล่อยลอย | High = ปกติ |

---

### 2.3 เซนเซอร์วัดสภาพอากาศ BME280 (Temperature, Humidity, Pressure)
- **ไฟล์โค้ดทดสอบ**: `esp32_firmware/test_sensors/test_bme280/test_bme280.ino`
- **I2C Address**: `0x76` (Default) หรือ `0x77`

| ขา BME280 | บอร์ด ESP32 / Shield | รายละเอียด |
| :--- | :--- | :--- |
| **VIN / VCC** | 3.3V | แหล่งจ่ายไฟ 3.3V |
| **GND** | GND | กราวด์ |
| **SCL** | GPIO 22 | I2C Clock Line |
| **SDA** | GPIO 21 | I2C Data Line |

---

### 2.4 เซนเซอร์ตรวจจับการเคลื่อนไหวและการสั่นสะเทือน GY-521 (MPU-6050)
- **ไฟล์โค้ดทดสอบ**: `esp32_firmware/test_sensors/test_gy521_mpu6050/test_gy521_mpu6050.ino`
- **I2C Address**: `0x68` (เมื่อ AD0 ต่อ GND)

| ขา GY-521 | บอร์ด ESP32 / Shield | รายละเอียด |
| :--- | :--- | :--- |
| **VCC** | 3.3V หรือ 5V | แหล่งจ่ายไฟ |
| **GND** | GND | กราวด์ |
| **SCL** | GPIO 22 | I2C Clock Line (ร่วมกับ BME280) |
| **SDA** | GPIO 21 | I2C Data Line (ร่วมกับ BME280) |
| **AD0** | GND | บังคับ I2C Address = 0x68 เพื่อป้องกันการชน |
| **INT** | ไม่ต้องต่อ (NC) | สัญญาณ Interrupt (ใช้แบบ Polling) |

---

## 3. ข้อควรระวังและการจัดการพลังงาน (Power & Electrical Guidelines)

1. **แหล่งจ่ายไฟหลัก (Main Power Supply)**:
   - เนื่องจากบอร์ดต่อทั้งเซนเซอร์เลเซอร์ (PMS5003 มีพัดลมดูดอากาศ) และเซนเซอร์อัลตราโซนิก (AJ-SR04M) ซึ่งกินกระแสรวมกันประมาณ 250-400 mA แนะนำให้จ่ายไฟผ่านช่อง **DC Jack (7V - 12V 2A)** บนตัว ESP32 Expansion Board หรือต่อสาย **Micro USB 5V 2A** เข้าที่ ESP32 โดยตรง ไม่ควรดึงไฟจากพอร์ต USB โน้ตบุ๊กที่จ่ายไฟได้ต่ำ (<500mA) เพราะอาจทำให้เซนเซอร์ดับหรือ Wi-Fi รีเซ็ตตัวเองได้
2. **การแชร์บัส I2C (I2C Bus Sharing)**:
   - บัส I2C บน ESP32 ขา `SDA (GPIO 21)` และ `SCL (GPIO 22)` สามารถต่อเซนเซอร์พร้อมกันได้ 2 ตัว โดยไม่มีปัญหาเรื่องการชนกันของแอดเดรส:
     - **BME280**: Address `0x76`
     - **GY-521 (MPU6050)**: Address `0x68`
3. **การทดสอบการส่งสัญญาณ (Pull-up Resistors)**:
   - บอร์ด BME280 และ GY-521 ส่วนใหญ่มี R Pull-up ออนบอร์ดอยู่แล้ว สามารถต่อตรงเข้ากับ ESP32 ได้ทันที
