package com.dmind.app.ui.screens.tools

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Cloud
import androidx.compose.material.icons.filled.LocalFireDepartment
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material.icons.filled.WaterDrop
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.dmind.app.R
import com.dmind.app.ui.components.AffectedOrange
import com.dmind.app.ui.components.CriticalRed
import com.dmind.app.ui.components.DmindBlue
import com.dmind.app.ui.components.DmindCard
import com.dmind.app.ui.components.IconBubble
import com.dmind.app.ui.components.ScreenHeader

// หน้าจอแสดงคู่มือการรับมือภัยพิบัติฉุกเฉินประเภทต่างๆ
@Composable
fun EmergencyManualScreen() {
    val guides = listOf(
        GuideCard(stringResource(R.string.manual_earthquake), Icons.Filled.Warning, stringResource(R.string.manual_earthquake_guide), CriticalRed),
        GuideCard(stringResource(R.string.manual_flood), Icons.Filled.WaterDrop, stringResource(R.string.manual_flood_guide), DmindBlue),
        GuideCard(stringResource(R.string.manual_storm), Icons.Filled.Cloud, stringResource(R.string.manual_storm_guide), AffectedOrange),
        GuideCard(stringResource(R.string.manual_fire), Icons.Filled.LocalFireDepartment, stringResource(R.string.manual_fire_guide), CriticalRed),
    )

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .statusBarsPadding(),
        contentPadding = PaddingValues(bottom = 92.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        item {
            ScreenHeader(
                stringResource(R.string.manual_title),
                stringResource(R.string.manual_subtitle),
                Icons.Filled.Shield,
            )
        }
        items(guides) { guide ->
            DmindCard(modifier = Modifier.padding(horizontal = 18.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    IconBubble(guide.icon, guide.color)
                    Spacer(Modifier.width(12.dp))
                    Column {
                        Text(guide.title, fontWeight = FontWeight.Bold)
                        Text(guide.body, color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 13.sp)
                    }
                }
            }
        }
    }
}

private data class GuideCard(
    val title: String,
    val icon: androidx.compose.ui.graphics.vector.ImageVector,
    val body: String,
    val color: androidx.compose.ui.graphics.Color,
)
