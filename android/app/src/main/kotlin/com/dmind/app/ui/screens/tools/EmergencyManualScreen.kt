package com.dmind.app.ui.screens.tools

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.animateContentSize
import androidx.compose.animation.expandVertically
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.shrinkVertically
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Backpack
import androidx.compose.material.icons.filled.Call
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Clear
import androidx.compose.material.icons.filled.Cloud
import androidx.compose.material.icons.filled.ExpandLess
import androidx.compose.material.icons.filled.ExpandMore
import androidx.compose.material.icons.filled.Landscape
import androidx.compose.material.icons.filled.LocalFireDepartment
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material.icons.filled.RadioButtonUnchecked
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Satellite
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material.icons.filled.WaterDrop
import androidx.compose.material.icons.filled.WbSunny
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.dmind.app.ui.components.AffectedOrange
import com.dmind.app.ui.components.CriticalRed
import com.dmind.app.ui.components.DmindBlue
import com.dmind.app.ui.components.DmindCard
import com.dmind.app.ui.components.IconBubble
import com.dmind.app.ui.components.SafeGreen
import com.dmind.app.ui.components.ScreenHeader
import com.dmind.app.ui.components.StatusPill
import com.dmind.app.ui.components.WatchYellow
import com.dmind.app.util.ExternalIntents

// หน้าจอแสดงคู่มือการรับมือภัยพิบัติฉุกเฉิน, กระเป๋า 72 ชม., สายด่วน และคู่มืออ่านดาวเทียม GISTDA (UI/UX Pro Max)
@Composable
fun EmergencyManualScreen(
    onBack: (() -> Unit)? = null,
) {
    val context = LocalContext.current
    var selectedTab by rememberSaveable { mutableStateOf(ManualTab.Survival.name) }
    var searchQuery by rememberSaveable { mutableStateOf("") }
    var expandedGuideId by rememberSaveable { mutableStateOf<String?>(null) }
    var checkedGoBagItems by rememberSaveable {
        mutableStateOf(setOf("water", "food", "light"))
    }

    val currentTab = remember(selectedTab) {
        ManualTab.entries.firstOrNull { it.name == selectedTab } ?: ManualTab.Survival
    }

    val filteredGuides = remember(searchQuery) {
        if (searchQuery.isBlank()) {
            SURVIVAL_GUIDES
        } else {
            SURVIVAL_GUIDES.filter { guide ->
                guide.title.contains(searchQuery, ignoreCase = true) ||
                    guide.shortDesc.contains(searchQuery, ignoreCase = true) ||
                    guide.beforeSteps.any { it.contains(searchQuery, ignoreCase = true) } ||
                    guide.duringSteps.any { it.contains(searchQuery, ignoreCase = true) } ||
                    guide.afterSteps.any { it.contains(searchQuery, ignoreCase = true) } ||
                    guide.dos.any { it.contains(searchQuery, ignoreCase = true) } ||
                    guide.donts.any { it.contains(searchQuery, ignoreCase = true) }
            }
        }
    }

    val filteredItems = remember(searchQuery) {
        if (searchQuery.isBlank()) {
            GO_BAG_ITEMS
        } else {
            GO_BAG_ITEMS.filter {
                it.name.contains(searchQuery, ignoreCase = true) ||
                    it.desc.contains(searchQuery, ignoreCase = true) ||
                    it.category.contains(searchQuery, ignoreCase = true)
            }
        }
    }

    val filteredHotlines = remember(searchQuery) {
        if (searchQuery.isBlank()) {
            EMERGENCY_HOTLINES
        } else {
            EMERGENCY_HOTLINES.filter {
                it.name.contains(searchQuery, ignoreCase = true) ||
                    it.phone.contains(searchQuery, ignoreCase = true) ||
                    it.description.contains(searchQuery, ignoreCase = true) ||
                    it.tag.contains(searchQuery, ignoreCase = true)
            }
        }
    }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .statusBarsPadding(),
        contentPadding = PaddingValues(bottom = 96.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp),
    ) {
        // ส่วนหัวหน้าจอ
        item {
            ScreenHeader(
                title = "คู่มือภัยพิบัติ & กระเป๋า 72 ชม.",
                subtitle = "แนวทางเอาตัวรอด การเตรียมพร้อม และสายด่วนฉุกเฉิน",
                icon = Icons.Filled.Shield,
                onBack = onBack,
            )
        }

        // ช่องค้นหาแบบเรียลไทม์
        item {
            OutlinedTextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 18.dp),
                placeholder = {
                    Text(
                        "ค้นหาวิธีเอาตัวรอด สิ่งของฉุกเฉิน หรือเบอร์โทร...",
                        fontSize = 13.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                },
                leadingIcon = {
                    Icon(
                        imageVector = Icons.Filled.Search,
                        contentDescription = null,
                        tint = DmindBlue,
                    )
                },
                trailingIcon = {
                    if (searchQuery.isNotBlank()) {
                        IconButton(onClick = { searchQuery = "" }) {
                            Icon(
                                imageVector = Icons.Filled.Clear,
                                contentDescription = "ล้างการค้นหา",
                                modifier = Modifier.size(18.dp),
                            )
                        }
                    }
                },
                shape = RoundedCornerShape(16.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = DmindBlue,
                    unfocusedBorderColor = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.6f),
                    focusedContainerColor = MaterialTheme.colorScheme.surface,
                    unfocusedContainerColor = MaterialTheme.colorScheme.surface,
                ),
                singleLine = true,
            )
        }

        // แถบสลับหมวดหมู่แบบ Pill Scrollable
        item {
            LazyRow(
                modifier = Modifier.fillMaxWidth(),
                contentPadding = PaddingValues(horizontal = 18.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                items(ManualTab.entries) { tab ->
                    val isSelected = tab == currentTab
                    Surface(
                        onClick = {
                            selectedTab = tab.name
                        },
                        shape = RoundedCornerShape(14.dp),
                        color = if (isSelected) DmindBlue else MaterialTheme.colorScheme.surface,
                        border = BorderStroke(
                            1.dp,
                            if (isSelected) DmindBlue else MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f),
                        ),
                        shadowElevation = if (isSelected) 3.dp else 0.dp,
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 14.dp, vertical = 10.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(8.dp),
                        ) {
                            Icon(
                                imageVector = tab.icon,
                                contentDescription = null,
                                tint = if (isSelected) Color.White else MaterialTheme.colorScheme.onSurfaceVariant,
                                modifier = Modifier.size(18.dp),
                            )
                            Text(
                                text = tab.label,
                                fontSize = 13.sp,
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                                color = if (isSelected) Color.White else MaterialTheme.colorScheme.onSurface,
                            )
                        }
                    }
                }
            }
        }

        // เนื้อหาตามแท็บที่เลือก
        when (currentTab) {
            ManualTab.Survival -> {
                if (filteredGuides.isEmpty()) {
                    item {
                        EmptyManualSearch(query = searchQuery, onClear = { searchQuery = "" })
                    }
                } else {
                    items(filteredGuides, key = { it.id }) { guide ->
                        val isExpanded = expandedGuideId == guide.id
                        SurvivalGuideCard(
                            guide = guide,
                            isExpanded = isExpanded,
                            onToggle = {
                                expandedGuideId = if (isExpanded) null else guide.id
                            },
                            modifier = Modifier.padding(horizontal = 18.dp),
                        )
                    }
                }
            }

            ManualTab.GoBag -> {
                val totalItems = GO_BAG_ITEMS.size
                val checkedCount = checkedGoBagItems.size
                val progress = if (totalItems > 0) checkedCount.toFloat() / totalItems.toFloat() else 0f
                val percent = (progress * 100).toInt()

                item {
                    GoBagProgressHeader(
                        checkedCount = checkedCount,
                        totalCount = totalItems,
                        progress = progress,
                        percent = percent,
                        onReset = { checkedGoBagItems = emptySet() },
                        modifier = Modifier.padding(horizontal = 18.dp),
                    )
                }

                items(filteredItems, key = { it.id }) { item ->
                    val isChecked = item.id in checkedGoBagItems
                    GoBagItemCard(
                        item = item,
                        isChecked = isChecked,
                        onToggle = {
                            checkedGoBagItems = if (isChecked) {
                                checkedGoBagItems - item.id
                            } else {
                                checkedGoBagItems + item.id
                            }
                        },
                        modifier = Modifier.padding(horizontal = 18.dp),
                    )
                }
            }

            ManualTab.Hotlines -> {
                item {
                    DmindCard(
                        modifier = Modifier.padding(horizontal = 18.dp),
                        contentPadding = PaddingValues(16.dp),
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            IconBubble(Icons.Filled.Call, CriticalRed)
                            Spacer(Modifier.width(12.dp))
                            Column {
                                Text(
                                    "สายด่วนภัยพิบัติแห่งชาติ (24 ชั่วโมง)",
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 15.sp,
                                )
                                Text(
                                    "กดปุ่มโทรเพื่อติดต่อเจ้าหน้าที่กู้ภัยและหน่วยงานรัฐได้ทันที",
                                    fontSize = 12.sp,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                                )
                            }
                        }
                    }
                }

                items(filteredHotlines, key = { it.phone }) { hotline ->
                    HotlineCard(
                        hotline = hotline,
                        onDial = { ExternalIntents.dial(context, hotline.phone) },
                        modifier = Modifier.padding(horizontal = 18.dp),
                    )
                }
            }

            ManualTab.Satellite -> {
                items(SATELLITE_GUIDES, key = { it.title }) { sat ->
                    SatelliteGuideCard(sat = sat, modifier = Modifier.padding(horizontal = 18.dp))
                }
            }
        }
    }
}

// ─── Enums & Models ─────────────────────────────────────────────────────────────

private enum class ManualTab(val label: String, val icon: ImageVector) {
    Survival("เอาตัวรอด", Icons.Filled.Shield),
    GoBag("กระเป๋า 72 ชม.", Icons.Filled.Backpack),
    Hotlines("สายด่วน", Icons.Filled.Phone),
    Satellite("ดาวเทียม GISTDA", Icons.Filled.Satellite),
}

private data class SurvivalGuideData(
    val id: String,
    val title: String,
    val subtitle: String,
    val icon: ImageVector,
    val color: Color,
    val shortDesc: String,
    val beforeSteps: List<String>,
    val duringSteps: List<String>,
    val afterSteps: List<String>,
    val dos: List<String>,
    val donts: List<String>,
)

private data class GoBagItemData(
    val id: String,
    val name: String,
    val desc: String,
    val category: String,
    val isEssential: Boolean,
)

private data class HotlineData(
    val name: String,
    val phone: String,
    val description: String,
    val tag: String,
    val color: Color,
)

private data class SatelliteGuideData(
    val title: String,
    val agency: String,
    val updateCycle: String,
    val description: String,
    val color: Color,
    val interpretationPoints: List<String>,
)

// ─── Survival Guide Components ──────────────────────────────────────────────────

@Composable
private fun SurvivalGuideCard(
    guide: SurvivalGuideData,
    isExpanded: Boolean,
    onToggle: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Card(
        modifier = modifier
            .fillMaxWidth()
            .animateContentSize(),
        shape = RoundedCornerShape(18.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        border = BorderStroke(
            1.dp,
            if (isExpanded) guide.color.copy(alpha = 0.6f) else MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.35f),
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = if (isExpanded) 4.dp else 1.dp),
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .clickable(onClick = onToggle)
                .padding(16.dp),
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                IconBubble(guide.icon, guide.color)
                Column(modifier = Modifier.weight(1f)) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                    ) {
                        Text(guide.title, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                    }
                    Text(
                        guide.subtitle,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        fontSize = 12.sp,
                    )
                }
                IconButton(onClick = onToggle) {
                    Icon(
                        imageVector = if (isExpanded) Icons.Filled.ExpandLess else Icons.Filled.ExpandMore,
                        contentDescription = if (isExpanded) "ย่อ" else "ขยาย",
                        tint = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }
            }

            Spacer(Modifier.height(8.dp))
            Text(
                text = guide.shortDesc,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurface,
                fontSize = 13.sp,
            )

            // เนื้อหาเมื่อกดขยาย
            AnimatedVisibility(
                visible = isExpanded,
                enter = fadeIn() + expandVertically(),
                exit = fadeOut() + shrinkVertically(),
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 12.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp),
                ) {
                    StepSection("ก่อนเกิดเหตุ (เตรียมพร้อม)", guide.beforeSteps, DmindBlue)
                    StepSection("ขณะเกิดเหตุ (เอาตัวรอด)", guide.duringSteps, CriticalRed)
                    StepSection("หลังเกิดเหตุ (ฟื้นฟูและปลอดภัย)", guide.afterSteps, SafeGreen)

                    // Dos and Don'ts Box
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                    ) {
                        DoDontBox("สิ่งที่ควรทำ", guide.dos, SafeGreen, Modifier.weight(1f))
                        DoDontBox("ข้อห้ามเด็ดขาด", guide.donts, CriticalRed, Modifier.weight(1f))
                    }
                }
            }
        }
    }
}

@Composable
private fun StepSection(
    title: String,
    steps: List<String>,
    accentColor: Color,
) {
    Surface(
        shape = RoundedCornerShape(12.dp),
        color = accentColor.copy(alpha = 0.06f),
        modifier = Modifier.fillMaxWidth(),
    ) {
        Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
            Text(
                text = title,
                fontWeight = FontWeight.Bold,
                fontSize = 13.sp,
                color = accentColor,
            )
            steps.forEachIndexed { index, step ->
                Row(
                    verticalAlignment = Alignment.Top,
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                ) {
                    Text(
                        "${index + 1}.",
                        fontWeight = FontWeight.Bold,
                        fontSize = 12.sp,
                        color = accentColor,
                    )
                    Text(
                        step,
                        fontSize = 12.sp,
                        color = MaterialTheme.colorScheme.onSurface,
                        lineHeight = 18.sp,
                    )
                }
            }
        }
    }
}

@Composable
private fun DoDontBox(
    title: String,
    items: List<String>,
    color: Color,
    modifier: Modifier = Modifier,
) {
    Surface(
        modifier = modifier,
        shape = RoundedCornerShape(12.dp),
        color = color.copy(alpha = 0.07f),
        border = BorderStroke(1.dp, color.copy(alpha = 0.3f)),
    ) {
        Column(
            modifier = Modifier.padding(10.dp),
            verticalArrangement = Arrangement.spacedBy(4.dp),
        ) {
            Text(title, fontWeight = FontWeight.Bold, fontSize = 12.sp, color = color)
            items.forEach { item ->
                Text(
                    "• $item",
                    fontSize = 11.sp,
                    color = MaterialTheme.colorScheme.onSurface,
                    lineHeight = 15.sp,
                )
            }
        }
    }
}

// ─── Go-Bag Components ──────────────────────────────────────────────────────────

@Composable
private fun GoBagProgressHeader(
    checkedCount: Int,
    totalCount: Int,
    progress: Float,
    percent: Int,
    onReset: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Card(
        modifier = modifier.fillMaxWidth(),
        shape = RoundedCornerShape(18.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface,
        ),
        border = BorderStroke(1.dp, DmindBlue.copy(alpha = 0.4f)),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp),
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween,
                modifier = Modifier.fillMaxWidth(),
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(10.dp),
                ) {
                    Box(
                        modifier = Modifier
                            .size(42.dp)
                            .background(
                                Brush.linearGradient(listOf(Color(0xFF3B82F6), Color(0xFF1D4ED8))),
                                CircleShape,
                            ),
                        contentAlignment = Alignment.Center,
                    ) {
                        Icon(
                            imageVector = Icons.Filled.Backpack,
                            contentDescription = null,
                            tint = Color.White,
                            modifier = Modifier.size(22.dp),
                        )
                    }
                    Column {
                        Text(
                            "ความพร้อมกระเป๋า 72 ชม.",
                            fontWeight = FontWeight.Bold,
                            fontSize = 15.sp,
                        )
                        Text(
                            "เตรียมพร้อมแล้ว $checkedCount จาก $totalCount รายการ",
                            fontSize = 12.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                    }
                }

                StatusPill(
                    label = "$percent%",
                    color = if (percent >= 80) SafeGreen else if (percent >= 50) WatchYellow else AffectedOrange,
                )
            }

            LinearProgressIndicator(
                progress = { progress },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(8.dp)
                    .clip(RoundedCornerShape(4.dp)),
                color = if (percent >= 80) SafeGreen else DmindBlue,
                trackColor = MaterialTheme.colorScheme.surfaceVariant,
            )

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Text(
                    text = if (percent >= 100) "ยอดเยี่ยม! คุณพร้อมรับมือเหตุฉุกเฉินแล้ว" else "ติ๊กถูกเพื่อบันทึกสิ่งของที่เตรียมไว้แล้ว",
                    fontSize = 11.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
                if (checkedCount > 0) {
                    OutlinedButton(
                        onClick = onReset,
                        contentPadding = PaddingValues(horizontal = 8.dp, vertical = 2.dp),
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.height(28.dp),
                    ) {
                        Icon(Icons.Filled.Refresh, contentDescription = null, modifier = Modifier.size(12.dp))
                        Spacer(Modifier.width(4.dp))
                        Text("รีเซ็ต", fontSize = 11.sp)
                    }
                }
            }
        }
    }
}

@Composable
private fun GoBagItemCard(
    item: GoBagItemData,
    isChecked: Boolean,
    onToggle: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Surface(
        modifier = modifier
            .fillMaxWidth()
            .clickable(onClick = onToggle),
        shape = RoundedCornerShape(14.dp),
        color = if (isChecked) SafeGreen.copy(alpha = 0.08f) else MaterialTheme.colorScheme.surface,
        border = BorderStroke(
            1.dp,
            if (isChecked) SafeGreen.copy(alpha = 0.4f) else MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.35f),
        ),
    ) {
        Row(
            modifier = Modifier.padding(14.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            Icon(
                imageVector = if (isChecked) Icons.Filled.CheckCircle else Icons.Filled.RadioButtonUnchecked,
                contentDescription = null,
                tint = if (isChecked) SafeGreen else MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.size(24.dp),
            )
            Column(modifier = Modifier.weight(1f)) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                ) {
                    Text(
                        text = item.name,
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp,
                        color = if (isChecked) SafeGreen else MaterialTheme.colorScheme.onSurface,
                    )
                    if (item.isEssential) {
                        StatusPill(label = "จำเป็น", color = CriticalRed)
                    }
                }
                Spacer(Modifier.height(2.dp))
                Text(
                    text = item.desc,
                    fontSize = 12.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
        }
    }
}

// ─── Hotline Components ─────────────────────────────────────────────────────────

@Composable
private fun HotlineCard(
    hotline: HotlineData,
    onDial: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Card(
        modifier = modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.35f)),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
    ) {
        Row(
            modifier = Modifier.padding(14.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            Box(
                modifier = Modifier
                    .size(46.dp)
                    .background(hotline.color.copy(alpha = 0.12f), RoundedCornerShape(12.dp)),
                contentAlignment = Alignment.Center,
            ) {
                Text(
                    text = hotline.phone,
                    fontWeight = FontWeight.Black,
                    fontSize = 14.sp,
                    color = hotline.color,
                )
            }

            Column(modifier = Modifier.weight(1f)) {
                Text(hotline.name, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                Text(
                    hotline.description,
                    fontSize = 12.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis,
                )
            }

            Button(
                onClick = onDial,
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(containerColor = hotline.color),
                contentPadding = PaddingValues(horizontal = 14.dp, vertical = 6.dp),
                modifier = Modifier.height(38.dp),
            ) {
                Icon(
                    imageVector = Icons.Filled.Call,
                    contentDescription = "โทร",
                    modifier = Modifier.size(16.dp),
                )
                Spacer(Modifier.width(6.dp))
                Text("โทร", fontWeight = FontWeight.Bold, fontSize = 13.sp)
            }
        }
    }
}

// ─── Satellite Guide Components ─────────────────────────────────────────────────

@Composable
private fun SatelliteGuideCard(
    sat: SatelliteGuideData,
    modifier: Modifier = Modifier,
) {
    Card(
        modifier = modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.35f)),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp),
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(10.dp),
            ) {
                IconBubble(Icons.Filled.Satellite, sat.color)
                Column(modifier = Modifier.weight(1f)) {
                    Text(sat.title, fontWeight = FontWeight.Bold, fontSize = 15.sp)
                    Text(
                        "${sat.agency} • รอบการอัปเดต: ${sat.updateCycle}",
                        fontSize = 11.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }
            }

            Text(sat.description, fontSize = 13.sp, color = MaterialTheme.colorScheme.onSurface)

            Surface(
                shape = RoundedCornerShape(10.dp),
                color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f),
                modifier = Modifier.fillMaxWidth(),
            ) {
                Column(
                    modifier = Modifier.padding(10.dp),
                    verticalArrangement = Arrangement.spacedBy(4.dp),
                ) {
                    Text(
                        "วิธีแปลความหมายบนแผนที่:",
                        fontWeight = FontWeight.Bold,
                        fontSize = 12.sp,
                        color = MaterialTheme.colorScheme.primary,
                    )
                    sat.interpretationPoints.forEach { point ->
                        Text("• $point", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                }
            }
        }
    }
}

@Composable
private fun EmptyManualSearch(query: String, onClear: () -> Unit) {
    DmindCard(
        modifier = Modifier.padding(horizontal = 18.dp),
        contentPadding = PaddingValues(24.dp),
    ) {
        Column(
            modifier = Modifier.fillMaxWidth(),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            Icon(
                imageVector = Icons.Filled.Search,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.size(36.dp),
            )
            Text(
                "ไม่พบข้อมูลสำหรับ \"$query\"",
                fontWeight = FontWeight.Bold,
                fontSize = 14.sp,
            )
            Text(
                "ลองเปลี่ยนคำค้นหา เช่น น้ำท่วม, ไฟป่า, ยา, ปภ.",
                fontSize = 12.sp,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            Button(
                onClick = onClear,
                shape = RoundedCornerShape(10.dp),
                modifier = Modifier.padding(top = 8.dp),
            ) {
                Text("ล้างการค้นหา")
            }
        }
    }
}

// ─── Static Data ────────────────────────────────────────────────────────────────

private val SURVIVAL_GUIDES = listOf(
    SurvivalGuideData(
        id = "flood",
        title = "น้ำท่วมฉับพลันและน้ำป่าไหลหลาก",
        subtitle = "Flash Flood & Riverine Inundation",
        icon = Icons.Filled.WaterDrop,
        color = DmindBlue,
        shortDesc = "ยกของขึ้นที่สูง ตัดกระแสไฟฟ้าเบรกเกอร์ทันที ห้ามเดินลุยน้ำไหลเชี่ยว และระวังสัตว์มีพิษ",
        beforeSteps = listOf(
            "ติดตามข่าวสารพยากรณ์อากาศและสัญญาณเตือนภัย ปภ. อย่างใกล้ชิด",
            "ยกสิ่งของและอุปกรณ์ไฟฟ้าขึ้นที่สูงเหนือระดับน้ำท่วมสูงสุดในอดีต",
            "เตรียมกระสอบทรายอุดท่อระบายน้ำและวางแนวกั้นหน้าบ้าน",
            "ย้ายรถยนต์และสัตว์เลี้ยงไปยังจุดปลอดภัยหรือที่ดอน",
        ),
        duringSteps = listOf(
            "สับคัตเอาต์ตัดกระแสไฟฟ้าหลักของบ้านทันทีก่อนน้ำท่วมถึงปลั๊ก",
            "ห้ามเดินหรือขับรถลุยน้ำที่ไหลเชี่ยว แม้ระดับน้ำจะสูงเพียง 15-30 ซม.",
            "หากจำเป็นต้องลุยน้ำ ให้ใช้ไม้ค้ำยันนำทางเพื่อตรวจเช็กหลุมหรือท่อเปิด",
            "ระวังสัตว์เลื้อยคลานมีพิษ เช่น งู ตะขาบ แมงป่อง ที่หนีน้ำขึ้นมาบนบ้าน",
        ),
        afterSteps = listOf(
            "ตรวจสอบความเสียหายของโครงสร้างบ้าน และใช้ไขควงวัดไฟตรวจเช็กไฟฟ้ารั่ว",
            "ห้ามเปิดเครื่องใช้ไฟฟ้าที่เคยจมน้ำจนกว่าช่างผู้ชำนาญจะตรวจสอบ",
            "ทำความสะอาดและฆ่าเชื้อโรคบริเวณที่น้ำท่วมขังเพื่อป้องกันโรคฉี่หนู (Leptospirosis)",
        ),
        dos = listOf("ตัดไฟทันที", "อพยพขึ้นที่สูง", "ดื่มน้ำสะอาดต้มสุก", "สวมรองเท้าบูท"),
        donts = listOf("ห้ามจับปลั๊กไฟเปียก", "ห้ามเล่นน้ำท่วม", "ห้ามขับรถฝ่ากระแสน้ำ", "ห้ามดื่มน้ำที่ท่วมขัง"),
    ),
    SurvivalGuideData(
        id = "wildfire",
        title = "ไฟป่า หมอกควัน และวิกฤต PM2.5",
        subtitle = "Wildfire, Smoke & Air Hazard",
        icon = Icons.Filled.LocalFireDepartment,
        color = CriticalRed,
        shortDesc = "สวมหน้ากาก N95 ทำแนวกันไฟรอบบ้าน 15 เมตร ปิดประตูหน้าต่าง และทำห้องปลอดฝุ่น (Clean Room)",
        beforeSteps = listOf(
            "กำจัดเศษใบไม้แห้ง กิ่งไม้ และหญ้ารอบบริเวณบ้านในรัศมีอย่างน้อย 10-15 เมตร",
            "เตรียมหน้ากากป้องกันฝุ่นระดับ N95 และแว่นตานิรภัยสำหรับทุกคนในครอบครัว",
            "จัดเตรียมห้องปลอดฝุ่น (Clean Room) ที่ปิดมิดชิดพร้อมเครื่องฟอกอากาศ",
            "สำรองน้ำและสายยางรดน้ำให้พร้อมฉีดพรมบริเวณรอบบ้าน",
        ),
        duringSteps = listOf(
            "ปิดประตู หน้าต่าง และช่องระบายอากาศทุกจุดเพื่อป้องกันควันไฟและขี้เถ้า",
            "หากต้องอพยพ ให้สังเกตทิศทางลม และเคลื่อนที่ตั้งฉากกับแนวไฟป่า",
            "ใช้ผ้าชุบน้ำหมาดๆ ปิดปากและจมูก คลานต่ำเพื่อหลบหนีกลุ่มควันหนาแน่น",
            "เปิดไฟหน้ารถและขับด้วยความระมัดระวังเนื่องจากทัศนวิสัยต่ำ",
        ),
        afterSteps = listOf(
            "ตรวจเช็กรอบบ้านเพื่อดับสะเก็ดไฟหรือเศษขี้เถ้าที่ยังคุกรุ่นอยู่",
            "ล้างทำความสะอาดขี้เถ้าบนหลังคาและรางน้ำฝน",
            "สังเกตอาการผิดปกติของระบบทางเดินหายใจ หากแสบตา แน่นหน้าอก ให้รีบพบแพทย์",
        ),
        dos = listOf("สวมหน้ากาก N95", "หนีตั้งฉากกับแนวลม", "ทำห้องปลอดฝุ่น", "ดื่มน้ำบ่อยๆ"),
        donts = listOf("ห้ามจุดไฟเผาขยะ/หญ้า", "ห้ามวิ่งตามทิศลม", "ห้ามออกกำลังกายกลางแจ้ง", "ห้ามใช้หน้ากากผ้าธรรมดา"),
    ),
    SurvivalGuideData(
        id = "earthquake",
        title = "แผ่นดินไหว",
        subtitle = "Earthquake Response",
        icon = Icons.Filled.Warning,
        color = AffectedOrange,
        shortDesc = "หมอบ กำบัง ยึด (Drop, Cover, Hold On) หลบใต้โต๊ะแข็งแรง อยู่ห่างจากหน้าต่าง และห้ามใช้ลิฟต์เด็ดขาด",
        beforeSteps = listOf(
            "ยึดตู้ เฟอร์นิเจอร์สูง และเครื่องใช้ไฟฟ้าหนักให้ติดกับผนังห้องอย่างแน่นหนา",
            "ไม่วางของหนักไว้บนชั้นวางของที่อยู่สูงเหนือศีรษะ",
            "ซักซ้อมจุดนัดพบฉุกเฉินของครอบครัวในพื้นที่โล่งแจ้ง",
            "เตรียมกระเป๋าฉุกเฉิน 72 ชม. วางไว้ในตำแหน่งที่หยิบง่ายใกล้ทางออก",
        ),
        duringSteps = listOf(
            "หมอบลงกับพื้น หลบใต้โต๊ะหรือเตียงที่มั่นคงแข็งแรง และเอามือยึดขาโต๊ะไว้ให้แน่น",
            "หากไม่มีโต๊ะ ให้หมอบชิดผนังด้านในห้อง และใช้แขนสองข้างกอดป้องกันศีรษะและลำคอ",
            "อยู่ให้ห่างจากหน้าต่างกระจก ประตู และโคมไฟระย้าที่อาจร่วงหล่นลงมา",
            "ห้ามใช้ลิฟต์โดยเด็ดขาด ให้ใช้บันไดหนีไฟเท่านั้น",
            "หากขับรถอยู่ ให้ค่อยๆ ชะลอเข้าข้างทาง ห่างจากสะพานลอย เสาไฟฟ้า และป้ายโฆษณา",
        ),
        afterSteps = listOf(
            "ตรวจเช็กกลิ่นแก๊สรั่วและไฟฟ้ารั่ว ห้ามจุดไม้ขีดหรือเปิดสวิตช์ไฟหากสงสัยว่ามีแก๊สรั่ว",
            "เตรียมพร้อมรับมือกับแรงสั่นสะเทือนตามมา (Aftershocks) ที่อาจเกิดขึ้นได้อีก",
            "หากติดอยู่ใต้ซากปรักหักพัง ให้ใช้ผ้าปิดจมูก และเคาะท่อหรือผนังส่งสัญญาณ ห้ามตะโกนจนเหนื่อย",
        ),
        dos = listOf("หมอบ กำบัง ยึด", "ใช้บันไดหนีไฟ", "เคาะท่อส่งสัญญาณ", "สวมรองเท้าหนา"),
        donts = listOf("ห้ามใช้ลิฟต์", "ห้ามวิ่งแตกตื่นออกนอกตึก", "ห้ามจุดไฟแช็กยามแก๊สรั่ว", "ห้ามอยู่ใต้สายไฟ"),
    ),
    SurvivalGuideData(
        id = "drought",
        title = "ภัยแล้งและคลื่นความร้อนรุนแรง",
        subtitle = "Severe Drought & Extreme Heat",
        icon = Icons.Filled.WbSunny,
        color = WatchYellow,
        shortDesc = "ดื่มน้ำสะอาดสม่ำเสมอแม้ไม่รู้สึกกระหาย เลี่ยงแดดจัดช่วง 11:00-15:00 น. และระวังโรคลมแดด (Heat Stroke)",
        beforeSteps = listOf(
            "สำรองน้ำสะอาดสำหรับอุปโภคบริโภคให้เพียงพอต่อสมาชิกในบ้านอย่างน้อย 1 สัปดาห์",
            "ตรวจเช็กระบบท่อประปาและก๊อกน้ำ ซ่อมแซมจุดรั่วซึมทันทีเพื่อประหยัดน้ำ",
            "ติดตั้งตาข่ายพรางแสงหรือปลูกต้นไม้ให้ร่มเงารอบตัวบ้าน",
        ),
        duringSteps = listOf(
            "จิบน้ำสะอาดบ่อยๆ ตลอดวัน หลีกเลี่ยงเครื่องดื่มแอลกอฮอล์และคาเฟอีนที่ขับน้ำ",
            "หลีกเลี่ยงกิจกรรมกลางแจ้งในช่วงเวลาที่แดดร้อนจัดที่สุด (11:00 - 15:00 น.)",
            "สวมเสื้อผ้าสีอ่อน เนื้อผ้าโปร่ง ระบายอากาศได้ดี เช่น ผ้าฝ้าย",
            "หากมีอาการหน้ามืด ตัวร้อนจัด ผิวแห้งไม่มีเหงื่อ ให้รีบเข้าที่ร่มและใช้น้ำเย็นเช็ดตัวทันที",
        ),
        afterSteps = listOf(
            "นำน้ำที่ใช้แล้ว (เช่น น้ำซักล้าง) มารดน้ำต้นไม้หรือล้างพื้นเพื่อประหยัดทรัพยากร",
            "ดูแลกลุ่มเสี่ยงเป็นพิเศษ เช่น เด็กเล็ก ผู้สูงอายุ และสัตว์เลี้ยง",
        ),
        dos = listOf("จิบน้ำตลอดวัน", "อยู่ในที่อากาศถ่ายเท", "ประคบเย็นเมื่อตัวร้อน", "สวมหมวก/กางร่ม"),
        donts = listOf("ห้ามปล่อยเด็กในรถ", "ห้ามดื่มแอลกอฮอล์กลางแดด", "ห้ามใช้น้ำฟุ่มเฟือย", "ห้ามตากแดดนาน"),
    ),
    SurvivalGuideData(
        id = "landslide",
        title = "ดินโคลนถล่มและหินร่วง",
        subtitle = "Landslide & Mudflow",
        icon = Icons.Filled.Landscape,
        color = Color(0xFF8B5CF6),
        shortDesc = "สังเกตสีน้ำในลำห้วยเปลี่ยนเป็นสีดินขุ่น มีเสียงดังครืนผิดปกติจากภูเขา ให้อพยพขึ้นที่สูงทันที",
        beforeSteps = listOf(
            "สังเกตรอยร้าวบนพื้นดิน ทางเดิน หรือรอยร้าวบนผนังอาคารที่ลาดเอียง",
            "สังเกตเสาไฟฟ้าหรือต้นไม้ที่เริ่มเอียงผิดปกติบริเวณเชิงเขา",
            "หลีกเลี่ยงการสร้างสิ่งปลูกสร้างขวางทางน้ำไหลธรรมชาติบนภูเขา",
        ),
        duringSteps = listOf(
            "หากได้ยินเสียงดังครืนกึกก้องจากภูเขา หรือน้ำลำห้วยขุ่นข้นกะทันหัน ให้อพยพทันที",
            "วิ่งหนีขึ้นที่สูงตามแนวสันเขา ห้ามวิ่งหนีลงไปตามร่องห้วยหรือทิศทางน้ำหลาก",
            "หากไม่สามารถหนีพ้น ให้หมอบคุดคู้ กอดเข่า และปกป้องศีรษะไว้ให้แน่นที่สุด",
        ),
        afterSteps = listOf(
            "อยู่ห่างจากบริเวณดินถล่มเนื่องจากอาจเกิดการถล่มซ้ำระลอกสองได้",
            "รายงานจุดเกิดเหตุและผู้สูญหายไปยังศูนย์อำนวยการช่วยเหลือ ปภ. 1784 ทันที",
        ),
        dos = listOf("หนีขึ้นสันเขา", "สังเกตเสียงดังผิดปกติ", "อพยพทันทียามฝนตกหนักสะสม", "พกนกหวีด"),
        donts = listOf("ห้ามวิ่งตามร่องห้วย", "ห้ามข้ามสะพานที่กระแสน้ำเชี่ยวพัด", "ห้ามเข้าไปถ่ายคลิปใกล้จุดถล่ม", "ห้ามกลับเข้าบ้านก่อนปลอดภัย"),
    ),
)

private val GO_BAG_ITEMS = listOf(
    GoBagItemData("water", "น้ำดื่มสะอาด (3 ลิตร/คน/วัน)", "อย่างน้อยสำหรับ 72 ชั่วโมง (3 วัน) บรรจุในขวดพลาสติกปิดสนิท", "น้ำและอาหาร", true),
    GoBagItemData("food", "อาหารแห้ง/พร้อมรับประทาน", "อาหารให้พลังงานสูง ไม่เน่าเสียง่าย ไม่ต้องใช้ความร้อนปรุงสุก (เช่น ปลากระป๋อง บิสกิต แท่งโปรตีน)", "น้ำและอาหาร", true),
    GoBagItemData("meds", "ชุดปฐมพยาบาล & ยาประจำตัว", "ยาพาราเซตามอล ผงเกลือแร่ ยาแก้ท้องเสีย ยาฆ่าเชื้อ พลาสเตอร์ และยาโรคประจำตัวสำรอง 7 วัน", "สุขภาพ", true),
    GoBagItemData("light", "ไฟฉายพลังงานสูง & ถ่านสำรอง", "หรือไฟฉายแบบมือหมุน/โซลาร์เซลล์ สำคัญมากยามไฟฟ้าดับในภาวะวิกฤต", "เครื่องมือ", true),
    GoBagItemData("power", "พาวเวอร์แบงก์ & สายชาร์จ", "ความจุอย่างน้อย 10,000-20,000 mAh ชาร์จไว้เต็มเสมอ พร้อมสายชาร์จโทรศัพท์", "การสื่อสาร", true),
    GoBagItemData("whistle", "นกหวีดฉุกเฉิน", "ใช้เป่าส่งสัญญาณขอความช่วยเหลือได้ยินไกลกว่าเสียงตะโกนและประหยัดพลังงาน", "ความปลอดภัย", true),
    GoBagItemData("mask", "หน้ากากอนามัย N95", "ป้องกันควันไฟ ขี้เถ้า ฝุ่นละออง และเชื้อโรคในศูนย์พักพิง", "สุขภาพ", true),
    GoBagItemData("docs", "เอกสารสำคัญในซองกันน้ำ", "สำเนาบัตรประชาชน ทะเบียนบ้าน กรมธรรม์ประกันภัย สมุดบัญชี และข้อมูลติดต่อฉุกเฉิน", "เอกสาร", true),
    GoBagItemData("cash", "เงินสดธนบัตรย่อย & เหรียญ", "ตู้ ATM และระบบสแกนจ่ายดิจิทัลอาจไม่ทำงานเมื่อโครงข่ายไฟฟ้าดับ", "การเงิน", false),
    GoBagItemData("raincoat", "เสื้อกันฝน & เสื้อผ้าสำรอง 1 ชุด", "ป้องกันภาวะตัวเย็นเกิน (Hypothermia) และเสื้อผ้าแห้งสำหรับเปลี่ยน", "เครื่องนุ่งห่ม", false),
    GoBagItemData("knife", "มีดพกอเนกประสงค์ & เชือก", "สำหรับเปิดกระป๋อง ตัดเชือก ซ่อมแซมอุปกรณ์จำเป็นเฉพาะหน้า", "เครื่องมือ", false),
    GoBagItemData("hygiene", "ทิชชู่เปียก & ถุงขยะดำ", "สำหรับสุขอนามัยส่วนบุคคล และใช้ทำเสื้อกันฝนหรือปูรองนอนฉุกเฉินได้", "สุขอนามัย", false),
)

private val EMERGENCY_HOTLINES = listOf(
    HotlineData("กรมป้องกันและบรรเทาสาธารณภัย (ปภ.)", "1784", "ศูนย์เตือนภัยพิบัติแห่งชาติ รายงานเหตุและขอความช่วยเหลือ 24 ชม.", "ภัยพิบัติ", CriticalRed),
    HotlineData("แจ้งเหตุเพลิงไหม้และกู้ภัย (ดับเพลิง)", "199", "แจ้งเหตุไฟไหม้ ไฟป่า สัตว์มีพิษเข้าบ้าน และบรรเทาสาธารณภัย", "อัคคีภัย", Color(0xFFEA580C)),
    HotlineData("สถาบันการแพทย์ฉุกเฉินแห่งชาติ (กู้ชีพ)", "1669", "เจ็บป่วยฉุกเฉิน อุบัติเหตุรุนแรง รถพยาบาลฉุกเฉินทั่วประเทศ", "การแพทย์", Color(0xFFE11D48)),
    HotlineData("สายด่วนพิทักษ์ป่า กรมอุทยานแห่งชาติ", "1362", "แจ้งเหตุไฟป่า ลักลอบตัดไม้ บุกรุกพื้นที่ป่า และสัตว์ป่าพลัดหลง", "ไฟป่า", Color(0xFF16A34A)),
    HotlineData("กรมทางหลวงชนบท", "1146", "รายงานน้ำท่วมทางสัญจร ดินสไลด์ปิดถนนในสายทางชนบท", "เส้นทาง", Color(0xFF2563EB)),
    HotlineData("ตำรวจทางหลวง", "1193", "สอบถามเส้นทางจราจรทางไกล ขอความช่วยเหลือรถเสีย/อุบัติเหตุบนทางหลวง", "ตำรวจ", Color(0xFF4F46E5)),
    HotlineData("เหตุด่วนเหตุร้าย (สำนักงานตำรวจแห่งชาติ)", "191", "แจ้งเหตุด่วน เหตุอาชญากรรม และความปลอดภัยในชีวิตทรัพย์สิน", "ตำรวจ", Color(0xFF0F172A)),
)

private val SATELLITE_GUIDES = listOf(
    SatelliteGuideData(
        title = "จุดความร้อน VIIRS (ไฟป่า)",
        agency = "GISTDA / Suomi NPP & NOAA-20",
        updateCycle = "ทุก 6-12 ชั่วโมง",
        description = "ดาวเทียมตรวจจับรังสีความร้อนที่พื้นผิวโลกด้วยความละเอียดพิกเซล 375 เมตร สามารถระบุจุดไฟป่าและเผาในที่โล่งได้อย่างแม่นยำสูง",
        color = CriticalRed,
        interpretationPoints = listOf(
            "สีแดงเข้ม/ม่วง: จุดความร้อนเพิ่งเกิดขึ้นใหม่ในรอบ 1-3 ชั่วโมง",
            "สีส้ม/เหลือง: จุดความร้อนที่ตรวจพบย้อนหลัง 6-24 ชั่วโมง",
            "ค่า FRP (Fire Radiative Power): ยิ่งค่าสูงแสดงว่าไฟป่ามีความร้อนและเปลวไฟรุนแรงมาก",
        ),
    ),
    SatelliteGuideData(
        title = "พื้นที่น้ำท่วม (Flood Extent)",
        agency = "GISTDA / COSMO-SkyMed & Sentinel-1",
        updateCycle = "รายวัน / 3 วัน / 7 วัน",
        description = "ใช้เทคโนโลยี Synthetic Aperture Radar (SAR) ยิงคลื่นไมโครเวฟทะลุกลุ่มเมฆและสายฝนลงมาตรวจจับผิวน้ำที่สะท้อนคลื่นได้อย่างสมบูรณ์แบบ",
        color = DmindBlue,
        interpretationPoints = listOf(
            "บริเวณสีฟ้า/น้ำเงิน: พื้นที่ที่ตรวจพบมวลน้ำท่วมขังบนผิวดิน",
            "เปรียบเทียบ 1 วัน vs 7 วัน: ดูการขยายตัวหรือการลดลงของปริมาณน้ำหลาก",
            "ช่วยให้เจ้าหน้าที่วางแผนการอพยพและส่งถุงยังชีพได้อย่างแม่นยำ",
        ),
    ),
    SatelliteGuideData(
        title = "น้ำท่วมซ้ำซาก (Flood Frequency)",
        agency = "GISTDA สถิติ 10 ปีย้อนหลัง",
        updateCycle = "รายปี",
        description = "รวบรวมข้อมูลน้ำท่วมสะสมย้อนหลัง 10 ปี เพื่อจำแนกระดับความถี่ในการเกิดน้ำท่วมซ้ำซากในแต่ละพื้นที่ของประเทศไทย",
        color = Color(0xFF0284C7),
        interpretationPoints = listOf(
            "รหัสสีเหลือง: ท่วมซ้ำ 1-3 ครั้ง (ความเสี่ยงต่ำ)",
            "รหัสสีส้ม: ท่วมซ้ำ 4-8 ครั้ง (ความเสี่ยงปานกลาง)",
            "รหัสสีแดงเข้ม: ท่วมซ้ำมากกว่า 9-12 ครั้ง (พื้นที่ลุ่มต่ำรับน้ำนอง)",
        ),
    ),
    SatelliteGuideData(
        title = "ความชื้นในดิน SMAP & ดัชนี NDWI (ภัยแล้ง)",
        agency = "GISTDA / NASA SMAP & MODIS",
        updateCycle = "รอบ 7 วัน",
        description = "ดาวเทียมตรวจวัดปริมาณน้ำในผิวดินชั้นบน 0-5 ซม. (SMAP) และดัชนีการสะท้อนคลื่นแสงของน้ำในใบพืช (NDWI) เพื่อประเมินความเสี่ยงภัยแล้ง",
        color = WatchYellow,
        interpretationPoints = listOf(
            "ค่าความชื้นต่ำกว่า 15-20%: ดินแห้งแล้งจัด พืชผลทางการเกษตรเริ่มขาดน้ำ",
            "ดัชนี DRIPlus สีส้ม-แดง: พื้นที่เฝ้าระวังภัยแล้งรุนแรงและขาดแคลนน้ำอุปโภค",
        ),
    ),
)
