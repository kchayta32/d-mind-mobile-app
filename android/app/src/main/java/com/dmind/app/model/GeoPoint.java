package com.dmind.app.model;

/**
 * GeoPoint - Represents a geographic coordinate point.
 * 
 * Used by GeofenceUtils for polygon operations and location monitoring.
 */
// โมเดลข้อมูลจุดพิกัดทางภูมิศาสตร์ประกอบด้วยละติจูดและลองจิจูด
public class GeoPoint {
    
    // ข้อมูลละติจูดและลองจิจูดในรูปแบบทศนิยม
    private double latitude;
    private double longitude;
    
    /**
     * Create a new GeoPoint
     * 
     * @param latitude - Latitude in decimal degrees
     * @param longitude - Longitude in decimal degrees
     */
    // คอนสตรักเตอร์สำหรับกำหนดค่าละติจูดและลองจิจูดเริ่มต้น
    public GeoPoint(double latitude, double longitude) {
        this.latitude = latitude;
        this.longitude = longitude;
    }
    
    /**
     * Create a GeoPoint from string format (e.g., "13.7565,100.5014")
     */
    // คอนสตรักเตอร์สำหรับสร้างจุดพิกัดจากข้อความคั่นด้วยเครื่องหมายจุลภาค
    public GeoPoint(String coordinateString) {
        String[] parts = coordinateString.split(",");
        if (parts.length >= 2) {
            this.latitude = Double.parseDouble(parts[0].trim());
            this.longitude = Double.parseDouble(parts[1].trim());
        }
    }
    
    // Getters สำหรับเข้าถึงค่าละติจูดและลองจิจูด
    public double getLatitude() {
        return latitude;
    }
    
    public double getLongitude() {
        return longitude;
    }
    
    // Setters สำหรับกำหนดค่าละติจูดและลองจิจูด
    public void setLatitude(double latitude) {
        this.latitude = latitude;
    }
    
    public void setLongitude(double longitude) {
        this.longitude = longitude;
    }
    
    // ============================================================
    // Utility Methods
    // ============================================================
    
    /**
     * Check if this point equals another point (with small epsilon for floating point)
     */
    // ตรวจสอบว่าพิกัดนี้ตรงกับอีกพิกัดหนึ่งหรือไม่โดยมีค่าสัมประสิทธิ์ความคลาดเคลื่อนยอมรับได้
    public boolean equals(GeoPoint other, double epsilon) {
        return Math.abs(this.latitude - other.latitude) < epsilon &&
               Math.abs(this.longitude - other.longitude) < epsilon;
    }
    
    /**
     * Convert GeoPoint to string for debugging/storage
     */
    // แปลงจุดพิกัดเป็นข้อความทศนิยมสำหรับใช้แสดงผลหรือบันทึกข้อมูล
    @Override
    public String toString() {
        return String.format("%.6f,%.6f", latitude, longitude);
    }
    
    /**
     * Convert to JSON-like string for API communication
     */
    // แปลงจุดพิกัดให้เป็นข้อความรูปแบบ JSON เพื่อส่งผ่าน API
    public String toJson() {
        return String.format("{\"lat\":%.6f,\"lng\":%.6f}", latitude, longitude);
    }
    
    // ============================================================
    // Static Factory Methods
    // ============================================================
    
    /**
     * Create GeoPoint from Location object (Android)
     */
    // สร้าง GeoPoint จากอ็อบเจกต์ Location ของระบบปฏิบัติการ Android
    public static GeoPoint fromAndroidLocation(android.location.Location location) {
        if (location == null) {
            return null;
        }
        return new GeoPoint(location.getLatitude(), location.getLongitude());
    }
    
    /**
     * Create GeoPoint from Google Maps API format
     */
    // สร้าง GeoPoint จากข้อมูลละติจูดและลองจิจูดโดยตรง
    public static GeoPoint fromMapsApi(double lat, double lng) {
        return new GeoPoint(lat, lng);
    }
    
    /**
     * Parse GeoPoint from WKT (Well-Known Text) format
     * Example: "POINT(100.5014 13.7565)"
     */
    // แปลงข้อมูลพิกัดจุดจากรูปแบบข้อความมาตรฐาน WKT (เช่น POINT(lng lat))
    public static GeoPoint fromWkt(String wkt) {
        if (wkt == null || !wkt.startsWith("POINT(")) {
            return null;
        }
        
        // ค้นหาตำแหน่งและตัดส่วนพิกัดตัวเลขภายในวงเล็บ
        int start = wkt.indexOf('(');
        int end = wkt.indexOf(')');
        if (start == -1 || end == -1) {
            return null;
        }
        
        String coords = wkt.substring(start + 1, end);
        String[] parts = coords.split(" ");
        
        if (parts.length >= 2) {
            double lng = Double.parseDouble(parts[0].trim());
            double lat = Double.parseDouble(parts[1].trim());
            return new GeoPoint(lat, lng);
        }
        
        return null;
    }
    
    /**
     * Create a GeoPoint from degrees-minutes-seconds format
     * 
     * @param dms - String in format "13°45'23.4\"N, 100°30'12.6\"E"
     */
    // ตัวแปลงพิกัดจากรูปแบบ องศา-ลิปดา-ฟิลิปดา (DMS)
    public static GeoPoint fromDMS(String dms) {
        // เมธอดชั่วคราวยังไม่ได้ถูกเปิดใช้งานการแปลงภายในระบบนี้
        return null;
    }
    
    // ============================================================
    // Coordinate System Conversions
    // ============================================================
    
    /**
     * Convert degrees to radians
     */
    // แปลงหน่วยค่ามุมจากองศาเป็นเรเดียน
    public static double toRadians(double degrees) {
        return degrees * Math.PI / 180;
    }
    
    /**
     * Convert radians to degrees
     */
    // แปลงหน่วยค่ามุมจากเรเดียนเป็นองศา
    public static double toDegrees(double radians) {
        return radians * 180 / Math.PI;
    }
    
    /**
     * Convert WGS84 to UTM (simplified - for regional calculations)
     */
    // แปลงพิกัดภูมิศาสตร์แบบ WGS84 เป็น UTM (เวอร์ชันคำนวณอย่างง่าย)
    public UTMCoordinate toUTM() {
        // ใช้สูตรอย่างง่ายในการแปลงข้อมูลโซนพิกัด UTM
        int zone = (int) Math.floor((longitude + 180) / 6) + 1;
        return new UTMCoordinate(zone, latitude, longitude);
    }
}
