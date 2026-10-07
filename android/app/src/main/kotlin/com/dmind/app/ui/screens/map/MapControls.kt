package com.dmind.app.ui.screens.map

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.FilterList
import androidx.compose.material.icons.filled.Layers
import androidx.compose.material.icons.filled.MyLocation
import androidx.compose.material.icons.filled.Remove
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.dmind.app.R
import com.dmind.app.ui.components.DmindBlue

// คอมโพสเซเบิลจัดกลุ่มปุ่มลอยควบคุมแผนที่ สไตล์ Modern Frosted Glass (ซูมเข้า/ออก, พิกัดผู้ใช้, แผ่นกรอง, ชั้นข้อมูล)
@Composable
internal fun MapControls(
    onLocate: () -> Unit,
    onZoomIn: () -> Unit,
    onZoomOut: () -> Unit,
    onFilter: () -> Unit,
    onLayers: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Column(
        modifier = modifier,
        verticalArrangement = Arrangement.spacedBy(8.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        // กลุ่มปุ่มซูมเข้า-ออก ในคอนเทนเนอร์เดียวกันแบบ Floating Pill
        Surface(
            shape = RoundedCornerShape(24.dp),
            color = MaterialTheme.colorScheme.surface.copy(alpha = 0.92f),
            border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f)),
            shadowElevation = 8.dp,
        ) {
            Column(
                modifier = Modifier.padding(4.dp),
                verticalArrangement = Arrangement.spacedBy(4.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
            ) {
                GlassControlIconButton(
                    icon = Icons.Filled.Add,
                    contentDescription = stringResource(R.string.map_cd_zoom_in),
                    tint = MaterialTheme.colorScheme.onSurface,
                    onClick = onZoomIn,
                )
                GlassControlIconButton(
                    icon = Icons.Filled.Remove,
                    contentDescription = stringResource(R.string.map_cd_zoom_out),
                    tint = MaterialTheme.colorScheme.onSurface,
                    onClick = onZoomOut,
                )
            }
        }

        // ปุ่มตำแหน่งของฉัน (Center Thailand / My Location)
        FloatingGlassButton(
            icon = Icons.Filled.MyLocation,
            contentDescription = stringResource(R.string.map_cd_my_location),
            tint = DmindBlue,
            onClick = onLocate,
        )

        // ปุ่มเปิดหน้าต่างสลับชั้นข้อมูล (Layers Sheet)
        FloatingGlassButton(
            icon = Icons.Filled.Layers,
            contentDescription = stringResource(R.string.map_layers),
            tint = Color(0xFF06B6D4), // Cyan
            onClick = onLayers,
        )

        // ปุ่มเปิดหน้าต่างตัวกรองข้อมูล (Filter Sheet)
        FloatingGlassButton(
            icon = Icons.Filled.FilterList,
            contentDescription = stringResource(R.string.map_filters),
            tint = DmindBlue,
            onClick = onFilter,
        )
    }
}

// คอมโพสเซเบิลปุ่มลอยแบบแก้วกลม (Floating Glass Button)
@Composable
private fun FloatingGlassButton(
    icon: ImageVector,
    contentDescription: String,
    tint: Color,
    onClick: () -> Unit,
) {
    Surface(
        modifier = Modifier.size(46.dp),
        shape = CircleShape,
        color = MaterialTheme.colorScheme.surface.copy(alpha = 0.94f),
        border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.45f)),
        shadowElevation = 6.dp,
    ) {
        Box(
            modifier = Modifier.clickable(onClick = onClick),
            contentAlignment = Alignment.Center,
        ) {
            Icon(
                imageVector = icon,
                contentDescription = contentDescription,
                tint = tint,
                modifier = Modifier.size(22.dp),
            )
        }
    }
}

// ปุ่มไอคอนภายในกลุ่มปุ่มแบบรวม
@Composable
private fun GlassControlIconButton(
    icon: ImageVector,
    contentDescription: String,
    tint: Color,
    onClick: () -> Unit,
) {
    Box(
        modifier = Modifier
            .size(38.dp)
            .clickable(onClick = onClick),
        contentAlignment = Alignment.Center,
    ) {
        Icon(
            imageVector = icon,
            contentDescription = contentDescription,
            tint = tint,
            modifier = Modifier.size(20.dp),
        )
    }
}
