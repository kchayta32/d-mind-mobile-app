package com.dmind.app.model;

import java.util.ArrayList;
import java.util.List;

/**
 * SOSMessage - Represents a SOS (Save Our Souls) emergency message.
 */
public class SOSMessage {
    
    private int id;
    private String userId;
    private double latitude;
    private double longitude;
    private int batteryLevel;
    private String message;
    private String status; // pending, sent, failed
    private long createdAt;
    private long sentAt;
    
    // Getters
    public int getId() { return id; }
    public String getUserId() { return userId; }
    public double getLatitude() { return latitude; }
    public double getLongitude() { return longitude; }
    public int getBatteryLevel() { return batteryLevel; }
    public String getMessage() { return message; }
    public String getStatus() { return status; }
    public long getCreatedAt() { return createdAt; }
    public long getSentAt() { return sentAt; }
    
    // Setters
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
    public boolean isValid() {
        return userId != null && !userId.isEmpty() &&
               latitude != 0.0 && longitude != 0.0 &&
               batteryLevel >= 0 && batteryLevel <= 100;
    }
    
    /**
     * Get SOS as JSON string for API communication
     */
    public String toJson() {
        return String.format(
            "{\"user_id\":\"%s\",\"lat\":%.6f,\"lng\":%.6f,\"battery\":%d,\"message\":\"%s\",\"status\":\"%s\",\"created\":%d}",
            userId != null ? userId : "",
            latitude, longitude, batteryLevel,
            message != null ? message.replace("\"", "\\\"") : "",
            status != null ? status : "pending",
            createdAt
        );
    }
    
    /**
     * Get SOS as readable string
     */
    @Override
    public String toString() {
        return String.format("SOS[id=%d, user=%s, location=%.6f,%.6f, battery=%d%%, msg=%s, status=%s]",
            id, userId, latitude, longitude, batteryLevel, message, status);
    }
    
    /**
     * Create SOS from JSON string
     */
    public static SOSMessage fromJson(String json) {
        // Simple JSON parsing - in production, use a JSON library
        SOSMessage msg = new SOSMessage();
        
        // Parse JSON manually or use Gson/JSONObject
        // This is a simplified implementation
        
        return msg;
    }
}
