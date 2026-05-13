package com.dmind.app.model;

/**
 * GeoPoint - Represents a geographic coordinate point.
 * 
 * Used by GeofenceUtils for polygon operations and location monitoring.
 */
public class GeoPoint {
    
    private double latitude;
    private double longitude;
    
    /**
     * Create a new GeoPoint
     * 
     * @param latitude - Latitude in decimal degrees
     * @param longitude - Longitude in decimal degrees
     */
    public GeoPoint(double latitude, double longitude) {
        this.latitude = latitude;
        this.longitude = longitude;
    }
    
    /**
     * Create a GeoPoint from string format (e.g., "13.7565,100.5014")
     */
    public GeoPoint(String coordinateString) {
        String[] parts = coordinateString.split(",");
        if (parts.length >= 2) {
            this.latitude = Double.parseDouble(parts[0].trim());
            this.longitude = Double.parseDouble(parts[1].trim());
        }
    }
    
    // Getters
    public double getLatitude() {
        return latitude;
    }
    
    public double getLongitude() {
        return longitude;
    }
    
    // Setters (for immutability, consider removing)
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
    public boolean equals(GeoPoint other, double epsilon) {
        return Math.abs(this.latitude - other.latitude) < epsilon &&
               Math.abs(this.longitude - other.longitude) < epsilon;
    }
    
    /**
     * Convert GeoPoint to string for debugging/storage
     */
    @Override
    public String toString() {
        return String.format("%.6f,%.6f", latitude, longitude);
    }
    
    /**
     * Convert to JSON-like string for API communication
     */
    public String toJson() {
        return String.format("{\"lat\":%.6f,\"lng\":%.6f}", latitude, longitude);
    }
    
    // ============================================================
    // Static Factory Methods
    // ============================================================
    
    /**
     * Create GeoPoint from Location object (Android)
     */
    public static GeoPoint fromAndroidLocation(android.location.Location location) {
        if (location == null) {
            return null;
        }
        return new GeoPoint(location.getLatitude(), location.getLongitude());
    }
    
    /**
     * Create GeoPoint from Google Maps API format
     */
    public static GeoPoint fromMapsApi(double lat, double lng) {
        return new GeoPoint(lat, lng);
    }
    
    /**
     * Parse GeoPoint from WKT (Well-Known Text) format
     * Example: "POINT(100.5014 13.7565)"
     */
    public static GeoPoint fromWkt(String wkt) {
        if (wkt == null || !wkt.startsWith("POINT(")) {
            return null;
        }
        
        // Extract coordinates from WKT
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
    public static GeoPoint fromDMS(String dms) {
        // This is a simplified parser - could be expanded
        // For now, assume conversion happens before this method
        return null;
    }
    
    // ============================================================
    // Coordinate System Conversions
    // ============================================================
    
    /**
     * Convert degrees to radians
     */
    public static double toRadians(double degrees) {
        return degrees * Math.PI / 180;
    }
    
    /**
     * Convert radians to degrees
     */
    public static double toDegrees(double radians) {
        return radians * 180 / Math.PI;
    }
    
    /**
     * Convert WGS84 to UTM (simplified - for regional calculations)
     */
    public UTMCoordinate toUTM() {
        // Simplified UTM conversion (for reference)
        // In production, use a proper geodesy library like GeographicLib
        int zone = (int) Math.floor((longitude + 180) / 6) + 1;
        return new UTMCoordinate(zone, latitude, longitude);
    }
}
