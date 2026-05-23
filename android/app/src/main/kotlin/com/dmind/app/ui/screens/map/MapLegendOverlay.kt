package com.dmind.app.ui.screens.map

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.DragIndicator
import androidx.compose.material.icons.filled.Layers
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.dmind.app.R
import com.dmind.app.domain.model.DisasterLayerType
import com.dmind.app.domain.model.FloodFrequencyBucket
import com.dmind.app.domain.model.GistdaDroughtProduct
import com.dmind.app.domain.model.GistdaTimeRange
import com.dmind.app.domain.model.ViirsTimeBucket
import com.dmind.app.ui.components.DmindBlue
import com.dmind.app.ui.components.SeverityLegend
import kotlin.math.roundToInt

@Composable
internal fun LegendToggleButton(
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    FloatingActionButton(
        onClick = onClick,
        modifier = modifier.size(48.dp),
        shape = CircleShape,
        containerColor = MaterialTheme.colorScheme.surface.copy(alpha = 0.95f),
        contentColor = DmindBlue,
    ) {
        Icon(Icons.Filled.Layers, contentDescription = stringResource(R.string.map_show_legend), modifier = Modifier.size(21.dp))
    }
}

@Composable
internal fun DraggableLegendOverlay(
    layer: DisasterLayerType,
    floodTimeRange: GistdaTimeRange,
    droughtProduct: GistdaDroughtProduct,
    offsetX: Float,
    offsetY: Float,
    onDrag: (Float, Float) -> Unit,
    onDismiss: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Surface(
        modifier = modifier
            .offset { IntOffset(offsetX.roundToInt(), offsetY.roundToInt()) }
            .pointerInput(layer, floodTimeRange, droughtProduct) {
                detectDragGestures { change, dragAmount ->
                    change.consume()
                    onDrag(dragAmount.x, dragAmount.y)
                }
            },
        color = MaterialTheme.colorScheme.surface.copy(alpha = 0.96f),
        shape = RoundedCornerShape(22.dp),
        shadowElevation = 10.dp,
        border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.32f)),
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp),
        ) {
            LegendHeader(onDismiss = onDismiss)
            when (layer) {
                DisasterLayerType.WildfireViirs -> ViirsLegendContent()
                DisasterLayerType.DroughtSmap -> DroughtLegendContent(droughtProduct)
                DisasterLayerType.Flood -> FloodLegendContent(floodTimeRange)
                else -> GenericLegendContent()
            }
        }
    }
}

@Composable
private fun LegendHeader(
    onDismiss: () -> Unit,
) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        Icon(
            Icons.Filled.DragIndicator,
            contentDescription = stringResource(R.string.map_cd_drag_legend),
            tint = MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier.size(20.dp),
        )
        Text(stringResource(R.string.map_legend), fontWeight = FontWeight.Bold, fontSize = 17.sp, modifier = Modifier.weight(1f))
        IconButton(onClick = onDismiss, modifier = Modifier.size(32.dp)) {
            Icon(Icons.Filled.Close, contentDescription = stringResource(R.string.map_hide_legend), modifier = Modifier.size(18.dp))
        }
    }
}

@Composable
private fun ViirsLegendContent(modifier: Modifier = Modifier) {
    Column(modifier = modifier, verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Text(stringResource(R.string.map_viirs_legend_title), color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 13.sp)
        Text(stringResource(R.string.map_viirs_hours_since_detected), color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 12.sp)
        ViirsTimeBucket.entries.forEach { bucket ->
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                Spacer(
                    modifier = Modifier
                        .size(18.dp)
                        .clip(CircleShape)
                        .background(bucket.color()),
                )
                Text(bucket.label, fontSize = 13.sp)
            }
        }
    }
}

@Composable
private fun DroughtLegendContent(
    product: GistdaDroughtProduct,
    modifier: Modifier = Modifier,
) {
    val bands = droughtLegendBands(product)
    Column(modifier = modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(10.dp)) {
        Text(product.localizedLegendTitle(), color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 13.sp)
        Row(Modifier.fillMaxWidth().height(18.dp).clip(RoundedCornerShape(999.dp))) {
            bands.forEach { band ->
                Spacer(
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxSize()
                        .background(band.color),
                )
            }
        }
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(4.dp)) {
            bands.forEach { band ->
                Column(Modifier.weight(1f), horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(band.range, fontWeight = FontWeight.SemiBold, fontSize = 10.sp, maxLines = 1)
                    Text(band.label, color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 10.sp, maxLines = 1)
                }
            }
        }
        if (product != GistdaDroughtProduct.Smap) {
            Text(product.localizedDescription(), color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 11.sp)
        }
    }
}

@Composable
private fun FloodLegendContent(
    timeRange: GistdaTimeRange,
    modifier: Modifier = Modifier,
) {
    if (timeRange == GistdaTimeRange.FloodFrequency) {
        FloodFrequencyLegendContent(modifier)
        return
    }
    Column(modifier = modifier, verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Text(stringResource(R.string.map_flood_impact_level), color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 12.sp)
        SeverityLegend()
    }
}

@Composable
private fun FloodFrequencyLegendContent(modifier: Modifier = Modifier) {
    val buckets = FloodFrequencyBucket.entries
    Column(modifier = modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Text(stringResource(R.string.map_flood_frequency_legend), color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 12.sp)
        Row(Modifier.fillMaxWidth().height(20.dp).clip(RoundedCornerShape(999.dp))) {
            buckets.forEach { bucket ->
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxSize()
                        .background(bucket.color()),
                    contentAlignment = Alignment.Center,
                ) {
                    Text(
                        bucket.label,
                        color = if (bucket in listOf(FloodFrequencyBucket.NineToTwelve, FloodFrequencyBucket.MoreThanTwelve)) Color.White else Color(0xFF0F172A),
                        fontSize = 9.sp,
                        fontWeight = FontWeight.Bold,
                        maxLines = 1,
                    )
                }
            }
        }
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            Text(stringResource(R.string.map_less_than_once), color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 10.sp)
            Text(stringResource(R.string.map_more_than_12_times), color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 10.sp)
        }
    }
}

@Composable
private fun GenericLegendContent(modifier: Modifier = Modifier) {
    Column(modifier = modifier, verticalArrangement = Arrangement.spacedBy(8.dp)) {
        SeverityLegend()
    }
}
