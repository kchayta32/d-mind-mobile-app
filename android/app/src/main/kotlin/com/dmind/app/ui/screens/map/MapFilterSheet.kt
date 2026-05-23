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

@OptIn(ExperimentalMaterial3Api::class)
@Composable
internal fun MapFilterSheet(
    state: DisasterMapUiState,
    onToggleType: (HazardType) -> Unit,
    onSeveritySelected: (Severity) -> Unit,
    onShowStationsChanged: (Boolean) -> Unit,
    onDismiss: () -> Unit,
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .navigationBarsPadding()
            .padding(horizontal = 20.dp, vertical = 12.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        Text(stringResource(R.string.map_filter_title), style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
        Text(stringResource(R.string.map_filter_hazard_type), fontWeight = FontWeight.SemiBold)
        FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            HazardType.entries.filter { it != HazardType.Weather }.forEach { type ->
                FilterChip(
                    selected = type in state.filter.selectedTypes,
                    onClick = { onToggleType(type) },
                    label = { Text(type.localizedLabel()) },
                    leadingIcon = { Icon(type.icon(), contentDescription = null, modifier = Modifier.size(18.dp)) },
                )
            }
        }
        Text(stringResource(R.string.map_filter_min_severity), fontWeight = FontWeight.SemiBold)
        FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Severity.entries.forEach { severity ->
                FilterChip(
                    selected = state.filter.minimumSeverity == severity,
                    onClick = { onSeveritySelected(severity) },
                    label = { Text(severity.localizedLabel()) },
                )
            }
        }
        Row(verticalAlignment = Alignment.CenterVertically) {
            Column(Modifier.weight(1f)) {
                Text(stringResource(R.string.map_show_stations), fontWeight = FontWeight.SemiBold)
                Text(stringResource(R.string.map_show_stations_subtitle), color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 12.sp)
            }
            Switch(checked = state.filter.showStations, onCheckedChange = onShowStationsChanged)
        }
        Button(onClick = onDismiss, modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(14.dp)) {
            Text(stringResource(R.string.map_apply_filter))
        }
    }
}

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
