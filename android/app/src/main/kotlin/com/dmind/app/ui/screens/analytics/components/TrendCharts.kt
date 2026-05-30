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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.dmind.app.R
import com.dmind.app.domain.model.TrendDataPoint
import com.dmind.app.ui.components.CriticalRed
import com.dmind.app.ui.components.DmindBlue
import com.dmind.app.ui.components.WatchYellow

/**
 * Trend chart showing event counts over time.
 * Uses a simple composable stacked bar chart for each date.
 */
// คอมโพสเซเบิลหลักสำหรับแสดงแผนภูมิแนวโน้มความถี่ภัยพิบัติตามช่วงเวลาในรูปแบบแผนภูมิแท่งซ้อนกัน (Stacked Bar Chart)
@Composable
fun TrendCharts(
    trends: List<TrendDataPoint>,
    selectedPeriod: String,
    modifier: Modifier = Modifier,
) {
    if (trends.isEmpty()) return

    Card(
        modifier = modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.35f)),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            Text(
                stringResource(R.string.analytics_trend_title),
                fontWeight = FontWeight.Bold,
                fontSize = 15.sp,
            )

            val maxTotal = remember(trends) { trends.maxOf { it.total }.toFloat().coerceAtLeast(1f) }

            // ส่วนประกอบหลักของตัวแผนภูมิแท่งเชิงเปรียบเทียบในแนวตั้ง
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(140.dp),
                horizontalArrangement = Arrangement.spacedBy(2.dp),
                verticalAlignment = Alignment.Bottom,
            ) {
                trends.forEach { point ->
                    val fraction = point.total.toFloat() / maxTotal
                    Column(
                        modifier = Modifier.weight(1f),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.Bottom,
                    ) {
                        // โครงสร้างแท่งซ้อน (Stacked bar) สำหรับแต่ละคอลัมน์ข้อมูล
                        val segments = listOf(
                            point.wildfire to CriticalRed,
                            point.flood to DmindBlue,
                            point.earthquake to WatchYellow,
                            point.storm to Color(0xFF64748B),
                            point.drought to Color(0xFFF59E0B),
                        )
                        val totalForBar = segments.sumOf { it.first }.toFloat().coerceAtLeast(1f)
                        val barHeight = (120 * fraction).dp.coerceAtLeast(4.dp)

                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(barHeight)
                                .clip(RoundedCornerShape(topStart = 3.dp, topEnd = 3.dp)),
                        ) {
                            Column(modifier = Modifier.matchParentSize()) {
                                segments.forEach { (value, color) ->
                                    if (value > 0) {
                                        Spacer(
                                            modifier = Modifier
                                                .fillMaxWidth()
                                                .weight(value.toFloat() / totalForBar)
                                                .background(color),
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // แสดงป้ายกำกับวันที่เริ่มต้น กึ่งกลาง และสิ้นสุด ใต้แผนภูมิ
            if (trends.size >= 3) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                ) {
                    Text(
                        trends.first().date.takeLast(5),
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        fontSize = 10.sp,
                    )
                    Text(
                        trends[trends.size / 2].date.takeLast(5),
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        fontSize = 10.sp,
                    )
                    Text(
                        trends.last().date.takeLast(5),
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        fontSize = 10.sp,
                    )
                }
            }

            // ส่วนอธิบายสีประจำประเภทภัยพิบัติของแผนภูมิ
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                LegendDot(stringResource(R.string.stat_wildfire), CriticalRed)
                LegendDot(stringResource(R.string.stat_flood), DmindBlue)
                LegendDot(stringResource(R.string.stat_earthquake), WatchYellow)
            }
        }
    }
}

// คอมโพสเซเบิลจุดสีและชื่อประเภทสำหรับแสดงคำอธิบายสัญลักษณ์ (Legend)
@Composable
private fun LegendDot(
    label: String,
    color: Color,
) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(4.dp),
    ) {
        Spacer(
            modifier = Modifier
                .size(8.dp)
                .clip(CircleShape)
                .background(color),
        )
        Text(label, fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
    }
}
