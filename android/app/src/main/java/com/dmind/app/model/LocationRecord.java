package com.dmind.app.model;

/**
 * LocationRecord - Represents a recorded location with timestamp and accuracy.
 */
public class LocationRecord {
    
    private int id;
    private double latitude;
    private double longitude;
    private long timestamp;
    private float accuracy;
    private int zoneId;
    
    // Getters
    public int getId() { return id; }
    public double getLatitude() { return latitude; }
    public double getLongitude() { return longitude; }
    public long getTimestamp() { return timestamp; }
    public float getAccuracy() { return accuracy; }
    public int getZoneId() { return zoneId; }
    
    // Setters
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
    public boolean isAccurateEnough(float thresholdMeters) {
        return accuracy <= thresholdMeters;
    }
    
    /**
     * Get location as GeoPoint
     */
    public GeoPoint getGeoPoint() {
        return new GeoPoint(latitude, longitude);
    }
    
    /**
     * Calculate time since this location was recorded
     */
    public long getTimeSinceRecorded() {
        return System.currentTimeMillis() - timestamp;
    }
    
    /**
     * Check if this is a recent location (within last 5 minutes)
     */
    public boolean isRecent() {
        return getTimeSinceRecorded() < 5 * 60 * 1000; // 5 minutes
    }
    
    /**
     * Get location string for logging
     */
    @Override
    public String toString() {
        return String.format("Location[id=%d, %.6f,%.6f, acc=%.1fm, %ds ago]",
            id, latitude, longitude, accuracy, getTimeSinceRecorded() / 1000);
    }
    
    /**
     * Get human-readable timestamp
     */
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
    public static LocationRecord fromAndroidLocation(android.location.Location location) {
        LocationRecord record = new LocationRecord();
        record.latitude = location.getLatitude();
        record.longitude = location.getLongitude();
        record.timestamp = location.getTime();
        record.accuracy = location.getAccuracy();
        return record;
    }
}
