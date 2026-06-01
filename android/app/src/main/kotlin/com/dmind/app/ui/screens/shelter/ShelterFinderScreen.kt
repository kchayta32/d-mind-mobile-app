package com.dmind.app.ui.screens.shelter

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.FlowRow
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
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Bolt
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Navigation
import androidx.compose.material.icons.filled.People
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material.icons.filled.Place
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material.icons.filled.WaterDrop
import androidx.compose.material.icons.filled.Wifi
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.dmind.app.data.supabase.ShelterRecord
import com.dmind.app.ui.components.CriticalRed
import com.dmind.app.ui.components.DmindCard
import com.dmind.app.ui.components.SafeGreen
import com.dmind.app.ui.components.StatusPill
import com.dmind.app.ui.components.WatchYellow
import com.dmind.app.ui.screens.tools.getUserLocation
import com.dmind.app.ui.viewmodel.ShelterFinderViewModel
import kotlinx.coroutines.launch

@Composable
fun ShelterFinderScreen(
    viewModel: ShelterFinderViewModel,
    onBackClick: () -> Unit
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val state by viewModel.state.collectAsState()

    var searchQuery by remember { mutableStateOf("") }
    var provinceDropdownExpanded by remember { mutableStateOf(false) }
    var typeDropdownExpanded by remember { mutableStateOf(false) }

    val provinces = listOf("ทุกจังหวัด") + viewModel.getProvinces()
    val shelterTypes = listOf(
        Pair("", "ทุกประเภท"),
        Pair("temporary", "ชั่วคราว"),
        Pair("permanent", "ถาวร"),
        Pair("evacuation", "อพยพ"),
        Pair("medical", "การแพทย์")
    )

    // Filter by search query manually, province/type handled by ViewModel
    val filteredShelters = remember(state.shelters, state.selectedProvince, state.selectedType, searchQuery) {
        viewModel.getFilteredShelters().filter {
            it.name.contains(searchQuery, ignoreCase = true) ||
            it.address.contains(searchQuery, ignoreCase = true)
        }
    }

    Scaffold(
        modifier = Modifier.fillMaxSize(),
        topBar = {
            // Header with Teal Gradient
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(
                        Brush.horizontalGradient(
                            listOf(Color(0xFF14B8A6), Color(0xFF10B981), Color(0xFF22C55E))
                        )
                    )
                    .statusBarsPadding()
                    .padding(horizontal = 16.dp, vertical = 16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    IconButton(onClick = onBackClick) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = Color.White)
                    }
                    Spacer(modifier = Modifier.width(8.dp))
                    Column {
                        Text("ศูนย์พักพิงฉุกเฉิน", style = MaterialTheme.typography.titleLarge, color = Color.White, fontWeight = FontWeight.Bold)
                        Text("ค้นหาศูนย์พักพิงใกล้ตัวคุณ", style = MaterialTheme.typography.bodySmall, color = Color.White.copy(alpha = 0.8f))
                    }
                }

                // Search Bar
                OutlinedTextField(
                    value = searchQuery,
                    onValueChange = { searchQuery = it },
                    placeholder = { Text("ค้นหาชื่อศูนย์ หรือที่อยู่...", color = Color.White.copy(alpha = 0.7f)) },
                    leadingIcon = { Icon(Icons.Default.Search, contentDescription = null, tint = Color.White) },
                    trailingIcon = {
                        if (searchQuery.isNotEmpty()) {
                            IconButton(onClick = { searchQuery = "" }) {
                                Icon(Icons.Default.Close, contentDescription = "Clear", tint = Color.White)
                            }
                        }
                    },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    singleLine = true,
                    textStyle = MaterialTheme.typography.bodyLarge.copy(color = Color.White),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedContainerColor = Color.White.copy(alpha = 0.15f),
                        unfocusedContainerColor = Color.White.copy(alpha = 0.1f),
                        focusedBorderColor = Color.White,
                        unfocusedBorderColor = Color.White.copy(alpha = 0.5f),
                        cursorColor = Color.White
                    )
                )
            }
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .padding(horizontal = 16.dp)
        ) {
            Spacer(modifier = Modifier.height(12.dp))

            // Filters Row
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Province Filter
                Box(modifier = Modifier.weight(1f)) {
                    Surface(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { provinceDropdownExpanded = true }
                            .height(44.dp),
                        shape = RoundedCornerShape(10.dp),
                        color = MaterialTheme.colorScheme.surfaceVariant,
                        border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.3f))
                    ) {
                        Box(contentAlignment = Alignment.CenterStart, modifier = Modifier.padding(horizontal = 12.dp)) {
                            val currentProvinceLabel = if (state.selectedProvince.isEmpty()) "ทุกจังหวัด" else state.selectedProvince
                            Text(
                                text = currentProvinceLabel,
                                fontSize = 13.sp,
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis
                            )
                        }
                    }
                    DropdownMenu(
                        expanded = provinceDropdownExpanded,
                        onDismissRequest = { provinceDropdownExpanded = false }
                    ) {
                        provinces.forEach { prov ->
                            DropdownMenuItem(
                                text = { Text(prov, fontSize = 14.sp) },
                                onClick = {
                                    viewModel.setSelectedProvince(if (prov == "ทุกจังหวัด") "" else prov)
                                    provinceDropdownExpanded = false
                                }
                            )
                        }
                    }
                }

                // Type Filter
                Box(modifier = Modifier.weight(1f)) {
                    Surface(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { typeDropdownExpanded = true }
                            .height(44.dp),
                        shape = RoundedCornerShape(10.dp),
                        color = MaterialTheme.colorScheme.surfaceVariant,
                        border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.3f))
                    ) {
                        Box(contentAlignment = Alignment.CenterStart, modifier = Modifier.padding(horizontal = 12.dp)) {
                            val activeTypePair = shelterTypes.find { it.first == state.selectedType }
                            Text(
                                text = activeTypePair?.second ?: "ทุกประเภท",
                                fontSize = 13.sp,
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis
                            )
                        }
                    }
                    DropdownMenu(
                        expanded = typeDropdownExpanded,
                        onDismissRequest = { typeDropdownExpanded = false }
                    ) {
                        shelterTypes.forEach { type ->
                            DropdownMenuItem(
                                text = { Text(type.second, fontSize = 14.sp) },
                                onClick = {
                                    viewModel.setSelectedType(type.first)
                                    typeDropdownExpanded = false
                                }
                            )
                        }
                    }
                }

                // Refresh Location Button
                IconButton(
                    onClick = {
                        scope.launch {
                            getUserLocation(context)?.let { coords ->
                                viewModel.setUserLocation(coords.first, coords.second)
                            }
                            viewModel.refresh()
                        }
                    },
                    modifier = Modifier
                        .size(44.dp)
                        .background(MaterialTheme.colorScheme.primaryContainer, RoundedCornerShape(10.dp))
                ) {
                    Icon(
                        imageVector = Icons.Default.Refresh,
                        contentDescription = "Refresh Location",
                        tint = MaterialTheme.colorScheme.onPrimaryContainer
                    )
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Results count
            Text(
                text = "${filteredShelters.size} ศูนย์พักพิง",
                fontWeight = FontWeight.Bold,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.padding(vertical = 4.dp)
            )

            Spacer(modifier = Modifier.height(4.dp))

            // Main List
            if (state.isLoading) {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator()
                }
            } else if (filteredShelters.isEmpty()) {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Icon(Icons.Default.Warning, contentDescription = null, modifier = Modifier.size(48.dp), tint = MaterialTheme.colorScheme.error)
                        Text("ไม่พบศูนย์พักพิงที่ค้นหา", fontWeight = FontWeight.Bold)
                        Text("ลองเปลี่ยนคำค้นหาหรือตัวกรองใหม่อีกครั้ง", fontSize = 13.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                }
            } else {
                LazyColumn(
                    verticalArrangement = Arrangement.spacedBy(16.dp),
                    contentPadding = PaddingValues(bottom = 24.dp)
                ) {
                    items(filteredShelters, key = { it.id }) { shelter ->
                        ShelterCard(
                            shelter = shelter,
                            onCallClick = { phone ->
                                context.startActivity(Intent(Intent.ACTION_DIAL, Uri.parse("tel:$phone")))
                            },
                            onNavigateClick = { lat, lon ->
                                context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse("google.navigation:q=$lat,$lon")))
                            }
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun ShelterCard(
    shelter: ShelterRecord,
    onCallClick: (String) -> Unit,
    onNavigateClick: (Double, Double) -> Unit
) {
    val occupancyPercent = if (shelter.capacity > 0) {
        (shelter.currentOccupancy ?: 0).toFloat() / shelter.capacity.toFloat()
    } else {
        0f
    }

    val progressColor = when {
        occupancyPercent > 0.8f -> CriticalRed
        occupancyPercent > 0.5f -> WatchYellow
        else -> SafeGreen
    }

    val statusDotColor = when (shelter.status.lowercase()) {
        "open" -> SafeGreen
        "full" -> CriticalRed
        else -> Color.Gray
    }

    val typeLabel = when (shelter.type.lowercase()) {
        "temporary" -> "ชั่วคราว"
        "permanent" -> "ถาวร"
        "evacuation" -> "อพยพ"
        "medical" -> "การแพทย์"
        else -> "ทั่วไป"
    }

    DmindCard {
        // 1. Header (Badge, Status Dot, Distance)
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                StatusPill(label = typeLabel, color = MaterialTheme.colorScheme.primary)
                Spacer(modifier = Modifier.width(8.dp))
                // Status indicator dot
                Box(
                    modifier = Modifier
                        .size(8.dp)
                        .clip(CircleShape)
                        .background(statusDotColor)
                )
                Spacer(modifier = Modifier.width(4.dp))
                val statusText = when (shelter.status.lowercase()) {
                    "open" -> "เปิดรับ"
                    "full" -> "เต็ม"
                    else -> "ปิด"
                }
                Text(statusText, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
            shelter.distanceKm?.let { dist ->
                Text(
                    text = "${String.format("%.1f", dist)} กม.",
                    style = MaterialTheme.typography.titleSmall,
                    color = MaterialTheme.colorScheme.primary,
                    fontWeight = FontWeight.Bold
                )
            }
        }

        // 2. Title & Address
        Text(shelter.name, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
        Text(
            text = shelter.address,
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            maxLines = 2,
            overflow = TextOverflow.Ellipsis
        )

        // 3. Occupancy Bar
        Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
            Row(horizontalArrangement = Arrangement.spacedBy(6.dp), verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    imageVector = Icons.Default.People,
                    contentDescription = null,
                    modifier = Modifier.size(16.dp),
                    tint = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Text(
                    text = "${shelter.currentOccupancy ?: 0}/${shelter.capacity} คน",
                    style = MaterialTheme.typography.bodyMedium,
                    fontWeight = FontWeight.Medium
                )
            }
            LinearProgressIndicator(
                progress = occupancyPercent,
                color = progressColor,
                trackColor = MaterialTheme.colorScheme.outlineVariant,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(8.dp)
                    .clip(RoundedCornerShape(4.dp))
            )
        }

        // 4. Facilities Badges
        if (shelter.facilities.isNotEmpty()) {
            val maxVisible = 5
            val visibleFacilities = shelter.facilities.take(maxVisible)
            val extraCount = shelter.facilities.size - maxVisible

            FlowRow(
                horizontalArrangement = Arrangement.spacedBy(6.dp),
                verticalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                visibleFacilities.forEach { facility ->
                    val icon = getFacilityIcon(facility)
                    Row(
                        modifier = Modifier
                            .background(MaterialTheme.colorScheme.surfaceVariant, RoundedCornerShape(6.dp))
                            .padding(horizontal = 6.dp, vertical = 4.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(icon, contentDescription = null, modifier = Modifier.size(12.dp), tint = MaterialTheme.colorScheme.onSurfaceVariant)
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(facility, fontSize = 10.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                }
                if (extraCount > 0) {
                    Box(
                        modifier = Modifier
                            .background(MaterialTheme.colorScheme.surfaceVariant, RoundedCornerShape(6.dp))
                            .padding(horizontal = 6.dp, vertical = 4.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text("+$extraCount", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                }
            }
        }

        // 5. Action Buttons (Phone & Directions)
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            if (!shelter.contactPhone.isNullOrBlank()) {
                OutlinedButton(
                    onClick = { onCallClick(shelter.contactPhone) },
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(10.dp),
                    border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.5f))
                ) {
                    Icon(Icons.Default.Phone, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("โทร")
                }
            }
            Button(
                onClick = { onNavigateClick(shelter.latitude, shelter.longitude) },
                modifier = Modifier.weight(1f),
                shape = RoundedCornerShape(10.dp),
                colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary)
            ) {
                Icon(
                    imageVector = Icons.Default.Navigation,
                    contentDescription = null,
                    modifier = Modifier
                        .size(16.dp)
                        .rotate(45f)
                )
                Spacer(modifier = Modifier.width(6.dp))
                Text("นำทาง")
            }
        }
    }
}

private fun getFacilityIcon(facility: String): ImageVector {
    val fac = facility.trim().lowercase()
    return when {
        fac.contains("น้ำ") || fac.contains("water") -> Icons.Default.WaterDrop
        fac.contains("อาหาร") || fac.contains("food") || fac.contains("กิน") -> Icons.Default.Info // wait, we don't have Restaurant in default, let's use Info or place
        fac.contains("เน็ต") || fac.contains("internet") || fac.contains("wifi") || fac.contains("wifi") -> Icons.Default.Wifi
        fac.contains("ไฟ") || fac.contains("power") || fac.contains("electric") || fac.contains("charging") -> Icons.Default.Bolt
        else -> Icons.Default.Info
    }
}
