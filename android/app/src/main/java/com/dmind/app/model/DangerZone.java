package com.dmind.app.model;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;

/**
 * DangerZone - Represents a geofenced disaster danger zone.
 */
public class DangerZone {
    
    private int id;
    private String name;
    private String type; // flood, tsunami, earthquake, landslide, storm, etc.
    private String alertTitle;
    private String alertMessage;
    private String polygon; // JSON array of coordinates or WKT format
    private long createdAt;
    private long expiryTime;
    private boolean enabled;
    
    // Getters
    public int getId() { return id; }
    public String getName() { return name; }
    public String getType() { return type; }
    public String getAlertTitle() { return alertTitle; }
    public String getAlertMessage() { return alertMessage; }
    public String getPolygon() { return polygon; }
    public long getCreatedAt() { return createdAt; }
    public long getExpiryTime() { return expiryTime; }
    public boolean isEnabled() { return enabled; }
    
    // Setters
    public void setId(int id) { this.id = id; }
    public void setName(String name) { this.name = name; }
    public void setType(String type) { this.type = type; }
    public void setAlertTitle(String alertTitle) { this.alertTitle = alertTitle; }
    public void setAlertMessage(String alertMessage) { this.alertMessage = alertMessage; }
    public void setPolygon(String polygon) { this.polygon = polygon; }
    public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }
    public void setExpiryTime(long expiryTime) { this.expiryTime = expiryTime; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }
    
    // ============================================================
    // Utility Methods
    // ============================================================
    
    /**
     * Check if zone is still active (not expired)
     */
    public boolean isActive() {
        return enabled && System.currentTimeMillis() < expiryTime;
    }
    
    /**
     * Parse polygon vertices from WKT or JSON format
     */
    public List<GeoPoint> getVertices() {
        List<GeoPoint> vertices = new ArrayList<>();

        if (polygon == null || polygon.trim().isEmpty()) {
            return vertices;
        }

        String value = polygon.trim();
        try {
            if (value.startsWith("[")) {
                JSONArray array = new JSONArray(value);
                for (int i = 0; i < array.length(); i++) {
                    Object item = array.get(i);
                    if (item instanceof JSONObject) {
                        JSONObject point = (JSONObject) item;
                        double lat = point.optDouble("lat", point.optDouble("latitude"));
                        double lng = point.optDouble("lng", point.optDouble("longitude"));
                        vertices.add(new GeoPoint(lat, lng));
                    } else if (item instanceof JSONArray) {
                        JSONArray point = (JSONArray) item;
                        if (point.length() >= 2) {
                            vertices.add(new GeoPoint(point.getDouble(1), point.getDouble(0)));
                        }
                    }
                }
            } else if (value.toUpperCase().startsWith("POLYGON")) {
                String coords = value.substring(value.indexOf("((") + 2, value.lastIndexOf("))"));
                String[] pairs = coords.split(",");
                for (String pair : pairs) {
                    String[] parts = pair.trim().split("\\s+");
                    if (parts.length >= 2) {
                        vertices.add(new GeoPoint(Double.parseDouble(parts[1]), Double.parseDouble(parts[0])));
                    }
                }
            }
        } catch (Exception ignored) {
            vertices.clear();
        }

        return vertices;
    }
    
    /**
     * Get remaining time until expiry
     */
    public long getTimeUntilExpiry() {
        return Math.max(0, expiryTime - System.currentTimeMillis());
    }
    
    /**
     * Check if zone is about to expire
     */
    public boolean isExpiringSoon() {
        return getTimeUntilExpiry() < 60 * 60 * 1000; // Less than 1 hour
    }
    
    /**
     * Get human-readable zone type
     */
    public String getHumanReadableType() {
        switch (type != null ? type.toLowerCase() : "") {
            case "flood":
            case "flooding":
                return "น้ำท่วม / Flooding";
            case "tsunami":
                return "สึนามิ / Tsunami";
            case "earthquake":
                return "แผ่นดินไหว / Earthquake";
            case "landslide":
                return "ดินถล่ม / Landslide";
            case "storm":
                return "พายุ / Storm";
            default:
                return "ภัยพิบัติ / Disaster";
        }
    }
    
    // ============================================================
    // Static Factory Methods
    // ============================================================
    
    /**
     * Create flood danger zone
     */
    public static DangerZone createFloodZone(int id, String name, String alertTitle, 
                                             String alertMessage, String polygon, long expiryTime) {
        DangerZone zone = new DangerZone();
        zone.id = id;
        zone.name = name;
        zone.type = "flood";
        zone.alertTitle = alertTitle;
        zone.alertMessage = alertMessage;
        zone.polygon = polygon;
        zone.createdAt = System.currentTimeMillis();
        zone.expiryTime = expiryTime;
        zone.enabled = true;
        return zone;
    }
    
    /**
     * Create tsunami danger zone
     */
    public static DangerZone createTsunamiZone(int id, String name, String alertTitle,
                                                String alertMessage, String polygon, long expiryTime) {
        DangerZone zone = new DangerZone();
        zone.id = id;
        zone.name = name;
        zone.type = "tsunami";
        zone.alertTitle = alertTitle;
        zone.alertMessage = alertMessage;
        zone.polygon = polygon;
        zone.createdAt = System.currentTimeMillis();
        zone.expiryTime = expiryTime;
        zone.enabled = true;
        return zone;
    }
}
