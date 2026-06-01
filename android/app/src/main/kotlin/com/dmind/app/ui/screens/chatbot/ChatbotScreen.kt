package com.dmind.app.ui.screens.chatbot

import android.Manifest
import android.content.pm.PackageManager
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
import androidx.compose.material.icons.filled.Assistant
import androidx.compose.material.icons.filled.Mic
import androidx.compose.material.icons.filled.MicNone
import androidx.compose.material.icons.filled.VolumeUp
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
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import com.dmind.app.R
import com.dmind.app.ui.components.DmindBlue
import com.dmind.app.ui.viewmodel.ChatMessage
import com.dmind.app.ui.viewmodel.ChatUiState
import com.dmind.app.ui.viewmodel.ChatbotViewModel
import com.dmind.app.util.VoiceManager

// หน้าจอแชทบอทระบบปัญญาประดิษฐ์เพื่อช่วยเหลือและแนะนำวิธีรับมือภัยพิบัติ (ปรับปรุงหน้าตาตามสกรีนช็อต)
@Composable
fun ChatbotScreen(
    state: ChatUiState,
    onSend: (String, String) -> Unit,
    viewModel: ChatbotViewModel? = null,
    onBack: (() -> Unit)? = null,
) {
    var input by rememberSaveable { mutableStateOf("") }
    val fallbackError = stringResource(R.string.chatbot_error)
    val messages = if (state.messages.isEmpty()) {
        listOf(ChatMessage(fromUser = false, text = stringResource(R.string.chatbot_welcome)))
    } else {
        state.messages
    }

    val context = LocalContext.current
    val voiceManager = remember { VoiceManager(context) }
    var wasLastInputSpoken by remember { mutableStateOf(false) }

    LaunchedEffect(viewModel, voiceManager) {
        // กำหนด callback สำหรับการจำเสียงพูดเป็นข้อความ (STT)
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

        // กำหนด callback สำหรับการแปลงข้อความให้ออกเสียงพูด (TTS)
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

    // ตัวจัดการขออนุญาตใช้งานไมโครโฟนสำหรับการป้อนข้อมูลด้วยเสียง
    val recordAudioPermissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        if (isGranted) {
            voiceManager.startListening()
        } else {
            viewModel?.setVoiceError("Microphone permission is required for voice input.")
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFFF8FAFC)) // สีพื้นหลังหน้าจอโทนสว่างพรีเมียม
            .statusBarsPadding()
            .imePadding(),
    ) {
        // Sticky Header: แถบส่วนหัวด้านบนแบบกำหนดเอง
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(Color.White)
                .padding(horizontal = 8.dp, vertical = 12.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            IconButton(onClick = { onBack?.invoke() }) {
                Icon(
                    imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                    contentDescription = "กลับ",
                    tint = Color(0xFF2563EB)
                )
            }
            Box(
                modifier = Modifier
                    .size(36.dp)
                    .background(
                        brush = Brush.linearGradient(
                            colors = listOf(Color(0xFF3B82F6), Color(0xFF1D4ED8))
                        ),
                        shape = RoundedCornerShape(8.dp)
                    ),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Filled.Assistant,
                    contentDescription = null,
                    tint = Color.White,
                    modifier = Modifier.size(20.dp)
                )
            }
            Spacer(modifier = Modifier.width(10.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = "Dr.Mind - ผู้เชี่ยวชาญฉุกเฉิน",
                    fontWeight = FontWeight.Bold,
                    fontSize = 15.sp,
                    color = Color(0xFF0F172A)
                )
                Text(
                    text = "ภัยธรรมชาติ & แพทย์ฉุกเฉิน",
                    fontSize = 11.sp,
                    color = Color(0xFF64748B)
                )
            }
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.padding(end = 8.dp)
            ) {
                Box(
                    modifier = Modifier
                        .size(6.dp)
                        .background(Color(0xFF16A34A), shape = CircleShape)
                )
                Spacer(modifier = Modifier.width(4.dp))
                Text(
                    text = "ออนไลน์",
                    fontSize = 11.sp,
                    color = Color(0xFF16A34A),
                    fontWeight = FontWeight.SemiBold
                )
            }
        }

        // เส้นแบ่งใต้แถบส่วนหัว
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(1.dp)
                .background(Color(0xFFE2E8F0))
        )

        // ส่วนแสดงการตอบโต้สนทนา
        LazyColumn(
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth()
                .padding(horizontal = 16.dp),
            contentPadding = PaddingValues(top = 12.dp, bottom = 12.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp),
        ) {
            // แสดงโปรโมชันและการ์ดแนะนำคำถามด่วนเมื่อไม่มีการสนทนาของฝั่งผู้ใช้ (หรือมีแค่ข้อความเริ่มต้นต้อนรับ)
            val showIntro = state.messages.isEmpty() || (state.messages.size == 1 && !state.messages[0].fromUser)

            if (showIntro) {
                item {
                    GradientHeaderCard(onSpeakerClick = {
                        if (voiceManager.isSpeaking()) {
                            voiceManager.stopSpeaking()
                        } else {
                            voiceManager.speak(messages.firstOrNull()?.text ?: "")
                        }
                    })
                }

                item {
                    QuickQuestionsHeader()
                }

                val quickQuestions = listOf(
                    "เมื่อเกิดแผ่นดินไหวควรทำอย่างไร?",
                    "วิธีปฐมพยาบาลเบื้องต้น"
                )

                item {
                    LazyRow(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 4.dp),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        items(quickQuestions) { question ->
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
                    Spacer(modifier = Modifier.height(8.dp))
                }
            }

            // แสดงข้อความในประวัติการคุย
            items(messages) { message ->
                ChatBubble(
                    message = message,
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

            // กำลังพิมพ์ (Loading state)
            if (state.isLoading) {
                item {
                    ChatBubble(
                        message = ChatMessage(fromUser = false, text = ""),
                        isLoading = true
                    )
                }
            }
        }

        // แถบควบคุมและกรอกข้อความสนทนาด้านล่างสุด
        Surface(
            color = Color.White,
            shadowElevation = 8.dp,
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .navigationBarsPadding()
                    .padding(horizontal = 16.dp, vertical = 12.dp),
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
                            text = if (state.isRecording) "กำลังฟังอยู่..." 
                            else "ถามคำถามเกี่ยวกับภัยพิบัติ...",
                            color = Color(0xFF94A3B8),
                            fontSize = 14.sp
                        ) 
                    },
                    shape = RoundedCornerShape(24.dp),
                    maxLines = 4,
                    enabled = !state.isLoading,
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = Color.Transparent,
                        unfocusedBorderColor = Color.Transparent,
                        disabledBorderColor = Color.Transparent,
                        focusedContainerColor = Color(0xFFF1F5F9),
                        unfocusedContainerColor = Color(0xFFF1F5F9),
                        disabledContainerColor = Color(0xFFF1F5F9)
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
                        .background(Color.White, shape = CircleShape)
                        .border(1.dp, Color(0xFFE2E8F0), shape = CircleShape)
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
                        val infiniteTransition = rememberInfiniteTransition(label = "pulse")
                        val scale by infiniteTransition.animateFloat(
                            initialValue = 1.0f,
                            targetValue = 1.3f,
                            animationSpec = infiniteRepeatable(
                                animation = tween(600, easing = LinearEasing),
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
                            tint = Color(0xFF64748B),
                            modifier = Modifier.size(20.dp)
                        )
                    }
                }

                // ปุ่มส่งข้อมูลทรงกลมไล่เฉดสีฟ้า-ม่วงพรีเมียม
                val isSendEnabled = input.isNotBlank() && !state.isLoading && !state.isRecording
                Box(
                    modifier = Modifier
                        .size(44.dp)
                        .background(
                            brush = if (isSendEnabled) {
                                Brush.linearGradient(
                                    colors = listOf(Color(0xFF2563EB), Color(0xFF8B5CF6))
                                )
                            } else {
                                Brush.linearGradient(
                                    colors = listOf(Color(0xFFCBD5E1), Color(0xFFE2E8F0))
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
                        tint = if (isSendEnabled) Color.White else Color(0xFF94A3B8),
                        modifier = Modifier.size(20.dp)
                    )
                }
            }
        }
    }
}

// คอมโพสเซเบิลการ์ดสีน้ำเงินไล่เฉดสไตล์พรีเมียม (Gradient Card)
@Composable
private fun GradientHeaderCard(
    onSpeakerClick: () -> Unit
) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp)
            .background(
                brush = Brush.horizontalGradient(
                    colors = listOf(Color(0xFF2563EB), Color(0xFF6366F1), Color(0xFF8B5CF6))
                ),
                shape = RoundedCornerShape(16.dp)
            )
            .padding(16.dp)
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
                // อวตารคุณหมอด้านซ้ายมือ
                Box(
                    modifier = Modifier
                        .size(48.dp)
                        .background(Color(0xFFFEF08A), shape = CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Text("🧑‍⚕️", fontSize = 28.sp)
                }
                Spacer(modifier = Modifier.width(12.dp))
                Column {
                    Text(
                        text = "Dr.Mind - ผู้เชี่ยวชาญ",
                        fontWeight = FontWeight.Bold,
                        fontSize = 17.sp,
                        color = Color.White
                    )
                    Text(
                        text = "ฉุกเฉิน",
                        fontWeight = FontWeight.Bold,
                        fontSize = 17.sp,
                        color = Color.White
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(5.dp)
                                .background(Color(0xFF4ADE80), shape = CircleShape)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = "ภัยธรรมชาติ & แพทย์ฉุกเฉิน",
                            fontSize = 12.sp,
                            color = Color.White.copy(alpha = 0.9f)
                        )
                    }
                }
            }
            // ปุ่ม "เสียง"
            Row(
                modifier = Modifier
                    .clickable { onSpeakerClick() }
                    .background(Color.White.copy(alpha = 0.2f), shape = RoundedCornerShape(20.dp))
                    .padding(horizontal = 12.dp, vertical = 6.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                Icon(
                    imageVector = Icons.Filled.VolumeUp,
                    contentDescription = "เสียง",
                    tint = Color.White,
                    modifier = Modifier.size(16.dp)
                )
                Text(
                    text = "เสียง",
                    color = Color.White,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold
                )
            }
        }
    }
}

// แถบแสดงหัวข้อ "คำถามที่พบบ่อย"
@Composable
private fun QuickQuestionsHeader() {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text("💡 ", fontSize = 16.sp)
        Text(
            text = "คำถามที่พบบ่อย",
            fontWeight = FontWeight.Bold,
            fontSize = 14.sp,
            color = Color(0xFF334155)
        )
    }
}

// คอมโพสเซเบิลฟองสบู่แสดงคำถามแนะนำ (Suggestion bubble) แบบขอบสีน้ำเงิน พื้นหลังขาว
@Composable
private fun SuggestionBubble(
    text: String,
    onClick: () -> Unit,
) {
    Surface(
        shape = RoundedCornerShape(20.dp),
        color = Color.White,
        border = BorderStroke(1.dp, Color(0xFF2563EB)),
        modifier = Modifier.clickable { onClick() }
    ) {
        Text(
            text = text,
            modifier = Modifier.padding(horizontal = 14.dp, vertical = 8.dp),
            fontSize = 13.sp,
            color = Color(0xFF2563EB),
            fontWeight = FontWeight.SemiBold
        )
    }
}

// คอมโพสเซเบิลกล่องข้อความโต้ตอบแยกฝ่ายผู้ใช้และฝ่ายแชทบอท
@Composable
private fun ChatBubble(
    message: ChatMessage,
    onSpeakerClick: (() -> Unit)? = null,
    isLoading: Boolean = false,
) {
    if (message.fromUser) {
        // แชทฝั่งผู้ใช้ (ขวา)
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 4.dp),
            horizontalArrangement = Arrangement.End
        ) {
            Box(
                modifier = Modifier
                    .fillMaxWidth(0.85f)
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
                    .padding(horizontal = 16.dp, vertical = 12.dp),
                contentAlignment = Alignment.CenterStart
            ) {
                Text(
                    text = message.text,
                    color = Color.White,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Normal,
                    lineHeight = 20.sp
                )
            }
        }
    } else {
        // แชทฝั่งแชทบอท (ซ้าย)
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 4.dp),
            horizontalArrangement = Arrangement.Start
        ) {
            Card(
                modifier = Modifier.fillMaxWidth(0.88f),
                shape = RoundedCornerShape(18.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                border = BorderStroke(1.dp, Color(0xFFF1F5F9)),
                elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    // แถบหัวเรื่อง: รูปคุณหมอ + ชื่อ Dr.Mind
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Box(
                                modifier = Modifier
                                    .size(28.dp)
                                    .background(Color(0xFFFEF08A), shape = CircleShape),
                                contentAlignment = Alignment.Center
                            ) {
                                Text("🧑‍⚕️", fontSize = 16.sp)
                            }
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = "Dr.Mind",
                                fontWeight = FontWeight.Bold,
                                fontSize = 14.sp,
                                color = Color(0xFF2563EB)
                            )
                        }
                        
                        if (onSpeakerClick != null && !isLoading) {
                            IconButton(
                                onClick = onSpeakerClick,
                                modifier = Modifier.size(24.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Filled.VolumeUp,
                                    contentDescription = "ฟังเสียง",
                                    tint = Color(0xFF64748B),
                                    modifier = Modifier.size(18.dp)
                                )
                            }
                        }
                    }
                    
                    Spacer(modifier = Modifier.height(8.dp))
                    
                    // เส้นแบ่ง
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(1.dp)
                            .background(Color(0xFFF1F5F9))
                    )
                    
                    Spacer(modifier = Modifier.height(10.dp))
                    
                    if (isLoading) {
                        // หน้าตาเมื่อกำลังพิมพ์
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            CircularProgressIndicator(
                                modifier = Modifier.size(16.dp),
                                strokeWidth = 2.dp,
                                color = Color(0xFF2563EB)
                            )
                            Text(
                                text = "กำลังพิมพ์...",
                                color = Color(0xFF64748B),
                                fontSize = 13.sp
                            )
                            Text(
                                text = "•••",
                                color = Color(0xFF2563EB),
                                fontWeight = FontWeight.Bold,
                                fontSize = 14.sp
                            )
                        }
                    } else {
                        // ข้อความคำแนะนำปกติ พร้อมรองรับการแสดงหัวข้อหนา (**คำหนา**)
                        AnnotatedMarkdownText(
                            text = message.text,
                            textColor = Color(0xFF334155)
                        )
                    }
                }
            }
        }
    }
}

// คอมโพสเซเบิลข้อความที่แสดงผลเป็นหัวข้อหนา (Bold parser)
@Composable
private fun AnnotatedMarkdownText(
    text: String,
    textColor: Color,
    modifier: Modifier = Modifier
) {
    val annotatedString = remember(text) {
        androidx.compose.ui.text.buildAnnotatedString {
            var lastIndex = 0
            val regex = Regex("\\*\\*(.*?)\\*\\*")
            regex.findAll(text).forEach { match ->
                val start = match.range.first
                val end = match.range.last + 1
                
                // ใส่ข้อความธรรมดาก่อนเจอคำหนา
                if (start > lastIndex) {
                    append(text.substring(lastIndex, start))
                }
                
                // ใส่ข้อความแบบหนา
                pushStyle(androidx.compose.ui.text.SpanStyle(fontWeight = FontWeight.Bold))
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
        lineHeight = 20.sp,
        modifier = modifier
    )
}
