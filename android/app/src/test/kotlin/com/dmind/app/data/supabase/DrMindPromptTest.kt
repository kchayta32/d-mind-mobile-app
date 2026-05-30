package com.dmind.app.data.supabase

import org.junit.Assert.assertTrue
import org.junit.Test

// คลาสทดสอบการทำงานในการสร้างข้อความและคำสั่ง (Prompt) สำหรับแชทบอทของระบบ Dr. Mind
class DrMindPromptTest {
    
    // ทดสอบว่าคำสั่งระบบ (System Instruction) จำกัดให้บอทตอบคำถามโดยอิงตามบริบทข้อมูลจาก Supabase เท่านั้น
    @Test
    fun `dr mind system instruction restricts answers to supabase context`() {
        val messages = DrMindPrompt.buildMessages(
            userMessage = "มีน้ำท่วมไหม",
            chatHistory = listOf("user" to "สวัสดี", "assistant" to "สวัสดีครับ"),
            supabaseContext = "[realtime_alerts]\n- ไม่มีข้อมูล",
        )

        val system = messages.first().content
        assertTrue(system.contains("SUPABASE_CONTEXT"))
        assertTrue(system.contains("ห้ามใช้ความรู้ทั่วไป"))
        assertTrue(system.contains("ยังไม่มีข้อมูลในฐานข้อมูล D-MIND"))
        assertTrue(messages[1].content.contains("[realtime_alerts]"))
    }
}
