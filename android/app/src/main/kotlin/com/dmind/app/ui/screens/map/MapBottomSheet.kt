package com.dmind.app.ui.screens.map

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.rememberScrollState
import androidx.compose.ui.graphics.nativeCanvas
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.FilterList
import androidx.compose.material.icons.filled.Layers
import androidx.compose.material.icons.filled.OpenInNew
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Sensors
import androidx.compose.material.icons.filled.WaterDrop
import androidx.compose.material3.AssistChip
import androidx.compose.material3.Button
import androidx.compose.material3.FilterChip
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.dmind.app.R
import com.dmind.app.domain.model.DisasterEvent
import com.dmind.app.domain.model.DisasterLayerType
import com.dmind.app.domain.model.FloodArea
import com.dmind.app.domain.model.GistdaDroughtProduct
import com.dmind.app.domain.model.GistdaTimeRange
import com.dmind.app.domain.model.MonitoringStation
import com.dmind.app.domain.model.Severity
import com.dmind.app.domain.model.ViirsHotspot
import com.dmind.app.domain.model.ViirsTimeBucket
import com.dmind.app.ui.components.AffectedOrange
import com.dmind.app.ui.components.CriticalRed
import com.dmind.app.ui.components.DmindBlue
import com.dmind.app.ui.components.DmindCard
import com.dmind.app.ui.components.IconBubble
import com.dmind.app.ui.components.MetricTile
import com.dmind.app.ui.components.SafeGreen
import com.dmind.app.ui.components.StatusPill
import com.dmind.app.ui.components.WatchYellow
import com.dmind.app.ui.components.color
import com.dmind.app.ui.components.icon
import com.dmind.app.ui.components.localizedLabel
import com.dmind.app.ui.viewmodel.DisasterMapUiState

@Composable
internal fun MapBottomSheetContent(
    state: DisasterMapUiState,
    selectedStation: MonitoringStation?,
    showLegend: Boolean,
    onClearSelection: () -> Unit,
    onOpenFilters: () -> Unit,
    onOpenLayers: () -> Unit,
    onOpenStations: () -> Unit,
    onToggleLegend: () -> Unit,
    onTimeRangeSelected: (GistdaTimeRange) -> Unit,
    onDroughtProductSelected: (GistdaDroughtProduct) -> Unit,
    onRefreshLayer: () -> Unit,
    modifier: Modifier = Modifier,
) {
    LazyColumn(
        modifier = modifier
            .fillMaxWidth()
            .heightIn(max = 650.dp),
        contentPadding = PaddingValues(horizontal = 18.dp, vertical = 10.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        item {
            Box(Modifier.fillMaxWidth(), contentAlignment = Alignment.Center) {
                Spacer(
                    modifier = Modifier
                        .width(42.dp)
                        .height(4.dp)
                        .clip(RoundedCornerShape(999.dp))
                        .background(MaterialTheme.colorScheme.outlineVariant),
                )
            }
        }

        item {
            Row(verticalAlignment = Alignment.CenterVertically) {
                IconBubble(state.activeLayer.icon(), DmindBlue)
                Spacer(Modifier.width(12.dp))
                Column(Modifier.weight(1f)) {
                    Text(
                        if (state.activeLayer == DisasterLayerType.DroughtSmap) {
                            "${state.activeLayer.localizedLabel()} ${state.droughtProduct.localizedLabel()}"
                        } else {
                            state.activeLayer.localizedLabel()
                        },
                        fontWeight = FontWeight.Bold,
                        fontSize = 18.sp,
                    )
                    Text(
                        stringResource(
                            R.string.map_updated_format,
                            state.layerLastUpdatedMillis.takeIf { it > 0L }?.toRelativeTimeLabel()
                                ?: state.snapshot.lastUpdatedMillis.toRelativeTimeLabel(),
                        ),
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        fontSize = 12.sp,
                    )
                }
                IconButton(onClick = onRefreshLayer) {
                    Icon(Icons.Filled.Refresh, contentDescription = stringResource(R.string.btn_refresh))
                }
            }
        }

        if (state.activeLayer == DisasterLayerType.Flood || state.activeLayer == DisasterLayerType.WildfireViirs) {
            item {
                TimeRangeSelector(
                    activeLayer = state.activeLayer,
                    selected = state.layerTimeRange,
                    onSelected = onTimeRangeSelected,
                )
            }
        }

        if (state.activeLayer == DisasterLayerType.DroughtSmap) {
            item {
                DroughtProductSelector(
                    selected = state.droughtProduct,
                    onSelected = onDroughtProductSelected,
                )
            }
        }

        item {
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                val count = when (state.activeLayer) {
                    DisasterLayerType.WildfireViirs -> state.viirsHotspots.size
                    DisasterLayerType.Flood -> state.floodAreas.size
                    DisasterLayerType.Stations -> state.visibleStations.size
                    DisasterLayerType.DroughtSmap -> if (state.activeWmtsLayer?.isAvailable == true) 1 else 0
                    else -> state.activeEvents().size
                }
                MetricTile(count.toString(), stringResource(R.string.map_items), DmindBlue, Modifier.weight(1f))
                MetricTile(state.activeCriticalCount().toString(), stringResource(R.string.map_critical), CriticalRed, Modifier.weight(1f))
                MetricTile(state.visibleStations.size.toString(), stringResource(R.string.map_stations), SafeGreen, Modifier.weight(1f))
            }
        }

        item {
            when {
                selectedStation != null -> {
                    StationDetailCard(
                        station = selectedStation,
                        weatherInfo = state.selectedWeatherInfo,
                        isWeatherLoading = state.isWeatherLoading,
                        onClearSelection = onClearSelection
                    )
                }
                state.isWeatherLoading -> {
                    WeatherDetailCard(weatherInfo = null, isLoading = true, onClearSelection = onClearSelection)
                }
                state.selectedWeatherInfo != null -> {
                    WeatherDetailCard(weatherInfo = state.selectedWeatherInfo, isLoading = false, onClearSelection = onClearSelection)
                }
                state.selectedViirsHotspot != null -> ViirsDetailCard(state.selectedViirsHotspot, onClearSelection)
                state.selectedFloodArea != null -> FloodDetailCard(state.selectedFloodArea, onClearSelection)
                state.selectedEvent != null -> EventDetailCard(state.selectedEvent, onClearSelection)
                else -> LayerSummaryCard(state = state, onOpenStations = onOpenStations)
            }
        }

        item {
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
                AssistChip(onClick = onOpenLayers, label = { Text(stringResource(R.string.map_layers)) }, leadingIcon = {
                    Icon(Icons.Filled.Layers, contentDescription = null, modifier = Modifier.size(18.dp))
                })
                AssistChip(onClick = onToggleLegend, label = { Text(if (showLegend) stringResource(R.string.map_hide_legend) else stringResource(R.string.map_legend)) })
                AssistChip(onClick = onOpenFilters, label = { Text(stringResource(R.string.map_filters)) }, leadingIcon = {
                    Icon(Icons.Filled.FilterList, contentDescription = null, modifier = Modifier.size(18.dp))
                })
            }
        }

        item {
            DmindCard(contentPadding = PaddingValues(14.dp)) {
                Text(stringResource(R.string.map_recent_items), fontWeight = FontWeight.Bold)
                val events = state.activeEvents().take(5)
                if (events.isEmpty() && state.viirsHotspots.isEmpty() && state.floodAreas.isEmpty()) {
                    Text(stringResource(R.string.map_no_layer_data), color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 13.sp)
                } else {
                    state.viirsHotspots.take(3).forEach { hotspot -> ViirsUpdateRow(hotspot) }
                    state.floodAreas.take(3).forEach { flood -> FloodUpdateRow(flood) }
                    events.forEach { event -> UpdateRow(event) }
                }
            }
        }

        item {
            DmindCard(contentPadding = PaddingValues(14.dp)) {
                Text(stringResource(R.string.map_sources), fontWeight = FontWeight.Bold)
                state.snapshot.sources.take(5).forEach { source ->
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        StatusPill(
                            if (source.isHealthy) stringResource(R.string.status_ready) else stringResource(R.string.map_status_backup),
                            if (source.isHealthy) SafeGreen else WatchYellow,
                        )
                        Spacer(Modifier.width(8.dp))
                        Column(Modifier.weight(1f)) {
                            Text(source.name, fontWeight = FontWeight.SemiBold, maxLines = 1)
                            Text(stringResource(R.string.map_records_format, source.count), fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                    }
                }
            }
        }
    }
}

// ─── Selectors ──────────────────────────────────────────────

@Composable
private fun TimeRangeSelector(
    activeLayer: DisasterLayerType,
    selected: GistdaTimeRange,
    onSelected: (GistdaTimeRange) -> Unit,
) {
    val ranges = if (activeLayer == DisasterLayerType.Flood) {
        listOf(
            GistdaTimeRange.OneDay,
            GistdaTimeRange.ThreeDays,
            GistdaTimeRange.SevenDays,
            GistdaTimeRange.ThirtyDays,
            GistdaTimeRange.FloodFrequency,
        )
    } else {
        listOf(
            GistdaTimeRange.OneDay,
            GistdaTimeRange.ThreeDays,
            GistdaTimeRange.SevenDays,
            GistdaTimeRange.ThirtyDays,
        )
    }
    FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
        ranges.forEach { range ->
            FilterChip(
                selected = selected == range,
                onClick = { onSelected(range) },
                label = { Text(range.localizedLabel()) },
            )
        }
    }
}

@Composable
private fun DroughtProductSelector(
    selected: GistdaDroughtProduct,
    onSelected: (GistdaDroughtProduct) -> Unit,
) {
    DmindCard(contentPadding = PaddingValues(12.dp)) {
        Text(stringResource(R.string.map_drought_dataset_title), fontWeight = FontWeight.Bold)
        Spacer(Modifier.height(8.dp))
        FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            GistdaDroughtProduct.entries.forEach { product ->
                FilterChip(
                    selected = selected == product,
                    onClick = { onSelected(product) },
                    label = { Text(product.localizedLabel()) },
                )
            }
        }
        Text(selected.localizedDescription(), color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 12.sp)
    }
}

// ─── Detail Cards ───────────────────────────────────────────

@Composable
private fun LayerSummaryCard(
    state: DisasterMapUiState,
    onOpenStations: () -> Unit,
) {
    DmindCard(contentPadding = PaddingValues(14.dp)) {
        Text(state.activeLayer.localizedDescription(), fontWeight = FontWeight.Bold)
        val message = when (state.activeLayer) {
            DisasterLayerType.WildfireViirs -> stringResource(R.string.map_layer_summary_viirs)
            DisasterLayerType.Flood -> stringResource(R.string.map_layer_summary_flood)
            DisasterLayerType.DroughtSmap -> state.activeWmtsLayer?.message ?: state.droughtProduct.localizedDescription()
            DisasterLayerType.Stations -> stringResource(R.string.map_layer_summary_stations)
            else -> stringResource(R.string.map_layer_summary_default)
        }
        Text(message, color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 13.sp)
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            StatusPill(
                if (state.activeLayer == DisasterLayerType.DroughtSmap) state.droughtProduct.localizedLabel() else state.activeLayer.localizedLabel(),
                DmindBlue,
            )
            state.activeWmtsLayer?.let { layer ->
                if (layer.path.isNotBlank()) {
                    val serviceLabel = if (layer.path.contains("/tms")) "TMS" else "WMTS"
                    StatusPill(if (layer.isAvailable) serviceLabel else stringResource(R.string.map_pending_connection), if (layer.isAvailable) SafeGreen else WatchYellow)
                }
            }
        }
        if (state.activeLayer == DisasterLayerType.Stations) {
            Button(onClick = onOpenStations, shape = RoundedCornerShape(14.dp)) {
                Icon(Icons.Filled.Sensors, contentDescription = null, modifier = Modifier.size(18.dp))
                Spacer(Modifier.width(8.dp))
                Text(stringResource(R.string.map_open_all_stations))
            }
        }
    }
}

@Composable
private fun EventDetailCard(
    event: DisasterEvent,
    onClearSelection: () -> Unit,
) {
    val updatedAt = event.updatedAt.ifBlank { stringResource(R.string.label_latest) }
    DmindCard(contentPadding = PaddingValues(14.dp)) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            IconBubble(event.type.icon(), event.severity.color())
            Spacer(Modifier.width(12.dp))
            Column(Modifier.weight(1f)) {
                Text(event.title, fontWeight = FontWeight.Bold, maxLines = 2, overflow = TextOverflow.Ellipsis)
                Text(event.description, color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 12.sp, maxLines = 2)
            }
            IconButton(onClick = onClearSelection) {
                Icon(Icons.Filled.Close, contentDescription = stringResource(R.string.btn_close))
            }
        }
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            StatusPill(event.type.localizedLabel(), DmindBlue)
            StatusPill(event.severity.localizedLabel(), event.severity.color())
            StatusPill(event.metric, event.severity.color())
        }
        Text(stringResource(R.string.map_source_format, event.source), color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 12.sp)
        Text(
            stringResource(R.string.map_event_updated_format, updatedAt),
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            fontSize = 12.sp,
        )
        Text(event.recommendedAction, fontWeight = FontWeight.SemiBold)
    }
}

@Composable
private fun ViirsDetailCard(
    hotspot: ViirsHotspot,
    onClearSelection: () -> Unit,
) {
    val context = LocalContext.current
    DmindCard(contentPadding = PaddingValues(16.dp)) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text("VIIRS ${hotspot.detectedDate}", fontWeight = FontWeight.Bold, fontSize = 16.sp, modifier = Modifier.weight(1f))
            IconButton(onClick = onClearSelection) {
                Icon(Icons.Filled.Close, contentDescription = stringResource(R.string.btn_close))
            }
        }
        Spacer(
            modifier = Modifier
                .fillMaxWidth()
                .height(1.dp)
                .background(MaterialTheme.colorScheme.outlineVariant),
        )
        DetailRow(stringResource(R.string.map_country_label), hotspot.country)
        DetailRow(stringResource(R.string.map_province_label), hotspot.province)
        DetailRow(stringResource(R.string.map_district_label), hotspot.district)
        DetailRow(stringResource(R.string.map_subdistrict_label), hotspot.subdistrict)
        DetailRow(stringResource(R.string.map_date_label), hotspot.detectedDate)
        DetailRow("UTM Zone:", hotspot.utmZone)
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text(stringResource(R.string.map_map_link_label), modifier = Modifier.weight(1f), color = MaterialTheme.colorScheme.onSurfaceVariant)
            TextButton(
                onClick = {
                    context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(hotspot.googleMapsUrl)))
                },
            ) {
                Text(stringResource(R.string.map_view_google_maps))
                Spacer(Modifier.width(4.dp))
                Icon(Icons.Filled.OpenInNew, contentDescription = null, modifier = Modifier.size(16.dp))
            }
        }
        DetailRow(stringResource(R.string.map_responsible_area_label), hotspot.responsibleArea)
        DetailRow("V Angle:", hotspot.vAngle)
        DetailRow("V Direct:", hotspot.vDirect)
        DetailRow("V Dist:", hotspot.vDist)
    }
}

@Composable
private fun FloodDetailCard(
    floodArea: FloodArea,
    onClearSelection: () -> Unit,
) {
    val areaSize = floodArea.areaSquareMeters?.let {
        stringResource(R.string.map_square_meters_format, it.formatOne())
    } ?: "-"
    DmindCard(contentPadding = PaddingValues(14.dp)) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            IconBubble(
                Icons.Filled.WaterDrop,
                if (floodArea.timeRange == GistdaTimeRange.FloodFrequency) floodArea.frequencyBucket.color() else floodArea.severity.color(),
            )
            Spacer(Modifier.width(12.dp))
            Column(Modifier.weight(1f)) {
                Text(
                    if (floodArea.timeRange == GistdaTimeRange.FloodFrequency) {
                        stringResource(R.string.map_flood_recurrent_title_format, floodArea.province)
                    } else {
                        stringResource(R.string.map_flood_area_title_format, floodArea.province)
                    },
                    fontWeight = FontWeight.Bold,
                )
                Text("${floodArea.district} ${floodArea.subdistrict}", color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 12.sp)
            }
            IconButton(onClick = onClearSelection) {
                Icon(Icons.Filled.Close, contentDescription = stringResource(R.string.btn_close))
            }
        }
        DetailRow(stringResource(R.string.map_data_range_label), floodArea.timeRange.localizedLabel())
        if (floodArea.timeRange == GistdaTimeRange.FloodFrequency) {
            DetailRow(stringResource(R.string.map_occurrence_count_label), stringResource(R.string.map_times_format, floodArea.recurrenceCount ?: 0))
            DetailRow(stringResource(R.string.map_symbol_range_label), floodArea.frequencyBucket.localizedDescription())
        }
        DetailRow(stringResource(R.string.map_area_size_label), areaSize)
        DetailRow(stringResource(R.string.map_updated_label), floodArea.updatedAt.ifBlank { "-" })
        StatusPill(
            if (floodArea.timeRange == GistdaTimeRange.FloodFrequency) floodArea.frequencyBucket.label else floodArea.severity.localizedLabel(),
            if (floodArea.timeRange == GistdaTimeRange.FloodFrequency) floodArea.frequencyBucket.color() else floodArea.severity.color(),
        )
    }
}

@Composable
private fun StationDetailCard(
    station: MonitoringStation,
    weatherInfo: com.dmind.app.domain.model.SelectedWeatherInfo?,
    isWeatherLoading: Boolean,
    onClearSelection: () -> Unit,
) {
    DmindCard(contentPadding = PaddingValues(14.dp)) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            IconBubble(Icons.Filled.Sensors, station.status.color())
            Spacer(Modifier.width(12.dp))
            Column(Modifier.weight(1f)) {
                Text(station.name, fontWeight = FontWeight.Bold)
                Text(station.province, color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 12.sp)
            }
            IconButton(onClick = onClearSelection) {
                Icon(Icons.Filled.Close, contentDescription = stringResource(R.string.btn_close))
            }
        }
        FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            station.metrics.forEach { metric ->
                StatusPill("${metric.label}: ${metric.value}", station.status.color())
            }
        }

        if (isWeatherLoading) {
            Spacer(Modifier.height(16.dp))
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(60.dp),
                contentAlignment = Alignment.Center
            ) {
                androidx.compose.material3.CircularProgressIndicator(color = DmindBlue, modifier = Modifier.size(24.dp))
            }
        } else if (weatherInfo != null) {
            val current = weatherInfo.current
            
            Spacer(Modifier.height(16.dp))
            Spacer(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(1.dp)
                    .background(MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f))
            )
            Spacer(Modifier.height(12.dp))

            Text(
                text = "สภาพอากาศและสิ่งแวดล้อม (Open-Meteo)",
                fontWeight = FontWeight.Bold,
                fontSize = 13.sp,
                color = MaterialTheme.colorScheme.primary
            )
            Spacer(Modifier.height(8.dp))

            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = "${current.temperatureCelsius.toInt()}°C - ${current.conditionLabel}",
                        fontWeight = FontWeight.SemiBold,
                        fontSize = 14.sp
                    )
                    Text(
                        text = "รู้สึกเหมือน ${current.apparentTemperatureCelsius.toInt()}°C | ลม ${current.windSpeedMps.toInt()} m/s",
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        fontSize = 11.sp
                    )
                }
                Text(
                    text = when (current.conditionLabel) {
                        "ท้องฟ้าแจ่มใส", "ท้องฟ้าโปร่ง" -> "☀️"
                        "มีเมฆบางส่วน" -> "⛅"
                        "ท้องฟ้าหลัว/มีเมฆมาก", "มีเมฆมาก" -> "☁️"
                        "มีหมอก" -> "🌫️"
                        "ฝนละออง", "ฝนตกเล็กน้อย", "ฝนซู่ตกเล็กน้อย" -> "🌧️"
                        "ฝนตกปานกลาง" -> "🌧️"
                        "ฝนตกหนัก", "ฝนซู่ตกหนัก" -> "🌧️"
                        "ฝนฟ้าคะนอง" -> "⛈️"
                        "ฝนฟ้าคะนองกับลูกเห็บ" -> "⛈️❄️"
                        else -> "☁️"
                    },
                    fontSize = 28.sp
                )
            }

            Spacer(Modifier.height(10.dp))

            Row(
                horizontalArrangement = Arrangement.spacedBy(6.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .clip(RoundedCornerShape(8.dp))
                        .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f))
                        .padding(8.dp)
                ) {
                    Column {
                        Text("PM2.5", fontSize = 9.sp, color = MaterialTheme.colorScheme.onSurfaceVariant, maxLines = 1)
                        Text(current.openMeteoPm25?.let { String.format(java.util.Locale.US, "%.1f", it) } ?: "-", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    }
                }
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .clip(RoundedCornerShape(8.dp))
                        .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f))
                        .padding(8.dp)
                ) {
                    Column {
                        Text("AQI", fontSize = 9.sp, color = MaterialTheme.colorScheme.onSurfaceVariant, maxLines = 1)
                        Text(current.openMeteoAqi?.toString() ?: "-", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    }
                }
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .clip(RoundedCornerShape(8.dp))
                        .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f))
                        .padding(8.dp)
                ) {
                    Column {
                        Text("ความชื้นดิน", fontSize = 9.sp, color = MaterialTheme.colorScheme.onSurfaceVariant, maxLines = 1)
                        Text(current.openMeteoSoilMoisture?.let { String.format(java.util.Locale.US, "%.2f", it) } ?: "-", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    }
                }
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .clip(RoundedCornerShape(8.dp))
                        .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f))
                        .padding(8.dp)
                ) {
                    Column {
                        Text("การไหลน้ำ", fontSize = 9.sp, color = MaterialTheme.colorScheme.onSurfaceVariant, maxLines = 1)
                        Text(current.openMeteoRiverDischarge?.let { String.format(java.util.Locale.US, "%.1f", it) } ?: "-", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}

// ─── Helper composables ─────────────────────────────────────

@Composable
internal fun DetailRow(
    label: String,
    value: String,
) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Text(label, modifier = Modifier.weight(1f), color = MaterialTheme.colorScheme.onSurfaceVariant)
        Text(value.ifBlank { "-" }, fontWeight = FontWeight.SemiBold, maxLines = 1, overflow = TextOverflow.Ellipsis)
    }
}

@Composable
private fun UpdateRow(event: DisasterEvent) {
    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
        Icon(event.type.icon(), contentDescription = null, tint = event.severity.color(), modifier = Modifier.size(20.dp))
        Column(Modifier.weight(1f)) {
            Text(event.title, maxLines = 1, overflow = TextOverflow.Ellipsis, fontWeight = FontWeight.SemiBold)
            Text(event.source, color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 12.sp)
        }
        StatusPill(event.severity.localizedLabel(), event.severity.color())
    }
}

@Composable
private fun ViirsUpdateRow(hotspot: ViirsHotspot) {
    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
        Spacer(
            modifier = Modifier
                .size(14.dp)
                .clip(CircleShape)
                .background(hotspot.timeBucket.color()),
        )
        Column(Modifier.weight(1f)) {
            Text("VIIRS ${hotspot.province}", maxLines = 1, overflow = TextOverflow.Ellipsis, fontWeight = FontWeight.SemiBold)
            Text(hotspot.detectedDate, color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 12.sp)
        }
        Text(hotspot.timeBucket.label, color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 12.sp)
    }
}

@Composable
private fun FloodUpdateRow(floodArea: FloodArea) {
    val color = if (floodArea.timeRange == GistdaTimeRange.FloodFrequency) floodArea.frequencyBucket.color() else floodArea.severity.color()
    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
        Icon(Icons.Filled.WaterDrop, contentDescription = null, tint = color, modifier = Modifier.size(20.dp))
        Column(Modifier.weight(1f)) {
            Text(
                if (floodArea.timeRange == GistdaTimeRange.FloodFrequency) {
                    stringResource(R.string.map_flood_recurrent_title_format, floodArea.province)
                } else {
                    stringResource(R.string.map_flood_short_title_format, floodArea.province)
                },
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
                fontWeight = FontWeight.SemiBold,
            )
            Text(
                if (floodArea.timeRange == GistdaTimeRange.FloodFrequency) {
                    stringResource(R.string.map_times_format, floodArea.recurrenceCount ?: 0)
                } else {
                    floodArea.timeRange.localizedLabel()
                },
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                fontSize = 12.sp,
            )
        }
        StatusPill(
            if (floodArea.timeRange == GistdaTimeRange.FloodFrequency) floodArea.frequencyBucket.label else floodArea.severity.localizedLabel(),
            color,
        )
    }
}

@Composable
private fun WeatherDetailCard(
    weatherInfo: com.dmind.app.domain.model.SelectedWeatherInfo?,
    isLoading: Boolean,
    onClearSelection: () -> Unit,
) {
    DmindCard(contentPadding = PaddingValues(16.dp)) {
        if (isLoading) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(200.dp),
                contentAlignment = Alignment.Center
            ) {
                androidx.compose.material3.CircularProgressIndicator(color = DmindBlue)
            }
            return@DmindCard
        }
        
        if (weatherInfo == null) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(100.dp),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    "ไม่พบข้อมูลสภาพอากาศ",
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
            return@DmindCard
        }

        val current = weatherInfo.current
        
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = current.locationName,
                    fontWeight = FontWeight.Bold,
                    fontSize = 20.sp,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
                Text(
                    text = current.conditionLabel,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    fontSize = 14.sp
                )
            }
            
            Text(
                text = when (current.conditionLabel) {
                    "ท้องฟ้าแจ่มใส", "ท้องฟ้าโปร่ง" -> "☀️"
                    "มีเมฆบางส่วน" -> "⛅"
                    "ท้องฟ้าหลัว/มีเมฆมาก", "มีเมฆมาก" -> "☁️"
                    "มีหมอก" -> "🌫️"
                    "ฝนละออง", "ฝนตกเล็กน้อย", "ฝนซู่ตกเล็กน้อย" -> "🌧️"
                    "ฝนตกปานกลาง" -> "🌧️"
                    "ฝนตกหนัก", "ฝนซู่ตกหนัก" -> "🌧️"
                    "ฝนฟ้าคะนอง" -> "⛈️"
                    "ฝนฟ้าคะนองกับลูกเห็บ" -> "⛈️❄️"
                    else -> "☁️"
                },
                fontSize = 42.sp
            )
            
            Spacer(Modifier.width(8.dp))
            
            IconButton(onClick = onClearSelection) {
                Icon(Icons.Filled.Close, contentDescription = stringResource(R.string.btn_close))
            }
        }
        
        Spacer(Modifier.height(12.dp))
        
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween,
            modifier = Modifier.fillMaxWidth()
        ) {
            Text(
                text = "${current.temperatureCelsius.toInt()}°C",
                fontSize = 48.sp,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.primary
            )
            
            Column(horizontalAlignment = Alignment.End) {
                Text(
                    text = "รู้สึกเหมือน ${current.apparentTemperatureCelsius.toInt()}°C",
                    fontSize = 13.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Text(
                    text = "ข้อมูล ณ ${current.forecastTime.substringAfter("T").take(5)} น.",
                    fontSize = 11.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
        
        Spacer(Modifier.height(16.dp))
        
        Row(
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Box(
                modifier = Modifier
                    .weight(1f)
                    .clip(RoundedCornerShape(12.dp))
                    .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f))
                    .padding(10.dp)
            ) {
                Column {
                    Text("ความชื้น", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    Text("${current.humidityPercent.toInt()}%", fontSize = 16.sp, fontWeight = FontWeight.Bold)
                }
            }
            
            Box(
                modifier = Modifier
                    .weight(1f)
                    .clip(RoundedCornerShape(12.dp))
                    .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f))
                    .padding(10.dp)
            ) {
                Column {
                    Text("ความเร็วลม", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    Text("${current.windSpeedMps.toInt()} m/s", fontSize = 16.sp, fontWeight = FontWeight.Bold)
                }
            }
            
            Box(
                modifier = Modifier
                    .weight(1f)
                    .clip(RoundedCornerShape(12.dp))
                    .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f))
                    .padding(10.dp)
            ) {
                Column {
                    Text("ความกดอากาศ", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    Text("${current.pressureHpa.toInt()} hPa", fontSize = 14.sp, fontWeight = FontWeight.Bold)
                }
            }
            
            Box(
                modifier = Modifier
                    .weight(1f)
                    .clip(RoundedCornerShape(12.dp))
                    .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f))
                    .padding(10.dp)
            ) {
                Column {
                    Text("ปริมาณฝน", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    Text("${current.rainMillimeters.formatOne()} มม.", fontSize = 14.sp, fontWeight = FontWeight.Bold)
                }
            }
        }
        
        Spacer(Modifier.height(16.dp))
        
        Text(
            text = "ข้อมูลสิ่งแวดล้อม Open-Meteo",
            fontWeight = FontWeight.Bold,
            fontSize = 14.sp,
            modifier = Modifier.padding(bottom = 8.dp)
        )
        
        Row(
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Box(
                modifier = Modifier
                    .weight(1f)
                    .clip(RoundedCornerShape(12.dp))
                    .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f))
                    .padding(10.dp)
            ) {
                Column {
                    Text("PM2.5 (Open-Meteo)", fontSize = 10.sp, color = MaterialTheme.colorScheme.onSurfaceVariant, maxLines = 1)
                    Text(current.openMeteoPm25?.let { String.format(java.util.Locale.US, "%.1f", it) } ?: "-", fontSize = 14.sp, fontWeight = FontWeight.Bold)
                }
            }
            Box(
                modifier = Modifier
                    .weight(1f)
                    .clip(RoundedCornerShape(12.dp))
                    .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f))
                    .padding(10.dp)
            ) {
                Column {
                    Text("AQI (Open-Meteo)", fontSize = 10.sp, color = MaterialTheme.colorScheme.onSurfaceVariant, maxLines = 1)
                    Text(current.openMeteoAqi?.toString() ?: "-", fontSize = 14.sp, fontWeight = FontWeight.Bold)
                }
            }
            Box(
                modifier = Modifier
                    .weight(1f)
                    .clip(RoundedCornerShape(12.dp))
                    .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f))
                    .padding(10.dp)
            ) {
                Column {
                    Text("ความชื้นดิน (Soil)", fontSize = 10.sp, color = MaterialTheme.colorScheme.onSurfaceVariant, maxLines = 1)
                    Text(current.openMeteoSoilMoisture?.let { String.format(java.util.Locale.US, "%.2f", it) } ?: "-", fontSize = 14.sp, fontWeight = FontWeight.Bold)
                }
            }
            Box(
                modifier = Modifier
                    .weight(1f)
                    .clip(RoundedCornerShape(12.dp))
                    .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f))
                    .padding(10.dp)
            ) {
                Column {
                    Text("การไหลของน้ำ (River)", fontSize = 10.sp, color = MaterialTheme.colorScheme.onSurfaceVariant, maxLines = 1)
                    Text(current.openMeteoRiverDischarge?.let { String.format(java.util.Locale.US, "%.1f", it) } ?: "-", fontSize = 14.sp, fontWeight = FontWeight.Bold)
                }
            }
        }
        
        Spacer(Modifier.height(20.dp))
        
        Text(
            text = "แนวโน้มอุณหภูมิรายชั่วโมง",
            fontWeight = FontWeight.Bold,
            fontSize = 14.sp,
            modifier = Modifier.padding(bottom = 8.dp)
        )
        
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(130.dp)
        ) {
            val scrollState = rememberScrollState()
            Row(
                modifier = Modifier
                    .fillMaxSize()
                    .horizontalScroll(scrollState)
            ) {
                HourlyTemperatureTrendLine(
                    hourly = weatherInfo.hourly,
                    modifier = Modifier
                        .width(720.dp)
                        .fillMaxHeight()
                )
            }
        }
        
        Spacer(Modifier.height(20.dp))
        
        Text(
            text = "พยากรณ์อากาศ 7 วันล่วงหน้า",
            fontWeight = FontWeight.Bold,
            fontSize = 14.sp,
            modifier = Modifier.padding(bottom = 8.dp)
        )
        
        Column(
            verticalArrangement = Arrangement.spacedBy(8.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            weatherInfo.daily.forEach { forecast ->
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween,
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(10.dp))
                        .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.3f))
                        .padding(horizontal = 12.dp, vertical = 8.dp)
                ) {
                    Text(
                        text = forecast.date,
                        fontWeight = FontWeight.SemiBold,
                        fontSize = 13.sp,
                        modifier = Modifier.width(90.dp)
                    )
                    
                    Text(
                        text = when (forecast.conditionLabel) {
                            "ท้องฟ้าแจ่มใส", "ท้องฟ้าโปร่ง" -> "☀️"
                            "มีเมฆบางส่วน" -> "⛅"
                            "ท้องฟ้าหลัว/มีเมฆมาก", "มีเมฆมาก" -> "☁️"
                            "มีหมอก" -> "🌫️"
                            "ฝนละออง", "ฝนตกเล็กน้อย", "ฝนซู่ตกเล็กน้อย" -> "🌧️"
                            "ฝนตกปานกลาง" -> "🌧️"
                            "ฝนตกหนัก", "ฝนซู่ตกหนัก" -> "🌧️"
                            "ฝนฟ้าคะนอง" -> "⛈️"
                            "ฝนฟ้าคะนองกับลูกเห็บ" -> "⛈️❄️"
                            else -> "☁️"
                        },
                        fontSize = 20.sp,
                        modifier = Modifier.width(32.dp),
                        textAlign = TextAlign.Center
                    )
                    
                    Text(
                        text = forecast.conditionLabel,
                        fontSize = 12.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        modifier = Modifier.weight(1f),
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                    
                    Row(
                        horizontalArrangement = Arrangement.End,
                        modifier = Modifier.width(80.dp)
                    ) {
                        Text(
                            text = "${forecast.maxTempCelsius.toInt()}°",
                            fontWeight = FontWeight.Bold,
                            fontSize = 13.sp
                        )
                        Spacer(Modifier.width(8.dp))
                        Text(
                            text = "${forecast.minTempCelsius.toInt()}°",
                            color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.6f),
                            fontSize = 13.sp
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun HourlyTemperatureTrendLine(
    hourly: List<com.dmind.app.domain.model.MapHourlyForecast>,
    modifier: Modifier = Modifier
) {
    if (hourly.isEmpty()) return
    
    val temps = hourly.map { it.temperatureCelsius }
    val maxTemp = temps.maxOrNull() ?: 40.0
    val minTemp = temps.minOrNull() ?: 10.0
    val tempRange = (maxTemp - minTemp).coerceAtLeast(1.0)
    
    val primaryColor = MaterialTheme.colorScheme.primary
    val onSurface = MaterialTheme.colorScheme.onSurface
    
    androidx.compose.foundation.Canvas(modifier = modifier) {
        val width = size.width
        val height = size.height
        
        val paddingLeft = 40f
        val paddingRight = 40f
        val paddingTop = 40f
        val paddingBottom = 40f
        
        val drawWidth = width - paddingLeft - paddingRight
        val drawHeight = height - paddingTop - paddingBottom
        
        val pointsCount = hourly.size
        val xStep = drawWidth / (pointsCount - 1).coerceAtLeast(1)
        
        val path = Path()
        val fillPath = Path()
        
        val points = hourly.mapIndexed { index, forecast ->
            val x = paddingLeft + index * xStep
            val normalizedTemp = (forecast.temperatureCelsius - minTemp) / tempRange
            val y = paddingTop + drawHeight - (normalizedTemp * drawHeight).toFloat()
            x to y
        }
        
        points.forEachIndexed { index, (x, y) ->
            if (index == 0) {
                path.moveTo(x, y)
                fillPath.moveTo(x, y)
            } else {
                path.lineTo(x, y)
                fillPath.lineTo(x, y)
            }
        }
        
        if (points.isNotEmpty()) {
            fillPath.lineTo(points.last().first, paddingTop + drawHeight)
            fillPath.lineTo(points.first().first, paddingTop + drawHeight)
            fillPath.close()
        }
        
        drawPath(
            path = fillPath,
            brush = Brush.verticalGradient(
                colors = listOf(primaryColor.copy(alpha = 0.3f), Color.Transparent),
                startY = points.minOf { it.second },
                endY = paddingTop + drawHeight
            )
        )
        
        drawPath(
            path = path,
            color = primaryColor,
            style = Stroke(
                width = 6f,
                cap = androidx.compose.ui.graphics.StrokeCap.Round,
                join = androidx.compose.ui.graphics.StrokeJoin.Round
            )
        )
        
        val step = if (pointsCount > 8) pointsCount / 6 else 1
        for (i in 0 until pointsCount step step) {
            val (x, y) = points[i]
            val forecast = hourly[i]
            
            drawContext.canvas.nativeCanvas.drawText(
                "${forecast.temperatureCelsius.toInt()}°",
                x,
                y - 12f,
                android.graphics.Paint().apply {
                    color = onSurface.toArgb()
                    textSize = 28f
                    textAlign = android.graphics.Paint.Align.CENTER
                    typeface = android.graphics.Typeface.DEFAULT_BOLD
                }
            )
            
            drawContext.canvas.nativeCanvas.drawText(
                forecast.time,
                x,
                paddingTop + drawHeight + 30f,
                android.graphics.Paint().apply {
                    color = onSurface.copy(alpha = 0.6f).toArgb()
                    textSize = 24f
                    textAlign = android.graphics.Paint.Align.CENTER
                }
            )
            
            drawCircle(
                color = primaryColor,
                radius = 8f,
                center = androidx.compose.ui.geometry.Offset(x, y)
            )
        }
    }
}

// ─── State helper extensions ────────────────────────────────

internal fun DisasterMapUiState.activeEvents(): List<DisasterEvent> {
    return when (activeLayer) {
        DisasterLayerType.Earthquake -> visibleEvents.filter { it.type == com.dmind.app.domain.model.HazardType.Earthquake }
        DisasterLayerType.Storm -> visibleEvents.filter { it.type == com.dmind.app.domain.model.HazardType.Storm || it.type == com.dmind.app.domain.model.HazardType.Heat }
        DisasterLayerType.AirQuality -> visibleEvents.filter { it.type == com.dmind.app.domain.model.HazardType.AirQuality }
        DisasterLayerType.Flood -> visibleEvents.filter { it.type == com.dmind.app.domain.model.HazardType.Flood }
        DisasterLayerType.WildfireViirs -> visibleEvents.filter { it.type == com.dmind.app.domain.model.HazardType.Fire }
        DisasterLayerType.Stations,
        DisasterLayerType.DroughtSmap,
        DisasterLayerType.RiverDischarge,
        DisasterLayerType.SoilMoistureHeatmap,
        -> emptyList()
    }
}

internal fun DisasterMapUiState.activeCriticalCount(): Int {
    return when (activeLayer) {
        DisasterLayerType.WildfireViirs -> viirsHotspots.count { it.timeBucket in listOf(ViirsTimeBucket.LessThanOne, ViirsTimeBucket.OneToThree) }
        DisasterLayerType.Flood -> floodAreas.count { it.severity == Severity.Critical }
        DisasterLayerType.Stations -> visibleStations.count { it.status == Severity.Critical }
        else -> activeEvents().count { it.severity == Severity.Critical }
    }
}
