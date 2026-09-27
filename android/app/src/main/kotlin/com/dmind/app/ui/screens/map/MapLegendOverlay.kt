package com.dmind.app.ui.screens.map

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.ui.graphics.Brush
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

// คอมโพสเซเบิลปุ่มสลับสำหรับแสดงผลแผงคำอธิบายสัญลักษณ์ (Legend)
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

// คอมโพสเซเบิลแสดงแผงคำอธิบายสัญลักษณ์แผนที่แบบลากขยับได้ (Draggable Legend Overlay)
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
                DisasterLayerType.Earthquake -> EarthquakeLegendContent()
                DisasterLayerType.Storm -> StormLegendContent()
                DisasterLayerType.AirQuality -> AirQualityLegendContent()
                else -> GenericLegendContent()
            }
        }
    }
}

// ส่วนหัวของแผงคำอธิบายพร้อมปุ่มปิดและไอคอนสัญญะสำหรับใช้ลากย้ายแผง
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

// ข้อมูลคำอธิบายสำหรับระดับความสดใหม่ของจุดความร้อนไฟป่าดาวเทียม VIIRS
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

// ข้อมูลคำอธิบายเชิงแถบสีไล่ระดับสำหรับดัชนีภัยแล้งของ GISTDA
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

// ข้อมูลคำอธิบายสำหรับพื้นที่น้ำท่วม สัญลักษณ์ดาวเทียม Sentinel และข้อมูลประชาชน
@Composable
private fun FloodLegendContent(
    timeRange: GistdaTimeRange,
    modifier: Modifier = Modifier,
) {
    if (timeRange == GistdaTimeRange.FloodFrequency) {
        FloodFrequencyLegendContent(modifier)
        return
    }
    Column(modifier = modifier, verticalArrangement = Arrangement.spacedBy(10.dp)) {
        Text("สัญลักษณ์ดาวเทียม Sentinel & อุทกภัย", fontWeight = FontWeight.SemiBold, fontSize = 13.sp, color = MaterialTheme.colorScheme.primary)

        Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
            // 1. Sentinel-1 SAR / GISTDA
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Box(
                    modifier = Modifier
                        .size(16.dp)
                        .clip(RoundedCornerShape(4.dp))
                        .background(Color(0xFF0284C7).copy(alpha = 0.7f))
                        .border(1.dp, Color(0xFF0369A1), RoundedCornerShape(4.dp))
                )
                Text("พื้นที่น้ำท่วมสด (Sentinel-1 SAR / GISTDA)", fontSize = 12.sp)
            }
            // 2. Sentinel-2 True Color
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Box(
                    modifier = Modifier
                        .size(16.dp)
                        .clip(RoundedCornerShape(4.dp))
                        .background(Color(0xFF10B981).copy(alpha = 0.7f))
                        .border(1.dp, Color(0xFF059669), RoundedCornerShape(4.dp))
                )
                Text("ภาพถ่ายสีจริงไร้เมฆ (Sentinel-2 Cloudless)", fontSize = 12.sp)
            }
            // 3. Historical Flood Frequency
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Box(
                    modifier = Modifier
                        .size(16.dp)
                        .clip(RoundedCornerShape(4.dp))
                        .background(Color(0xFFF59E0B).copy(alpha = 0.7f))
                        .border(1.dp, Color(0xFFD97706), RoundedCornerShape(4.dp))
                )
                Text("พื้นที่น้ำท่วมซ้ำซาก (สถิติ 1-12 ครั้ง)", fontSize = 12.sp)
            }
            // 4. Crowdsourced Citizen Flood Ground Truth
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Box(
                    modifier = Modifier
                        .size(16.dp)
                        .clip(CircleShape)
                        .background(Color(0xFF10B981))
                        .border(1.5.dp, Color.White, CircleShape)
                )
                Text("จุดยืนยันน้ำท่วมจริงโดยประชาชน (Ground Truth)", fontSize = 12.sp)
            }
            // 5. Water Stations
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Box(
                    modifier = Modifier
                        .size(16.dp)
                        .clip(CircleShape)
                        .background(Color(0xFF2563EB))
                        .border(1.5.dp, Color.White, CircleShape)
                )
                Text("สถานีตรวจวัดน้ำและอัตราไหล (GloFAS)", fontSize = 12.sp)
            }
        }

        Spacer(Modifier.height(4.dp))
        Text(stringResource(R.string.map_flood_impact_level), color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 12.sp)
        SeverityLegend()
    }
}

// ข้อมูลคำอธิบายสำหรับข้อมูลความถี่เหตุการณ์น้ำท่วมสะสม
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

// ข้อมูลคำอธิบายสำหรับแผ่นดินไหว และการแพร่กระจายคลื่นไหวสะเทือน
@Composable
private fun EarthquakeLegendContent(modifier: Modifier = Modifier) {
    Column(modifier = modifier, verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Text("สัญลักษณ์แผ่นดินไหว & การแพร่คลื่น", fontWeight = FontWeight.SemiBold, fontSize = 13.sp, color = MaterialTheme.colorScheme.primary)
        Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Box(
                    modifier = Modifier
                        .size(16.dp)
                        .clip(CircleShape)
                        .background(Color(0xFFEF4444))
                        .border(1.5.dp, Color.White, CircleShape)
                )
                Text("จุดศูนย์กลางแผ่นดินไหว (Epicenter)", fontSize = 12.sp)
            }
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Box(
                    modifier = Modifier
                        .size(16.dp)
                        .clip(CircleShape)
                        .background(Color(0xFF06B6D4).copy(alpha = 0.25f))
                        .border(2.dp, Color(0xFF06B6D4), CircleShape)
                )
                Column {
                    Text("คลื่นปฐมภูมิ P-Wave (~6.0 km/s)", fontSize = 12.sp, fontWeight = FontWeight.Medium)
                    Text("คลื่นอัดตัวความเร็วสูง เดินทางถึงก่อน", fontSize = 10.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            }
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Box(
                    modifier = Modifier
                        .size(16.dp)
                        .clip(CircleShape)
                        .background(Color(0xFFF43F5E).copy(alpha = 0.25f))
                        .border(2.dp, Color(0xFFF43F5E), CircleShape)
                )
                Column {
                    Text("คลื่นทุติยภูมิ S-Wave (~3.5 km/s)", fontSize = 12.sp, fontWeight = FontWeight.Medium)
                    Text("คลื่นเฉือนสร้างแรงสั่นสะเทือนทำลายล้าง", fontSize = 10.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            }
        }
        Spacer(Modifier.height(4.dp))
        Text("ระดับความรุนแรงตามมาตราเมอร์คัลลี / ขนาดริกเตอร์", color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 11.sp)
        SeverityLegend()
    }
}

// ข้อมูลคำอธิบายสำหรับพายุ และเรดาร์ตรวจสภาพอากาศ
@Composable
private fun StormLegendContent(modifier: Modifier = Modifier) {
    Column(modifier = modifier, verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Text("สัญลักษณ์เรดาร์ตรวจสภาพอากาศ & พายุ", fontWeight = FontWeight.SemiBold, fontSize = 13.sp, color = MaterialTheme.colorScheme.primary)
        Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Box(
                    modifier = Modifier
                        .size(16.dp)
                        .clip(CircleShape)
                        .background(Color(0xFFA855F7))
                        .border(1.5.dp, Color.White, CircleShape)
                )
                Text("ศูนย์กลางพายุหมุน (Cyclonic Center / พายุฟ้าคะนอง)", fontSize = 12.sp)
            }
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Box(
                    modifier = Modifier
                        .size(16.dp)
                        .clip(RoundedCornerShape(4.dp))
                        .background(Brush.horizontalGradient(listOf(Color(0xFF22C55E), Color(0xFFEAB308), Color(0xFFEF4444))))
                )
                Text("เรดาร์ตรวจอากาศสด RainViewer (กลุ่มเมฆฝน)", fontSize = 12.sp)
            }
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Box(
                    modifier = Modifier
                        .size(16.dp)
                        .clip(CircleShape)
                        .background(Color(0xFF6366F1))
                        .border(1.5.dp, Color.White, CircleShape)
                )
                Text("สถานีเรดาร์และตรวจวัดลม/ฝน TMD", fontSize = 12.sp)
            }
        }
        Spacer(Modifier.height(4.dp))
        SeverityLegend()
    }
}

// ข้อมูลคำอธิบายสำหรับเกณฑ์คุณภาพอากาศ PM2.5
@Composable
private fun AirQualityLegendContent(modifier: Modifier = Modifier) {
    val aqiBands = listOf(
        Triple("0-15 µg/m³", "ดีมาก", Color(0xFF0284C7)),
        Triple("15.1-25 µg/m³", "ดี", Color(0xFF10B981)),
        Triple("25.1-37.5 µg/m³", "ปานกลาง", Color(0xFFF59E0B)),
        Triple("37.6-75 µg/m³", "เริ่มมีผลกระทบ", Color(0xFFF97316)),
        Triple(">75 µg/m³", "มีผลต่อสุขภาพ", Color(0xFFEF4444)),
    )
    Column(modifier = modifier, verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Text("เกณฑ์ดัชนีคุณภาพอากาศ PM2.5 (มาตรฐานไทย)", fontWeight = FontWeight.SemiBold, fontSize = 13.sp, color = MaterialTheme.colorScheme.primary)
        Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
            aqiBands.forEach { (range, label, color) ->
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Box(
                        modifier = Modifier
                            .size(16.dp)
                            .clip(RoundedCornerShape(4.dp))
                            .background(color)
                    )
                    Text("$range: $label", fontSize = 12.sp, fontWeight = FontWeight.Medium)
                }
            }
        }
    }
}

// ข้อมูลคำอธิบายระดับความรุนแรงทั่วไปประจำชั้นข้อมูลแผนที่
@Composable
private fun GenericLegendContent(modifier: Modifier = Modifier) {
    Column(modifier = modifier, verticalArrangement = Arrangement.spacedBy(8.dp)) {
        SeverityLegend()
    }
}
