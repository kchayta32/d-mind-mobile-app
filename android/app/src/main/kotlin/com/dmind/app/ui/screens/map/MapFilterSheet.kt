package com.dmind.app.ui.screens.map

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Layers
import androidx.compose.material3.Button
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.dmind.app.R
import com.dmind.app.domain.model.DisasterLayerType
import com.dmind.app.domain.model.HazardType
import com.dmind.app.domain.model.Severity
import com.dmind.app.ui.components.DmindBlue
import com.dmind.app.ui.components.icon
import com.dmind.app.ui.components.localizedLabel
import com.dmind.app.ui.viewmodel.DisasterMapUiState

import androidx.compose.foundation.layout.defaultMinSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.FilterList
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Tune
import androidx.compose.material3.Badge
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.OutlinedButton
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import com.dmind.app.domain.model.AirQualityThreshold
import com.dmind.app.domain.model.DisasterFilter
import com.dmind.app.domain.model.EarthquakeDepthFilter
import com.dmind.app.domain.model.EarthquakeMagnitudeFilter
import com.dmind.app.domain.model.GistdaTimeRange
import com.dmind.app.domain.model.StormRainIntensity
import com.dmind.app.domain.model.WildfireConfidenceFilter
import com.dmind.app.domain.model.WildfireSatelliteSource

// คอมโพสเซเบิลสำหรับแผ่นสัญญะตัวกรองข้อมูลบนแผนที่ (ตัวเลือกประเภทภัยพิบัติ ระดับความรุนแรงขั้นต่ำ ตัวกรองเฉพาะภัยพิบัติ และปุ่มนำไปใช้/รีเซ็ต)
@OptIn(ExperimentalMaterial3Api::class)
@Composable
internal fun MapFilterSheet(
    state: DisasterMapUiState,
    onToggleType: (HazardType) -> Unit,
    onSeveritySelected: (Severity) -> Unit,
    onShowStationsChanged: (Boolean) -> Unit,
    onUpdateFilter: (DisasterFilter) -> Unit = {},
    onResetFilters: () -> Unit = {},
    onDismiss: () -> Unit,
) {
    // ประเภทภัยพิบัติที่กำลังเลือกเพื่อปรับแต่งตัวกรองเฉพาะทาง
    var focusedDisasterType by remember(state.filter.selectedTypes) {
        mutableStateOf(
            when {
                HazardType.Earthquake in state.filter.selectedTypes -> HazardType.Earthquake
                HazardType.Flood in state.filter.selectedTypes -> HazardType.Flood
                HazardType.Fire in state.filter.selectedTypes -> HazardType.Fire
                HazardType.AirQuality in state.filter.selectedTypes -> HazardType.AirQuality
                HazardType.Storm in state.filter.selectedTypes -> HazardType.Storm
                else -> HazardType.Earthquake
            }
        )
    }

    LazyColumn(
        modifier = Modifier
            .fillMaxWidth()
            .navigationBarsPadding()
            .padding(horizontal = 20.dp, vertical = 8.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        // ส่วนหัวและป้ายแสดงสถานะตัวกรอง
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = stringResource(R.string.map_filter_title),
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold
                )
                Surface(
                    shape = RoundedCornerShape(20.dp),
                    color = if (state.filter.isDefault) {
                        MaterialTheme.colorScheme.surfaceVariant
                    } else {
                        MaterialTheme.colorScheme.primaryContainer
                    },
                    border = BorderStroke(
                        1.dp,
                        if (state.filter.isDefault) MaterialTheme.colorScheme.outlineVariant else DmindBlue
                    )
                ) {
                    Text(
                        text = if (state.filter.isDefault) "ค่าเริ่มต้น" else "ใช้งาน ${state.filter.activeFilterCount} ตัวกรอง",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = if (state.filter.isDefault) MaterialTheme.colorScheme.onSurfaceVariant else MaterialTheme.colorScheme.primary,
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
                    )
                }
            }
        }

        // ป้ายแสดงจำนวนรายการที่ตรงตามเงื่อนไข (Match Count Badge)
        item {
            Card(
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.35f)
                ),
                border = BorderStroke(1.dp, DmindBlue.copy(alpha = 0.3f)),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 14.dp, vertical = 10.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Filled.FilterList,
                        contentDescription = null,
                        tint = DmindBlue,
                        modifier = Modifier.size(20.dp)
                    )
                    Spacer(Modifier.width(10.dp))
                    Column {
                        Text(
                            text = "ตรงตามเงื่อนไข: ${state.visibleEvents.size} เหตุการณ์",
                            fontWeight = FontWeight.Bold,
                            fontSize = 14.sp,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        if (state.filter.showStations) {
                            Text(
                                text = "พร้อมแสดงสถานีตรวจวัด ${state.visibleStations.size} แห่งบนแผนที่",
                                fontSize = 12.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }
                }
            }
        }

        // ส่วนเลือกประเภทภัยพิบัติหลัก
        item {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text(
                    text = stringResource(R.string.map_filter_hazard_type),
                    fontWeight = FontWeight.SemiBold,
                    fontSize = 15.sp
                )
                FlowRow(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    HazardType.entries.filter { it != HazardType.Weather }.forEach { type ->
                        val isSelected = type in state.filter.selectedTypes
                        FilterChip(
                            selected = isSelected,
                            onClick = {
                                onToggleType(type)
                                focusedDisasterType = type
                            },
                            label = { Text(type.localizedLabel(), fontSize = 13.sp) },
                            leadingIcon = {
                                Icon(type.icon(), contentDescription = null, modifier = Modifier.size(18.dp))
                            },
                            modifier = Modifier.defaultMinSize(minHeight = 44.dp)
                        )
                    }
                }
            }
        }

        // ส่วนเลือกระดับความรุนแรงขั้นต่ำ
        item {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text(
                    text = stringResource(R.string.map_filter_min_severity),
                    fontWeight = FontWeight.SemiBold,
                    fontSize = 15.sp
                )
                FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Severity.entries.forEach { severity ->
                        FilterChip(
                            selected = state.filter.minimumSeverity == severity,
                            onClick = { onSeveritySelected(severity) },
                            label = { Text(severity.localizedLabel(), fontSize = 13.sp) },
                            modifier = Modifier.defaultMinSize(minHeight = 44.dp)
                        )
                    }
                }
            }
        }

        // สลับการแสดงผลสถานีตรวจวัด
        item {
            Surface(
                shape = RoundedCornerShape(12.dp),
                color = MaterialTheme.colorScheme.surface,
                border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.6f)),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 14.dp, vertical = 10.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(Modifier.weight(1f)) {
                        Text(stringResource(R.string.map_show_stations), fontWeight = FontWeight.SemiBold)
                        Text(
                            stringResource(R.string.map_show_stations_subtitle),
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            fontSize = 12.sp
                        )
                    }
                    Switch(
                        checked = state.filter.showStations,
                        onCheckedChange = onShowStationsChanged,
                        modifier = Modifier.defaultMinSize(minHeight = 44.dp)
                    )
                }
            }
        }

        item {
            HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f))
        }

        // ส่วนตัวกรองเฉพาะภัยพิบัติแบบไดนามิก (Dynamic Dedicated Section)
        item {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Filled.Tune,
                        contentDescription = null,
                        tint = DmindBlue,
                        modifier = Modifier.size(20.dp)
                    )
                    Spacer(Modifier.width(8.dp))
                    Text(
                        text = "ตัวกรองเฉพาะภัยพิบัติ (Disaster-Specific)",
                        fontWeight = FontWeight.Bold,
                        fontSize = 15.sp
                    )
                }

                // แถบเลือกสลับดูและปรับแต่งตัวกรองของประเภทภัยพิบัติต่างๆ
                val customizableTypes = listOf(
                    HazardType.Earthquake,
                    HazardType.Flood,
                    HazardType.Fire,
                    HazardType.AirQuality,
                    HazardType.Storm,
                )
                FlowRow(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    customizableTypes.forEach { type ->
                        val isCurrentFocused = focusedDisasterType == type
                        FilterChip(
                            selected = isCurrentFocused,
                            onClick = { focusedDisasterType = type },
                            label = { Text(type.localizedLabel(), fontWeight = if (isCurrentFocused) FontWeight.Bold else FontWeight.Normal) },
                            leadingIcon = { Icon(type.icon(), contentDescription = null, modifier = Modifier.size(16.dp)) },
                            modifier = Modifier.defaultMinSize(minHeight = 44.dp)
                        )
                    }
                }

                // กล่องควบคุมเฉพาะตามประเภทภัยพิบัติที่โฟกัส
                Card(
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.35f)
                    ),
                    border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(
                        modifier = Modifier.padding(14.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        when (focusedDisasterType) {
                            HazardType.Earthquake -> {
                                Text(
                                    text = "ขนาดแผ่นดินไหวขั้นต่ำ (Minimum Magnitude)",
                                    fontWeight = FontWeight.SemiBold,
                                    fontSize = 13.sp
                                )
                                FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                    EarthquakeMagnitudeFilter.entries.forEach { mag ->
                                        FilterChip(
                                            selected = state.filter.earthquake.minMagnitude == mag,
                                            onClick = {
                                                onUpdateFilter(
                                                    state.filter.copy(
                                                        earthquake = state.filter.earthquake.copy(minMagnitude = mag)
                                                    )
                                                )
                                            },
                                            label = { Text(mag.label) },
                                            modifier = Modifier.defaultMinSize(minHeight = 44.dp)
                                        )
                                    }
                                }

                                Text(
                                    text = "ระดับความลึกของจุดศูนย์กลาง (Depth)",
                                    fontWeight = FontWeight.SemiBold,
                                    fontSize = 13.sp
                                )
                                FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                    EarthquakeDepthFilter.entries.forEach { depth ->
                                        FilterChip(
                                            selected = state.filter.earthquake.depth == depth,
                                            onClick = {
                                                onUpdateFilter(
                                                    state.filter.copy(
                                                        earthquake = state.filter.earthquake.copy(depth = depth)
                                                    )
                                                )
                                            },
                                            label = { Text(depth.label) },
                                            modifier = Modifier.defaultMinSize(minHeight = 44.dp)
                                        )
                                    }
                                }
                            }

                            HazardType.Flood -> {
                                Text(
                                    text = "ช่วงเวลาข้อมูลน้ำท่วม (GISTDA Time Range)",
                                    fontWeight = FontWeight.SemiBold,
                                    fontSize = 13.sp
                                )
                                 FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                    listOf(
                                        GistdaTimeRange.OneDay,
                                        GistdaTimeRange.ThreeDays,
                                        GistdaTimeRange.SevenDays,
                                        GistdaTimeRange.ThirtyDays,
                                        GistdaTimeRange.FloodFrequency,
                                        GistdaTimeRange.WaterHyacinth,
                                    ).forEach { range ->
                                        FilterChip(
                                            selected = state.filter.flood.timeRange == range,
                                            onClick = {
                                                onUpdateFilter(
                                                    state.filter.copy(
                                                        flood = state.filter.flood.copy(timeRange = range)
                                                    )
                                                )
                                            },
                                            label = { Text(range.thaiLabel) },
                                            modifier = Modifier.defaultMinSize(minHeight = 44.dp)
                                        )
                                    }
                                }

                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Column(Modifier.weight(1f)) {
                                        Text("ชั้นข้อมูลพื้นที่น้ำท่วม (Flood Layer)", fontWeight = FontWeight.Medium, fontSize = 13.sp)
                                        Text("แสดงภาพถ่ายดาวเทียม Sentinel-1/COSMO", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                    }
                                    Switch(
                                        checked = state.filter.flood.showFloodLayer,
                                        onCheckedChange = {
                                            onUpdateFilter(
                                                state.filter.copy(
                                                    flood = state.filter.flood.copy(showFloodLayer = it)
                                                )
                                            )
                                        },
                                        modifier = Modifier.defaultMinSize(minHeight = 44.dp)
                                    )
                                }

                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Column(Modifier.weight(1f)) {
                                        Text("สถานีตรวจวัดน้ำ (Water Stations)", fontWeight = FontWeight.Medium, fontSize = 13.sp)
                                        Text("แสดงสถานีวัดระดับน้ำและอัตราการไหล", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                    }
                                    Switch(
                                        checked = state.filter.flood.showWaterStations,
                                        onCheckedChange = {
                                            onUpdateFilter(
                                                state.filter.copy(
                                                    flood = state.filter.flood.copy(showWaterStations = it)
                                                )
                                            )
                                        },
                                        modifier = Modifier.defaultMinSize(minHeight = 44.dp)
                                    )
                                }
                            }

                            HazardType.Fire -> {
                                Text(
                                    text = "ช่วงเวลาข้อมูลจุดความร้อน (VIIRS Time Range)",
                                    fontWeight = FontWeight.SemiBold,
                                    fontSize = 13.sp
                                )
                                FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                    listOf(
                                        GistdaTimeRange.OneDay,
                                        GistdaTimeRange.ThreeDays,
                                        GistdaTimeRange.SevenDays,
                                        GistdaTimeRange.ThirtyDays,
                                        GistdaTimeRange.BurnFrequency,
                                        GistdaTimeRange.BurnScar,
                                    ).forEach { range ->
                                        FilterChip(
                                            selected = state.filter.wildfire.timeRange == range,
                                            onClick = {
                                                onUpdateFilter(
                                                    state.filter.copy(
                                                        wildfire = state.filter.wildfire.copy(timeRange = range)
                                                    )
                                                )
                                            },
                                            label = { Text(range.thaiLabel) },
                                            modifier = Modifier.defaultMinSize(minHeight = 44.dp)
                                        )
                                    }
                                }

                                Text(
                                    text = "ดาวเทียมตรวจวัด (Satellite Source)",
                                    fontWeight = FontWeight.SemiBold,
                                    fontSize = 13.sp
                                )
                                FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                    WildfireSatelliteSource.entries.forEach { src ->
                                        FilterChip(
                                            selected = state.filter.wildfire.satelliteSource == src,
                                            onClick = {
                                                onUpdateFilter(
                                                    state.filter.copy(
                                                        wildfire = state.filter.wildfire.copy(satelliteSource = src)
                                                    )
                                                )
                                            },
                                            label = { Text(src.label) },
                                            modifier = Modifier.defaultMinSize(minHeight = 44.dp)
                                        )
                                    }
                                }

                                Text(
                                    text = "ระดับความมั่นใจ (Confidence)",
                                    fontWeight = FontWeight.SemiBold,
                                    fontSize = 13.sp
                                )
                                FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                    WildfireConfidenceFilter.entries.forEach { conf ->
                                        FilterChip(
                                            selected = state.filter.wildfire.confidence == conf,
                                            onClick = {
                                                onUpdateFilter(
                                                    state.filter.copy(
                                                        wildfire = state.filter.wildfire.copy(confidence = conf)
                                                    )
                                                )
                                            },
                                            label = { Text(conf.label) },
                                            modifier = Modifier.defaultMinSize(minHeight = 44.dp)
                                        )
                                    }
                                }
                            }

                            HazardType.AirQuality -> {
                                Text(
                                    text = "เกณฑ์คุณภาพอากาศ PM2.5 (Threshold)",
                                    fontWeight = FontWeight.SemiBold,
                                    fontSize = 13.sp
                                )
                                FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                    AirQualityThreshold.entries.forEach { threshold ->
                                        FilterChip(
                                            selected = state.filter.airQuality.threshold == threshold,
                                            onClick = {
                                                onUpdateFilter(
                                                    state.filter.copy(
                                                        airQuality = state.filter.airQuality.copy(threshold = threshold)
                                                    )
                                                )
                                            },
                                            label = { Text(threshold.label) },
                                            modifier = Modifier.defaultMinSize(minHeight = 44.dp)
                                        )
                                    }
                                }
                            }

                            HazardType.Storm -> {
                                Text(
                                    text = "ระดับความรุนแรงของฝน (Rain Intensity)",
                                    fontWeight = FontWeight.SemiBold,
                                    fontSize = 13.sp
                                )
                                FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                    StormRainIntensity.entries.forEach { intensity ->
                                        FilterChip(
                                            selected = state.filter.storm.rainIntensity == intensity,
                                            onClick = {
                                                onUpdateFilter(
                                                    state.filter.copy(
                                                        storm = state.filter.storm.copy(rainIntensity = intensity)
                                                    )
                                                )
                                            },
                                            label = { Text(intensity.label) },
                                            modifier = Modifier.defaultMinSize(minHeight = 44.dp)
                                        )
                                    }
                                }
                            }

                            else -> {
                                Text(
                                    text = "ไม่มีตัวเลือกการปรับแต่งเฉพาะสำหรับประเภทนี้",
                                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                                    fontSize = 13.sp
                                )
                            }
                        }
                    }
                }
            }
        }

        // ปุ่มคำสั่ง รีเซ็ต และ นำไปใช้ (Reset and Apply Buttons)
        item {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 8.dp),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                OutlinedButton(
                    onClick = onResetFilters,
                    shape = RoundedCornerShape(14.dp),
                    modifier = Modifier.defaultMinSize(minHeight = 48.dp)
                ) {
                    Icon(
                        imageVector = Icons.Filled.Refresh,
                        contentDescription = "Reset Filters",
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(Modifier.width(6.dp))
                    Text("รีเซ็ต")
                }

                Button(
                    onClick = onDismiss,
                    shape = RoundedCornerShape(14.dp),
                    modifier = Modifier
                        .weight(1f)
                        .defaultMinSize(minHeight = 48.dp)
                ) {
                    Icon(
                        imageVector = Icons.Filled.Check,
                        contentDescription = null,
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(Modifier.width(6.dp))
                    Text(
                        text = "ใช้ตัวกรอง (${state.visibleEvents.size})"
                    )
                }
            }
        }
    }
}

// คอมโพสเซเบิลสำหรับจัดการตัวเลือกการสลับชั้นข้อมูลแผนที่ภัยพิบัติและรูปแบบการแสดงผลพื้นหลัง
@Composable
internal fun LayerSheet(
    selectedLayer: DisasterLayerType,
    selectedMapStyle: MapTileStyle,
    onLayerSelected: (DisasterLayerType) -> Unit,
    onMapStyleSelected: (MapTileStyle) -> Unit,
) {
    LazyColumn(
        modifier = Modifier
            .fillMaxWidth()
            .navigationBarsPadding()
            .padding(horizontal = 20.dp, vertical = 12.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        item {
            Text(stringResource(R.string.map_layers_title), style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
        }
        item {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                DisasterLayerType.entries.forEach { layer ->
                    SelectableLayerRow(
                        selected = selectedLayer == layer,
                        icon = layer.icon(),
                        title = layer.localizedLabel(),
                        subtitle = layer.localizedDescription(),
                        onClick = { onLayerSelected(layer) },
                    )
                }
            }
        }
        item {
            Text(stringResource(R.string.map_style_title), fontWeight = FontWeight.Bold, modifier = Modifier.padding(top = 8.dp))
        }
        item {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                MapTileStyle.entries.forEach { style ->
                    SelectableLayerRow(
                        selected = selectedMapStyle == style,
                        icon = Icons.Filled.Layers,
                        title = style.localizedLabel(),
                        subtitle = style.localizedDescription(),
                        onClick = { onMapStyleSelected(style) },
                    )
                }
            }
        }
    }
}

// แถวตัวเลือกชั้นข้อมูลเดี่ยวที่รองรับการแตะเพื่อทำงาน
@Composable
private fun SelectableLayerRow(
    selected: Boolean,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    title: String,
    subtitle: String,
    onClick: () -> Unit,
) {
    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(16.dp))
            .clickable(onClick = onClick),
        color = if (selected) DmindBlue.copy(alpha = 0.1f) else MaterialTheme.colorScheme.surface,
        border = BorderStroke(1.dp, if (selected) DmindBlue else MaterialTheme.colorScheme.outlineVariant),
        shape = RoundedCornerShape(16.dp),
    ) {
        Row(Modifier.padding(14.dp), verticalAlignment = Alignment.CenterVertically) {
            Icon(icon, contentDescription = null, tint = DmindBlue)
            Spacer(Modifier.width(12.dp))
            Column {
                Text(title, fontWeight = FontWeight.Bold)
                Text(subtitle, color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 12.sp)
            }
        }
    }
}
