package com.dmind.app.model;

/**
 * UTMCoordinate - Represents a coordinate in Universal Transverse Mercator (UTM) system.
 * 
 * UTM is used for regional distance calculations and provides meter-based coordinates.
 */
// โมเดลข้อมูลพิกัดระบบ UTM (Universal Transverse Mercator) เพื่อช่วยคำนวณระยะทางเป็นเมตรอย่างแม่นยำ
public class UTMCoordinate {
    
    // คุณสมบัติต่างๆ ของพิกัด UTM
    private int zone;
    private double easting;
    private double northing;
    private double latitude;
    private double longitude;
    private boolean isNorthernHemisphere;
    
    /**
     * Create UTM coordinate
     */
    // คอนสตรักเตอร์สำหรับพิกัด UTM โดยดึงโซนเริ่มต้นและคำนวณแปลงพิกัดทันที
    public UTMCoordinate(int zone, double latitude, double longitude) {
        this.zone = zone;
        this.latitude = latitude;
        this.longitude = longitude;
        this.isNorthernHemisphere = latitude >= 0;
        
        // แปลงพิกัดภูมิศาสตร์ปกติเป็นรูปแบบ UTM
        convertToUTM();
    }
    
    /**
     * Convert WGS84 to UTM (simplified implementation)
     * For production, use a proper geodesy library
     */
    // อัลกอริทึมแปลงระบบพิกัดภูมิศาสตร์ (WGS84) เป็นพิกัด UTM แบบย่อ (easting, northing)
    private void convertToUTM() {
        double latRad = GeoPoint.toRadians(latitude);
        double lonRad = GeoPoint.toRadians(longitude);
        double lonZero = GeoPoint.toRadians((zone - 1) * 6 - 180 + 3);
        
        // ค่าสัมประสิทธิ์ความเยื้องศูนย์กลางของทรงรี WGS84
        double e = 0.0818191908429;
        double e2 = e * e;
        double e4 = e2 * e2;
        double e6 = e4 * e2;
        
        // คำนวณหาค่าละติจูดโครงร่าง (footprint latitude)
        double mu = latRad - (e2/2 - 5*e4/24 + e6/12) * Math.sin(2*latRad) 
                    + (7*e4/48 - 29*e6/240) * Math.sin(4*latRad)
                    - (7*e4/240 + 17*e6/240) * Math.sin(6*latRad);
        
        double N = 6378137.0 / Math.sqrt(1 - e2 * Math.sin(latRad) * Math.sin(latRad));
        double T = Math.tan(latRad) * Math.tan(latRad);
        double C = e2 / (1 - e2) * Math.cos(latRad) * Math.cos(latRad);
        double A = (lonRad - lonZero) * Math.cos(latRad);
        
        // M คือระยะทางตามแนวเส้นเมอริเดียนจากเส้นศูนย์สูตรถึงละติจูด (เมตร)
        double M = 6378137.0 * ((1 - e2/4 - 3*e4/64 - 5*e6/256) * latRad 
                - (3*e2/8 + 3*e4/32 + 45*e6/1024) * Math.sin(2*latRad)
                + (15*e4/256 + 45*e6/1024) * Math.sin(4*latRad)
                - (35*e6/3072) * Math.sin(6*latRad));
        
        // คำนวณค่าพิกัด UTM แกน X (easting) และแกน Y (northing)
        northing = M + 6378137.0 * (latRad - mu) * (1 + T + C);
        easting = 500000 + 6378137.0 * A * (1 - T + (5 - 18*T + T*T + 14*C - 58*C*C) * A * A / 24);
        
        // เพิ่มค่าชดเชย False Northing สำหรับซีกโลกใต้
        if (!isNorthernHemisphere) {
            northing += 10000000;
        }
    }
    
    // Getters สำหรับเข้าถึงค่าพิกัด UTM
    public int getZone() { return zone; }
    public double getEasting() { return easting; }
    public double getNorthing() { return northing; }
    public double getLatitude() { return latitude; }
    public double getLongitude() { return longitude; }
    public boolean isNorthernHemisphere() { return isNorthernHemisphere; }
    
    // Setters สำหรับกำหนดค่าพิกัด UTM
    public void setZone(int zone) { this.zone = zone; }
    public void setEasting(double easting) { this.easting = easting; }
    public void setNorthing(double northing) { this.northing = northing; }
    public void setLatitude(double latitude) { this.latitude = latitude; }
    public void setLongitude(double longitude) { this.longitude = longitude; }
    public void setNorthernHemisphere(boolean northernHemisphere) { isNorthernHemisphere = northernHemisphere; }
    
    /**
     * Calculate distance to another UTM coordinate
     * UTM coordinates are in meters, so this is straightforward
     */
    // คำนวณระยะทางตรงระหว่างพิกัด UTM สองจุด (หน่วยเป็นเมตรโดยใช้ทฤษฎีบทพีทาโกรัส)
    public double distanceTo(UTMCoordinate other) {
        double dx = this.easting - other.easting;
        double dy = this.northing - other.northing;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    /**
     * Check if this UTM coordinate is within a radius of another coordinate
     */
    // ตรวจสอบว่าพิกัดนี้อยู่ในรัศมีขอบเขตที่กำหนดหรือไม่ (รัศมีหน่วยเป็นเมตร)
    public boolean isWithinRadius(UTMCoordinate other, double radiusMeters) {
        return distanceTo(other) <= radiusMeters;
    }
    
    /**
     * Check if this coordinate is in the same UTM zone as another
     */
    // ตรวจสอบว่าพิกัดนี้อยู่ในโซน UTM เดียวกันกับอีกพิกัดหรือไม่
    public boolean inSameZone(UTMCoordinate other) {
        return this.zone == other.zone;
    }
    
    /**
     * Convert to GeoPoint (WGS84) - simplified
     * For production, use GeographicLib
     */
    // แปลงพิกัด UTM ให้กลับเป็นจุดพิกัดทางภูมิศาสตร์ GeoPoint
    public GeoPoint toGeoPoint() {
        return new GeoPoint(latitude, longitude);
    }
    
    /**
     * Convert to string representation
     */
    // แสดงข้อมูลรายละเอียดพิกัด UTM ในรูปแบบข้อความ
    @Override
    public String toString() {
        return String.format("UTM Zone %d%s, E: %.2fm, N: %.2fm", 
            zone, 
            isNorthernHemisphere ? "N" : "S",
            easting, northing);
    }
    
    /**
     * Check if coordinates are valid
     */
    // ตรวจสอบว่าค่าของโซน ค่าทิศตะวันออก และค่าทิศเหนือเป็นพิกัด UTM ที่ถูกต้องตามทฤษฎีหรือไม่
    public boolean isValid() {
        return zone >= 1 && zone <= 60 &&
               easting >= 100000 && easting <= 900000 &&
               northing >= 0 && northing <= 10000000;
    }
    
    // ============================================================
    // Static Factory Methods
    // ============================================================
    
    /**
     * Create UTM coordinate from GeoPoint
     */
    // เมธอด static สำหรับสร้างวัตถุพิกัด UTM จากวัตถุ GeoPoint
    public static UTMCoordinate fromGeoPoint(GeoPoint point) {
        int zone = (int) Math.floor((point.getLongitude() + 180) / 6) + 1;
        return new UTMCoordinate(zone, point.getLatitude(), point.getLongitude());
    }
    
    /**
     * Create UTM coordinate from string
     * Example: "54N 345678E 1375678N"
     */
    // เมธอด static สำหรับการแปลงข้อความพิกัดรูปแบบ UTM ให้เป็นวัตถุ UTMCoordinate
    public static UTMCoordinate fromString(String utmString) {
        try {
            String[] parts = utmString.split("[,\\s]+");
            if (parts.length >= 3) {
                int zone = Integer.parseInt(parts[0].replace("N", "").replace("S", ""));
                double easting = Double.parseDouble(parts[1].replace("E", ""));
                double northing = Double.parseDouble(parts[2].replace("N", ""));
                
                UTMCoordinate coord = new UTMCoordinate(zone, 0, 0);
                coord.easting = easting;
                coord.northing = northing;
                coord.isNorthernHemisphere = parts[0].contains("N");
                
                return coord;
            }
        } catch (Exception e) {
            // ดักจับข้อผิดพลาดการดึงข้อมูลรูปแบบข้อความ
        }
        return null;
    }
}
