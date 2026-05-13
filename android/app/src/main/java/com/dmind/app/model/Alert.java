package com.dmind.app.model;

/**
 * Alert - Represents a disaster alert from the backend.
 */
public class Alert {
    
    private int id;
    private String type; // flood, tsunami, earthquake, landslide, storm
    private String level; // critical, warning, info
    private String message;
    private String title;
    private boolean read;
    private long timestamp;
    
    // Getters
    public int getId() { return id; }
    public String getType() { return type; }
    public String getLevel() { return level; }
    public String getMessage() { return message; }
    public String getTitle() { return title; }
    public boolean isRead() { return read; }
    public long getTimestamp() { return timestamp; }
    
    // Setters
    public void setId(int id) { this.id = id; }
    public void setType(String type) { this.type = type; }
    public void setLevel(String level) { this.level = level; }
    public void setMessage(String message) { this.message = message; }
    public void setTitle(String title) { this.title = title; }
    public void setRead(boolean read) { this.read = read; }
    public void setTimestamp(long timestamp) { this.timestamp = timestamp; }
    
    // ============================================================
    // Utility Methods
    // ============================================================
    
    /**
     * Check if alert is critical
     */
    public boolean isCritical() {
        return "critical".equalsIgnoreCase(level);
    }
    
    /**
     * Check if alert should trigger full-screen notification
     */
    public boolean shouldShowFullScreen() {
        return "critical".equalsIgnoreCase(level) || "warning".equalsIgnoreCase(level);
    }
    
    /**
     * Get notification importance based on level
     */
    public int getNotificationImportance() {
        switch (level != null ? level.toLowerCase() : "") {
            case "critical":
                return android.app.NotificationManager.IMPORTANCE_HIGH;
            case "warning":
                return android.app.NotificationManager.IMPORTANCE_DEFAULT;
            default:
                return android.app.NotificationManager.IMPORTANCE_LOW;
        }
    }
    
    /**
     * Get alert icon resource based on type
     */
    public int getIconResource() {
        switch (type != null ? type.toLowerCase() : "") {
            case "tsunami":
                return android.R.drawable.ic_dialog_alert; // Red
            case "earthquake":
                return android.R.drawable.ic_menu_mylocation; // Blue
            case "flood":
                return android.R.drawable.ic_dialog_info; // Blue
            default:
                return android.R.drawable.ic_dialog_alert;
        }
    }
    
    /**
     * Get human-readable alert level
     */
    public String getHumanReadableLevel() {
        switch (level != null ? level.toLowerCase() : "") {
            case "critical":
                return "วิกฤติ / CRITICAL";
            case "warning":
                return "แจ้งเตือน / WARNING";
            default:
                return "ข้อมูล / INFO";
        }
    }
    
    /**
     * Convert to JSON string
     */
    public String toJson() {
        return String.format(
            "{\"id\":%d,\"type\":\"%s\",\"level\":\"%s\",\"title\":\"%s\",\"message\":\"%s\",\"read\":%b,\"timestamp\":%d}",
            id, type, level, title, message, read, timestamp
        );
    }
    
    // ============================================================
    // Static Factory Methods
    // ============================================================
    
    /**
     * Create critical emergency alert
     */
    public static Alert createCriticalAlert(String type, String title, String message) {
        Alert alert = new Alert();
        alert.type = type;
        alert.level = "critical";
        alert.title = title;
        alert.message = message;
        alert.read = false;
        alert.timestamp = System.currentTimeMillis();
        return alert;
    }
    
    /**
     * Create warning alert
     */
    public static Alert createWarningAlert(String type, String title, String message) {
        Alert alert = new Alert();
        alert.type = type;
        alert.level = "warning";
        alert.title = title;
        alert.message = message;
        alert.read = false;
        alert.timestamp = System.currentTimeMillis();
        return alert;
    }
    
    /**
     * Create info alert
     */
    public static Alert createInfoAlert(String type, String title, String message) {
        Alert alert = new Alert();
        alert.type = type;
        alert.level = "info";
        alert.title = title;
        alert.message = message;
        alert.read = false;
        alert.timestamp = System.currentTimeMillis();
        return alert;
    }
}
