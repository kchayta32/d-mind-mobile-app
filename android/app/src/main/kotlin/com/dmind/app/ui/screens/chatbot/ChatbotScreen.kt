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
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Send
import androidx.compose.material.icons.filled.Assistant
import androidx.compose.material.icons.filled.Mic
import androidx.compose.material.icons.filled.MicNone
import androidx.compose.material.icons.filled.VolumeUp
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
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
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import com.dmind.app.R
import com.dmind.app.ui.components.DmindBlue
import com.dmind.app.ui.components.ScreenHeader
import com.dmind.app.ui.viewmodel.ChatMessage
import com.dmind.app.ui.viewmodel.ChatUiState
import com.dmind.app.ui.viewmodel.ChatbotViewModel
import com.dmind.app.util.VoiceManager

// หน้าจอแชทบอทระบบปัญญาประดิษฐ์เพื่อช่วยเหลือและแนะนำวิธีรับมือภัยพิบัติ
@Composable
fun ChatbotScreen(
    state: ChatUiState,
    onSend: (String, String) -> Unit,
    viewModel: ChatbotViewModel? = null,
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
            .statusBarsPadding()
            .imePadding(),
    ) {
        ScreenHeader(
            title = stringResource(R.string.chatbot_title),
            subtitle = stringResource(R.string.chatbot_subtitle),
            icon = Icons.Filled.Assistant,
        )
        // ส่วนแสดงกล่องข้อความสนทนาประวัติทั้งหมด
        LazyColumn(
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth()
                .padding(horizontal = 16.dp),
            contentPadding = PaddingValues(bottom = 12.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp),
        ) {
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
            if (state.isLoading) {
                item {
                    Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.padding(start = 6.dp)) {
                        CircularProgressIndicator(modifier = Modifier.size(18.dp), strokeWidth = 2.dp)
                        Spacer(Modifier.width(8.dp))
                        Text(stringResource(R.string.chatbot_loading), color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 12.sp)
                    }
                }
            }
        }

        val quickQuestions = listOf(
            "แนะนำวิธีเตรียมรับมือน้ำท่วม",
            "มีรายงานภัยพิบัติล่าสุดอะไรบ้าง",
            "ตรวจสอบฝุ่น PM2.5 วันนี้",
            "เบอร์โทรฉุกเฉินที่จำเป็น",
            "วิธีขอความช่วยเหลือฉุกเฉิน"
        )
        
        // ส่วนแสดงปุ่มตัวช่วยพิมพ์สำหรับคำถามด่วน (Quick Questions)
        LazyRow(
            modifier = Modifier
                .fillMaxWidth()
                .background(MaterialTheme.colorScheme.background)
                .padding(vertical = 8.dp),
            contentPadding = PaddingValues(horizontal = 16.dp),
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

        // แถบควบคุมและกรอกข้อความสนทนาด้านล่างสุด
        Surface(
            color = MaterialTheme.colorScheme.surface,
            shadowElevation = 8.dp,
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .navigationBarsPadding()
                    .padding(12.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                IconButton(
                    onClick = {
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
                    }
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
                            tint = androidx.compose.ui.graphics.Color.Red,
                            modifier = Modifier.scale(scale)
                        )
                    } else {
                        Icon(
                            imageVector = Icons.Filled.MicNone,
                            contentDescription = "พูด",
                            tint = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }

                // ช่องป้อนข้อความสำหรับการสนทนาแชทบอท
                OutlinedTextField(
                    value = if (state.isRecording) state.transcriptionText else input,
                    onValueChange = { if (!state.isRecording) input = it },
                    modifier = Modifier.weight(1f),
                    placeholder = { 
                        Text(
                            if (state.isRecording) "กำลังฟังอยู่..." 
                            else stringResource(R.string.chatbot_placeholder)
                        ) 
                    },
                    shape = RoundedCornerShape(18.dp),
                    maxLines = 4,
                    enabled = !state.isLoading,
                    keyboardOptions = KeyboardOptions(imeAction = ImeAction.Send),
                    keyboardActions = KeyboardActions(
                        onSend = {
                            onSend(input, fallbackError)
                            input = ""
                        },
                    ),
                )
                IconButton(
                    onClick = {
                        onSend(input, fallbackError)
                        input = ""
                    },
                    enabled = input.isNotBlank() && !state.isLoading && !state.isRecording,
                ) {
                    Icon(Icons.AutoMirrored.Filled.Send, contentDescription = stringResource(R.string.chatbot_send), tint = DmindBlue)
                }
            }
        }
    }
}

// คอมโพสเซเบิลฟองสบู่กล่องข้อความสนทนาแยกตามฝ่ายผู้ใช้และฝ่ายแชทบอท
@Composable
private fun ChatBubble(
    message: ChatMessage,
    onSpeakerClick: (() -> Unit)? = null,
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = if (message.fromUser) Arrangement.End else Arrangement.Start,
        verticalAlignment = Alignment.Bottom,
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth(0.86f)
                .background(
                    color = if (message.fromUser) DmindBlue else MaterialTheme.colorScheme.surfaceVariant,
                    shape = RoundedCornerShape(
                        topStart = 18.dp,
                        topEnd = 18.dp,
                        bottomStart = if (message.fromUser) 18.dp else 4.dp,
                        bottomEnd = if (message.fromUser) 4.dp else 18.dp,
                    ),
                )
                .padding(14.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = message.text,
                    color = if (message.fromUser) androidx.compose.ui.graphics.Color.White else MaterialTheme.colorScheme.onSurfaceVariant,
                    fontWeight = if (message.fromUser) FontWeight.SemiBold else FontWeight.Normal,
                )
            }
            if (!message.fromUser && onSpeakerClick != null) {
                Spacer(modifier = Modifier.width(8.dp))
                IconButton(
                    onClick = onSpeakerClick,
                    modifier = Modifier.size(24.dp)
                ) {
                    Icon(
                        imageVector = Icons.Filled.VolumeUp,
                        contentDescription = "ฟังเสียง",
                        tint = MaterialTheme.colorScheme.onSurfaceVariant,
                        modifier = Modifier.size(20.dp)
                    )
                }
            }
        }
    }
}

// คอมโพสเซเบิลฟองสบู่แสดงคำถามแนะนำ (Suggestion bubble)
@Composable
private fun SuggestionBubble(
    text: String,
    onClick: () -> Unit,
) {
    Surface(
        shape = RoundedCornerShape(16.dp),
        color = MaterialTheme.colorScheme.secondaryContainer.copy(alpha = 0.7f),
        modifier = Modifier.clickable { onClick() }
    ) {
        Text(
            text = text,
            modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp),
            fontSize = 13.sp,
            color = MaterialTheme.colorScheme.onSecondaryContainer
        )
    }
}
