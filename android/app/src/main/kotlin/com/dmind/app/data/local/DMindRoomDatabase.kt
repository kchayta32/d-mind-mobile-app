package com.dmind.app.data.local

import androidx.room.Dao
import androidx.room.Database
import androidx.room.Entity
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.PrimaryKey
import androidx.room.Query
import androidx.room.RoomDatabase

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
    abstract fun alertDao(): AlertDao
    abstract fun sosQueueDao(): SosQueueDao
    abstract fun dangerZoneDao(): DangerZoneDao
    abstract fun locationHistoryDao(): LocationHistoryDao
}

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

@Entity(tableName = "location_history")
data class LocationHistoryEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val latitude: Double,
    val longitude: Double,
    val accuracy: Float,
    val timestamp: Long,
)

@Dao
interface AlertDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsert(alert: AlertEntity)

    @Query("SELECT * FROM alerts ORDER BY timestamp DESC")
    suspend fun latestAlerts(): List<AlertEntity>
}

@Dao
interface SosQueueDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun enqueue(message: SosQueueEntity): Long

    @Query("SELECT * FROM sos_queue WHERE status = 'pending' ORDER BY createdAt ASC")
    suspend fun pendingMessages(): List<SosQueueEntity>
}

@Dao
interface DangerZoneDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsert(zone: DangerZoneEntity)

    @Query("SELECT * FROM danger_zones WHERE isEnabled = 1 ORDER BY expiresAt ASC")
    suspend fun activeZones(): List<DangerZoneEntity>
}

@Dao
interface LocationHistoryDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun addLocation(location: LocationHistoryEntity)

    @Query("SELECT * FROM location_history ORDER BY timestamp DESC LIMIT :limit")
    suspend fun latest(limit: Int = 100): List<LocationHistoryEntity>
}
