package com.dmind.app.ui.screens.map

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.FilterList
import androidx.compose.material.icons.filled.Layers
import androidx.compose.material.icons.filled.MyLocation
import androidx.compose.material.icons.filled.Remove
import com.dmind.app.R
import com.dmind.app.ui.components.DmindBlue

// คอมโพสเซเบิลจัดกลุ่มปุ่มลอยควบคุมแผนที่ (ซูมเข้า/ออก, พิกัดผู้ใช้, แผ่นกรอง, ชั้นข้อมูล)
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
        verticalArrangement = Arrangement.spacedBy(10.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        FloatingMapButton(icon = Icons.Filled.MyLocation, contentDescription = stringResource(R.string.map_cd_my_location), onClick = onLocate)
        FloatingMapButton(icon = Icons.Filled.Add, contentDescription = stringResource(R.string.map_cd_zoom_in), onClick = onZoomIn)
        FloatingMapButton(icon = Icons.Filled.Remove, contentDescription = stringResource(R.string.map_cd_zoom_out), onClick = onZoomOut)
        FloatingMapButton(icon = Icons.Filled.FilterList, contentDescription = stringResource(R.string.map_filters), onClick = onFilter)
        FloatingMapButton(icon = Icons.Filled.Layers, contentDescription = stringResource(R.string.map_layers), onClick = onLayers)
    }
}

// คอมโพสเซเบิลย่อยปุ่มลอยควบคุมแผนที่แบบวงกลม (Floating Action Button)
@Composable
private fun FloatingMapButton(
    icon: ImageVector,
    contentDescription: String,
    onClick: () -> Unit,
) {
    FloatingActionButton(
        onClick = onClick,
        modifier = Modifier.size(46.dp),
        shape = CircleShape,
        containerColor = MaterialTheme.colorScheme.surface.copy(alpha = 0.95f),
        contentColor = DmindBlue,
    ) {
        Icon(icon, contentDescription = contentDescription, modifier = Modifier.size(21.dp))
    }
}
