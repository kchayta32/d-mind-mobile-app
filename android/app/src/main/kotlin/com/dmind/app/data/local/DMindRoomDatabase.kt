package com.dmind.app.data.local

import androidx.room.Dao
import androidx.room.Database
import androidx.room.Entity
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.PrimaryKey
import androidx.room.Query
import androidx.room.RoomDatabase

// การกำหนดคลาสฐานข้อมูลหลักของ Room Database สำหรับแอปพลิเคชัน D-MIND
@Database(
    entities = [
        AlertEntity::class,
        SosQueueEntity::class,
        DangerZoneEntity::class,
        LocationHistoryEntity::class,
    ],
    version = 1,
    exportSchema = false,
)
abstract class DMindRoomDatabase : RoomDatabase() {
    // การเข้าถึง DAO สำหรับการจัดการข้อมูลการแจ้งเตือนภัยพิบัติ
    abstract fun alertDao(): AlertDao
    // การเข้าถึง DAO สำหรับการจัดการคิวส่งข้อมูลขอความช่วยเหลือฉุกเฉิน (SOS)
    abstract fun sosQueueDao(): SosQueueDao
    // การเข้าถึง DAO สำหรับข้อมูลพื้นที่เสี่ยงภัยอันตราย
    abstract fun dangerZoneDao(): DangerZoneDao
    // การเข้าถึง DAO สำหรับเก็บประวัติตำแหน่งทางภูมิศาสตร์ของผู้ใช้
    abstract fun locationHistoryDao(): LocationHistoryDao
}

// ตารางและโครงสร้างข้อมูลสำหรับจัดเก็บประวัติการแจ้งเตือน
@Entity(tableName = "alerts")
data class AlertEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val type: String,
    val level: String,
    val title: String,
    val message: String,
    val timestamp: Long,
    val isRead: Boolean = false,
)

// ตารางและโครงสร้างข้อมูลสำหรับคิว SOS รอส่งข้อมูลเมื่อเครือข่ายพร้อมใช้งาน
@Entity(tableName = "sos_queue")
data class SosQueueEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val userId: String,
    val latitude: Double,
    val longitude: Double,
    val batteryLevel: Int,
    val message: String,
    val status: String = "pending",
    val createdAt: Long,
    val sentAt: Long? = null,
)

// ตารางและโครงสร้างข้อมูลสำหรับจัดเก็บพื้นที่เสี่ยงภัย (Danger Zone)
@Entity(tableName = "danger_zones")
data class DangerZoneEntity(
    @PrimaryKey val id: Long,
    val name: String,
    val type: String,
    val alertTitle: String,
    val alertMessage: String,
    val polygonJson: String,
    val createdAt: Long,
    val expiresAt: Long,
    val isEnabled: Boolean = true,
)

// ตารางและโครงสร้างข้อมูลสำหรับจัดเก็บประวัติพิกัดตำแหน่งของผู้ใช้งาน
@Entity(tableName = "location_history")
data class LocationHistoryEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val latitude: Double,
    val longitude: Double,
    val accuracy: Float,
    val timestamp: Long,
)

// อินเตอร์เฟสสำหรับจัดการคำสั่ง SQL หรือเข้าถึงฐานข้อมูลของตารางการแจ้งเตือน (Alerts)
@Dao
interface AlertDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsert(alert: AlertEntity)

    @Query("SELECT * FROM alerts ORDER BY timestamp DESC")
    suspend fun latestAlerts(): List<AlertEntity>
}

// อินเตอร์เฟสสำหรับจัดการข้อมูลคิว SOS ในฐานข้อมูล
@Dao
interface SosQueueDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun enqueue(message: SosQueueEntity): Long

    @Query("SELECT * FROM sos_queue WHERE status = 'pending' ORDER BY createdAt ASC")
    suspend fun pendingMessages(): List<SosQueueEntity>
}

// อินเตอร์เฟสสำหรับจัดการข้อมูลพื้นที่เสี่ยงภัยที่ยังคงทำงานหรือมีผลอยู่
@Dao
interface DangerZoneDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsert(zone: DangerZoneEntity)

    @Query("SELECT * FROM danger_zones WHERE isEnabled = 1 ORDER BY expiresAt ASC")
    suspend fun activeZones(): List<DangerZoneEntity>
}

// อินเตอร์เฟสสำหรับจัดการประวัติตำแหน่งพิกัดของผู้ใช้งาน
@Dao
interface LocationHistoryDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun addLocation(location: LocationHistoryEntity)

    @Query("SELECT * FROM location_history ORDER BY timestamp DESC LIMIT :limit")
    suspend fun latest(limit: Int = 100): List<LocationHistoryEntity>
}
