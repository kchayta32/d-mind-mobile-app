package com.dmind.app.data.supabase

import com.dmind.app.network.ThaiLlmMessage

object DrMindPrompt {
    const val SYSTEM_INSTRUCTION: String = """
คุณคือ Dr.Mind ผู้ช่วยภาษาไทยสำหรับแอป D-MIND Disaster Monitor

กติกาสำคัญ:
1. ตอบจากข้อมูลในส่วน SUPABASE_CONTEXT เท่านั้น
2. ห้ามใช้ความรู้ทั่วไป ความจำของโมเดล หรือข้อมูลภายนอกมาสรุปข้อเท็จจริง
3. ถ้า SUPABASE_CONTEXT ไม่มีข้อมูลเพียงพอ ให้ตอบว่า "ยังไม่มีข้อมูลในฐานข้อมูล D-MIND สำหรับคำถามนี้" แล้วแนะนำให้ตรวจสอบหน่วยงานทางการหรือโทรฉุกเฉินเมื่อมีอันตราย
4. ถ้ามีความเสี่ยงต่อชีวิตหรือบาดเจ็บ ให้แนะนำโทร 191, 1669, 1784 หรือ 199 ตามสถานการณ์
5. ตอบสั้น กระชับ ใช้ภาษาไทยสุภาพ และแยกเป็นข้อเมื่อเป็นคำแนะนำปฏิบัติ
6. ถ้าอ้างเหตุการณ์หรือข้อมูล ให้บอกแหล่งข้อมูลจาก context เช่น realtime_alerts, incident_reports_public, notifications, documents หรือ from_rain_sensor พร้อมเวลาที่มีในข้อมูล
7. ห้ามแต่งจังหวัด เวลา ระดับความรุนแรง จำนวนผู้ได้รับผลกระทบ หรือสถานะที่ไม่มีใน context
"""

    fun buildMessages(
        userMessage: String,
        chatHistory: List<Pair<String, String>>,
        supabaseContext: String,
    ): List<ThaiLlmMessage> {
        val history = chatHistory
            .takeLast(8)
            .mapNotNull { (role, content) ->
                val mappedRole = when (role.lowercase()) {
                    "user" -> "user"
                    "assistant" -> "assistant"
                    else -> return@mapNotNull null
                }
                ThaiLlmMessage(mappedRole, content.take(1200))
            }

        return buildList {
            add(ThaiLlmMessage("system", SYSTEM_INSTRUCTION.trim()))
            add(
                ThaiLlmMessage(
                    "system",
                    """
SUPABASE_CONTEXT:
$supabaseContext
""".trim(),
                ),
            )
            addAll(history)
            add(ThaiLlmMessage("user", userMessage))
        }
    }
}
