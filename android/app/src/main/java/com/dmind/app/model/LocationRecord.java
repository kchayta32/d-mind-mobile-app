package com.dmind.app.model;

/**
 * LocationRecord - Represents a recorded location with timestamp and accuracy.
 */
// โมเดลข้อมูลประวัติตำแหน่งพิกัดที่มีข้อมูลเวลาบันทึกและความแม่นยำ
public class LocationRecord {
    
    // คุณสมบัติต่างๆ ของพิกัดประวัติการเดินทาง
    private int id;
    private double latitude;
    private double longitude;
    private long timestamp;
    private float accuracy;
    private int zoneId;
    
    // Getters สำหรับเข้าถึงข้อมูลคุณสมบัติ
    public int getId() { return id; }
    public double getLatitude() { return latitude; }
    public double getLongitude() { return longitude; }
    public long getTimestamp() { return timestamp; }
    public float getAccuracy() { return accuracy; }
    public int getZoneId() { return zoneId; }
    
    // Setters สำหรับกำหนดค่าคุณสมบัติ
    public void setId(int id) { this.id = id; }
    public void setLatitude(double latitude) { this.latitude = latitude; }
    public void setLongitude(double longitude) { this.longitude = longitude; }
    public void setTimestamp(long timestamp) { this.timestamp = timestamp; }
    public void setAccuracy(float accuracy) { this.accuracy = accuracy; }
    public void setZoneId(int zoneId) { this.zoneId = zoneId; }
    
    // ============================================================
    // Utility Methods
    // ============================================================
    
    /**
     * Check if location is accurate enough (based on meters)
     */
    // ตรวจสอบว่าพิกัดมีความแม่นยำเพียงพอหรือไม่โดยเทียบกับเกณฑ์หน่วยเมตร
    public boolean isAccurateEnough(float thresholdMeters) {
        return accuracy <= thresholdMeters;
    }
    
    /**
     * Get location as GeoPoint
     */
    // แปลงข้อมูลพิกัดเป็นอ็อบเจกต์ GeoPoint
    public GeoPoint getGeoPoint() {
        return new GeoPoint(latitude, longitude);
    }
    
    /**
     * Calculate time since this location was recorded
     */
    // คำนวณระยะเวลานับตั้งแต่พิกัดนี้ถูกบันทึกจนถึงปัจจุบัน (มิลลิวินาที)
    public long getTimeSinceRecorded() {
        return System.currentTimeMillis() - timestamp;
    }
    
    /**
     * Check if this is a recent location (within last 5 minutes)
     */
    // ตรวจสอบว่าเป็นตำแหน่งปัจจุบัน/เพิ่งบันทึกไม่นานมานี้ (ภายใน 5 นาทีล่าสุด)
    public boolean isRecent() {
        return getTimeSinceRecorded() < 5 * 60 * 1000; // 5 minutes
    }
    
    /**
     * Get location string for logging
     */
    // แปลงรายละเอียดพิกัดเป็นข้อความแบบสังเขปเพื่อใช้บันทึก Log
    @Override
    public String toString() {
        return String.format("Location[id=%d, %.6f,%.6f, acc=%.1fm, %ds ago]",
            id, latitude, longitude, accuracy, getTimeSinceRecorded() / 1000);
    }
    
    /**
     * Get human-readable timestamp
     */
    // แปลงเวลาบันทึกตำแหน่งให้อ่านเข้าใจง่าย เช่น เมื่อสักครู่, กี่นาทีที่แล้ว
    public String getHumanReadableTime() {
        long secondsAgo = getTimeSinceRecorded() / 1000;
        
        if (secondsAgo < 60) {
            return "Just now";
        } else if (secondsAgo < 3600) {
            return secondsAgo / 60 + " minutes ago";
        } else if (secondsAgo < 86400) {
            return secondsAgo / 3600 + " hours ago";
        } else {
            return secondsAgo / 86400 + " days ago";
        }
    }
    
    // ============================================================
    // Static Factory Methods
    // ============================================================
    
    /**
     * Create location from GeoPoint
     */
    // เมธอด static สำหรับสร้างข้อมูลบันทึกตำแหน่งจาก GeoPoint อย่างรวดเร็ว
    public static LocationRecord fromGeoPoint(GeoPoint point) {
        LocationRecord record = new LocationRecord();
        record.latitude = point.getLatitude();
        record.longitude = point.getLongitude();
        record.timestamp = System.currentTimeMillis();
        record.accuracy = 10.0f; // Default accuracy
        return record;
    }
    
    /**
     * Create location from Android Location object
     */
    // เมธอด static สำหรับสร้างข้อมูลบันทึกตำแหน่งจากอ็อบเจกต์ Location ของระบบปฏิบัติการ Android
    public static LocationRecord fromAndroidLocation(android.location.Location location) {
        LocationRecord record = new LocationRecord();
        record.latitude = location.getLatitude();
        record.longitude = location.getLongitude();
        record.timestamp = location.getTime();
        record.accuracy = location.getAccuracy();
        return record;
    }
}
