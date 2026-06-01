package com.dmind.app.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.dmind.app.data.supabase.SupabaseRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

// โครงสร้างของออบเจกต์เก็บข้อความแชทบอทสนทนา
data class ChatMessage(
    val fromUser: Boolean,
    val text: String,
)

// คลาสเก็บข้อมูลสถานะ UI (UI State) สำหรับหน้าจอผู้ช่วยอัจฉริยะแชทบอท
data class ChatUiState(
    val messages: List<ChatMessage> = emptyList(),
    val isLoading: Boolean = false,
    val isRecording: Boolean = false,
    val isTtsPlaying: Boolean = false,
    val transcriptionText: String = "",
    val volumeLevel: Float = 0f,
    val voiceError: String? = null,
    val textToSpeak: String? = null,
)

// คลาส ViewModel สำหรับการสนทนาโต้ตอบกับผู้ช่วย AI ปัญญาประดิษฐ์ (แชทบอท) ทั้งข้อความและเสียง
class ChatbotViewModel(
    private val repository: SupabaseRepository,
) : ViewModel() {
    private val _state = MutableStateFlow(ChatUiState())
    val state: StateFlow<ChatUiState> = _state.asStateFlow()

    // ส่งข้อความสนทนาและประวัติแชทเพื่อให้ผู้ช่วย AI ประมวลผลตอบกลับ
    fun send(message: String, fallbackError: String) {
        val clean = message.trim()
        if (clean.isBlank() || _state.value.isLoading) return
        val history = _state.value.messages.map { (if (it.fromUser) "user" else "assistant") to it.text }
        _state.update { it.copy(messages = it.messages + ChatMessage(true, clean), isLoading = true) }
        viewModelScope.launch {
            val reply = repository.invokeAiChat(clean, history).getOrElse {
                fallbackError
            }
            _state.update {
                it.copy(
                    messages = it.messages + ChatMessage(false, reply),
                    isLoading = false,
                    textToSpeak = reply
                )
            }
        }
    }

    // กำหนดสถานะความพร้อมในการบันทึกเสียงผู้ใช้
    fun setRecording(recording: Boolean) {
        _state.update { it.copy(isRecording = recording) }
    }

    // กำหนดสถานะแสดงความพร้อมเมื่อ TTS (Text-to-Speech) กำลังเล่นเสียงพูดตอบกลับ
    fun setTtsPlaying(playing: Boolean) {
        _state.update { it.copy(isTtsPlaying = playing) }
    }

    // อัปเดตข้อความถอดเสียงถอดความ (Speech-to-Text) ล่าสุด
    fun updateTranscription(text: String) {
        _state.update { it.copy(transcriptionText = text) }
    }

    // อัปเดตระดับความดังหรือระดับคลื่นเสียงสัญญาณไมโครโฟน
    fun setVolumeLevel(level: Float) {
        _state.update { it.copy(volumeLevel = level) }
    }

    // ตั้งค่าข้อความแจ้งเตือนข้อผิดพลาดเกี่ยวกับการตรวจจับและถอดเสียงเสียง
    fun setVoiceError(error: String?) {
        _state.update { it.copy(voiceError = error) }
    }

    // ล้างข้อความเพื่อระงับการสั่งประมวลผลอ่านออกเสียงตอบกลับ
    fun clearTextToSpeak() {
        _state.update { it.copy(textToSpeak = null) }
    }

    // ล้างสถานะและรีเซ็ตค่าการรับข้อมูลเสียงทั้งหมด
    fun clearVoiceState() {
        _state.update {
            it.copy(
                isRecording = false,
                isTtsPlaying = false,
                transcriptionText = "",
                volumeLevel = 0f,
                voiceError = null
            )
        }
    }
}
