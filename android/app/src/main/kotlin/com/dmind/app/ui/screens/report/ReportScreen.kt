package com.dmind.app.ui.screens.report

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Cloud
import androidx.compose.material.icons.filled.LocalFireDepartment
import androidx.compose.material.icons.filled.Report
import androidx.compose.material.icons.filled.Send
import androidx.compose.material.icons.filled.WaterDrop
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.FilterChip
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardCapitalization
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.dmind.app.R
import com.dmind.app.data.supabase.IncidentReportRecord
import com.dmind.app.ui.components.AffectedOrange
import com.dmind.app.ui.components.DmindBlue
import com.dmind.app.ui.components.DmindCard
import com.dmind.app.ui.components.EmptyState
import android.net.Uri
import android.graphics.Bitmap
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.result.PickVisualMediaRequest
import androidx.compose.ui.platform.LocalContext
import androidx.compose.foundation.Image
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.foundation.background
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.height
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.material3.IconButton
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material.icons.filled.CameraAlt
import androidx.compose.material.icons.filled.PhotoLibrary
import androidx.compose.material.icons.filled.Close
import androidx.compose.runtime.remember
import com.dmind.app.ui.components.IconBubble
import com.dmind.app.ui.components.ScreenHeader
import com.dmind.app.ui.components.StatusPill
import com.dmind.app.ui.viewmodel.ReportMessage
import com.dmind.app.ui.viewmodel.ReportUiState

@Composable
fun ReportScreen(
    state: ReportUiState,
    onSubmit: (
        type: String,
        title: String,
        description: String,
        location: String?,
        severity: Int,
        imageBytes: ByteArray?,
        imageFileName: String?,
        imageContentType: String?
    ) -> Unit,
) {
    var type by rememberSaveable { mutableStateOf("flood") }
    var title by rememberSaveable { mutableStateOf("") }
    var description by rememberSaveable { mutableStateOf("") }
    var location by rememberSaveable { mutableStateOf("") }
    var severity by rememberSaveable { mutableIntStateOf(3) }

    val context = LocalContext.current
    var imageUri by remember { mutableStateOf<Uri?>(null) }
    var imageBitmap by remember { mutableStateOf<Bitmap?>(null) }

    val pickMediaLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.PickVisualMedia()
    ) { uri ->
        if (uri != null) {
            imageUri = uri
            imageBitmap = null
        }
    }

    val takePhotoLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.TakePicturePreview()
    ) { bitmap ->
        if (bitmap != null) {
            imageBitmap = bitmap
            imageUri = null
        }
    }

    val reportTypeOptions = listOf(
        ReportTypeOption("flood", stringResource(R.string.report_type_flood), Icons.Filled.WaterDrop),
        ReportTypeOption("storm", stringResource(R.string.report_type_storm), Icons.Filled.Cloud),
        ReportTypeOption("fire", stringResource(R.string.report_type_fire), Icons.Filled.LocalFireDepartment),
        ReportTypeOption("other", stringResource(R.string.report_type_other), Icons.Filled.Report),
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
                title = stringResource(R.string.report_title),
                subtitle = stringResource(R.string.report_subtitle),
                icon = Icons.Filled.Report,
            )
        }

        item {
            DmindCard(modifier = Modifier.padding(horizontal = 18.dp)) {
                Text(stringResource(R.string.incident_details), fontWeight = FontWeight.Bold)
                FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    reportTypeOptions.forEach { option ->
                        FilterChip(
                            selected = type == option.value,
                            onClick = { type = option.value },
                            label = { Text(option.label) },
                            leadingIcon = { Icon(option.icon, contentDescription = null) },
                        )
                    }
                }
                OutlinedTextField(
                    value = title,
                    onValueChange = { title = it },
                    modifier = Modifier.fillMaxWidth(),
                    label = { Text(stringResource(R.string.report_field_title)) },
                    singleLine = true,
                    keyboardOptions = KeyboardOptions(capitalization = KeyboardCapitalization.Sentences),
                )
                OutlinedTextField(
                    value = description,
                    onValueChange = { description = it },
                    modifier = Modifier.fillMaxWidth(),
                    label = { Text(stringResource(R.string.report_field_description)) },
                    minLines = 3,
                    keyboardOptions = KeyboardOptions(capitalization = KeyboardCapitalization.Sentences),
                )
                OutlinedTextField(
                    value = location,
                    onValueChange = { location = it },
                    modifier = Modifier.fillMaxWidth(),
                    label = { Text(stringResource(R.string.report_field_location)) },
                    singleLine = true,
                )
                Text(stringResource(R.string.report_severity), fontWeight = FontWeight.SemiBold)
                FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    (1..5).forEach { level ->
                        FilterChip(
                            selected = severity == level,
                            onClick = { severity = level },
                            label = { Text("S$level") },
                        )
                    }
                }
                Text(stringResource(R.string.report_add_photo), fontWeight = FontWeight.SemiBold)
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Button(
                        onClick = {
                            pickMediaLauncher.launch(
                                PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly)
                            )
                        },
                        modifier = Modifier.weight(1f),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = MaterialTheme.colorScheme.secondaryContainer,
                            contentColor = MaterialTheme.colorScheme.onSecondaryContainer
                        )
                    ) {
                        Icon(Icons.Filled.PhotoLibrary, contentDescription = null)
                        Spacer(Modifier.width(8.dp))
                        Text(stringResource(R.string.btn_gallery))
                    }
                    Button(
                        onClick = { takePhotoLauncher.launch(null) },
                        modifier = Modifier.weight(1f),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = MaterialTheme.colorScheme.secondaryContainer,
                            contentColor = MaterialTheme.colorScheme.onSecondaryContainer
                        )
                    ) {
                        Icon(Icons.Filled.CameraAlt, contentDescription = null)
                        Spacer(Modifier.width(8.dp))
                        Text(stringResource(R.string.btn_camera))
                    }
                }

                // Image Preview
                if (imageUri != null || imageBitmap != null) {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(200.dp)
                            .clip(RoundedCornerShape(12.dp))
                            .background(MaterialTheme.colorScheme.surfaceVariant),
                        contentAlignment = Alignment.Center
                    ) {
                        if (imageUri != null) {
                            val bitmap = remember(imageUri) { loadBitmapFromUri(context, imageUri!!) }
                            if (bitmap != null) {
                                Image(
                                    bitmap = bitmap.asImageBitmap(),
                                    contentDescription = "Selected Image",
                                    modifier = Modifier.fillMaxSize(),
                                    contentScale = androidx.compose.ui.layout.ContentScale.Crop
                                )
                            }
                        } else if (imageBitmap != null) {
                            Image(
                                bitmap = imageBitmap!!.asImageBitmap(),
                                contentDescription = "Captured Image",
                                modifier = Modifier.fillMaxSize(),
                                contentScale = androidx.compose.ui.layout.ContentScale.Crop
                            )
                        }

                        // Close button to remove image
                        IconButton(
                            onClick = {
                                imageUri = null
                                imageBitmap = null
                            },
                            modifier = Modifier
                                .align(Alignment.TopEnd)
                                .padding(8.dp)
                                .background(Color.Black.copy(alpha = 0.5f), CircleShape)
                        ) {
                            Icon(Icons.Filled.Close, contentDescription = "Remove Image", tint = Color.White)
                        }
                    }
                }

                Button(
                    onClick = {
                        var finalBytes: ByteArray? = null
                        var finalName: String? = null
                        var finalType: String? = null
                        try {
                            if (imageUri != null) {
                                val originalBitmap = loadBitmapFromUri(context, imageUri!!)
                                if (originalBitmap != null) {
                                    val resized = resizeBitmap(originalBitmap, 1024)
                                    finalBytes = bitmapToBytes(resized)
                                    finalName = "report_${System.currentTimeMillis()}.jpg"
                                    finalType = "image/jpeg"
                                }
                            } else if (imageBitmap != null) {
                                val resized = resizeBitmap(imageBitmap!!, 1024)
                                finalBytes = bitmapToBytes(resized)
                                finalName = "report_${System.currentTimeMillis()}.jpg"
                                finalType = "image/jpeg"
                            }
                        } catch (e: Exception) {
                            e.printStackTrace()
                        }

                        onSubmit(type, title, description, location, severity, finalBytes, finalName, finalType)
                        if (title.isNotBlank() && description.isNotBlank()) {
                            title = ""
                            description = ""
                            location = ""
                            imageUri = null
                            imageBitmap = null
                        }
                    },
                    enabled = !state.isSubmitting,
                    modifier = Modifier.fillMaxWidth(),
                    shape = androidx.compose.foundation.shape.RoundedCornerShape(14.dp),
                ) {
                    if (state.isSubmitting) {
                        CircularProgressIndicator(modifier = Modifier.padding(end = 10.dp), strokeWidth = 2.dp)
                    } else {
                        Icon(Icons.Filled.Send, contentDescription = null)
                        Spacer(Modifier.width(8.dp))
                    }
                    Text(stringResource(R.string.btn_submit_report))
                }
                state.message?.let { message ->
                    Text(
                        state.errorMessage ?: message.localizedText(),
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        fontSize = 12.sp,
                    )
                }
            }
        }

        item {
            Text(stringResource(R.string.recent_reports), fontWeight = FontWeight.Bold, modifier = Modifier.padding(horizontal = 20.dp))
        }

        if (state.recentReports.isEmpty() && !state.isLoading) {
            item {
                EmptyState(
                    title = stringResource(R.string.no_reports),
                    message = stringResource(R.string.no_reports_message),
                    icon = Icons.Filled.Report,
                )
            }
        } else {
            items(state.recentReports, key = { it.id }) { report ->
                ReportCard(report, Modifier.padding(horizontal = 18.dp))
            }
        }
    }
}

@Composable
private fun ReportCard(
    report: IncidentReportRecord,
    modifier: Modifier = Modifier,
) {
    DmindCard(modifier = modifier, contentPadding = PaddingValues(12.dp)) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            IconBubble(Icons.Filled.Report, if (report.severityLevel >= 4) AffectedOrange else DmindBlue)
            Spacer(Modifier.width(10.dp))
            Column(Modifier.weight(1f)) {
                Text(report.title, fontWeight = FontWeight.SemiBold, maxLines = 1, overflow = TextOverflow.Ellipsis)
                Text(report.description, color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 12.sp, maxLines = 2)
            }
            StatusPill(report.status, DmindBlue)
        }
        Text(report.location ?: stringResource(R.string.report_location_not_provided), color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 12.sp)
    }
}

private data class ReportTypeOption(
    val value: String,
    val label: String,
    val icon: androidx.compose.ui.graphics.vector.ImageVector,
)

@Composable
private fun ReportMessage.localizedText(): String = when (this) {
    ReportMessage.ValidationError -> stringResource(R.string.report_validation_error)
    ReportMessage.Submitted -> stringResource(R.string.report_submitted)
    ReportMessage.SubmitError -> stringResource(R.string.report_submit_error)
}

private fun loadBitmapFromUri(context: android.content.Context, uri: android.net.Uri): android.graphics.Bitmap? {
    return try {
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.P) {
            val source = android.graphics.ImageDecoder.createSource(context.contentResolver, uri)
            android.graphics.ImageDecoder.decodeBitmap(source)
        } else {
            @Suppress("DEPRECATION")
            android.provider.MediaStore.Images.Media.getBitmap(context.contentResolver, uri)
        }
    } catch (e: Exception) {
        null
    }
}

private fun resizeBitmap(bitmap: android.graphics.Bitmap, maxDimension: Int): android.graphics.Bitmap {
    val width = bitmap.width
    val height = bitmap.height
    val newWidth: Int
    val newHeight: Int
    if (width > height) {
        newWidth = maxDimension
        newHeight = (height * (maxDimension.toDouble() / width.toDouble())).toInt()
    } else {
        newHeight = maxDimension
        newWidth = (width * (maxDimension.toDouble() / height.toDouble())).toInt()
    }
    return android.graphics.Bitmap.createScaledBitmap(bitmap, newWidth, newHeight, true)
}

private fun bitmapToBytes(bitmap: android.graphics.Bitmap): ByteArray {
    val stream = java.io.ByteArrayOutputStream()
    bitmap.compress(android.graphics.Bitmap.CompressFormat.JPEG, 90, stream)
    return stream.toByteArray()
}
