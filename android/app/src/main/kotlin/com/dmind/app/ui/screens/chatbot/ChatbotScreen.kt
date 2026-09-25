package com.dmind.app.ui.screens.chatbot

import android.Manifest
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.Send
import androidx.compose.material.icons.automirrored.filled.VolumeUp
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material.icons.filled.Mic
import androidx.compose.material.icons.filled.MicNone
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import com.dmind.app.R
import com.dmind.app.ui.components.SafeGreen
import com.dmind.app.ui.viewmodel.ChatMessage
import com.dmind.app.ui.viewmodel.ChatUiState
import com.dmind.app.ui.viewmodel.ChatbotViewModel
import com.dmind.app.util.VoiceManager
import kotlinx.coroutines.delay
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

// โมเดลหมวดหมู่คำถามแนะนำเกี่ยวกับภัยพิบัติ
private data class DisasterPromptCategory(
    val id: String,
    val name: String,
    val icon: String,
    val prompts: List<String>
)

// ข้อมูลหมวดหมู่คำถามฉุกเฉินและภัยพิบัติ
private val DISASTER_CATEGORIES = listOf(
    DisasterPromptCategory(
        id = "popular",
        name = "ยอดนิยม",
        icon = "✨",
        prompts = listOf(
            "เมื่อเกิดแผ่นดินไหวควรปฏิบัติตนอย่างไร?",
            "วิธีปฐมพยาบาลเบื้องต้นเมื่อมีคนหมดสติ",
            "การเตรียมตัวรับมือน้ำท่วมฉับพลัน",
            "วิธีดับไฟเบื้องต้นและใช้ถังดับเพลิง",
            "อาการอันตรายจากฝุ่น PM2.5 และวิธีป้องกัน",
            "เบอร์โทรฉุกเฉินและการแจ้งเหตุ 1669"
        )
    ),
    DisasterPromptCategory(
        id = "flood",
        name = "น้ำท่วม",
        icon = "🌊",
        prompts = listOf(
            "เมื่อเกิดน้ำท่วมฉับพลันควรทำอย่างไร?",
            "ของจำเป็นในถุงยังชีพน้ำท่วมมีอะไรบ้าง?",
            "วิธีป้องกันโรคฉี่หนูและโรคที่มากับน้ำท่วม",
            "การตัดกระแสไฟฟ้าในบ้านก่อนน้ำท่วมถึง",
            "การปฏิบัติตัวหลังน้ำลดและการฟื้นฟูบ้าน"
        )
    ),
    DisasterPromptCategory(
        id = "fire",
        name = "ไฟป่า & อัคคีภัย",
        icon = "🔥",
        prompts = listOf(
            "วิธีเอาชีวิตรอดเมื่อติดในอาคารไฟไหม้",
            "วิธีป้องกันควันพิษและฝุ่นจากไฟป่า",
            "วิธีใช้ถังดับเพลิงเบื้องต้น (ดึง-ปลด-กด-ส่าย)",
            "การเตรียมตัวอพยพเมื่อไฟป่าลุกลาม",
            "วิธีปฐมพยาบาลแผลไฟไหม้และน้ำร้อนลวก"
        )
    ),
    DisasterPromptCategory(
        id = "earthquake",
        name = "แผ่นดินไหว",
        icon = "⚡",
        prompts = listOf(
            "หลัก หมอบ-กำบัง-ยึด เมื่อแผ่นดินไหว",
            "จุดปลอดภัยที่สุดในบ้านเมื่อเกิดแผ่นดินไหว",
            "สิ่งที่ห้ามทำเด็ดขาดขณะแผ่นดินไหว",
            "วิธีตรวจสอบความปลอดภัยของอาคารหลังแผ่นดินไหว",
            "การเตรียมตัวรับมืออาฟเตอร์ช็อก"
        )
    ),
    DisasterPromptCategory(
        id = "pm25",
        name = "ฝุ่น PM2.5",
        icon = "💨",
        prompts = listOf(
            "วิธีเลือกหน้ากากป้องกันฝุ่น PM2.5 ที่ได้มาตรฐาน",
            "อาการเตือนเมื่อได้รับฝุ่น PM2.5 เกินขนาด",
            "วิธีทำห้องปลอดฝุ่น (Clean Room) ในบ้าน",
            "ข้อควรปฏิบัติสำหรับกลุ่มเสี่ยง เด็ก ผู้สูงอายุ",
            "ค่า PM2.5 เท่าไหร่ถึงอันตรายต่อสุขภาพ"
        )
    ),
    DisasterPromptCategory(
        id = "firstaid",
        name = "ปฐมพยาบาล",
        icon = "🏥",
        prompts = listOf(
            "ขั้นตอนการทำ CPR และใช้เครื่อง AED",
            "วิธีห้ามเลือดบาดแผลฉุกเฉินอย่างถูกต้อง",
            "การช่วยคนสำลักอาหารติดคอ (Heimlich Maneuver)",
            "การปฐมพยาบาลคนเป็นลมแดดหรือฮีทสโตรก",
            "วิธีดูแลกระดูกหักหรือข้อเคลื่อนเบื้องต้น"
        )
    ),
    DisasterPromptCategory(
        id = "hotline",
        name = "สายด่วนฉุกเฉิน",
        icon = "📞",
        prompts = listOf(
            "รวมเบอร์โทรสายด่วนฉุกเฉิน 24 ชม. ที่จำเป็น",
            "ขั้นตอนการแจ้งเหตุ 1669 ให้ช่วยเหลือเร็วที่สุด",
            "ช่องทางขอความช่วยเหลือกรณีติดค้างในพื้นที่ภัยพิบัติ",
            "เบอร์แจ้งเหตุดับเพลิงและกู้ภัย (199)"
        )
    )
)

// ข้อมูลสายด่วนฉุกเฉินสำหรับแถบ Emergency Crisis Quick-Call
private data class EmergencyHotline(
    val number: String,
    val title: String,
    val subtitle: String,
    val badgeColor: Color,
)

private val EMERGENCY_HOTLINES = listOf(
    EmergencyHotline("1669", "แพทย์ฉุกเฉิน", "กู้ชีพ 24 ชม.", Color(0xFFDC2626)),
    EmergencyHotline("1784", "สายด่วน ปภ.", "เตือนภัยพิบัติ", Color(0xFFEA580C)),
    EmergencyHotline("199", "ดับเพลิง", "เพลิงไหม้/กู้ภัย", Color(0xFFD97706)),
    EmergencyHotline("191", "เหตุด่วนเหตุร้าย", "ตำรวจ", Color(0xFF2563EB)),
)

// หน้าจอแชทบอทระบบปัญญาประดิษฐ์ Dr.Mind ผู้เชี่ยวชาญด้านภัยพิบัติและการแพทย์ฉุกเฉิน
@Composable
fun ChatbotScreen(
    state: ChatUiState,
    onSend: (String, String) -> Unit,
    viewModel: ChatbotViewModel? = null,
    onBack: (() -> Unit)? = null,
) {
    var input by rememberSaveable { mutableStateOf("") }
    var selectedCategoryId by rememberSaveable { mutableStateOf("popular") }
    val fallbackError = stringResource(R.string.chatbot_error)
    val defaultWelcome = stringResource(R.string.chatbot_welcome)
    val messages = if (state.messages.isEmpty()) {
        listOf(ChatMessage(fromUser = false, text = defaultWelcome))
    } else {
        state.messages
    }

    val context = LocalContext.current
    val voiceManager = remember { VoiceManager(context) }
    var wasLastInputSpoken by remember { mutableStateOf(false) }

    LaunchedEffect(viewModel, voiceManager) {
        voiceManager.sttCallback = object : VoiceManager.SttCallback {
            override fun onReadyForSpeech() {
                viewModel?.setRecording(true)
                viewModel?.setVoiceError(null)
            }
            override fun onBeginningOfSpeech() {}
            override fun onRmsChanged(rmsdB: Float) {
                viewModel?.setVolumeLevel(rmsdB)
            }
            override fun onPartialResults(text: String) {
                viewModel?.updateTranscription(text)
            }
            override fun onResults(text: String) {
                viewModel?.updateTranscription(text)
                viewModel?.setRecording(false)
                if (text.isNotBlank()) {
                    wasLastInputSpoken = true
                    viewModel?.send(text, fallbackError)
                }
            }
            override fun onError(errorCode: Int, errorMessage: String) {
                viewModel?.setRecording(false)
                viewModel?.setVoiceError(errorMessage)
            }
            override fun onStateChanged(isListening: Boolean) {
                viewModel?.setRecording(isListening)
            }
        }

        voiceManager.ttsCallback = object : VoiceManager.TtsCallback {
            override fun onStart(utteranceId: String) {
                viewModel?.setTtsPlaying(true)
            }
            override fun onDone(utteranceId: String) {
                viewModel?.setTtsPlaying(false)
            }
            override fun onError(utteranceId: String, errorCode: Int?) {
                viewModel?.setTtsPlaying(false)
            }
            override fun onStateChanged(isSpeaking: Boolean) {
                viewModel?.setTtsPlaying(isSpeaking)
            }
        }
    }

    DisposableEffect(voiceManager) {
        onDispose {
            voiceManager.destroy()
            viewModel?.clearVoiceState()
        }
    }

    LaunchedEffect(state.textToSpeak) {
        val toSpeak = state.textToSpeak
        if (toSpeak != null) {
            if (wasLastInputSpoken) {
                voiceManager.speak(toSpeak)
                wasLastInputSpoken = false
            }
            viewModel?.clearTextToSpeak()
        }
    }

    val recordAudioPermissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        if (isGranted) {
            voiceManager.startListening()
        } else {
            viewModel?.setVoiceError("จำเป็นต้องได้รับสิทธิ์การใช้ไมโครโฟนเพื่อส่งเสียง")
        }
    }

    val dialCall: (String) -> Unit = { phoneNumber ->
        try {
            val intent = Intent(Intent.ACTION_DIAL, Uri.parse("tel:$phoneNumber")).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            context.startActivity(intent)
        } catch (_: Exception) {
            Toast.makeText(context, "ไม่สามารถเปิดตัวโทรออกได้", Toast.LENGTH_SHORT).show()
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .statusBarsPadding()
            .imePadding(),
    ) {
        // 1. Header Bar: Dr.Mind Branding พร้อมไฟสถานะกะพริบแบบ Realtime Pulse
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(MaterialTheme.colorScheme.surface)
                .padding(horizontal = 8.dp, vertical = 10.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            IconButton(onClick = { onBack?.invoke() }) {
                Icon(
                    imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                    contentDescription = "กลับ",
                    tint = MaterialTheme.colorScheme.onSurface
                )
            }

            // Dr.Mind Avatar พร้อม Pulse status ring
            Box(
                modifier = Modifier
                    .size(40.dp)
                    .background(
                        brush = Brush.linearGradient(
                            colors = listOf(Color(0xFF2563EB), Color(0xFF4F46E5))
                        ),
                        shape = RoundedCornerShape(12.dp)
                    ),
                contentAlignment = Alignment.Center
            ) {
                Text("👨‍⚕️", fontSize = 22.sp)
            }

            Spacer(modifier = Modifier.width(10.dp))

            Column(modifier = Modifier.weight(1f)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        text = "Dr.Mind - ผู้เชี่ยวชาญฉุกเฉิน",
                        fontWeight = FontWeight.Bold,
                        fontSize = 15.sp,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Box(
                        modifier = Modifier
                            .background(
                                color = MaterialTheme.colorScheme.primaryContainer,
                                shape = RoundedCornerShape(6.dp)
                            )
                            .padding(horizontal = 5.dp, vertical = 1.dp)
                    ) {
                        Text(
                            text = "AI",
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onPrimaryContainer
                        )
                    }
                }
                Text(
                    text = "ภัยธรรมชาติ & แพทย์ฉุกเฉิน 24 ชม.",
                    fontSize = 11.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }

            // Realtime Glowing Online Pulse Indicator
            val infiniteTransition = rememberInfiniteTransition(label = "onlinePulse")
            val pulseScale by infiniteTransition.animateFloat(
                initialValue = 0.8f,
                targetValue = 1.35f,
                animationSpec = infiniteRepeatable(
                    animation = tween(1000, easing = LinearEasing),
                    repeatMode = RepeatMode.Reverse
                ),
                label = "pulseScale"
            )

            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.padding(end = 6.dp)
            ) {
                Box(contentAlignment = Alignment.Center) {
                    Box(
                        modifier = Modifier
                            .size(12.dp)
                            .scale(pulseScale)
                            .background(SafeGreen.copy(alpha = 0.35f), shape = CircleShape)
                    )
                    Box(
                        modifier = Modifier
                            .size(7.dp)
                            .background(SafeGreen, shape = CircleShape)
                    )
                }
                Spacer(modifier = Modifier.width(5.dp))
                Text(
                    text = "ออนไลน์",
                    fontSize = 11.sp,
                    color = SafeGreen,
                    fontWeight = FontWeight.SemiBold
                )
            }
        }

        // เส้นแบ่งใต้แถบส่วนหัว
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(1.dp)
                .background(MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.6f))
        )

        // 2. Emergency Crisis Quick-Call Bar (แถบโทรสายด่วนฉุกเฉินด่วนที่สุด)
        EmergencyCrisisQuickCallBar(onDial = dialCall)

        // 3. ส่วนแสดงข้อความสนทนา
        LazyColumn(
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth()
                .padding(horizontal = 14.dp),
            contentPadding = PaddingValues(top = 10.dp, bottom = 12.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp),
        ) {
            val showIntro = state.messages.isEmpty() || (state.messages.size == 1 && !state.messages[0].fromUser)

            // แสดงการ์ดต้อนรับและหมวดหมู่คำถามเจาะจง
            if (showIntro) {
                item {
                    GradientHeaderCard(
                        onSpeakerClick = {
                            if (voiceManager.isSpeaking()) {
                                voiceManager.stopSpeaking()
                            } else {
                                voiceManager.speak(messages.firstOrNull()?.text ?: defaultWelcome)
                            }
                        }
                    )
                }

                item {
                    QuickQuestionsHeader()
                }

                // แถบเลือกหมวดหมู่คำถาม (Categories: น้ำท่วม, ไฟป่า, แผ่นดินไหว, PM2.5, ปฐมพยาบาล, สายด่วน)
                item {
                    LazyRow(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 2.dp),
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        items(DISASTER_CATEGORIES) { category ->
                            val isSelected = category.id == selectedCategoryId
                            CategoryChip(
                                category = category,
                                isSelected = isSelected,
                                onClick = { selectedCategoryId = category.id }
                            )
                        }
                    }
                }

                // แถบแสดงคำถามแนะนำตามหมวดหมู่ที่เลือก
                val activeCategory = DISASTER_CATEGORIES.firstOrNull { it.id == selectedCategoryId }
                    ?: DISASTER_CATEGORIES[0]

                item {
                    LazyRow(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 4.dp),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        items(activeCategory.prompts) { question ->
                            SuggestionBubble(
                                text = question,
                                onClick = {
                                    onSend(question, fallbackError)
                                }
                            )
                        }
                    }
                }

                item {
                    Spacer(modifier = Modifier.height(4.dp))
                }
            }

            // แสดงข้อความทั้งหมดในประวัติ
            items(messages) { message ->
                ChatBubble(
                    message = message,
                    context = context,
                    isSpeaking = state.isTtsPlaying,
                    onSpeakerClick = if (message.fromUser) null else {
                        {
                            if (voiceManager.isSpeaking()) {
                                voiceManager.stopSpeaking()
                            } else {
                                voiceManager.speak(message.text)
                            }
                        }
                    }
                )
            }

            // สถานะ AI กำลังประมวลผลคำตอบ (Animated typing indicator)
            if (state.isLoading) {
                item {
                    AnimatedTypingIndicatorBubble()
                }
            }
        }

        // 4. แถบควบคุมและกรอกข้อความสนทนาด้านล่างสุด
        Surface(
            color = MaterialTheme.colorScheme.surface,
            shadowElevation = 8.dp,
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .navigationBarsPadding()
                    .padding(horizontal = 14.dp, vertical = 10.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                // ช่องพิมพ์ข้อความทรงเม็ดยา
                OutlinedTextField(
                    value = if (state.isRecording) state.transcriptionText else input,
                    onValueChange = { if (!state.isRecording) input = it },
                    modifier = Modifier.weight(1f),
                    placeholder = {
                        Text(
                            text = if (state.isRecording) "กำลังรับฟังเสียง..."
                            else "ถาม Dr.Mind เกี่ยวกับภัยพิบัติหรือปฐมพยาบาล...",
                            color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.7f),
                            fontSize = 13.sp
                        )
                    },
                    shape = RoundedCornerShape(24.dp),
                    maxLines = 4,
                    enabled = !state.isLoading,
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = Color.Transparent,
                        unfocusedBorderColor = Color.Transparent,
                        disabledBorderColor = Color.Transparent,
                        focusedContainerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.6f),
                        unfocusedContainerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.6f),
                        disabledContainerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.3f),
                        focusedTextColor = MaterialTheme.colorScheme.onSurface,
                        unfocusedTextColor = MaterialTheme.colorScheme.onSurface,
                    ),
                    keyboardOptions = KeyboardOptions(imeAction = ImeAction.Send),
                    keyboardActions = KeyboardActions(
                        onSend = {
                            if (input.isNotBlank() && !state.isLoading) {
                                onSend(input, fallbackError)
                                input = ""
                            }
                        },
                    ),
                )

                // ปุ่มไมโครโฟนกลมแยกเดี่ยว
                Box(
                    modifier = Modifier
                        .size(44.dp)
                        .background(MaterialTheme.colorScheme.surfaceVariant, shape = CircleShape)
                        .border(1.dp, MaterialTheme.colorScheme.outlineVariant, shape = CircleShape)
                        .clickable {
                            val hasRecordPermission = ContextCompat.checkSelfPermission(
                                context,
                                Manifest.permission.RECORD_AUDIO
                            ) == PackageManager.PERMISSION_GRANTED

                            if (state.isRecording) {
                                voiceManager.stopListening()
                            } else {
                                if (hasRecordPermission) {
                                    voiceManager.startListening()
                                } else {
                                    recordAudioPermissionLauncher.launch(Manifest.permission.RECORD_AUDIO)
                                }
                            }
                        },
                    contentAlignment = Alignment.Center
                ) {
                    if (state.isRecording) {
                        val micTransition = rememberInfiniteTransition(label = "pulseMic")
                        val scale by micTransition.animateFloat(
                            initialValue = 1.0f,
                            targetValue = 1.25f,
                            animationSpec = infiniteRepeatable(
                                animation = tween(500, easing = LinearEasing),
                                repeatMode = RepeatMode.Reverse
                            ),
                            label = "pulseScale"
                        )
                        Icon(
                            imageVector = Icons.Filled.Mic,
                            contentDescription = "กำลังฟังอยู่",
                            tint = Color.Red,
                            modifier = Modifier.scale(scale)
                        )
                    } else {
                        Icon(
                            imageVector = Icons.Filled.MicNone,
                            contentDescription = "พูด",
                            tint = MaterialTheme.colorScheme.onSurfaceVariant,
                            modifier = Modifier.size(20.dp)
                        )
                    }
                }

                // ปุ่มส่งข้อมูลทรงกลมไล่เฉดสีฟ้า-น้ำเงินพรีเมียม
                val isSendEnabled = input.isNotBlank() && !state.isLoading && !state.isRecording
                Box(
                    modifier = Modifier
                        .size(44.dp)
                        .background(
                            brush = if (isSendEnabled) {
                                Brush.linearGradient(
                                    colors = listOf(Color(0xFF2563EB), Color(0xFF4F46E5))
                                )
                            } else {
                                Brush.linearGradient(
                                    colors = listOf(
                                        MaterialTheme.colorScheme.surfaceVariant,
                                        MaterialTheme.colorScheme.outlineVariant
                                    )
                                )
                            },
                            shape = CircleShape
                        )
                        .clickable(enabled = isSendEnabled) {
                            onSend(input, fallbackError)
                            input = ""
                        },
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.AutoMirrored.Filled.Send,
                        contentDescription = stringResource(R.string.chatbot_send),
                        tint = if (isSendEnabled) Color.White else MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.5f),
                        modifier = Modifier.size(20.dp)
                    )
                }
            }
        }
    }
}

// แถบ Emergency Crisis Quick-Call Bar สำหรับการโทรออกสายด่วนทันที
@Composable
private fun EmergencyCrisisQuickCallBar(
    onDial: (String) -> Unit
) {
    Surface(
        color = Color(0xFFFEF2F2),
        modifier = Modifier.fillMaxWidth(),
        border = BorderStroke(1.dp, Color(0xFFFCA5A5).copy(alpha = 0.5f))
    ) {
        Column(
            modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.padding(bottom = 4.dp)
            ) {
                Icon(
                    imageVector = Icons.Filled.Warning,
                    contentDescription = null,
                    tint = Color(0xFFDC2626),
                    modifier = Modifier.size(13.dp)
                )
                Spacer(modifier = Modifier.width(4.dp))
                Text(
                    text = "สายด่วนฉุกเฉิน (กดโทรออกได้ทันที)",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF991B1B)
                )
            }

            LazyRow(
                horizontalArrangement = Arrangement.spacedBy(6.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                items(EMERGENCY_HOTLINES) { hotline ->
                    Surface(
                        shape = RoundedCornerShape(10.dp),
                        color = Color.White,
                        border = BorderStroke(1.dp, Color(0xFFFCA5A5)),
                        modifier = Modifier.clickable { onDial(hotline.number) }
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 5.dp)
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(22.dp)
                                    .background(hotline.badgeColor, shape = RoundedCornerShape(6.dp)),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    imageVector = Icons.Filled.Phone,
                                    contentDescription = null,
                                    tint = Color.White,
                                    modifier = Modifier.size(12.dp)
                                )
                            }
                            Spacer(modifier = Modifier.width(6.dp))
                            Column {
                                Text(
                                    text = hotline.number,
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Black,
                                    color = Color(0xFF1F2937)
                                )
                                Text(
                                    text = hotline.title,
                                    fontSize = 9.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = hotline.badgeColor
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}

// คอมโพสเซเบิลการ์ดส่วนหัวสีน้ำเงินสไตล์ Modern Doctor Assistant
@Composable
private fun GradientHeaderCard(
    onSpeakerClick: () -> Unit
) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp)
            .background(
                brush = Brush.horizontalGradient(
                    colors = listOf(Color(0xFF1D4ED8), Color(0xFF3B82F6), Color(0xFF4F46E5))
                ),
                shape = RoundedCornerShape(16.dp)
            )
            .padding(14.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.weight(1f)
            ) {
                Box(
                    modifier = Modifier
                        .size(46.dp)
                        .background(Color.White.copy(alpha = 0.2f), shape = CircleShape)
                        .border(1.5.dp, Color.White.copy(alpha = 0.5f), CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Text("👨‍⚕️", fontSize = 26.sp)
                }
                Spacer(modifier = Modifier.width(12.dp))
                Column {
                    Text(
                        text = "Dr.Mind AI ฉุกเฉิน",
                        fontWeight = FontWeight.Bold,
                        fontSize = 16.sp,
                        color = Color.White
                    )
                    Spacer(modifier = Modifier.height(2.dp))
                    Text(
                        text = "คำแนะนำการรอดชีวิต & การปฐมพยาบาล",
                        fontSize = 11.sp,
                        color = Color.White.copy(alpha = 0.9f)
                    )
                }
            }

            // ปุ่มอ่านเสียงต้อนรับ
            Row(
                modifier = Modifier
                    .clickable { onSpeakerClick() }
                    .background(Color.White.copy(alpha = 0.22f), shape = RoundedCornerShape(20.dp))
                    .padding(horizontal = 10.dp, vertical = 6.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                Icon(
                    imageVector = Icons.AutoMirrored.Filled.VolumeUp,
                    contentDescription = "เสียง",
                    tint = Color.White,
                    modifier = Modifier.size(15.dp)
                )
                Text(
                    text = "ฟังเสียง",
                    color = Color.White,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold
                )
            }
        }
    }
}

// ชิปหมวดหมู่คำถามสำหรับคัดกรอง
@Composable
private fun CategoryChip(
    category: DisasterPromptCategory,
    isSelected: Boolean,
    onClick: () -> Unit
) {
    Surface(
        shape = RoundedCornerShape(20.dp),
        color = if (isSelected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.7f),
        border = BorderStroke(
            1.dp,
            if (isSelected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.outlineVariant
        ),
        modifier = Modifier.clickable { onClick() }
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.padding(horizontal = 10.dp, vertical = 5.dp)
        ) {
            Text(category.icon, fontSize = 12.sp)
            Spacer(modifier = Modifier.width(4.dp))
            Text(
                text = category.name,
                fontSize = 11.sp,
                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                color = if (isSelected) Color.White else MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

// แถบแสดงหัวข้อ "คำถามที่พบบ่อย"
@Composable
private fun QuickQuestionsHeader() {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(top = 4.dp, bottom = 2.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text("💡 ", fontSize = 14.sp)
        Text(
            text = "เลือกหมวดคำถามเร่งด่วน",
            fontWeight = FontWeight.Bold,
            fontSize = 13.sp,
            color = MaterialTheme.colorScheme.onSurface
        )
    }
}

// ฟองสบู่แสดงคำถามแนะนำ (Suggestion pill)
@Composable
private fun SuggestionBubble(
    text: String,
    onClick: () -> Unit,
) {
    Surface(
        shape = RoundedCornerShape(18.dp),
        color = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.4f),
        border = BorderStroke(1.dp, MaterialTheme.colorScheme.primary.copy(alpha = 0.5f)),
        modifier = Modifier.clickable { onClick() }
    ) {
        Text(
            text = text,
            modifier = Modifier.padding(horizontal = 12.dp, vertical = 7.dp),
            fontSize = 12.sp,
            color = MaterialTheme.colorScheme.primary,
            fontWeight = FontWeight.SemiBold
        )
    }
}

// ฟังก์ชันแปลงเวลาสำหรับแสดงใน Message Bubble
private fun formatMessageTime(timestampMillis: Long): String {
    return try {
        val sdf = SimpleDateFormat("HH:mm", Locale.getDefault())
        sdf.format(Date(timestampMillis))
    } catch (_: Exception) {
        ""
    }
}

// คอมโพสเซเบิลกล่องข้อความโต้ตอบแยกระหว่างผู้ใช้และฝ่าย Dr.Mind
@Composable
private fun ChatBubble(
    message: ChatMessage,
    context: Context,
    isSpeaking: Boolean = false,
    onSpeakerClick: (() -> Unit)? = null,
) {
    val clipboardManager = LocalClipboardManager.current
    var isCopied by remember { mutableStateOf(false) }

    LaunchedEffect(isCopied) {
        if (isCopied) {
            delay(2000)
            isCopied = false
        }
    }

    if (message.fromUser) {
        // แชทฝั่งผู้ใช้ (ขวา)
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 2.dp),
            horizontalArrangement = Arrangement.End
        ) {
            Column(
                horizontalAlignment = Alignment.End,
                modifier = Modifier.fillMaxWidth(0.85f)
            ) {
                Box(
                    modifier = Modifier
                        .background(
                            brush = Brush.horizontalGradient(
                                colors = listOf(Color(0xFF2563EB), Color(0xFF1D4ED8))
                            ),
                            shape = RoundedCornerShape(
                                topStart = 18.dp,
                                topEnd = 18.dp,
                                bottomStart = 18.dp,
                                bottomEnd = 4.dp
                            )
                        )
                        .padding(horizontal = 14.dp, vertical = 10.dp)
                ) {
                    Text(
                        text = message.text,
                        color = Color.White,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Normal,
                        lineHeight = 20.sp
                    )
                }

                // เวลาส่งข้อความของผู้ใช้
                Text(
                    text = formatMessageTime(message.timestamp),
                    fontSize = 10.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.7f),
                    modifier = Modifier.padding(top = 2.dp, end = 4.dp)
                )
            }
        }
    } else {
        // แชทฝั่ง Dr.Mind ผู้ช่วย AI (ซ้าย)
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 2.dp),
            horizontalArrangement = Arrangement.Start
        ) {
            Card(
                modifier = Modifier.fillMaxWidth(0.88f),
                shape = RoundedCornerShape(
                    topStart = 18.dp,
                    topEnd = 18.dp,
                    bottomStart = 4.dp,
                    bottomEnd = 18.dp
                ),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.8f)),
                elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    // แถบหัวเรื่องของ Dr.Mind + ปุ่มการกระทำ (Copy & Speaker)
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Box(
                                modifier = Modifier
                                    .size(26.dp)
                                    .background(
                                        MaterialTheme.colorScheme.primaryContainer,
                                        shape = CircleShape
                                    ),
                                contentAlignment = Alignment.Center
                            ) {
                                Text("👨‍⚕️", fontSize = 14.sp)
                            }
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = "Dr.Mind",
                                fontWeight = FontWeight.Bold,
                                fontSize = 13.sp,
                                color = MaterialTheme.colorScheme.primary
                            )
                        }

                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(2.dp)
                        ) {
                            // ปุ่มอ่านเสียง TTS
                            if (onSpeakerClick != null) {
                                IconButton(
                                    onClick = onSpeakerClick,
                                    modifier = Modifier.size(28.dp)
                                ) {
                                    Icon(
                                        imageVector = Icons.AutoMirrored.Filled.VolumeUp,
                                        contentDescription = "อ่านออกเสียง",
                                        tint = if (isSpeaking) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurfaceVariant,
                                        modifier = Modifier.size(17.dp)
                                    )
                                }
                            }

                            // ปุ่มคัดลอกข้อความลงคลิปบอร์ด
                            IconButton(
                                onClick = {
                                    val cleanText = message.text.replace(Regex("[*_#`~]"), "")
                                    clipboardManager.setText(AnnotatedString(cleanText))
                                    isCopied = true
                                    Toast.makeText(context, "คัดลอกข้อความแล้ว", Toast.LENGTH_SHORT).show()
                                },
                                modifier = Modifier.size(28.dp)
                            ) {
                                Icon(
                                    imageVector = if (isCopied) Icons.Filled.Check else Icons.Filled.ContentCopy,
                                    contentDescription = "คัดลอก",
                                    tint = if (isCopied) SafeGreen else MaterialTheme.colorScheme.onSurfaceVariant,
                                    modifier = Modifier.size(15.dp)
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(6.dp))

                    // เส้นแบ่ง
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(1.dp)
                            .background(MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f))
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    // เนื้อหาข้อความพร้อมจัดฟอร์แมต Markdown เบื้องต้น
                    AnnotatedMarkdownText(
                        text = message.text,
                        textColor = MaterialTheme.colorScheme.onSurface
                    )

                    // เวลาส่งข้อความ
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(top = 6.dp),
                        horizontalArrangement = Arrangement.End
                    ) {
                        Text(
                            text = formatMessageTime(message.timestamp),
                            fontSize = 10.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.6f)
                        )
                    }
                }
            }
        }
    }
}

// คอมโพสเซเบิลฟองสบู่แสดงแอนิเมชันกำลังพิมพ์ข้อความของ AI
@Composable
private fun AnimatedTypingIndicatorBubble() {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        horizontalArrangement = Arrangement.Start
    ) {
        Card(
            modifier = Modifier.fillMaxWidth(0.85f),
            shape = RoundedCornerShape(
                topStart = 18.dp,
                topEnd = 18.dp,
                bottomStart = 4.dp,
                bottomEnd = 18.dp
            ),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
            border = BorderStroke(1.dp, MaterialTheme.colorScheme.primary.copy(alpha = 0.3f)),
            elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
        ) {
            Column(modifier = Modifier.padding(14.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(24.dp)
                            .background(
                                MaterialTheme.colorScheme.primaryContainer,
                                shape = CircleShape
                            ),
                        contentAlignment = Alignment.Center
                    ) {
                        Text("👨‍⚕️", fontSize = 13.sp)
                    }
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "Dr.Mind",
                        fontWeight = FontWeight.Bold,
                        fontSize = 13.sp,
                        color = MaterialTheme.colorScheme.primary
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "กำลังประมวลผลคำแนะนำ...",
                        fontSize = 11.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.8f)
                    )
                }

                Spacer(modifier = Modifier.height(10.dp))

                // จุดกระโดด 3 จุด (Animated Bouncing Dots)
                val dotTransition = rememberInfiniteTransition(label = "dots")
                val dot1Offset by dotTransition.animateFloat(
                    initialValue = 0f,
                    targetValue = -6f,
                    animationSpec = infiniteRepeatable(
                        animation = tween(400, delayMillis = 0, easing = LinearEasing),
                        repeatMode = RepeatMode.Reverse
                    ),
                    label = "dot1"
                )
                val dot2Offset by dotTransition.animateFloat(
                    initialValue = 0f,
                    targetValue = -6f,
                    animationSpec = infiniteRepeatable(
                        animation = tween(400, delayMillis = 150, easing = LinearEasing),
                        repeatMode = RepeatMode.Reverse
                    ),
                    label = "dot2"
                )
                val dot3Offset by dotTransition.animateFloat(
                    initialValue = 0f,
                    targetValue = -6f,
                    animationSpec = infiniteRepeatable(
                        animation = tween(400, delayMillis = 300, easing = LinearEasing),
                        repeatMode = RepeatMode.Reverse
                    ),
                    label = "dot3"
                )

                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(15.dp),
                        strokeWidth = 2.dp,
                        color = MaterialTheme.colorScheme.primary
                    )
                    Text(
                        text = "กำลังค้นหาข้อมูลจากฐานข้อมูลฉุกเฉิน",
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        fontSize = 12.sp
                    )
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(3.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier
                                .size(5.dp)
                                .scale(1f + (-dot1Offset / 10f))
                                .background(MaterialTheme.colorScheme.primary, CircleShape)
                        )
                        Box(
                            modifier = Modifier
                                .size(5.dp)
                                .scale(1f + (-dot2Offset / 10f))
                                .background(Color(0xFF4F46E5), CircleShape)
                        )
                        Box(
                            modifier = Modifier
                                .size(5.dp)
                                .scale(1f + (-dot3Offset / 10f))
                                .background(MaterialTheme.colorScheme.primary.copy(alpha = 0.6f), CircleShape)
                        )
                    }
                }
            }
        }
    }
}

// คอมโพสเซเบิลข้อความที่แสดงผลเป็นหัวข้อหนา (Markdown Parser)
@Composable
private fun AnnotatedMarkdownText(
    text: String,
    textColor: Color,
    modifier: Modifier = Modifier
) {
    val annotatedString = remember(text) {
        buildAnnotatedString {
            var lastIndex = 0
            val regex = Regex("\\*\\*(.*?)\\*\\*")
            regex.findAll(text).forEach { match ->
                val start = match.range.first
                val end = match.range.last + 1

                if (start > lastIndex) {
                    append(text.substring(lastIndex, start))
                }

                pushStyle(SpanStyle(fontWeight = FontWeight.Bold))
                append(match.groupValues[1])
                pop()

                lastIndex = end
            }
            if (lastIndex < text.length) {
                append(text.substring(lastIndex))
            }
        }
    }
    Text(
        text = annotatedString,
        color = textColor,
        fontSize = 14.sp,
        lineHeight = 21.sp,
        modifier = modifier
    )
}
