package com.dmind.app.database;

import android.content.Context;
import android.content.ContentValues;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;
import android.util.Log;

import com.dmind.app.model.Alert;
import com.dmind.app.model.DangerZone;
import com.dmind.app.model.LocationRecord;
import com.dmind.app.model.SOSMessage;

import java.util.ArrayList;
import java.util.List;

/**
 * AlertsCacheDAO - Database access object for alerts and danger zones.
 * 
 * This DAO manages:
 * 1. Danger zones (geofenced disaster areas)
 * 2. SOS message queue (for offline sending)
 * 3. Alert cache (received alerts from backend)
 * 4. User location history
 */
// ตัวจัดการการเข้าถึงฐานข้อมูล SQLite สำหรับเก็บข้อมูลแจ้งเตือน พื้นที่อันตราย และประวัติตำแหน่ง
public class AlertsCacheDAO extends SQLiteOpenHelper {
    
    // กำหนดชื่อและเวอร์ชันของฐานข้อมูล
    private static final String DATABASE_NAME = "dmind_alerts.db";
    private static final int DATABASE_VERSION = 1;
    
    // รายชื่อตารางในระบบฐานข้อมูล
    public static final String TABLE_DANGER_ZONES = "danger_zones";
    public static final String TABLE_SOS_QUEUE = "sos_queue";
    public static final String TABLE_ALERTS_CACHE = "alerts_cache";
    public static final String TABLE_LOCATION_HISTORY = "location_history";
    
    // โครงสร้างคอลัมน์ของตารางพื้นที่อันตราย (Danger Zones)
    public static final String COLUMN_ZONE_ID = "zone_id";
    public static final String COLUMN_ZONE_NAME = "zone_name";
    public static final String COLUMN_ZONE_TYPE = "zone_type";
    public static final String COLUMN_ZONE_ALERT_TITLE = "alert_title";
    public static final String COLUMN_ZONE_ALERT_MESSAGE = "alert_message";
    public static final String COLUMN_ZONE_POLYGON = "polygon_vertices";
    public static final String COLUMN_ZONE_CREATED = "created_at";
    public static final String COLUMN_ZONE_EXPIRY = "expiry_time";
    public static final String COLUMN_ZONE_ENABLED = "is_enabled";
    
    // โครงสร้างคอลัมน์ของตารางคิวข้อความขอความช่วยเหลือฉุกเฉิน (SOS Queue)
    public static final String COLUMN_SOS_ID = "sos_id";
    public static final String COLUMN_SOS_USER_ID = "user_id";
    public static final String COLUMN_SOS_LATITUDE = "latitude";
    public static final String COLUMN_SOS_LONGITUDE = "longitude";
    public static final String COLUMN_SOS_BATTERY = "battery_level";
    public static final String COLUMN_SOS_MESSAGE = "message";
    public static final String COLUMN_SOS_STATUS = "status";
    public static final String COLUMN_SOS_CREATED = "created_at";
    public static final String COLUMN_SOS_SENT = "sent_at";
    
    // โครงสร้างคอลัมน์ของตารางประวัติการบันทึกการแจ้งเตือน (Alerts Cache)
    public static final String COLUMN_ALERT_ID = "alert_id";
    public static final String COLUMN_ALERT_TYPE = "alert_type";
    public static final String COLUMN_ALERT_LEVEL = "alert_level";
    public static final String COLUMN_ALERT_MESSAGE = "alert_message";
    public static final String COLUMN_ALERT_TITLE = "alert_title";
    public static final String COLUMN_ALERT_READ = "is_read";
    public static final String COLUMN_ALERT_TIMESTAMP = "timestamp";
    
    // โครงสร้างคอลัมน์ของตารางประวัติตำแหน่งผู้ใช้ (Location History)
    public static final String COLUMN_LOC_ID = "loc_id";
    public static final String COLUMN_LOC_LATITUDE = "latitude";
    public static final String COLUMN_LOC_LONGITUDE = "longitude";
    public static final String COLUMN_LOC_TIMESTAMP = "timestamp";
    public static final String COLUMN_LOC_ACCURACY = "accuracy";
    public static final String COLUMN_LOC_ZONE_ID = "zone_id";
    
    private static final String TAG = "AlertsCacheDAO";
    
    // คอนสตรักเตอร์สำหรับสร้างและเตรียมการเชื่อมต่อฐานข้อมูล
    public AlertsCacheDAO(Context context) {
        super(context, DATABASE_NAME, null, DATABASE_VERSION);
    }
    
    @Override
    public void onCreate(SQLiteDatabase db) {
        // สร้างตารางสำหรับเก็บข้อมูลพื้นที่อันตราย
        String CREATE_DANGER_ZONES_TABLE = "CREATE TABLE " + TABLE_DANGER_ZONES + " (" +
                COLUMN_ZONE_ID + " INTEGER PRIMARY KEY," +
                COLUMN_ZONE_NAME + " TEXT," +
                COLUMN_ZONE_TYPE + " TEXT," +
                COLUMN_ZONE_ALERT_TITLE + " TEXT," +
                COLUMN_ZONE_ALERT_MESSAGE + " TEXT," +
                COLUMN_ZONE_POLYGON + " TEXT," +
                COLUMN_ZONE_CREATED + " INTEGER," +
                COLUMN_ZONE_EXPIRY + " INTEGER," +
                COLUMN_ZONE_ENABLED + " INTEGER DEFAULT 1" +
                ")";
        db.execSQL(CREATE_DANGER_ZONES_TABLE);
        
        // สร้างตารางสำหรับคิวข้อความขอความช่วยเหลือฉุกเฉิน (SOS)
        String CREATE_SOS_QUEUE_TABLE = "CREATE TABLE " + TABLE_SOS_QUEUE + " (" +
                COLUMN_SOS_ID + " INTEGER PRIMARY KEY AUTOINCREMENT," +
                COLUMN_SOS_USER_ID + " TEXT," +
                COLUMN_SOS_LATITUDE + " REAL," +
                COLUMN_SOS_LONGITUDE + " REAL," +
                COLUMN_SOS_BATTERY + " INTEGER," +
                COLUMN_SOS_MESSAGE + " TEXT," +
                COLUMN_SOS_STATUS + " TEXT DEFAULT 'pending'," +
                COLUMN_SOS_CREATED + " INTEGER," +
                COLUMN_SOS_SENT + " INTEGER" +
                ")";
        db.execSQL(CREATE_SOS_QUEUE_TABLE);
        
        // สร้างตารางสำหรับประวัติการรับการแจ้งเตือนภัยพิบัติ
        String CREATE_ALERTS_CACHE_TABLE = "CREATE TABLE " + TABLE_ALERTS_CACHE + " (" +
                COLUMN_ALERT_ID + " INTEGER PRIMARY KEY AUTOINCREMENT," +
                COLUMN_ALERT_TYPE + " TEXT," +
                COLUMN_ALERT_LEVEL + " TEXT," +
                COLUMN_ALERT_MESSAGE + " TEXT," +
                COLUMN_ALERT_TITLE + " TEXT," +
                COLUMN_ALERT_READ + " INTEGER DEFAULT 0," +
                COLUMN_ALERT_TIMESTAMP + " INTEGER" +
                ")";
        db.execSQL(CREATE_ALERTS_CACHE_TABLE);
        
        // สร้างตารางสำหรับเก็บประวัติตำแหน่งทางภูมิศาสตร์ของผู้ใช้
        String CREATE_LOCATION_HISTORY_TABLE = "CREATE TABLE " + TABLE_LOCATION_HISTORY + " (" +
                COLUMN_LOC_ID + " INTEGER PRIMARY KEY AUTOINCREMENT," +
                COLUMN_LOC_LATITUDE + " REAL," +
                COLUMN_LOC_LONGITUDE + " REAL," +
                COLUMN_LOC_TIMESTAMP + " INTEGER," +
                COLUMN_LOC_ACCURACY + " REAL," +
                COLUMN_LOC_ZONE_ID + " INTEGER" +
                ")";
        db.execSQL(CREATE_LOCATION_HISTORY_TABLE);
        
        Log.d(TAG, "Database tables created");
    }
    
    @Override
    public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
        // ลบตารางเดิมออกหากมีการอัปเกรดเวอร์ชันฐานข้อมูล
        db.execSQL("DROP TABLE IF EXISTS " + TABLE_DANGER_ZONES);
        db.execSQL("DROP TABLE IF EXISTS " + TABLE_SOS_QUEUE);
        db.execSQL("DROP TABLE IF EXISTS " + TABLE_ALERTS_CACHE);
        db.execSQL("DROP TABLE IF EXISTS " + TABLE_LOCATION_HISTORY);
        
        // สร้างตารางใหม่ทั้งหมดหลังจากลบเสร็จสิ้น
        onCreate(db);
        
        Log.d(TAG, "Database upgraded from version " + oldVersion + " to " + newVersion);
    }
    
    // ============================================================
    // Danger Zone Operations
    // ============================================================
    
    /**
     * Add danger zone to database
     */
    // เพิ่มข้อมูลพื้นที่อันตรายใหม่ลงในฐานข้อมูล
    public long addDangerZone(DangerZone zone) {
        SQLiteDatabase db = this.getWritableDatabase();
        
        ContentValues values = new ContentValues();
        values.put(COLUMN_ZONE_ID, zone.getId());
        values.put(COLUMN_ZONE_NAME, zone.getName());
        values.put(COLUMN_ZONE_TYPE, zone.getType());
        values.put(COLUMN_ZONE_ALERT_TITLE, zone.getAlertTitle());
        values.put(COLUMN_ZONE_ALERT_MESSAGE, zone.getAlertMessage());
        values.put(COLUMN_ZONE_POLYGON, zone.getPolygon());
        values.put(COLUMN_ZONE_CREATED, zone.getCreatedAt());
        values.put(COLUMN_ZONE_EXPIRY, zone.getExpiryTime());
        values.put(COLUMN_ZONE_ENABLED, zone.isEnabled() ? 1 : 0);
        
        long id = db.insert(TABLE_DANGER_ZONES, null, values);
        db.close();
        
        Log.d(TAG, "Danger zone added with ID: " + id);
        return id;
    }
    
    /**
     * Get all danger zones
     */
    // ดึงรายการพื้นที่อันตรายทั้งหมดที่เปิดใช้งานและยังไม่หมดอายุ
    public List<DangerZone> getAllDangerZones() {
        List<DangerZone> zones = new ArrayList<>();
        String query = "SELECT * FROM " + TABLE_DANGER_ZONES + 
                      " WHERE " + COLUMN_ZONE_ENABLED + " = 1" +
                      " ORDER BY " + COLUMN_ZONE_EXPIRY + " ASC";
        
        SQLiteDatabase db = this.getReadableDatabase();
        Cursor cursor = db.rawQuery(query, null);
        
        if (cursor.moveToFirst()) {
            do {
                DangerZone zone = new DangerZone();
                zone.setId(cursor.getInt(cursor.getColumnIndexOrThrow(COLUMN_ZONE_ID)));
                zone.setName(cursor.getString(cursor.getColumnIndexOrThrow(COLUMN_ZONE_NAME)));
                zone.setType(cursor.getString(cursor.getColumnIndexOrThrow(COLUMN_ZONE_TYPE)));
                zone.setAlertTitle(cursor.getString(cursor.getColumnIndexOrThrow(COLUMN_ZONE_ALERT_TITLE)));
                zone.setAlertMessage(cursor.getString(cursor.getColumnIndexOrThrow(COLUMN_ZONE_ALERT_MESSAGE)));
                zone.setPolygon(cursor.getString(cursor.getColumnIndexOrThrow(COLUMN_ZONE_POLYGON)));
                zone.setCreatedAt(cursor.getLong(cursor.getColumnIndexOrThrow(COLUMN_ZONE_CREATED)));
                zone.setExpiryTime(cursor.getLong(cursor.getColumnIndexOrThrow(COLUMN_ZONE_EXPIRY)));
                zone.setEnabled(cursor.getInt(cursor.getColumnIndexOrThrow(COLUMN_ZONE_ENABLED)) == 1);
                
                zones.add(zone);
            } while (cursor.moveToNext());
        }
        
        cursor.close();
        db.close();
        
        Log.d(TAG, "Loaded " + zones.size() + " danger zones");
        return zones;
    }
    
    // ============================================================
    // SOS Queue Operations
    // ============================================================
    
    /**
     * Enqueue SOS message
     */
    // เพิ่มข้อความ SOS เข้าสู่คิวการส่ง (ใช้สำหรับเก็บออฟไลน์เมื่อไม่มีสัญญาณเน็ต)
    public long enqueueSOS(String userId, double latitude, double longitude, 
                          int batteryLevel, String message) {
        SQLiteDatabase db = this.getWritableDatabase();
        
        ContentValues values = new ContentValues();
        values.put(COLUMN_SOS_USER_ID, userId);
        values.put(COLUMN_SOS_LATITUDE, latitude);
        values.put(COLUMN_SOS_LONGITUDE, longitude);
        values.put(COLUMN_SOS_BATTERY, batteryLevel);
        values.put(COLUMN_SOS_MESSAGE, message);
        values.put(COLUMN_SOS_STATUS, "pending");
        values.put(COLUMN_SOS_CREATED, System.currentTimeMillis());
        
        long id = db.insert(TABLE_SOS_QUEUE, null, values);
        db.close();
        
        Log.d(TAG, "SOS message enqueued with ID: " + id);
        return id;
    }
    
    /**
     * Get pending SOS messages
     */
    // ดึงข้อมูลข้อความขอความช่วยเหลือ SOS ที่ยังอยู่ในสถานะรอดำเนินการส่ง
    public List<SOSMessage> getPendingSOSMessages() {
        List<SOSMessage> messages = new ArrayList<>();
        SQLiteDatabase db = this.getReadableDatabase();
        Cursor cursor = db.query(
            TABLE_SOS_QUEUE,
            null,
            COLUMN_SOS_STATUS + " = ?",
            new String[]{"pending"},
            null, null,
            COLUMN_SOS_CREATED + " ASC"
        );
        
        if (cursor.moveToFirst()) {
            do {
                SOSMessage msg = new SOSMessage();
                msg.setId(cursor.getInt(cursor.getColumnIndexOrThrow(COLUMN_SOS_ID)));
                msg.setUserId(cursor.getString(cursor.getColumnIndexOrThrow(COLUMN_SOS_USER_ID)));
                msg.setLatitude(cursor.getDouble(cursor.getColumnIndexOrThrow(COLUMN_SOS_LATITUDE)));
                msg.setLongitude(cursor.getDouble(cursor.getColumnIndexOrThrow(COLUMN_SOS_LONGITUDE)));
                msg.setBatteryLevel(cursor.getInt(cursor.getColumnIndexOrThrow(COLUMN_SOS_BATTERY)));
                msg.setMessage(cursor.getString(cursor.getColumnIndexOrThrow(COLUMN_SOS_MESSAGE)));
                msg.setCreatedAt(cursor.getLong(cursor.getColumnIndexOrThrow(COLUMN_SOS_CREATED)));
                
                messages.add(msg);
            } while (cursor.moveToNext());
        }
        
        cursor.close();
        db.close();
        return messages;
    }

    /**
     * Mark a queued SOS message as sent.
     */
    // อัปเดตสถานะของข้อความ SOS ในคิวว่าได้ถูกส่งออกเรียบร้อยแล้ว
    public int markSOSAsSent(int sosId) {
        SQLiteDatabase db = this.getWritableDatabase();

        ContentValues values = new ContentValues();
        values.put(COLUMN_SOS_STATUS, "sent");
        values.put(COLUMN_SOS_SENT, System.currentTimeMillis());

        int rows = db.update(
            TABLE_SOS_QUEUE,
            values,
            COLUMN_SOS_ID + " = ?",
            new String[]{String.valueOf(sosId)}
        );
        db.close();
        return rows;
    }

    /**
     * Mark a queued SOS message as failed but keep it retriable.
     */
    // เปลี่ยนสถานะข้อความ SOS ให้กลับมารอการส่งใหม่ (กรณีส่งล้มเหลว)
    public int markSOSAsPending(int sosId) {
        SQLiteDatabase db = this.getWritableDatabase();

        ContentValues values = new ContentValues();
        values.put(COLUMN_SOS_STATUS, "pending");

        int rows = db.update(
            TABLE_SOS_QUEUE,
            values,
            COLUMN_SOS_ID + " = ?",
            new String[]{String.valueOf(sosId)}
        );
        db.close();
        return rows;
    }
    
    // ============================================================
    // Alerts Cache Operations
    // ============================================================
    
    /**
     * Add alert to cache
     */
    // บันทึกรายการภัยพิบัติที่ได้รับลงในแคชฐานข้อมูลของเครื่อง
    public long addAlert(String alertType, String alertLevel, String message, String title) {
        SQLiteDatabase db = this.getWritableDatabase();
        
        ContentValues values = new ContentValues();
        values.put(COLUMN_ALERT_TYPE, alertType);
        values.put(COLUMN_ALERT_LEVEL, alertLevel);
        values.put(COLUMN_ALERT_MESSAGE, message);
        values.put(COLUMN_ALERT_TITLE, title);
        values.put(COLUMN_ALERT_READ, 0);
        values.put(COLUMN_ALERT_TIMESTAMP, System.currentTimeMillis());
        
        long id = db.insert(TABLE_ALERTS_CACHE, null, values);
        db.close();
        
        return id;
    }
    
    /**
     * Get unread alerts
     */
    // ดึงรายการแจ้งเตือนภัยพิบัติที่ยังไม่ได้กดอ่าน
    public List<Alert> getUnreadAlerts() {
        List<Alert> alerts = new ArrayList<>();
        SQLiteDatabase db = this.getReadableDatabase();
        Cursor cursor = db.query(
            TABLE_ALERTS_CACHE,
            null,
            COLUMN_ALERT_READ + " = 0",
            null, null, null,
            COLUMN_ALERT_TIMESTAMP + " DESC"
        );
        
        if (cursor.moveToFirst()) {
            do {
                Alert alert = new Alert();
                alert.setId(cursor.getInt(cursor.getColumnIndexOrThrow(COLUMN_ALERT_ID)));
                alert.setType(cursor.getString(cursor.getColumnIndexOrThrow(COLUMN_ALERT_TYPE)));
                alert.setLevel(cursor.getString(cursor.getColumnIndexOrThrow(COLUMN_ALERT_LEVEL)));
                alert.setMessage(cursor.getString(cursor.getColumnIndexOrThrow(COLUMN_ALERT_MESSAGE)));
                alert.setTitle(cursor.getString(cursor.getColumnIndexOrThrow(COLUMN_ALERT_TITLE)));
                alert.setTimestamp(cursor.getLong(cursor.getColumnIndexOrThrow(COLUMN_ALERT_TIMESTAMP)));
                
                alerts.add(alert);
            } while (cursor.moveToNext());
        }
        
        cursor.close();
        db.close();
        return alerts;
    }
    
    // ============================================================
    // Location History Operations
    // ============================================================
    
    /**
     * Add location to history
     */
    // บันทึกประวัติตำแหน่งปัจจุบันของผู้ใช้เก็บไว้ในประวัติการเดินทางบนระบบออฟไลน์
    public long addLocation(double latitude, double longitude, float accuracy) {
        SQLiteDatabase db = this.getWritableDatabase();
        
        ContentValues values = new ContentValues();
        values.put(COLUMN_LOC_LATITUDE, latitude);
        values.put(COLUMN_LOC_LONGITUDE, longitude);
        values.put(COLUMN_LOC_TIMESTAMP, System.currentTimeMillis());
        values.put(COLUMN_LOC_ACCURACY, accuracy);
        
        long id = db.insert(TABLE_LOCATION_HISTORY, null, values);
        db.close();
        
        return id;
    }

    /**
     * Get the latest location record from the location_history table.
     */
    // ดึงข้อมูลพิกัดสถานที่ล่าสุดที่อัปเดตลงเครื่อง
    public LocationRecord getLatestLocation() {
        SQLiteDatabase db = this.getReadableDatabase();
        LocationRecord record = null;
        String query = "SELECT * FROM " + TABLE_LOCATION_HISTORY +
                       " ORDER BY " + COLUMN_LOC_TIMESTAMP + " DESC LIMIT 1";
        Cursor cursor = db.rawQuery(query, null);
        if (cursor != null) {
            if (cursor.moveToFirst()) {
                record = new LocationRecord();
                record.setId(cursor.getInt(cursor.getColumnIndexOrThrow(COLUMN_LOC_ID)));
                record.setLatitude(cursor.getDouble(cursor.getColumnIndexOrThrow(COLUMN_LOC_LATITUDE)));
                record.setLongitude(cursor.getDouble(cursor.getColumnIndexOrThrow(COLUMN_LOC_LONGITUDE)));
                record.setTimestamp(cursor.getLong(cursor.getColumnIndexOrThrow(COLUMN_LOC_TIMESTAMP)));
                record.setAccuracy(cursor.getFloat(cursor.getColumnIndexOrThrow(COLUMN_LOC_ACCURACY)));
                record.setZoneId(cursor.getInt(cursor.getColumnIndexOrThrow(COLUMN_LOC_ZONE_ID)));
            }
            cursor.close();
        }
        db.close();
        return record;
    }
}
