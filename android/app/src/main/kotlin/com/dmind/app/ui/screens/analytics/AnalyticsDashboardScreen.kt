package com.dmind.app.ui.screens.analytics

import androidx.compose.animation.animateContentSize
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Analytics
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.dmind.app.R
import com.dmind.app.ui.screens.analytics.components.DisasterStatCharts
import com.dmind.app.ui.screens.analytics.components.EnvironmentalCards
import com.dmind.app.ui.screens.analytics.components.SummaryCards
import com.dmind.app.ui.screens.analytics.components.TrendCharts
import com.dmind.app.ui.viewmodel.AnalyticsDashboardUiState

// หน้าจอแดชบอร์ดแสดงผลสถิติและข้อมูลการวิเคราะห์ข้อมูลภัยพิบัติ
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AnalyticsDashboardScreen(
    state: AnalyticsDashboardUiState,
    onRefresh: () -> Unit,
    onSelectPeriod: (String) -> Unit,
    onBack: () -> Unit,
) {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .statusBarsPadding(),
        contentPadding = PaddingValues(bottom = 84.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        // แถบเครื่องมือด้านบน
        item {
            AnalyticsTopBar(
                onBack = onBack,
                onRefresh = onRefresh,
                isLoading = state.isLoading,
            )
        }

        // ตัวเลือกช่วงเวลาข้อมูล (7 วัน, 30 วัน, 1 ปี)
        item {
            PeriodSelector(
                selectedPeriod = state.selectedPeriod,
                onSelectPeriod = onSelectPeriod,
                modifier = Modifier.padding(horizontal = 16.dp),
            )
        }

        // แสดงสัญลักษณ์การโหลดข้อมูล
        if (state.isLoading && state.summary == null) {
            item {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(48.dp),
                    contentAlignment = Alignment.Center,
                ) {
                    CircularProgressIndicator()
                }
            }
        }

        // แสดงข้อความผิดพลาด
        state.error?.let { error ->
            item {
                Surface(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp),
                    shape = RoundedCornerShape(12.dp),
                    color = Color(0xFFEF4444).copy(alpha = 0.1f),
                ) {
                    Text(
                        error,
                        color = Color(0xFFEF4444),
                        fontSize = 13.sp,
                        modifier = Modifier.padding(12.dp),
                        textAlign = TextAlign.Center,
                    )
                }
            }
        }

        // การ์ดสรุปข้อมูลสถิติภาพรวมภัยพิบัติ
        item {
            SummaryCards(
                summary = state.summary,
                modifier = Modifier
                    .padding(horizontal = 16.dp)
                    .animateContentSize(),
            )
        }

        // ส่วนการแสดงแผนภูมิแยกสถิติตามประเภทภัยพิบัติ
        item {
            DisasterStatCharts(
                summary = state.summary,
                modifier = Modifier.padding(horizontal = 16.dp),
            )
        }

        // ส่วนแผนภูมิแนวโน้มภัยพิบัติย้อนหลัง
        item {
            TrendCharts(
                trends = state.trends,
                selectedPeriod = state.selectedPeriod,
                modifier = Modifier.padding(horizontal = 16.dp),
            )
        }

        // การ์ดแสดงผลข้อมูลและดัชนีทางสิ่งแวดล้อม
        item {
            EnvironmentalCards(
                data = state.environmental,
                modifier = Modifier.padding(horizontal = 16.dp),
            )
        }
    }
}

// คอมโพสเซเบิลแถบเครื่องมือด้านบนสุดของหน้าจอวิเคราะห์สถิติ
@Composable
private fun AnalyticsTopBar(
    onBack: () -> Unit,
    onRefresh: () -> Unit,
    isLoading: Boolean,
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 8.dp, vertical = 6.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        IconButton(onClick = onBack) {
            Icon(
                Icons.Filled.ArrowBack,
                contentDescription = stringResource(R.string.btn_back),
            )
        }
        Box(
            modifier = Modifier
                .size(32.dp)
                .background(
                    Brush.linearGradient(listOf(Color(0xFF8B5CF6), Color(0xFF6366F1))),
                    shape = RoundedCornerShape(8.dp),
                ),
            contentAlignment = Alignment.Center,
        ) {
            Icon(
                Icons.Filled.Analytics,
                contentDescription = null,
                tint = Color.White,
                modifier = Modifier.size(18.dp),
            )
        }
        Column(
            modifier = Modifier
                .weight(1f)
                .padding(start = 10.dp),
        ) {
            Text(
                stringResource(R.string.analytics_title),
                fontWeight = FontWeight.ExtraBold,
                fontSize = 18.sp,
                maxLines = 1,
            )
            Text(
                stringResource(R.string.analytics_subtitle),
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                fontSize = 11.sp,
                maxLines = 1,
            )
        }
        IconButton(onClick = onRefresh, enabled = !isLoading) {
            if (isLoading) {
                CircularProgressIndicator(
                    modifier = Modifier.size(20.dp),
                    strokeWidth = 2.dp,
                )
            } else {
                Icon(
                    Icons.Filled.Refresh,
                    contentDescription = stringResource(R.string.analytics_refresh),
                )
            }
        }
    }
}

// คอมโพสเซเบิลสำหรับเลือกช่วงเวลาในการกรองข้อมูลวิเคราะห์
@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun PeriodSelector(
    selectedPeriod: String,
    onSelectPeriod: (String) -> Unit,
    modifier: Modifier = Modifier,
) {
    val periods = listOf(
        "7d" to stringResource(R.string.analytics_period_7d),
        "30d" to stringResource(R.string.analytics_period_30d),
        "1y" to stringResource(R.string.analytics_period_1y),
    )
    Row(
        modifier = modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        periods.forEach { (code, label) ->
            FilterChip(
                selected = selectedPeriod == code,
                onClick = { onSelectPeriod(code) },
                label = { Text(label, fontWeight = FontWeight.SemiBold, fontSize = 13.sp) },
                shape = RoundedCornerShape(10.dp),
                colors = FilterChipDefaults.filterChipColors(
                    selectedContainerColor = MaterialTheme.colorScheme.primary,
                    selectedLabelColor = MaterialTheme.colorScheme.onPrimary,
                ),
            )
        }
    }
}
