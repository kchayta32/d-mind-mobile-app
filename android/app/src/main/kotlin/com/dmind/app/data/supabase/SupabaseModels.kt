package com.dmind.app.data.supabase

// โมเดลแสดงข้อมูลประวัติรายงานอุบัติภัย/ภัยพิบัติที่บันทึกในฐานข้อมูล Supabase
data class IncidentReportRecord(
    val id: String,
    val type: String,
    val title: String,
    val description: String,
    val location: String?,
    val severityLevel: Int,
    val status: String,
    val isVerified: Boolean,
    val createdAt: String,
)

// โมเดลแบบร่างสำหรับส่งรายงานอุบัติภัย/ภัยพิบัติใหม่ไปยัง Supabase
data class IncidentReportDraft(
    val type: String,
    val title: String,
    val description: String,
    val location: String? = null,
    val latitude: Double? = null,
    val longitude: Double? = null,
    val severityLevel: Int = 3,
    val contactInfo: String? = null,
    val imageUrls: List<String> = emptyList(),
)

// โมเดลข้อมูลการแจ้งเตือนภัยพิบัติแบบเรียลไทม์จากฐานข้อมูล Supabase
data class RealtimeAlertRecord(
    val id: String,
    val alertType: String,
    val title: String,
    val message: String,
    val severityLevel: Int,
    val radiusKm: Double,
    val isActive: Boolean,
    val createdAt: String?,
)

// โมเดลบันทึกข้อมูลการแจ้งเตือนส่วนบุคคลในระบบ
data class NotificationRecord(
    val id: String,
    val title: String,
    val message: String,
    val type: String,
    val severityLevel: Int,
    val readAt: String?,
    val createdAt: String,
)

// โมเดลสำหรับแก้ไขตั้งค่าการรับข่าวสารแจ้งเตือนภัย
data class NotificationSettingsDraft(
    val email: String?,
    val pushEnabled: Boolean,
    val emailEnabled: Boolean,
    val smsEnabled: Boolean = false,
    val severityThreshold: Int = 3,
    val locationRadiusKm: Double = 25.0,
)

// โมเดลแบบร่างคำร้องขอความช่วยเหลือจากผู้ประสบภัยสำหรับส่งขึ้นฐานข้อมูล
data class VictimReportDraft(
    val name: String,
    val contact: String?,
    val description: String?,
    val latitude: Double,
    val longitude: Double,
    val status: String = "pending",
)

// โมเดลแบบประเมินความพึงพอใจการใช้งานระบบของแอปพลิเคชัน
data class SatisfactionSurveyDraft(
    val overallRating: Int,
    val userInterfaceRating: Int? = null,
    val mapVisualizationRating: Int? = null,
    val alertSystemRating: Int? = null,
    val emergencyInfoRating: Int? = null,
    val aiAssistantRating: Int? = null,
    val mostUsefulFeature: String? = null,
    val suggestions: String? = null,
    val wouldRecommend: Int? = null,
)

// โมเดลแบบร่างส่งประเมินความเสียหายภัยพิบัติจากรูปถ่าย
data class DamageAssessmentDraft(
    val imageUrl: String,
    val originalFilename: String? = null,
    val incidentId: String? = null,
)

// โมเดลสรุปผลการวิเคราะห์และประเมินระดับความเสียหายรวมถึงมูลค่าประเมินจากรูปภาพภัยพิบัติ
data class DamageAssessmentRecord(
    val id: String,
    val incidentId: String?,
    val imageUrl: String,
    val originalFilename: String?,
    val assessmentResult: String?,
    val damageLevel: String?,
    val confidenceScore: Double?,
    val detectedCategories: List<String>,
    val estimatedCost: Double?,
    val processingStatus: String,
    val errorMessage: String?,
    val processedAt: String?,
    val createdAt: String,
)

// โมเดลข้อมูลประวัติคำขอความช่วยเหลือฉุกเฉินที่จัดเก็บในฐานข้อมูล Supabase
data class VictimReportRecord(
    val id: String,
    val name: String,
    val contact: String?,
    val description: String?,
    val latitude: Double,
    val longitude: Double,
    val status: String,
    val createdAt: String,
)

// โมเดลแสดงข้อมูลศูนย์พักพิงที่บันทึกในฐานข้อมูล Supabase หรือดึงข้อมูลจำลอง
data class ShelterRecord(
    val id: String,
    val name: String,
    val address: String,
    val province: String,
    val district: String?,
    val latitude: Double,
    val longitude: Double,
    val capacity: Int,
    val currentOccupancy: Int?,
    val type: String, // 'temporary' | 'permanent' | 'evacuation' | 'medical'
    val facilities: List<String>,
    val contactPhone: String?,
    val status: String, // 'open' | 'closed' | 'full'
    val lastUpdated: String?,
    val distanceKm: Double? = null,
)
