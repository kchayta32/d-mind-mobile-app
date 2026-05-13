package com.dmind.app.domain

data class ReliabilityStatus(
    val locationGranted: Boolean,
    val backgroundLocationGranted: Boolean,
    val notificationGranted: Boolean,
    val batteryIgnoring: Boolean,
    val dndGranted: Boolean,
    val monitoring: Boolean,
    val pendingSOSCount: Int,
    val sosEndpointConfigured: Boolean,
    val fcmTokenEndpointConfigured: Boolean,
    val fcmTokenAvailable: Boolean,
)
