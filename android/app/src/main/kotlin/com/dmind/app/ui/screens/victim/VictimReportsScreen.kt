package com.dmind.app.ui.screens.victim

import android.Manifest
import android.annotation.SuppressLint
import android.content.Context
import android.content.pm.PackageManager
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
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
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.ContactPhone
import androidx.compose.material.icons.filled.HealthAndSafety
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.MyLocation
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.FilterChip
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Snackbar
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import com.dmind.app.R
import com.dmind.app.data.supabase.VictimReportRecord
import com.dmind.app.ui.components.AffectedOrange
import com.dmind.app.ui.components.CriticalRed
import com.dmind.app.ui.components.DmindBlue
import com.dmind.app.ui.components.DmindCard
import com.dmind.app.ui.components.EmptyState
import com.dmind.app.ui.components.IconBubble
import com.dmind.app.ui.components.SafeGreen
import com.dmind.app.ui.components.ScreenHeader
import com.dmind.app.ui.components.StatusPill
import com.dmind.app.ui.components.WatchYellow
import com.dmind.app.ui.viewmodel.VictimReportsUiState
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.Priority
import com.google.android.gms.tasks.CancellationTokenSource
import kotlinx.coroutines.launch

// หน้าจอการแจ้งขอความช่วยเหลือสำหรับผู้ประสบภัยพิบัติ
@Composable
fun VictimReportsScreen(
    state: VictimReportsUiState,
    onSubmit: (
        name: String,
        contact: String?,
        description: String?,
        latitude: Double,
        longitude: Double,
    ) -> Unit,
    onRefresh: () -> Unit,
    onClearSuccess: () -> Unit,
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()

    var name by rememberSaveable { mutableStateOf("") }
    var ageStr by rememberSaveable { mutableStateOf("") }
    var gender by rememberSaveable { mutableStateOf("male") }
    var contactNumber by rememberSaveable { mutableStateOf("") }
    var details by rememberSaveable { mutableStateOf("") }
    var latitude by remember { mutableStateOf<Double?>(null) }
    var longitude by remember { mutableStateOf<Double?>(null) }
    var assistanceStatus by rememberSaveable { mutableStateOf("pending") }

    var locationMessage by remember { mutableStateOf("") }
    var isLocating by remember { mutableStateOf(false) }

    val permissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        val fineGranted = permissions[Manifest.permission.ACCESS_FINE_LOCATION] == true
        val coarseGranted = permissions[Manifest.permission.ACCESS_COARSE_LOCATION] == true
        if (fineGranted || coarseGranted) {
            isLocating = true
            getCurrentLocation(context,
                onSuccess = { lat, lng ->
                    latitude = lat
                    longitude = lng
                    locationMessage = "พิกัด: $lat, $lng"
                    isLocating = false
                },
                onFailure = {
                    locationMessage = "ไม่สามารถระบุพิกัดได้: ${it.localizedMessage}"
                    isLocating = false
                }
            )
        } else {
            locationMessage = "โปรดอนุญาตการเข้าถึงตำแหน่งที่ตั้ง"
        }
    }

    LaunchedEffect(Unit) {
        onRefresh()
    }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .statusBarsPadding(),
        contentPadding = PaddingValues(bottom = 92.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        item {
            ScreenHeader(
                title = stringResource(R.string.nav_victim_reports),
                subtitle = stringResource(R.string.victim_reports_subtitle),
                icon = Icons.Filled.HealthAndSafety
            )
        }

        // Submit Form Card
        item {
            DmindCard(modifier = Modifier.padding(horizontal = 18.dp)) {
                Text(
                    text = stringResource(R.string.victim_form_title),
                    fontWeight = FontWeight.Bold,
                    fontSize = 16.sp
                )

                OutlinedTextField(
                    value = name,
                    onValueChange = { name = it },
                    label = { Text(stringResource(R.string.victim_name)) },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                    leadingIcon = { Icon(Icons.Filled.Person, contentDescription = null) }
                )

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    OutlinedTextField(
                        value = ageStr,
                        onValueChange = { ageStr = it },
                        label = { Text(stringResource(R.string.victim_age)) },
                        modifier = Modifier.weight(1f),
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        singleLine = true
                    )
                    OutlinedTextField(
                        value = contactNumber,
                        onValueChange = { contactNumber = it },
                        label = { Text(stringResource(R.string.victim_phone)) },
                        modifier = Modifier.weight(1.5f),
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
                        singleLine = true,
                        leadingIcon = { Icon(Icons.Filled.ContactPhone, contentDescription = null) }
                    )
                }

                // Gender Choice
                Text(
                    text = stringResource(R.string.victim_gender),
                    fontWeight = FontWeight.SemiBold,
                    fontSize = 14.sp
                )
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    val genders = listOf(
                        "male" to R.string.gender_male,
                        "female" to R.string.gender_female,
                        "other" to R.string.gender_other
                    )
                    genders.forEach { (key, labelRes) ->
                        FilterChip(
                            selected = gender == key,
                            onClick = { gender = key },
                            label = { Text(stringResource(labelRes)) },
                            modifier = Modifier.weight(1f)
                        )
                    }
                }

                OutlinedTextField(
                    value = details,
                    onValueChange = { details = it },
                    label = { Text(stringResource(R.string.victim_details)) },
                    modifier = Modifier.fillMaxWidth(),
                    minLines = 3,
                    leadingIcon = { Icon(Icons.Filled.Info, contentDescription = null) }
                )

                // Assistance Status Choice
                Text(
                    text = stringResource(R.string.victim_assistance_status),
                    fontWeight = FontWeight.SemiBold,
                    fontSize = 14.sp
                )
                FlowRow(
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    val statuses = listOf(
                        "pending" to R.string.status_pending_help,
                        "assisting" to R.string.status_assisting,
                        "assisted" to R.string.status_completed
                    )
                    statuses.forEach { (key, labelRes) ->
                        FilterChip(
                            selected = assistanceStatus == key,
                            onClick = { assistanceStatus = key },
                            label = { Text(stringResource(labelRes)) }
                        )
                    }
                }

                // Location Coordinator Section
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Button(
                        onClick = {
                            val fineLoc = ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_FINE_LOCATION)
                            val coarseLoc = ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_COARSE_LOCATION)
                            if (fineLoc == PackageManager.PERMISSION_GRANTED || coarseLoc == PackageManager.PERMISSION_GRANTED) {
                                isLocating = true
                                getCurrentLocation(context,
                                    onSuccess = { lat, lng ->
                                        latitude = lat
                                        longitude = lng
                                        locationMessage = "พิกัด: $lat, $lng"
                                        isLocating = false
                                    },
                                    onFailure = {
                                        locationMessage = "ไม่สามารถระบุพิกัดได้: ${it.localizedMessage}"
                                        isLocating = false
                                    }
                                )
                            } else {
                                permissionLauncher.launch(
                                    arrayOf(
                                        Manifest.permission.ACCESS_FINE_LOCATION,
                                        Manifest.permission.ACCESS_COARSE_LOCATION
                                    )
                                )
                            }
                        },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = MaterialTheme.colorScheme.secondaryContainer,
                            contentColor = MaterialTheme.colorScheme.onSecondaryContainer
                        )
                    ) {
                        if (isLocating) {
                            CircularProgressIndicator(modifier = Modifier.size(18.dp), strokeWidth = 2.dp, color = MaterialTheme.colorScheme.onSecondaryContainer)
                        } else {
                            Icon(Icons.Filled.MyLocation, contentDescription = null)
                        }
                        Spacer(Modifier.width(8.dp))
                        Text(stringResource(R.string.btn_detect_location))
                    }
                    Text(
                        text = if (latitude != null && longitude != null) {
                            "%.4f, %.4f".format(latitude, longitude)
                        } else {
                            locationMessage.ifEmpty { stringResource(R.string.location_not_set) }
                        },
                        fontSize = 12.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                }

                Button(
                    onClick = {
                        val age = ageStr.toIntOrNull()
                        val contact = contactNumber.ifBlank { null }
                        val additionalDetails = buildString {
                            if (age != null) append("อายุ: $age ปี. ")
                            if (!gender.isNullOrBlank()) {
                                val genderStr = when (gender) {
                                    "male" -> "ชาย"
                                    "female" -> "หญิง"
                                    else -> "อื่นๆ"
                                }
                                append("เพศ: $genderStr. ")
                            }
                            if (!details.isNullOrBlank()) append(details)
                        }.trim().takeIf { it.isNotEmpty() }

                        onSubmit(
                            name,
                            contact,
                            additionalDetails,
                            latitude ?: 0.0,
                            longitude ?: 0.0
                        )
                        // Clear fields if submit was triggered
                        if (name.isNotBlank()) {
                            name = ""
                            ageStr = ""
                            contactNumber = ""
                            details = ""
                            latitude = null
                            longitude = null
                            locationMessage = ""
                        }
                    },
                    modifier = Modifier.fillMaxWidth(),
                    enabled = name.isNotBlank() && !state.isSubmitting,
                    shape = RoundedCornerShape(14.dp)
                ) {
                    if (state.isSubmitting) {
                        CircularProgressIndicator(modifier = Modifier.padding(end = 10.dp), strokeWidth = 2.dp)
                    } else {
                        Icon(Icons.Filled.Add, contentDescription = null)
                        Spacer(Modifier.width(8.dp))
                    }
                    Text(stringResource(R.string.btn_submit_victim_report))
                }

                if (!state.errorMessage.isNullOrBlank()) {
                    Text(
                        text = state.errorMessage,
                        color = MaterialTheme.colorScheme.error,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }

        // Recent reports title
        item {
            Row(
                modifier = Modifier.fillMaxWidth().padding(horizontal = 20.dp, vertical = 4.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = stringResource(R.string.victim_reports_history),
                    fontWeight = FontWeight.Bold,
                    fontSize = 15.sp
                )
                TextButton(onClick = onRefresh, enabled = !state.isLoading) {
                    Text(stringResource(R.string.btn_refresh))
                }
            }
        }

        if (state.isLoading) {
            item {
                Column(
                    modifier = Modifier.fillMaxWidth().padding(32.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    CircularProgressIndicator()
                }
            }
        } else if (state.reports.isEmpty()) {
            item {
                EmptyState(
                    title = stringResource(R.string.no_victim_reports),
                    message = stringResource(R.string.no_victim_reports_message),
                    icon = Icons.Filled.HealthAndSafety
                )
            }
        } else {
            items(state.reports, key = { it.id }) { report ->
                VictimReportCard(
                    report = report,
                    modifier = Modifier.padding(horizontal = 18.dp)
                )
            }
        }
    }

    // Success Snackbar popup
    if (state.isSuccess) {
        Snackbar(
            action = {
                TextButton(onClick = onClearSuccess) {
                    Text(stringResource(R.string.btn_ok), color = MaterialTheme.colorScheme.primaryContainer)
                }
            },
            modifier = Modifier.padding(12.dp)
        ) {
            Text(stringResource(R.string.report_submitted))
        }
    }
}

// การ์ดแสดงรายละเอียดการแจ้งขอความช่วยเหลือแต่ละรายการ
@Composable
private fun VictimReportCard(
    report: VictimReportRecord,
    modifier: Modifier = Modifier,
) {
    val statusColor = when (report.status) {
        "assisted" -> SafeGreen
        "assisting" -> WatchYellow
        else -> CriticalRed
    }

    val statusTextRes = when (report.status) {
        "assisted" -> R.string.status_completed
        "assisting" -> R.string.status_assisting
        else -> R.string.status_pending_help
    }

    DmindCard(modifier = modifier, contentPadding = PaddingValues(14.dp)) {
        Row(
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconBubble(
                icon = Icons.Filled.Person,
                color = statusColor
            )
            Spacer(Modifier.width(12.dp))
            Column(Modifier.weight(1f)) {
                Text(
                    text = report.name,
                    fontWeight = FontWeight.Bold,
                    fontSize = 15.sp,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
            }
            StatusPill(
                label = stringResource(statusTextRes),
                color = statusColor
            )
        }

        if (!report.description.isNullOrBlank()) {
            Text(
                text = report.description,
                fontSize = 13.sp,
                color = MaterialTheme.colorScheme.onSurface,
                modifier = Modifier.padding(top = 4.dp)
            )
        }

        Row(
            modifier = Modifier.fillMaxWidth().padding(top = 6.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                imageVector = Icons.Filled.LocationOn,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.width(14.dp)
            )
            Spacer(Modifier.width(4.dp))
            Text(
                text = if (report.latitude != null && report.longitude != null) {
                    "พิกัด: %.4f, %.4f".format(report.latitude, report.longitude)
                } else {
                    stringResource(R.string.location_not_set)
                },
                fontSize = 11.sp,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )

            if (!report.contact.isNullOrBlank()) {
                Spacer(Modifier.weight(1f))
                Icon(
                    imageVector = Icons.Filled.ContactPhone,
                    contentDescription = null,
                    tint = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.width(14.dp)
                )
                Spacer(Modifier.width(4.dp))
                Text(
                    text = report.contact,
                    fontSize = 11.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    fontWeight = FontWeight.SemiBold
                )
            }
        }
    }
}

// ฟังก์ชันดึงตำแหน่งที่ตั้งปัจจุบัน (พิกัด GPS) ของผู้ใช้
@SuppressLint("MissingPermission")
private fun getCurrentLocation(
    context: Context,
    onSuccess: (Double, Double) -> Unit,
    onFailure: (Exception) -> Unit
) {
    try {
        val fusedLocationClient = LocationServices.getFusedLocationProviderClient(context)
        val cts = CancellationTokenSource()
        fusedLocationClient.getCurrentLocation(Priority.PRIORITY_HIGH_ACCURACY, cts.token)
            .addOnSuccessListener { loc ->
                if (loc != null) {
                    onSuccess(loc.latitude, loc.longitude)
                } else {
                    fusedLocationClient.lastLocation.addOnSuccessListener { lastLoc ->
                        if (lastLoc != null) {
                            onSuccess(lastLoc.latitude, lastLoc.longitude)
                        } else {
                            onFailure(Exception("GPS location returned null"))
                        }
                    }.addOnFailureListener {
                        onFailure(it)
                    }
                }
            }
            .addOnFailureListener {
                onFailure(it)
            }
    } catch (e: Exception) {
        onFailure(e)
    }
}
