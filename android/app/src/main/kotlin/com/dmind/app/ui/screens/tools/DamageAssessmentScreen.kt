package com.dmind.app.ui.screens.tools

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
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
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CameraAlt
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.PhotoLibrary
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Send
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.dmind.app.R
import com.dmind.app.data.supabase.DamageAssessmentRecord
import com.dmind.app.ui.components.AffectedOrange
import com.dmind.app.ui.components.CriticalRed
import com.dmind.app.ui.components.DmindBlue
import com.dmind.app.ui.components.DmindCard
import com.dmind.app.ui.components.EmptyState
import com.dmind.app.ui.components.SafeGreen
import com.dmind.app.ui.components.ScreenHeader
import com.dmind.app.ui.components.StatusPill
import com.dmind.app.ui.viewmodel.DamageAssessmentUiState
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

// หน้าจอประเมินความเสียหายจากภาพถ่ายภัยพิบัติ พร้อมส่งวิเคราะห์และประวัติการประเมิน
@Composable
fun DamageAssessmentScreen(
    state: DamageAssessmentUiState,
    onUpload: (fileName: String, contentType: String, bytes: ByteArray) -> Unit,
    onDelete: (id: String) -> Unit,
    onRefresh: () -> Unit,
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    var imageUri by remember { mutableStateOf<Uri?>(null) }
    var imageBitmap by remember { mutableStateOf<Bitmap?>(null) }
    var selectedBitmap by remember { mutableStateOf<Bitmap?>(null) }

    LaunchedEffect(imageUri) {
        selectedBitmap = imageUri?.let { uri ->
            withContext(Dispatchers.IO) {
                loadBitmapFromUri(context, uri)
            }
        }
    }

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

    LaunchedEffect(Unit) {
        onRefresh()
    }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .statusBarsPadding(),
        contentPadding = PaddingValues(bottom = 92.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        item {
            ScreenHeader(
                stringResource(R.string.damage_title),
                stringResource(R.string.damage_subtitle),
                Icons.Filled.CameraAlt,
            )
        }

        // Action card to select photo and trigger analysis
        item {
            DmindCard(modifier = Modifier.padding(horizontal = 18.dp)) {
                Text(
                    text = stringResource(R.string.damage_workflow_title),
                    fontWeight = FontWeight.Bold,
                    fontSize = 16.sp
                )
                Text(
                    text = stringResource(R.string.damage_workflow_message),
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    fontSize = 13.sp
                )

                Spacer(Modifier.height(8.dp))

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
                            if (selectedBitmap != null) {
                                Image(
                                    bitmap = selectedBitmap!!.asImageBitmap(),
                                    contentDescription = "Selected Image",
                                    modifier = Modifier.fillMaxSize(),
                                    contentScale = ContentScale.Crop
                                )
                            } else {
                                CircularProgressIndicator()
                            }
                        } else if (imageBitmap != null) {
                            Image(
                                bitmap = imageBitmap!!.asImageBitmap(),
                                contentDescription = "Captured Image",
                                modifier = Modifier.fillMaxSize(),
                                contentScale = ContentScale.Crop
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

                    Button(
                        onClick = {
                            scope.launch {
                                val bytes = try {
                                    withContext(Dispatchers.IO) {
                                        if (imageUri != null) {
                                            val originalBitmap = selectedBitmap ?: loadBitmapFromUri(context, imageUri!!)
                                            if (originalBitmap != null) {
                                                val resized = resizeBitmap(originalBitmap, 1024)
                                                bitmapToBytes(resized)
                                            } else null
                                        } else if (imageBitmap != null) {
                                            val resized = resizeBitmap(imageBitmap!!, 1024)
                                            bitmapToBytes(resized)
                                        } else null
                                    }
                                } catch (e: Exception) {
                                    e.printStackTrace()
                                    null
                                }

                                if (bytes != null) {
                                    val fileName = "assessment_${System.currentTimeMillis()}.jpg"
                                    onUpload(fileName, "image/jpeg", bytes)
                                    imageUri = null
                                    imageBitmap = null
                                }
                            }
                        },
                        modifier = Modifier.fillMaxWidth(),
                        enabled = !state.isUploading,
                        shape = RoundedCornerShape(14.dp)
                    ) {
                        if (state.isUploading) {
                            CircularProgressIndicator(modifier = Modifier.padding(end = 10.dp), strokeWidth = 2.dp)
                        } else {
                            Icon(Icons.Filled.Send, contentDescription = null)
                            Spacer(Modifier.width(8.dp))
                        }
                        Text(stringResource(R.string.btn_analyze_damage))
                    }
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

        // Assessments Title
        item {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp, vertical = 4.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = stringResource(R.string.damage_assessment_history),
                    fontWeight = FontWeight.Bold,
                    fontSize = 15.sp
                )
                IconButton(onClick = onRefresh, enabled = !state.isLoading) {
                    Icon(Icons.Filled.Refresh, contentDescription = "Refresh")
                }
            }
        }

        if (state.isLoading) {
            item {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(32.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    CircularProgressIndicator()
                }
            }
        } else if (state.assessments.isEmpty()) {
            item {
                EmptyState(
                    title = stringResource(R.string.no_assessments),
                    message = stringResource(R.string.no_assessments_message),
                    icon = Icons.Filled.CameraAlt
                )
            }
        } else {
            items(state.assessments, key = { it.id }) { record ->
                DamageAssessmentCard(
                    record = record,
                    onDelete = onDelete,
                    modifier = Modifier.padding(horizontal = 18.dp)
                )
            }
        }
    }
}

// ส่วนแสดงการ์ดรายการข้อมูลประเมินความเสียหายแต่ละรายการ
@Composable
private fun DamageAssessmentCard(
    record: DamageAssessmentRecord,
    onDelete: (String) -> Unit,
    modifier: Modifier = Modifier,
) {
    val levelColor = when (record.damageLevel?.lowercase()) {
        "high", "critical" -> CriticalRed
        "medium", "moderate" -> AffectedOrange
        "low", "minor" -> SafeGreen
        else -> DmindBlue
    }

    DmindCard(modifier = modifier, contentPadding = PaddingValues(12.dp)) {
        Box(modifier = Modifier.fillMaxWidth()) {
            Row(verticalAlignment = Alignment.Top) {
                NetworkImage(
                    url = record.imageUrl,
                    contentDescription = "Damage Image",
                    modifier = Modifier
                        .size(80.dp)
                        .clip(RoundedCornerShape(8.dp))
                )
                Spacer(Modifier.width(12.dp))
                Column(modifier = Modifier.weight(1f)) {
                    val category = record.detectedCategories.joinToString(", ").ifBlank {
                        stringResource(R.string.damage_general)
                    }
                    Text(
                        text = category,
                        fontWeight = FontWeight.Bold,
                        fontSize = 15.sp,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                    
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.padding(vertical = 4.dp)
                    ) {
                        record.damageLevel?.let {
                            StatusPill(it, levelColor)
                        }
                        record.confidenceScore?.let {
                            Text(
                                text = "%.0f%%".format(it * 100),
                                fontSize = 12.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }

                    if (record.processingStatus == "processing") {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            CircularProgressIndicator(modifier = Modifier.size(12.dp), strokeWidth = 1.dp)
                            Spacer(Modifier.width(6.dp))
                            Text(
                                text = stringResource(R.string.status_processing),
                                fontSize = 12.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    } else {
                        val resultText = record.assessmentResult ?: record.errorMessage ?: ""
                        if (resultText.isNotBlank()) {
                            Text(
                                text = resultText,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                                fontSize = 12.sp,
                                maxLines = 3,
                                overflow = TextOverflow.Ellipsis
                            )
                        }
                    }
                }
            }

            IconButton(
                onClick = { onDelete(record.id) },
                modifier = Modifier.align(Alignment.TopEnd)
            ) {
                Icon(
                    imageVector = Icons.Filled.Delete,
                    contentDescription = "Delete",
                    tint = MaterialTheme.colorScheme.error
                )
            }
        }
    }
}

private val imageCache = java.util.concurrent.ConcurrentHashMap<String, Bitmap>()

@Composable
private fun NetworkImage(
    url: String,
    contentDescription: String?,
    modifier: Modifier = Modifier,
    contentScale: ContentScale = ContentScale.Crop
) {
    var bitmap by remember(url) { mutableStateOf<Bitmap?>(imageCache[url]) }
    var isLoading by remember(url) { mutableStateOf(bitmap == null) }

    LaunchedEffect(url) {
        if (bitmap != null) {
            isLoading = false
            return@LaunchedEffect
        }
        isLoading = true
        bitmap = try {
            withContext(Dispatchers.IO) {
                val connection = java.net.URL(url).openConnection() as java.net.HttpURLConnection
                connection.doInput = true
                connection.connect()
                val input = connection.inputStream
                val bmp = BitmapFactory.decodeStream(input)
                if (bmp != null) {
                    imageCache[url] = bmp
                }
                bmp
            }
        } catch (e: Exception) {
            null
        }
        isLoading = false
    }

    Box(modifier = modifier, contentAlignment = Alignment.Center) {
        if (isLoading) {
            CircularProgressIndicator(modifier = Modifier.size(24.dp))
        } else {
            val bmp = bitmap
            if (bmp != null) {
                Image(
                    bitmap = bmp.asImageBitmap(),
                    contentDescription = contentDescription,
                    modifier = Modifier.fillMaxSize(),
                    contentScale = contentScale
                )
            } else {
                Icon(
                    imageVector = Icons.Filled.Warning,
                    contentDescription = "Failed to load image",
                    tint = MaterialTheme.colorScheme.error
                )
            }
        }
    }
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
