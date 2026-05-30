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
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.dmind.app.R
import com.dmind.app.domain.model.AnalyticsSummary
import com.dmind.app.ui.components.CriticalRed
import com.dmind.app.ui.components.DmindBlue
import com.dmind.app.ui.components.WatchYellow

/**
 * Disaster statistics bar chart and breakdown by type.
 * Uses a simple composable bar chart (no Vico dependency for this component)
 * since a simple horizontal bar is cleaner for type breakdown.
 */
// คอมโพสเซเบิลหลักสำหรับแสดงแผนภูมิแท่งเชิงเปรียบเทียบสถิติภัยพิบัติแยกตามประเภท
@Composable
fun DisasterStatCharts(
    summary: AnalyticsSummary?,
    modifier: Modifier = Modifier,
) {
    if (summary == null) return

    Card(
        modifier = modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.35f)),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp),
        ) {
            Text(
                stringResource(R.string.analytics_by_type),
                fontWeight = FontWeight.Bold,
                fontSize = 15.sp,
            )
            val maxValue = summary.byType.values.maxOrNull()?.toFloat()?.coerceAtLeast(1f) ?: 1f
            // รายการประเภทภัยพิบัติพร้อมข้อมูลจำนวนและสีประจำประเภทสำหรับแสดงผลในแผนภูมิ
            val typeEntries = listOf(
                TypeBarEntry(stringResource(R.string.stat_earthquake), summary.byType["earthquake"] ?: 0, WatchYellow),
                TypeBarEntry(stringResource(R.string.stat_flood), summary.byType["flood"] ?: 0, DmindBlue),
                TypeBarEntry(stringResource(R.string.stat_wildfire), summary.byType["wildfire"] ?: 0, CriticalRed),
                TypeBarEntry(stringResource(R.string.analytics_storm_label), summary.byType["storm"] ?: 0, Color(0xFF64748B)),
                TypeBarEntry(stringResource(R.string.analytics_drought_label), summary.byType["drought"] ?: 0, Color(0xFFF59E0B)),
            )

            typeEntries.forEach { entry ->
                TypeBarRow(
                    label = entry.label,
                    value = entry.value,
                    fraction = entry.value.toFloat() / maxValue,
                    color = entry.color,
                )
            }
        }
    }
}

// คอมโพสเซเบิลแถวข้อมูลแผนภูมิแท่งเดี่ยวพร้อมจุดสีข้อมูลและแถบเปอร์เซ็นต์
@Composable
private fun TypeBarRow(
    label: String,
    value: Int,
    fraction: Float,
    color: Color,
) {
    Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                Spacer(
                    modifier = Modifier
                        .size(10.dp)
                        .clip(CircleShape)
                        .background(color),
                )
                Text(label, fontSize = 13.sp)
            }
            Text(
                value.toString(),
                fontWeight = FontWeight.Bold,
                fontSize = 14.sp,
                color = color,
            )
        }
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(8.dp)
                .clip(RoundedCornerShape(4.dp))
                .background(color.copy(alpha = 0.12f)),
        ) {
            Box(
                modifier = Modifier
                    .fillMaxWidth(fraction.coerceIn(0.02f, 1f))
                    .height(8.dp)
                    .clip(RoundedCornerShape(4.dp))
                    .background(color),
            )
        }
    }
}

// คลาสข้อมูลสำหรับเก็บข้อมูลแต่ละประเภทภัยพิบัติที่จะนำไปแสดงในแผนภูมิ
private data class TypeBarEntry(
    val label: String,
    val value: Int,
    val color: Color,
)
