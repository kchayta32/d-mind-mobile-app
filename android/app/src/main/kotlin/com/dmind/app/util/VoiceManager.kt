package com.dmind.app.util

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import android.speech.tts.TextToSpeech
import android.speech.tts.UtteranceProgressListener
import android.util.Log
import java.util.Locale
import java.util.concurrent.atomic.AtomicBoolean

/**
 * VoiceManager provides an interface to wrap Android's native SpeechRecognizer (Speech-to-Text)
 * and TextToSpeech (TTS) engines, ensuring thread safety and clean lifecycle management.
 */
// คลาสหลักสำหรับจัดการระบบรู้จำเสียงพูด (Speech-to-Text) และสังเคราะห์เสียงพูด (Text-to-Speech) ของอุปกรณ์
class VoiceManager(private val context: Context) {
    private val mainHandler = Handler(Looper.getMainLooper())
    
    private var speechRecognizer: SpeechRecognizer? = null
    private var textToSpeech: TextToSpeech? = null
    
    private val isSttListening = AtomicBoolean(false)
    private val isTtsSpeaking = AtomicBoolean(false)
    
    var sttCallback: SttCallback? = null
    var ttsCallback: TtsCallback? = null

    // อินเตอร์เฟส Callback สำหรับจัดการเหตุการณ์ต่างๆ ของระบบรู้จำเสียงพูด (STT)
    interface SttCallback {
        fun onReadyForSpeech()
        fun onBeginningOfSpeech()
        fun onRmsChanged(rmsdB: Float)
        fun onPartialResults(text: String)
        fun onResults(text: String)
        fun onError(errorCode: Int, errorMessage: String)
        fun onStateChanged(isListening: Boolean)
    }

    // อินเตอร์เฟส Callback สำหรับจัดการเหตุการณ์การสังเคราะห์เสียงพูด (TTS)
    interface TtsCallback {
        fun onStart(utteranceId: String)
        fun onDone(utteranceId: String)
        fun onError(utteranceId: String, errorCode: Int?)
        fun onStateChanged(isSpeaking: Boolean)
    }

    // บล็อกกำหนดค่าเริ่มต้น (Initializer Block) ทำการโพสต์คำสั่งสร้างวัตถุ TTS และ STT บน Main Thread
    init {
        mainHandler.post {
            initializeTts()
            initializeStt()
        }
    }

    // ตรวจสอบความพร้อมและกำหนดค่าให้กับวัตถุ SpeechRecognizer สำหรับระบบวิเคราะห์เสียงพูด
    private fun initializeStt() {
        if (speechRecognizer != null) return
        try {
            if (SpeechRecognizer.isRecognitionAvailable(context)) {
                speechRecognizer = SpeechRecognizer.createSpeechRecognizer(context.applicationContext).apply {
                    setRecognitionListener(SpeechListener())
                }
            } else {
                Log.e("VoiceManager", "Speech recognition is not available on this device")
            }
        } catch (e: Exception) {
            Log.e("VoiceManager", "Error initializing SpeechRecognizer", e)
        }
    }

    // ตรวจสอบความพร้อมและกำหนดค่าเริ่มต้นให้กับวัตถุ TextToSpeech (ตั้งค่าเริ่มต้นเป็นภาษาไทย หากไม่รองรับให้ใช้ภาษาอังกฤษ)
    private fun initializeTts() {
        if (textToSpeech != null) return
        try {
            textToSpeech = TextToSpeech(context.applicationContext) { status ->
                if (status == TextToSpeech.SUCCESS) {
                    textToSpeech?.let { tts ->
                        val result = tts.setLanguage(Locale("th", "TH"))
                        if (result == TextToSpeech.LANG_MISSING_DATA || result == TextToSpeech.LANG_NOT_SUPPORTED) {
                            tts.language = Locale.US
                        }
                        tts.setOnUtteranceProgressListener(TtsListener())
                    }
                } else {
                    Log.e("VoiceManager", "TTS initialization failed with status: $status")
                }
            }
        } catch (e: Exception) {
            Log.e("VoiceManager", "Error initializing TextToSpeech", e)
        }
    }

    // เริ่มกระบวนการรับฟังเสียงพูดจากไมโครโฟน เพื่อแปลงเป็นข้อความ (รองรับการระบุโค้ดภาษา)
    fun startListening(languageCode: String? = null) {
        mainHandler.post {
            try {
                initializeStt()
                if (speechRecognizer == null) {
                    sttCallback?.onError(
                        SpeechRecognizer.ERROR_CLIENT,
                        "Speech recognition is not initialized or not supported."
                    )
                    return@post
                }
                
                // If TTS is playing, stop it first to prevent feedback
                stopSpeaking()
                
                val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
                    putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
                    
                    val localeStr = languageCode ?: "th-TH"
                    putExtra(RecognizerIntent.EXTRA_LANGUAGE, localeStr)
                    putExtra(RecognizerIntent.EXTRA_LANGUAGE_PREFERENCE, localeStr)
                    putExtra(RecognizerIntent.EXTRA_ONLY_RETURN_LANGUAGE_PREFERENCE, localeStr)
                    
                    putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true)
                }
                
                speechRecognizer?.startListening(intent)
            } catch (e: Exception) {
                Log.e("VoiceManager", "Failed to start listening", e)
                sttCallback?.onError(SpeechRecognizer.ERROR_CLIENT, e.message ?: "Failed to start listening")
            }
        }
    }

    // สั่งหยุดรับฟังเสียงพูดและเริ่มกระบวนการประมวลผลเสียงที่ได้รับ
    fun stopListening() {
        mainHandler.post {
            try {
                speechRecognizer?.stopListening()
            } catch (e: Exception) {
                Log.e("VoiceManager", "Failed to stop listening", e)
            }
        }
    }

    // สั่งยกเลิกการรับฟังเสียงพูดทั้งหมดทันทีโดยไม่ประมวลผลข้อมูล
    fun cancelListening() {
        mainHandler.post {
            try {
                speechRecognizer?.cancel()
                isSttListening.set(false)
                sttCallback?.onStateChanged(false)
            } catch (e: Exception) {
                Log.e("VoiceManager", "Failed to cancel listening", e)
            }
        }
    }

    // เริ่มอ่านออกเสียงข้อความที่ระบุ (Text-to-Speech) โดยสั่งยกเลิก STT ก่อนหน้าเพื่อไม่ให้บันทึกเสียงตัวเอง
    fun speak(text: String, utteranceId: String = "chatbot_speech") {
        mainHandler.post {
            try {
                initializeTts()
                val ttsInst = textToSpeech
                if (ttsInst == null) {
                    Log.e("VoiceManager", "TextToSpeech not initialized")
                    ttsCallback?.onError(utteranceId, TextToSpeech.ERROR)
                    return@post
                }
                
                // If currently listening, cancel it to prevent recording own speech
                cancelListening()
                
                val queueMode = TextToSpeech.QUEUE_FLUSH
                val params = Bundle().apply {
                    putString(TextToSpeech.Engine.KEY_PARAM_UTTERANCE_ID, utteranceId)
                }
                val result = ttsInst.speak(text, queueMode, params, utteranceId)
                if (result == TextToSpeech.ERROR) {
                    Log.e("VoiceManager", "TextToSpeech speak failed")
                    ttsCallback?.onError(utteranceId, TextToSpeech.ERROR)
                }
            } catch (e: Exception) {
                Log.e("VoiceManager", "Error during speak", e)
                ttsCallback?.onError(utteranceId, TextToSpeech.ERROR)
            }
        }
    }

    // สั่งหยุดการอ่านออกเสียงทั้งหมดของ TTS
    fun stopSpeaking() {
        mainHandler.post {
            try {
                textToSpeech?.stop()
                isTtsSpeaking.set(false)
                ttsCallback?.onStateChanged(false)
            } catch (e: Exception) {
                Log.e("VoiceManager", "Failed to stop speaking", e)
            }
        }
    }

    // ตรวจสอบสถานะว่าระบบ STT กำลังรับฟังเสียงอยู่หรือไม่
    fun isListening(): Boolean = isSttListening.get()
    // ตรวจสอบสถานะว่าระบบ TTS กำลังอ่านออกเสียงอยู่หรือไม่
    fun isSpeaking(): Boolean = isTtsSpeaking.get()

    // สั่งหยุดการทำงาน ทำลายวัตถุ และเคลียร์หน่วยความจำของทั้งระบบ STT และ TTS
    fun destroy() {
        mainHandler.post {
            try {
                speechRecognizer?.destroy()
                speechRecognizer = null
            } catch (e: Exception) {
                Log.e("VoiceManager", "Error destroying SpeechRecognizer", e)
            }
            try {
                textToSpeech?.stop()
                textToSpeech?.shutdown()
                textToSpeech = null
            } catch (e: Exception) {
                Log.e("VoiceManager", "Error shutting down TextToSpeech", e)
            }
            sttCallback = null
            ttsCallback = null
        }
    }

    // คืนค่าคำอธิบายข้อผิดพลาดตามรหัสความผิดพลาด (Error Code) ของระบบรู้จำเสียงพูด
    private fun getErrorMessage(errorCode: Int): String {
        return when (errorCode) {
            SpeechRecognizer.ERROR_AUDIO -> "Audio recording error."
            SpeechRecognizer.ERROR_CLIENT -> "Client side error."
            SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS -> "Insufficient permissions. Please grant microphone access."
            SpeechRecognizer.ERROR_NETWORK -> "Network error."
            SpeechRecognizer.ERROR_NETWORK_TIMEOUT -> "Network timeout."
            SpeechRecognizer.ERROR_NO_MATCH -> "No speech recognized. Please try again."
            SpeechRecognizer.ERROR_RECOGNIZER_BUSY -> "Speech recognizer is busy. Please wait."
            SpeechRecognizer.ERROR_SERVER -> "Server error."
            SpeechRecognizer.ERROR_SPEECH_TIMEOUT -> "No speech input detected."
            else -> "Unknown speech recognition error ($errorCode)."
        }
    }

    // คลาสภายในสำหรับคอยรับฟังและจัดการเหตุการณ์ผลลัพธ์ของระบบวิเคราะห์เสียงพูด (SpeechRecognizer)
    private inner class SpeechListener : RecognitionListener {
        override fun onReadyForSpeech(params: Bundle?) {
            isSttListening.set(true)
            mainHandler.post {
                sttCallback?.onReadyForSpeech()
                sttCallback?.onStateChanged(true)
            }
        }

        override fun onBeginningOfSpeech() {
            mainHandler.post {
                sttCallback?.onBeginningOfSpeech()
            }
        }

        override fun onRmsChanged(rmsdB: Float) {
            mainHandler.post {
                sttCallback?.onRmsChanged(rmsdB)
            }
        }

        override fun onBufferReceived(buffer: ByteArray?) {}

        override fun onEndOfSpeech() {
            isSttListening.set(false)
            mainHandler.post {
                sttCallback?.onStateChanged(false)
            }
        }

        override fun onError(error: Int) {
            isSttListening.set(false)
            val msg = getErrorMessage(error)
            Log.w("VoiceManager", "SpeechRecognizer error: $msg ($error)")
            mainHandler.post {
                sttCallback?.onError(error, msg)
                sttCallback?.onStateChanged(false)
            }
        }

        override fun onResults(results: Bundle?) {
            isSttListening.set(false)
            val matches = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
            val text = matches?.firstOrNull() ?: ""
            mainHandler.post {
                sttCallback?.onResults(text)
                sttCallback?.onStateChanged(false)
            }
        }

        override fun onPartialResults(results: Bundle?) {
            val matches = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
            val text = matches?.firstOrNull() ?: ""
            mainHandler.post {
                sttCallback?.onPartialResults(text)
            }
        }

        override fun onEvent(eventType: Int, params: Bundle?) {}
    }

    // คลาสภายในสำหรับติดตามความคืบหน้าและจัดการข้อผิดพลาดในการเล่นเสียงพูดของ TextToSpeech
    private inner class TtsListener : UtteranceProgressListener() {
        override fun onStart(utteranceId: String) {
            isTtsSpeaking.set(true)
            mainHandler.post {
                ttsCallback?.onStart(utteranceId)
                ttsCallback?.onStateChanged(true)
            }
        }

        override fun onDone(utteranceId: String) {
            isTtsSpeaking.set(false)
            mainHandler.post {
                ttsCallback?.onDone(utteranceId)
                ttsCallback?.onStateChanged(false)
            }
        }

        @Deprecated("Deprecated in Java")
        override fun onError(utteranceId: String) {
            isTtsSpeaking.set(false)
            mainHandler.post {
                ttsCallback?.onError(utteranceId, TextToSpeech.ERROR)
                ttsCallback?.onStateChanged(false)
            }
        }

        override fun onError(utteranceId: String, errorCode: Int) {
            isTtsSpeaking.set(false)
            mainHandler.post {
                ttsCallback?.onError(utteranceId, errorCode)
                ttsCallback?.onStateChanged(false)
            }
        }
    }
}
