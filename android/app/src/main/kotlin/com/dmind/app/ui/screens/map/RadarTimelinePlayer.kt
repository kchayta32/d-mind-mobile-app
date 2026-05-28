package com.dmind.app.ui.screens.map

import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Pause
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.SkipNext
import androidx.compose.material.icons.filled.SkipPrevious
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.dmind.app.ui.components.DmindBlue
import com.dmind.app.ui.viewmodel.RainViewerFrame
import java.time.Instant
import java.time.ZoneId
import java.time.format.DateTimeFormatter
import java.util.Locale

@Composable
fun RadarTimelinePlayer(
    radarFrames: List<RainViewerFrame>,
    currentRadarFrameIndex: Int,
    isRadarPlaying: Boolean,
    radarPlaybackSpeed: Int,
    onPlayPauseClick: () -> Unit,
    onStepBackwardClick: () -> Unit,
    onStepForwardClick: () -> Unit,
    onSpeedChange: (Int) -> Unit,
    onSeekFrame: (Int) -> Unit,
    modifier: Modifier = Modifier,
) {
    if (radarFrames.isEmpty() || currentRadarFrameIndex < 0 || currentRadarFrameIndex >= radarFrames.size) {
        return
    }

    val currentFrame = radarFrames[currentRadarFrameIndex]
    val nowSecs = System.currentTimeMillis() / 1000
    val isForecast = currentFrame.time > nowSecs

    // Pulsing animation for LIVE indicator
    val infiniteTransition = rememberInfiniteTransition(label = "pulse")
    val pulseScale by infiniteTransition.animateFloat(
        initialValue = 1.0f,
        targetValue = 1.8f,
        animationSpec = infiniteRepeatable(
            animation = tween(1200, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "pulseScale"
    )
    val pulseAlpha by infiniteTransition.animateFloat(
        initialValue = 0.6f,
        targetValue = 0.0f,
        animationSpec = infiniteRepeatable(
            animation = tween(1200, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "pulseAlpha"
    )

    Column(
        modifier = modifier
            .fillMaxWidth()
            .shadow(12.dp, shape = RoundedCornerShape(24.dp))
            .background(
                brush = Brush.verticalGradient(
                    colors = listOf(
                        Color(0xFF1E293B).copy(alpha = 0.88f), // Frosted dark slate top
                        Color(0xFF0F172A).copy(alpha = 0.96f)  // Frosted dark slate bottom
                    )
                ),
                shape = RoundedCornerShape(24.dp)
            )
            .border(
                width = 1.dp,
                brush = Brush.verticalGradient(
                    colors = listOf(
                        Color.White.copy(alpha = 0.22f),
                        Color.White.copy(alpha = 0.06f)
                    )
                ),
                shape = RoundedCornerShape(24.dp)
            )
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        // Top row: Badge and formatted time display
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Active status badge
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Box(modifier = Modifier.size(16.dp), contentAlignment = Alignment.Center) {
                    if (!isForecast) {
                        Box(
                            modifier = Modifier
                                .size((8.dp * pulseScale))
                                .clip(CircleShape)
                                .background(Color(0xFF10B981).copy(alpha = pulseAlpha))
                        )
                    }
                    Box(
                        modifier = Modifier
                            .size(8.dp)
                            .clip(CircleShape)
                            .background(if (isForecast) Color(0xFFF59E0B) else Color(0xFF10B981))
                    )
                }
                Text(
                    text = if (isForecast) "พยากรณ์ (FORECAST)" else "เรดาร์สด (LIVE)",
                    color = if (isForecast) Color(0xFFFBBF24) else Color(0xFF34D399),
                    fontWeight = FontWeight.Bold,
                    fontSize = 12.sp
                )
            }

            // Local Thai Time display (e.g. 16:30 น.)
            Text(
                text = formatThaiTime(currentFrame.time),
                color = Color.White,
                fontWeight = FontWeight.Bold,
                fontSize = 15.sp
            )
        }

        // Timeline Slider with NOW indicator
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            // Back step
            IconButton(
                onClick = onStepBackwardClick,
                modifier = Modifier.size(36.dp)
            ) {
                Icon(
                    imageVector = Icons.Filled.SkipPrevious,
                    contentDescription = "ถอยหลัง",
                    tint = Color.White
                )
            }

            // Slider container with NOW indicator drawn behind
            Box(
                modifier = Modifier
                    .weight(1f)
                    .height(42.dp),
                contentAlignment = Alignment.CenterStart
            ) {
                // Find where NOW falls in frames list
                val nowIndex = radarFrames.indexOfLast { it.time <= nowSecs }
                if (nowIndex >= 0 && radarFrames.size > 1) {
                    val nowFraction = nowIndex.toFloat() / (radarFrames.size - 1)
                    BoxWithConstraints(modifier = Modifier.fillMaxWidth()) {
                        // Slider track has about 12.dp padding at start and end for thumb overhang
                        val trackPadding = 12.dp
                        val actualWidth = maxWidth - (trackPadding * 2)
                        val nowOffset = trackPadding + (actualWidth * nowFraction)

                        Column(
                            modifier = Modifier
                                .padding(start = nowOffset)
                                .align(Alignment.CenterStart),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Box(
                                modifier = Modifier
                                    .width(1.5.dp)
                                    .height(20.dp)
                                    .background(Color.White.copy(alpha = 0.5f))
                            )
                            Text(
                                text = "NOW",
                                color = Color.White.copy(alpha = 0.6f),
                                fontSize = 8.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                }

                Slider(
                    value = currentRadarFrameIndex.toFloat(),
                    onValueChange = { onSeekFrame(it.toInt()) },
                    valueRange = 0f..maxOf(1f, (radarFrames.size - 1).toFloat()),
                    steps = if (radarFrames.size > 2) radarFrames.size - 2 else 0,
                    colors = SliderDefaults.colors(
                        thumbColor = Color.White,
                        activeTrackColor = DmindBlue,
                        inactiveTrackColor = Color.White.copy(alpha = 0.24f),
                        activeTickColor = Color.Transparent,
                        inactiveTickColor = Color.Transparent
                    ),
                    modifier = Modifier.fillMaxWidth()
                )
            }

            // Forward step
            IconButton(
                onClick = onStepForwardClick,
                modifier = Modifier.size(36.dp)
            ) {
                Icon(
                    imageVector = Icons.Filled.SkipNext,
                    contentDescription = "ไปข้างหน้า",
                    tint = Color.White
                )
            }
        }

        // Bottom row: Play/Pause button, Speed Selector Pill, and Rainfall intensity legend bar
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Play/Pause button
            Button(
                onClick = onPlayPauseClick,
                colors = ButtonDefaults.buttonColors(
                    containerColor = DmindBlue,
                    contentColor = Color.White
                ),
                contentPadding = PaddingValues(horizontal = 14.dp, vertical = 6.dp),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.height(36.dp)
            ) {
                Icon(
                    imageVector = if (isRadarPlaying) Icons.Filled.Pause else Icons.Filled.PlayArrow,
                    contentDescription = if (isRadarPlaying) "หยุด" else "เล่น",
                    modifier = Modifier.size(16.dp)
                )
                Spacer(modifier = Modifier.width(4.dp))
                Text(
                    text = if (isRadarPlaying) "หยุด" else "เล่นตัวอย่าง",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.SemiBold
                )
            }

            // Speed Selector Pill (1x, 2x, 4x)
            Row(
                modifier = Modifier
                    .clip(RoundedCornerShape(99.dp))
                    .background(Color.White.copy(alpha = 0.08f))
                    .padding(2.dp),
                horizontalArrangement = Arrangement.spacedBy(2.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                listOf(1, 2, 4).forEach { speed ->
                    val isSelected = radarPlaybackSpeed == speed
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(99.dp))
                            .background(if (isSelected) DmindBlue else Color.Transparent)
                            .clickable { onSpeedChange(speed) }
                            .padding(horizontal = 10.dp, vertical = 5.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "${speed}x",
                            color = if (isSelected) Color.White else Color.White.copy(alpha = 0.6f),
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }
        }

        // Color-coded Rainfall Intensity Legend Bar
        Column(
            modifier = Modifier.fillMaxWidth(),
            verticalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text("เบา (Light)", color = Color.White.copy(alpha = 0.5f), fontSize = 9.sp)
                Text("ปานกลาง (Mod)", color = Color.White.copy(alpha = 0.5f), fontSize = 9.sp)
                Text("แรง (Heavy)", color = Color.White.copy(alpha = 0.5f), fontSize = 9.sp)
                Text("รุนแรง (Ext)", color = Color.White.copy(alpha = 0.5f), fontSize = 9.sp)
            }
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(6.dp)
                    .clip(RoundedCornerShape(3.dp))
                    .background(
                        brush = Brush.horizontalGradient(
                            colors = listOf(
                                Color(0xFF60A5FA), // Light Blue
                                Color(0xFF3B82F6), // Blue
                                Color(0xFF10B981), // Green
                                Color(0xFFFBBF24), // Yellow
                                Color(0xFFF97316), // Orange
                                Color(0xFFEF4444), // Red
                                Color(0xFFEC4899), // Pink
                                Color(0xFF8B5CF6)  // Purple
                            )
                        )
                    )
            )
        }
    }
}

private fun formatThaiTime(epochSeconds: Long): String {
    val instant = Instant.ofEpochSecond(epochSeconds)
    val formatter = DateTimeFormatter.ofPattern("HH:mm", Locale("th", "TH"))
        .withZone(ZoneId.of("Asia/Bangkok"))
    return "${formatter.format(instant)} น."
}
