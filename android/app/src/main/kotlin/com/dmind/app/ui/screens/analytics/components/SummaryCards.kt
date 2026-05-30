package com.dmind.app.ui.screens.analytics.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Landscape
import androidx.compose.material.icons.filled.TrendingUp
import androidx.compose.material.icons.filled.Warning
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
import com.dmind.app.domain.model.AnalyticsSummary
import com.dmind.app.ui.components.CriticalRed
import com.dmind.app.ui.components.DmindBlue
import com.dmind.app.ui.components.WatchYellow
import java.util.Locale

// คอมโพสเซเบิลหลักสำหรับแสดงกลุ่มการ์ดตัวเลขสรุปสถิติภาพรวมภัยพิบัติ (จำนวนเหตุการณ์ทั้งหมด, พื้นที่ประสบภัย, ความรุนแรงระดับวิกฤต/สูง)
@Composable
fun SummaryCards(
    summary: AnalyticsSummary?,
    modifier: Modifier = Modifier,
) {
    if (summary == null) return

    Column(
        modifier = modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(10.dp),
    ) {
        Text(
            stringResource(R.string.analytics_overview),
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold,
        )
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(10.dp),
        ) {
            SummaryMetricCard(
                title = stringResource(R.string.analytics_total_events),
                value = summary.totalEvents.toString(),
                icon = Icons.Filled.Warning,
                gradient = listOf(Color(0xFF3B82F6), Color(0xFF1D4ED8)),
                modifier = Modifier.weight(1f),
            )
            SummaryMetricCard(
                title = stringResource(R.string.analytics_affected_area),
                value = String.format(Locale.US, "%,.0f", summary.affectedAreaKm2),
                unit = "km²",
                icon = Icons.Filled.Landscape,
                gradient = listOf(Color(0xFF10B981), Color(0xFF059669)),
                modifier = Modifier.weight(1f),
            )
        }
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(10.dp),
        ) {
            val critical = summary.bySeverity["critical"] ?: 0
            val high = summary.bySeverity["high"] ?: 0
            SummaryMetricCard(
                title = stringResource(R.string.analytics_critical_events),
                value = critical.toString(),
                icon = Icons.Filled.Warning,
                gradient = listOf(Color(0xFFEF4444), Color(0xFFDC2626)),
                modifier = Modifier.weight(1f),
            )
            SummaryMetricCard(
                title = stringResource(R.string.analytics_high_severity),
                value = high.toString(),
                icon = Icons.Filled.TrendingUp,
                gradient = listOf(Color(0xFFF59E0B), Color(0xFFD97706)),
                modifier = Modifier.weight(1f),
            )
        }
    }
}

// คอมโพสเซเบิลการ์ดสถิติด้านการวิเคราะห์หลักแบบไล่เฉดสีพร้อมไอคอนและหน่วยวัด
@Composable
private fun SummaryMetricCard(
    title: String,
    value: String,
    icon: ImageVector,
    gradient: List<Color>,
    modifier: Modifier = Modifier,
    unit: String? = null,
) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color.Transparent),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(Brush.linearGradient(gradient))
                .padding(14.dp),
        ) {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Surface(
                    shape = CircleShape,
                    color = Color.White.copy(alpha = 0.2f),
                ) {
                    Icon(
                        icon,
                        contentDescription = null,
                        tint = Color.White,
                        modifier = Modifier.padding(6.dp).size(16.dp),
                    )
                }
                Row(
                    verticalAlignment = Alignment.Bottom,
                    horizontalArrangement = Arrangement.spacedBy(4.dp),
                ) {
                    Text(
                        value,
                        color = Color.White,
                        fontWeight = FontWeight.ExtraBold,
                        fontSize = 24.sp,
                    )
                    if (unit != null) {
                        Text(
                            unit,
                            color = Color.White.copy(alpha = 0.8f),
                            fontSize = 12.sp,
                            modifier = Modifier.padding(bottom = 3.dp),
                        )
                    }
                }
                Text(
                    title,
                    color = Color.White.copy(alpha = 0.85f),
                    fontSize = 12.sp,
                    maxLines = 1,
                )
            }
        }
    }
}
