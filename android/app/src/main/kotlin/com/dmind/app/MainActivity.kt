package com.dmind.app

import android.content.Context
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.core.view.WindowCompat
import com.dmind.app.ui.DMindApp
import com.dmind.app.util.LocaleManager

// คลาสหลักสำหรับหน้าแรก (Activity) ของแอปพลิเคชัน DMind
class MainActivity : ComponentActivity() {
    // ฟังก์ชันตั้งค่าภาษาให้กับ Context ก่อนการเริ่มทำงานของ Activity
    override fun attachBaseContext(newBase: Context) {
        super.attachBaseContext(LocaleManager.wrapContext(newBase))
    }

    // ฟังก์ชันจัดการตอนสร้าง Activity โดยเริ่มต้นการแสดงผล UI หลักด้วย Compose
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // ตั้งค่าให้เนื้อหา UI สามารถแสดงผลครอบคลุมแถบระบบ (Edge-to-Edge)
        WindowCompat.setDecorFitsSystemWindows(window, false)
        // กำหนด UI หลักของแอปพลิเคชันผ่านคอมโพเนนต์ DMindApp
        setContent {
            DMindApp()
        }
    }
}
