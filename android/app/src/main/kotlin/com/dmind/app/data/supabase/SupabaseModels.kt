package com.dmind.app.data.supabase

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

data class NotificationRecord(
    val id: String,
    val title: String,
    val message: String,
    val type: String,
    val severityLevel: Int,
    val readAt: String?,
    val createdAt: String,
)

data class NotificationSettingsDraft(
    val email: String?,
    val pushEnabled: Boolean,
    val emailEnabled: Boolean,
    val smsEnabled: Boolean = false,
    val severityThreshold: Int = 3,
    val locationRadiusKm: Double = 25.0,
)

data class VictimReportDraft(
    val name: String,
    val contact: String?,
    val description: String?,
    val latitude: Double,
    val longitude: Double,
    val status: String = "pending",
)

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

data class DamageAssessmentDraft(
    val imageUrl: String,
    val originalFilename: String? = null,
    val incidentId: String? = null,
)

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
