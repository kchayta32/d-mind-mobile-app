package com.dmind.app.ui.screens.analytics.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Air
import androidx.compose.material.icons.filled.Thermostat
import androidx.compose.material.icons.filled.WaterDrop
import androidx.compose.material.icons.filled.Water
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.dmind.app.R
import com.dmind.app.domain.model.EnvironmentalData
import java.util.Locale

@Composable
fun EnvironmentalCards(
    data: EnvironmentalData?,
    modifier: Modifier = Modifier,
) {
    if (data == null) return

    Column(
        modifier = modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(10.dp),
    ) {
        Text(
            stringResource(R.string.analytics_environmental),
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold,
        )

        // PM2.5 / AQI Card
        AqiCard(
            pm25 = data.pm25,
            aqi = data.aqi,
            aqiLevel = data.aqiLevel,
        )

        // Weather metrics row
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(10.dp),
        ) {
            EnvironmentalMetricCard(
                icon = Icons.Filled.Thermostat,
                label = stringResource(R.string.analytics_temperature),
                value = String.format(Locale.US, "%.1f°C", data.temperature),
                color = Color(0xFFEF4444),
                modifier = Modifier.weight(1f),
            )
            EnvironmentalMetricCard(
                icon = Icons.Filled.WaterDrop,
                label = stringResource(R.string.analytics_humidity),
                value = "${data.humidity}%",
                color = DmindBlueCompat,
                modifier = Modifier.weight(1f),
            )
        }

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(10.dp),
        ) {
            EnvironmentalMetricCard(
                icon = Icons.Filled.Water,
                label = stringResource(R.string.analytics_water_level),
                value = data.waterLevel?.let { String.format(Locale.US, "%.1f m", it) } ?: "-",
                color = Color(0xFF0EA5E9),
                modifier = Modifier.weight(1f),
            )
            EnvironmentalMetricCard(
                icon = Icons.Filled.WaterDrop,
                label = stringResource(R.string.analytics_rainfall),
                value = data.rainfall?.let { String.format(Locale.US, "%.1f mm", it) } ?: "-",
                color = Color(0xFF6366F1),
                modifier = Modifier.weight(1f),
            )
        }
    }
}

@Composable
private fun AqiCard(
    pm25: Double,
    aqi: Int,
    aqiLevel: String,
) {
    val aqiColor = when {
        aqi <= 50 -> Color(0xFF22C55E)
        aqi <= 100 -> Color(0xFFF59E0B)
        aqi <= 150 -> Color(0xFFEF4444)
        else -> Color(0xFF9333EA)
    }
    val aqiGradient = when {
        aqi <= 50 -> listOf(Color(0xFF22C55E), Color(0xFF16A34A))
        aqi <= 100 -> listOf(Color(0xFFF59E0B), Color(0xFFD97706))
        aqi <= 150 -> listOf(Color(0xFFEF4444), Color(0xFFDC2626))
        else -> listOf(Color(0xFF9333EA), Color(0xFF7C3AED))
    }

    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color.Transparent),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(Brush.linearGradient(aqiGradient))
                .padding(16.dp),
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Column(
                    modifier = Modifier.weight(1f),
                    verticalArrangement = Arrangement.spacedBy(4.dp),
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                    ) {
                        Icon(
                            Icons.Filled.Air,
                            contentDescription = null,
                            tint = Color.White,
                            modifier = Modifier.size(20.dp),
                        )
                        Text(
                            stringResource(R.string.analytics_air_quality),
                            color = Color.White,
                            fontWeight = FontWeight.Bold,
                            fontSize = 15.sp,
                        )
                    }
                    Text(
                        "PM2.5: ${String.format(Locale.US, "%.1f", pm25)} µg/m³",
                        color = Color.White.copy(alpha = 0.9f),
                        fontSize = 13.sp,
                    )
                    Surface(
                        shape = RoundedCornerShape(999.dp),
                        color = Color.White.copy(alpha = 0.2f),
                    ) {
                        Text(
                            aqiLevel,
                            color = Color.White,
                            fontWeight = FontWeight.Bold,
                            fontSize = 12.sp,
                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp),
                        )
                    }
                }
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                ) {
                    Text(
                        "AQI",
                        color = Color.White.copy(alpha = 0.8f),
                        fontSize = 11.sp,
                    )
                    Text(
                        aqi.toString(),
                        color = Color.White,
                        fontWeight = FontWeight.ExtraBold,
                        fontSize = 36.sp,
                    )
                }
            }
        }
    }
}

@Composable
private fun EnvironmentalMetricCard(
    icon: ImageVector,
    label: String,
    value: String,
    color: Color,
    modifier: Modifier = Modifier,
) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.3f)),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
    ) {
        Row(
            modifier = Modifier.padding(12.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Surface(
                shape = RoundedCornerShape(10.dp),
                color = color.copy(alpha = 0.12f),
            ) {
                Icon(
                    icon,
                    contentDescription = null,
                    tint = color,
                    modifier = Modifier.padding(8.dp).size(18.dp),
                )
            }
            Spacer(Modifier.width(10.dp))
            Column {
                Text(value, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                Text(label, color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 11.sp)
            }
        }
    }
}

// Duplicated from DmindComponents to avoid circular dependency
private val DmindBlueCompat = Color(0xFF2563EB)
