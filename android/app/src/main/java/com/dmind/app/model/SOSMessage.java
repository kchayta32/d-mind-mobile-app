package com.dmind.app.model;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.Locale;

/**
 * SOSMessage - Represents a SOS (Save Our Souls) emergency message.
 */
// โมเดลข้อมูลแทนข้อความขอความช่วยเหลือฉุกเฉิน (SOS Emergency Message)
public class SOSMessage {
    
    // คุณสมบัติของข้อความขอความช่วยเหลือฉุกเฉิน
    private int id;
    private String userId;
    private double latitude;
    private double longitude;
    private int batteryLevel;
    private String message;
    private String status; // pending, sent, failed
    private long createdAt;
    private long sentAt;
    
    // Getters สำหรับเข้าถึงข้อมูลคุณสมบัติ
    public int getId() { return id; }
    public String getUserId() { return userId; }
    public double getLatitude() { return latitude; }
    public double getLongitude() { return longitude; }
    public int getBatteryLevel() { return batteryLevel; }
    public String getMessage() { return message; }
    public String getStatus() { return status; }
    public long getCreatedAt() { return createdAt; }
    public long getSentAt() { return sentAt; }
    
    // Setters สำหรับกำหนดค่าคุณสมบัติ
    public void setId(int id) { this.id = id; }
    public void setUserId(String userId) { this.userId = userId; }
    public void setLatitude(double latitude) { this.latitude = latitude; }
    public void setLongitude(double longitude) { this.longitude = longitude; }
    public void setBatteryLevel(int batteryLevel) { this.batteryLevel = batteryLevel; }
    public void setMessage(String message) { this.message = message; }
    public void setStatus(String status) { this.status = status; }
    public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }
    public void setSentAt(long sentAt) { this.sentAt = sentAt; }
    
    // ============================================================
    // Utility Methods
    // ============================================================
    
    /**
     * Check if SOS is valid (has minimum required data)
     */
    // ตรวจสอบความถูกต้องของข้อความ SOS (มีข้อมูลสำคัญครบถ้วน เช่น ละติจูด ลองจิจูด และระดับแบตเตอรี่)
    public boolean isValid() {
        return userId != null && !userId.isEmpty() &&
               latitude != 0.0 && longitude != 0.0 &&
               batteryLevel >= 0 && batteryLevel <= 100;
    }
    
    /**
     * Get SOS as JSON string for API communication
     */
    // แปลงโมเดลข้อมูลข้อความ SOS เป็นข้อความรูปแบบโครงสร้าง JSON สำหรับส่งไปยังเซิร์ฟเวอร์หลังบ้าน
    // ชื่อฟิลด์ต้องตรงกับ SosRequest ของ backend (userId, latitude, longitude, batteryLevel, message)
    // และใช้ JSONObject เพื่อให้ escape ถูกต้องและไม่ขึ้นกับ Locale ของเครื่อง (เช่น ทศนิยมเป็น ',')
    public String toJson() {
        try {
            JSONObject json = new JSONObject();
            json.put("id", id > 0 ? String.valueOf(id) : JSONObject.NULL);
            json.put("userId", userId != null && !userId.isEmpty() ? userId : "anonymous");
            json.put("latitude", latitude);
            json.put("longitude", longitude);
            json.put("batteryLevel", batteryLevel);
            json.put("message", message != null ? message : "");
            json.put("status", status != null ? status : "pending");
            json.put("createdAt", createdAt);
            return json.toString();
        } catch (JSONException e) {
            throw new IllegalStateException("Unable to serialize SOS message", e);
        }
    }
    
    /**
     * Get SOS as readable string
     */
    // แปลงข้อมูลการขอความช่วยเหลือเป็นข้อความที่มนุษย์อ่านเข้าใจง่ายเพื่อใช้ทำ Log หรือตรวจสอบ
    @Override
    public String toString() {
        return String.format(Locale.US, "SOS[id=%d, user=%s, location=%.6f,%.6f, battery=%d%%, msg=%s, status=%s]",
            id, userId, latitude, longitude, batteryLevel, message, status);
    }
    
    /**
     * Create SOS from JSON string
     */
    // แปลงข้อความ JSON ให้กลับมาเป็นอ็อบเจกต์ SOSMessage (รองรับทั้งชื่อฟิลด์ใหม่และชื่อฟิลด์เดิม)
    public static SOSMessage fromJson(String json) {
        SOSMessage msg = new SOSMessage();
        if (json == null || json.trim().isEmpty()) {
            return msg;
        }
        try {
            JSONObject obj = new JSONObject(json);
            String rawId = obj.optString("id", "");
            if (!rawId.isEmpty()) {
                try {
                    msg.id = Integer.parseInt(rawId);
                } catch (NumberFormatException ignored) {
                    // id ที่ไม่ใช่ตัวเลข (เช่น UUID จากเซิร์ฟเวอร์) จะถูกละไว้
                }
            }
            msg.userId = obj.optString("userId", obj.optString("user_id", null));
            msg.latitude = obj.optDouble("latitude", obj.optDouble("lat", 0.0));
            msg.longitude = obj.optDouble("longitude", obj.optDouble("lng", 0.0));
            msg.batteryLevel = obj.optInt("batteryLevel", obj.optInt("battery", -1));
            msg.message = obj.optString("message", null);
            msg.status = obj.optString("status", "pending");
            msg.createdAt = obj.optLong("createdAt", obj.optLong("created", 0L));
        } catch (JSONException ignored) {
            // คืนค่าออบเจกต์ว่างหากรูปแบบ JSON ไม่ถูกต้อง
        }
        return msg;
    }
}
