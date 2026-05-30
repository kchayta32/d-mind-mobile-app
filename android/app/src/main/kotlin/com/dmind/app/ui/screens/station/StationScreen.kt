package com.dmind.app.ui.screens.station

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Sensors
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.dmind.app.R
import com.dmind.app.domain.model.MonitoringStation
import com.dmind.app.ui.components.DmindBlue
import com.dmind.app.ui.components.DmindCard
import com.dmind.app.ui.components.EmptyState
import com.dmind.app.ui.components.IconBubble
import com.dmind.app.ui.components.ScreenHeader
import com.dmind.app.ui.components.StatusPill
import com.dmind.app.ui.components.color
import com.dmind.app.ui.components.localizedLabel
import com.dmind.app.ui.viewmodel.DisasterMapUiState

// หน้าจอแสดงรายการสถานีตรวจวัดคุณภาพสิ่งแวดล้อมและภัยพิบัติทั้งหมด
@Composable
fun StationScreen(
    mapState: DisasterMapUiState,
) {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .statusBarsPadding(),
        contentPadding = PaddingValues(bottom = 92.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        item {
            ScreenHeader(
                title = stringResource(R.string.stations_title),
                subtitle = stringResource(R.string.stations_subtitle),
                icon = Icons.Filled.Sensors,
            )
        }

        // แสดงข้อความเมื่อไม่พบสถานีตรวจวัดในระบบ
        if (mapState.snapshot.stations.isEmpty()) {
            item {
                EmptyState(
                    title = stringResource(R.string.no_stations),
                    message = stringResource(R.string.no_stations_message),
                    icon = Icons.Filled.Sensors,
                )
            }
        } else {
            // แสดงการ์ดข้อมูลและค่าที่วัดได้ของแต่ละสถานี
            items(mapState.snapshot.stations, key = { it.id }) { station ->
                StationCard(station, Modifier.padding(horizontal = 18.dp))
            }
        }
    }
}

// คอมโพสเซเบิลการ์ดแสดงรายละเอียดของแต่ละสถานีตรวจวัด สัญญาณ และเวลาการอัปเดต
@Composable
private fun StationCard(
    station: MonitoringStation,
    modifier: Modifier = Modifier,
) {
    DmindCard(modifier = modifier) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            IconBubble(Icons.Filled.Sensors, station.status.color())
            Spacer(Modifier.width(12.dp))
            Column(Modifier.weight(1f)) {
                Text(station.name, fontWeight = FontWeight.Bold, maxLines = 1, overflow = TextOverflow.Ellipsis)
                Text(station.province, color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 12.sp)
            }
            StatusPill(station.status.localizedLabel(), station.status.color())
        }
        FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            station.metrics.forEach { metric ->
                StatusPill("${metric.label}: ${metric.value}", DmindBlue)
            }
        }
        Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(Icons.Filled.Sensors, contentDescription = null, modifier = Modifier.size(16.dp), tint = MaterialTheme.colorScheme.onSurfaceVariant)
            Spacer(Modifier.width(6.dp))
            Text(stringResource(R.string.station_updated, station.updatedAt), color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 12.sp)
        }
    }
}
